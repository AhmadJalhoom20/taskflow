import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';

/**
 * Enterprise Audit and Security Headers Middleware.
 * Generates X-Request-Id, tracks X-Response-Time, and stamps service provenance.
 */
export const enterpriseHeaders = (req: Request, res: Response, next: NextFunction): void => {
  const incomingReqId = req.headers['x-request-id'];
  const requestId =
    typeof incomingReqId === 'string' && incomingReqId.trim().length > 0
      ? incomingReqId.trim()
      : crypto.randomUUID();

  // Propagate to request headers for downstream loggers and context
  req.headers['x-request-id'] = requestId;

  // Stamp Enterprise Identity & Hardening Headers (without fingerprinting headers)
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Security-Policy', 'Enterprise JWT + Strict RBAC');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Measure response duration with high precision
  const startTime = process.hrtime.bigint();
  const originalSend = res.send;

  res.send = function (body?: any): Response {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    }
    return originalSend.call(this, body);
  };

  next();
};

/**
 * Enterprise Helmet configuration.
 */
export const enterpriseHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'http://localhost:5001',
        'http://localhost:3000',
        'https://taskflow-taqat.apps.taqat.academy',
        'https://taskflow.apps.taqat.academy',
        'https://*.taqat.academy',
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * Global rate limiter: 100 requests per minute per IP.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: 429,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests. Please throttle requests to under 100 per minute.',
      code: 'RATE_LIMIT_EXCEEDED',
      requestId: req.headers['x-request-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Mutation rate limiter: 30 write operations per minute per IP.
 */
export const mutationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: 429,
  skip: (req: Request) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Mutation rate limit exceeded. Modification requests are throttled.',
      code: 'MUTATION_RATE_LIMIT_EXCEEDED',
      requestId: req.headers['x-request-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Dedicated authentication rate limiter: 10 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: 429,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      requestId: req.headers['x-request-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Registration Rate Limiter Configuration Constants
 */
export const REGISTRATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes window
export const REGISTRATION_MAX_ATTEMPTS = 10; // 10 attempts max per window
export const COOKIE_PENALTY_MS = 5 * 60 * 1000; // 5 minutes cookie penalty (Tier 1)
export const IP_PENALTY_MS = 30 * 60 * 1000; // 30 minutes IP penalty (Tier 2)
export const REGISTRATION_TRACKER_COOKIE = 'taskflow_reg_tracker';

// In-memory state tracking
const ipBlocklist = new Map<string, number>(); // clientIp -> blockedUntil (epoch ms)
const cookieBlocklist = new Map<string, number>(); // trackerId -> blockedUntil (epoch ms)
const cookieAttempts = new Map<string, number[]>(); // trackerId -> attempt timestamps

/**
 * Parses a standard HTTP Cookie header string into key-value pairs.
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return result;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key.length > 0) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

/**
 * Normalizes IP addresses (stripping IPv6 mapping and standardizing localhost).
 */
export function normalizeIp(rawIp: string): string {
  let ip = rawIp.trim();
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  return ip;
}

/**
 * Extracts normalized client IP address from Express Request.
 */
export function getClientIp(req: Request): string {
  if (req.ip && typeof req.ip === 'string') {
    return normalizeIp(req.ip);
  }
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
    const first = xForwardedFor.split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    const first = xForwardedFor[0].split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  if (req.socket && req.socket.remoteAddress) {
    return normalizeIp(req.socket.remoteAddress);
  }
  return '127.0.0.1';
}

/**
 * Appends Set-Cookie header safely without overwriting previous cookies.
 */
export function appendCookieHeader(res: Response, cookieHeader: string): void {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookieHeader);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieHeader]);
  } else {
    res.setHeader('Set-Cookie', [String(existing), cookieHeader]);
  }
}

/**
 * Prunes expired blocks and attempt histories from memory.
 */
export function pruneExpiredRegistrationEntries(now: number = Date.now()): void {
  for (const [ip, blockedUntil] of ipBlocklist.entries()) {
    if (now >= blockedUntil) {
      ipBlocklist.delete(ip);
    }
  }
  for (const [cookie, blockedUntil] of cookieBlocklist.entries()) {
    if (now >= blockedUntil) {
      cookieBlocklist.delete(cookie);
    }
  }
  for (const [cookie, timestamps] of cookieAttempts.entries()) {
    const active = timestamps.filter((t) => now - t < REGISTRATION_WINDOW_MS);
    if (active.length === 0) {
      cookieAttempts.delete(cookie);
    } else {
      cookieAttempts.set(cookie, active);
    }
  }
}

// Background cleanup interval (unreferenced to allow clean process termination)
const cleanupTimer = setInterval(() => {
  pruneExpiredRegistrationEntries(Date.now());
}, 60 * 1000);
cleanupTimer.unref();

/**
 * Resets all registration rate limit tracking and bans. Used for testing.
 */
export function resetRegistrationRateLimits(): void {
  ipBlocklist.clear();
  cookieBlocklist.clear();
  cookieAttempts.clear();
}

/**
 * Returns current snapshot of registration rate limit internal metrics.
 */
export function getRegistrationRateLimitState(): {
  ipBlocklistSize: number;
  cookieBlocklistSize: number;
  activeTrackersCount: number;
} {
  return {
    ipBlocklistSize: ipBlocklist.size,
    cookieBlocklistSize: cookieBlocklist.size,
    activeTrackersCount: cookieAttempts.size,
  };
}

