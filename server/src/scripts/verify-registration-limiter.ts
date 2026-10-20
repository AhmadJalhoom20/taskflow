/**
 * Verification script for Multi-Tier Registration Rate Limiter.
 * Simulates registration attempts against the running TaskFlow API service.
 * Strictly zero emojis.
 */

interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  error?: string;
  code?: string;
  tier?: number;
  retryAfter?: number;
  blockedUntil?: string;
  requestId?: string;
  timestamp?: string;
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`[FAIL] Assertion failed: ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

async function runVerification(): Promise<void> {
  console.log('[TaskFlow Security Test] Starting Multi-Tier Registration Rate Limiter Verification...');

  // Step 0: Reset any existing rate limiter state
  const resetRes = await fetch(`${BASE_URL}/auth/reset-limiter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  assert(resetRes.ok, 'Reset rate limiter endpoint returned HTTP 200 OK');

  let trackerCookie: string | null = null;

  // Step 1: Simulate the first 10 registration attempts
  console.log('[Test Stage 1] Executing first 10 registration attempts...');
  for (let attempt = 1; attempt <= 10; attempt++) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (trackerCookie) {
      headers['Cookie'] = trackerCookie;
    }

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    // Check Set-Cookie on first attempt
    if (attempt === 1) {
      const setCookie = res.headers.get('set-cookie');
      assert(
        Boolean(setCookie && setCookie.includes('taskflow_reg_tracker=')),
        'Initial request generates Set-Cookie header with taskflow_reg_tracker'
      );
      assert(
        Boolean(setCookie && setCookie.includes('HttpOnly') && setCookie.includes('SameSite=Lax')),
        'Cookie has HttpOnly and SameSite=Lax attributes'
      );
      if (setCookie) {
        const match = setCookie.match(/taskflow_reg_tracker=[^;]+/);
        if (match) {
          trackerCookie = match[0];
        }
      }
    }

    // Verify rate limit headers
    const remaining = res.headers.get('ratelimit-remaining');
    const limit = res.headers.get('ratelimit-limit');
    assert(limit === '10', `Attempt ${attempt}: RateLimit-Limit header is 10`);
    assert(
      remaining === String(10 - attempt),
      `Attempt ${attempt}: RateLimit-Remaining correctly decrements to ${10 - attempt}`
    );

    // Verify request proceeds to auth controller (returns 400 validation error, NOT 429)
    assert(
      res.status === 400,
      `Attempt ${attempt}: Request successfully proceeded past rate limiter (status ${res.status} !== 429)`
    );
  }

  assert(trackerCookie !== null, 'Tracker cookie was acquired successfully');

  // Step 2: Attempt 11 - Exceeding 10 attempts limit should trigger Tier 1 Penalty (Cookie Block)
  console.log('[Test Stage 2] Executing 11th registration attempt with same tracker cookie...');
  const res11 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: trackerCookie!,
    },
    body: JSON.stringify({}),
  });

  assert(res11.status === 429, `Attempt 11: Returned HTTP 429 Too Many Requests (got ${res11.status})`);
  const retryAfter11 = res11.headers.get('retry-after');
  assert(Boolean(retryAfter11 && Number(retryAfter11) > 0), 'Attempt 11: Retry-After header present and positive');

  const body11: ProblemDetails = await res11.json();
  assert(
    body11.type === 'https://taskflow.enterprise/problems/rate-limit-cookie-blocked',
    'Attempt 11: RFC 9457 type matches rate-limit-cookie-blocked'
  );
  assert(
    body11.code === 'REGISTRATION_COOKIE_BLOCKED',
    'Attempt 11: Code is REGISTRATION_COOKIE_BLOCKED'
  );
  assert(body11.tier === 1, 'Attempt 11: Penalty tier is 1 (Cookie block)');
  assert(Boolean(body11.blockedUntil), 'Attempt 11: blockedUntil timestamp provided');
  assert(Boolean(body11.detail), 'Attempt 11: RFC 9457 detail message present');

  // Verify IP is NOT blocked on first penalty
  console.log('[Test Stage 3] Verifying client IP is NOT blocked on first offense...');
  const resIpCheck = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'taskflow_reg_tracker=unrelated-client-uuid-999',
    },
    body: JSON.stringify({}),
  });
  assert(
    resIpCheck.status === 400,
    `Unrelated cookie from same IP is NOT blocked (status ${resIpCheck.status} !== 429)`
  );

  // Step 3: Attempt 12 - Client with blocked cookie attempts again within penalty window (Tier 2 Escalation)
  console.log('[Test Stage 4] Executing repeated attempt with blocked cookie to trigger IP escalation...');
  const res12 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: trackerCookie!,
    },
    body: JSON.stringify({}),
  });

  assert(res12.status === 429, `Attempt 12: Returned HTTP 429 Too Many Requests (got ${res12.status})`);
  const retryAfter12 = res12.headers.get('retry-after');
  assert(
    Boolean(retryAfter12 && Number(retryAfter12) >= 1700),
    `Attempt 12: Retry-After reflects 30-minute escalation (~1800s, got ${retryAfter12})`
  );

  const body12: ProblemDetails = await res12.json();
  assert(
    body12.type === 'https://taskflow.enterprise/problems/rate-limit-ip-blocked',
    'Attempt 12: RFC 9457 type escalated to rate-limit-ip-blocked'
  );
  assert(body12.code === 'REGISTRATION_IP_BLOCKED', 'Attempt 12: Code is REGISTRATION_IP_BLOCKED');
  assert(body12.tier === 2, 'Attempt 12: Penalty tier is 2 (IP block escalation)');

  // Step 4: Attempt 13 - Subsequent request from blocked IP (even without cookie) must immediately return 429
  console.log('[Test Stage 5] Verifying blocked IP is rejected on subsequent attempts without cookie...');
  const res13 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  assert(
    res13.status === 429,
    `Attempt 13: Blocked IP without cookie immediately returns HTTP 429 (got ${res13.status})`
  );
  const body13: ProblemDetails = await res13.json();
  assert(body13.code === 'REGISTRATION_IP_BLOCKED', 'Attempt 13: Block code is REGISTRATION_IP_BLOCKED');
  assert(body13.tier === 2, 'Attempt 13: Tier is 2 (IP ban)');

  // Step 5: Clean reset after test
  console.log('[Test Stage 6] Cleaning up test state...');
  await fetch(`${BASE_URL}/auth/reset-limiter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('[TaskFlow Security Test] Verification completed successfully with 100% assertions passed.');
}

runVerification().catch((err) => {
  console.error('[FAIL] Verification encountered an unhandled error:', err);
  process.exit(1);
});
