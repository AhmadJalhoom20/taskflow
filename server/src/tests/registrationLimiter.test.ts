import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Request, Response } from 'express';
import {
  parseCookies,
  normalizeIp,
  getClientIp,
  appendCookieHeader,
  registrationRateLimiter,
  resetRegistrationRateLimits,
  getRegistrationRateLimitState,
  REGISTRATION_TRACKER_COOKIE,
  REGISTRATION_MAX_ATTEMPTS,
  COOKIE_PENALTY_MS,
  IP_PENALTY_MS,
} from '../middlewares/security.js';

function createMockReqRes(options: {
  ip?: string;
  cookie?: string;
  xForwardedFor?: string;
}) {
  const headers: Record<string, string | string[]> = {};
  if (options.cookie) headers['cookie'] = options.cookie;
  if (options.xForwardedFor) headers['x-forwarded-for'] = options.xForwardedFor;

  const req = {
    ip: options.ip || '127.0.0.1',
    headers,
    socket: { remoteAddress: options.ip || '127.0.0.1' },
    originalUrl: '/api/auth/register',
  } as unknown as Request;

  const responseHeaders: Record<string, string | string[]> = {};
  let statusCode = 200;
  let jsonBody: any = null;

  const res = {
    statusCode,
    getHeader(name: string) {
      return responseHeaders[name.toLowerCase()];
    },
    setHeader(name: string, value: string | string[]) {
      responseHeaders[name.toLowerCase()] = value;
      return res;
    },
    status(code: number) {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json(body: any) {
      jsonBody = body;
      return res;
    },
    type(_t: string) {
      return res;
    },
  } as unknown as Response;

  return { req, res, getStatusCode: () => statusCode, getJsonBody: () => jsonBody, responseHeaders };
}

describe('Multi-Tier Registration Rate Limiter Unit Tests', () => {
  beforeEach(() => {
    resetRegistrationRateLimits();
  });

  test('parseCookies handles various cookie string formats correctly', () => {
    assert.deepEqual(parseCookies(undefined), {});
    assert.deepEqual(parseCookies(''), {});
    assert.deepEqual(parseCookies('foo=bar'), { foo: 'bar' });
    assert.deepEqual(
      parseCookies('taskflow_reg_tracker=uuid-123; session=abc'),
      { taskflow_reg_tracker: 'uuid-123', session: 'abc' }
    );
    assert.deepEqual(
      parseCookies('  spaced_cookie = val1 ; other = val2  '),
      { spaced_cookie: 'val1', other: 'val2' }
    );
  });

  test('normalizeIp standardizes IPv6 and loopback addresses', () => {
    assert.equal(normalizeIp('::1'), '127.0.0.1');
    assert.equal(normalizeIp('::ffff:192.168.1.10'), '192.168.1.10');
    assert.equal(normalizeIp('10.0.0.1'), '10.0.0.1');
  });

  test('appendCookieHeader appends without destroying existing headers', () => {
    const { res, responseHeaders } = createMockReqRes({});
    appendCookieHeader(res, 'cookie1=val1');
    assert.equal(responseHeaders['set-cookie'], 'cookie1=val1');

    appendCookieHeader(res, 'cookie2=val2');
    assert.deepEqual(responseHeaders['set-cookie'], ['cookie1=val1', 'cookie2=val2']);
  });

  test('Allows exactly 10 requests within window and sets tracker cookie', () => {
    let assignedCookie = '';

    for (let i = 1; i <= REGISTRATION_MAX_ATTEMPTS; i++) {
      const { req, res, responseHeaders } = createMockReqRes({
        ip: '198.51.100.1',
        cookie: assignedCookie ? `${REGISTRATION_TRACKER_COOKIE}=${assignedCookie}` : undefined,
      });

      let nextCalled = false;
      registrationRateLimiter(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true, `Attempt ${i} should call next()`);
      assert.equal(res.getHeader('ratelimit-remaining'), String(REGISTRATION_MAX_ATTEMPTS - i));

      if (i === 1) {
        const rawSetCookie = responseHeaders['set-cookie'] as string;
        assert(rawSetCookie.includes(`${REGISTRATION_TRACKER_COOKIE}=`));
        assert(rawSetCookie.includes('HttpOnly'));
        assert(rawSetCookie.includes('SameSite=Lax'));
        const match = rawSetCookie.match(new RegExp(`${REGISTRATION_TRACKER_COOKIE}=([^;]+)`));
        assert(match && match[1]);
        assignedCookie = match[1];
      }
    }
  });

  test('11th request triggers Tier 1 Cookie Block (429) without blocking IP', () => {
    const trackerId = 'test-client-cookie-uuid';
    const clientIp = '203.0.113.42';

    // Seed 10 requests
    for (let i = 1; i <= 10; i++) {
      const { req, res } = createMockReqRes({
        ip: clientIp,
        cookie: `${REGISTRATION_TRACKER_COOKIE}=${trackerId}`,
      });
      registrationRateLimiter(req, res, () => {});
    }

    // Attempt 11
    const { req, res, getStatusCode, getJsonBody, responseHeaders } = createMockReqRes({
      ip: clientIp,
      cookie: `${REGISTRATION_TRACKER_COOKIE}=${trackerId}`,
    });

    let nextCalled = false;
    registrationRateLimiter(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'Attempt 11 should not call next()');
    assert.equal(getStatusCode(), 429);
    assert.equal(responseHeaders['retry-after'], String(COOKIE_PENALTY_MS / 1000));

    const body = getJsonBody();
    assert.equal(body.status, 429);
    assert.equal(body.tier, 1);
    assert.equal(body.code, 'REGISTRATION_COOKIE_BLOCKED');
    assert.equal(body.type, 'https://taskflow.enterprise/problems/rate-limit-cookie-blocked');

    // Confirm that another cookie on the same IP is NOT blocked
    const { req: reqNew, res: resNew, getStatusCode: getStatusCodeNew } = createMockReqRes({
      ip: clientIp,
      cookie: `${REGISTRATION_TRACKER_COOKIE}=different-cookie-uuid`,
    });
    let nextCalledForNew = false;
    registrationRateLimiter(reqNew, resNew, () => {
      nextCalledForNew = true;
    });
    assert.equal(nextCalledForNew, true, 'Unrelated session on same IP is NOT blocked');
    assert.equal(getStatusCodeNew(), 200);
  });

  test('Attempting again with blocked cookie escalates to Tier 2 IP Block for 30 minutes', () => {
    const trackerId = 'blocked-cookie-uuid-escalation';
    const clientIp = '198.51.100.99';

    // Seed 10 attempts
    for (let i = 1; i <= 10; i++) {
      const { req, res } = createMockReqRes({
        ip: clientIp,
        cookie: `${REGISTRATION_TRACKER_COOKIE}=${trackerId}`,
      });
      registrationRateLimiter(req, res, () => {});
    }

    // Attempt 11: Cookie Block (Tier 1)
    const { req: req11, res: res11 } = createMockReqRes({
      ip: clientIp,
      cookie: `${REGISTRATION_TRACKER_COOKIE}=${trackerId}`,
    });
    registrationRateLimiter(req11, res11, () => {});

    // Attempt 12: Repeated attempt with blocked cookie (Tier 2 Escalation)
    const { req: req12, res: res12, getStatusCode: getCode12, getJsonBody: getBody12, responseHeaders: headers12 } = createMockReqRes({
      ip: clientIp,
      cookie: `${REGISTRATION_TRACKER_COOKIE}=${trackerId}`,
    });

    let nextCalled12 = false;
    registrationRateLimiter(req12, res12, () => {
      nextCalled12 = true;
    });

    assert.equal(nextCalled12, false);
    assert.equal(getCode12(), 429);
    assert.equal(headers12['retry-after'], String(IP_PENALTY_MS / 1000));

    const body12 = getBody12();
    assert.equal(body12.status, 429);
    assert.equal(body12.tier, 2);
    assert.equal(body12.code, 'REGISTRATION_IP_BLOCKED');
    assert.equal(body12.type, 'https://taskflow.enterprise/problems/rate-limit-ip-blocked');

    // Attempt 13: Any subsequent request from that IP is immediately rejected, even with no cookie
    const { req: req13, res: res13, getStatusCode: getCode13, getJsonBody: getBody13 } = createMockReqRes({
      ip: clientIp,
    });
    let nextCalled13 = false;
    registrationRateLimiter(req13, res13, () => {
      nextCalled13 = true;
    });

    assert.equal(nextCalled13, false);
    assert.equal(getCode13(), 429);
    const body13 = getBody13();
    assert.equal(body13.tier, 2);
    assert.equal(body13.code, 'REGISTRATION_IP_BLOCKED');
  });
});