/**
 * Multi-Tier Registration Rate Limiter Middleware
 *
 * Rules:
 * 1. Registration limit: 10 attempts per 5 minutes per tracker cookie.
 * 2. Identification: Tracks attempts using cookie 'taskflow_reg_tracker'. Generates and sets UUID if missing.
 * 3. Tier 1 Penalty (Cookie Block): Exceeding 10 attempts within 5 minutes blocks the cookie for 5 minutes.
 *    Returns HTTP 429 with RFC 9457 JSON and Retry-After header. IP is NOT blocked on first offense.
 * 4. Tier 2 Penalty (IP Block Escalation): Attempting registration with a blocked cookie inside penalty window
 *    escalates to blocking client IP for 30 minutes. All subsequent requests from blocked IP return HTTP 429.
 */
export const registrationRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const now = Date.now();
  const clientIp = getClientIp(req);
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  // Tier 2: Check active IP ban
  const ipBlockedUntil = ipBlocklist.get(clientIp);
  if (ipBlockedUntil) {
    if (now < ipBlockedUntil) {
      const retryAfter = Math.max(1, Math.ceil((ipBlockedUntil - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Content-Type', 'application/problem+json');
      return res.status(429).json({
        type: 'https://taskflow.enterprise/problems/rate-limit-ip-blocked',
        title: 'Registration Forbidden - IP Address Blocked',
        status: 429,
        detail: `Client IP address (${clientIp}) is blocked for 30 minutes due to repeated registration rate limit violations. Retry after ${retryAfter} seconds.`,
        instance: req.originalUrl,
        error: 'Client IP address is blocked due to registration rate limit violations.',
        code: 'REGISTRATION_IP_BLOCKED',
        retryAfter,
        tier: 2,
        blockedUntil: new Date(ipBlockedUntil).toISOString(),
        requestId,
        timestamp: new Date().toISOString(),
      });
    } else {
      ipBlocklist.delete(clientIp);
    }
  }

  // Cookie identification
  const cookies = parseCookies(req.headers.cookie);
  let trackerId = cookies[REGISTRATION_TRACKER_COOKIE];
  let isNewTracker = false;

  if (!trackerId || typeof trackerId !== 'string' || trackerId.trim().length === 0) {
    trackerId = crypto.randomUUID();
    isNewTracker = true;
    const cookieHeader = `${REGISTRATION_TRACKER_COOKIE}=${trackerId}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`;
    appendCookieHeader(res, cookieHeader);
  }

  // Tier 2 Escalation Check: Attempt by a currently blocked cookie within penalty window
  const cookieBlockedUntil = cookieBlocklist.get(trackerId);
  if (cookieBlockedUntil) {
    if (now < cookieBlockedUntil) {
      // Escalate to IP block for 30 minutes
      const ipBanUntil = now + IP_PENALTY_MS;
      ipBlocklist.set(clientIp, ipBanUntil);

      const retryAfter = Math.max(1, Math.ceil(IP_PENALTY_MS / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('Content-Type', 'application/problem+json');
      return res.status(429).json({
        type: 'https://taskflow.enterprise/problems/rate-limit-ip-blocked',
        title: 'Registration Blocked - Escalated IP Ban',
        status: 429,
        detail: `Client IP address (${clientIp}) has been escalated and blocked for 30 minutes because a blocked session attempted registration within the penalty window. Retry after ${retryAfter} seconds.`,
        instance: req.originalUrl,
        error: 'Client IP address has been blocked for 30 minutes due to repeated registration attempts while session was blocked.',
        code: 'REGISTRATION_IP_BLOCKED',
        retryAfter,
        tier: 2,
        blockedUntil: new Date(ipBanUntil).toISOString(),
        requestId,
        timestamp: new Date().toISOString(),
      });
    } else {
      cookieBlocklist.delete(trackerId);
      cookieAttempts.delete(trackerId);
    }
  }

  // Rate Limit Sliding Window Evaluation
  const history = (cookieAttempts.get(trackerId) || []).filter(
    (timestamp) => now - timestamp < REGISTRATION_WINDOW_MS
  );

  // Check if limit exceeded (maximum 10 attempts allowed in window)
  if (history.length >= REGISTRATION_MAX_ATTEMPTS) {
    // Tier 1: Block cookie for 5 minutes. Do NOT block IP on first penalty.
    const cookieBanUntil = now + COOKIE_PENALTY_MS;
    cookieBlocklist.set(trackerId, cookieBanUntil);

    const retryAfter = Math.max(1, Math.ceil(COOKIE_PENALTY_MS / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('Content-Type', 'application/problem+json');
    return res.status(429).json({
      type: 'https://taskflow.enterprise/problems/rate-limit-cookie-blocked',
      title: 'Too Many Requests - Registration Session Blocked',
      status: 429,
      detail: 'Registration rate limit exceeded (maximum 10 attempts per 5 minutes). This session tracker is blocked for 5 minutes. Subsequent attempts will escalate to an IP address block.',
      instance: req.originalUrl,
      error: 'Registration rate limit exceeded (maximum 10 attempts per 5 minutes). Session blocked for 5 minutes.',
      code: 'REGISTRATION_COOKIE_BLOCKED',
      retryAfter,
      tier: 1,
      blockedUntil: new Date(cookieBanUntil).toISOString(),
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  // Record valid attempt within threshold
  history.push(now);
  cookieAttempts.set(trackerId, history);

  // Rate limit response headers
  res.setHeader('RateLimit-Limit', String(REGISTRATION_MAX_ATTEMPTS));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, REGISTRATION_MAX_ATTEMPTS - history.length)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(REGISTRATION_WINDOW_MS / 1000)));

  next();
};
