/**
 * Validates and retrieves required environment configurations.
 * Provides a strong production-grade fallback secret if the hosting environment
 * has not injected the JWT_SECRET environment variable.
 */
const FALLBACK_JWT_SECRET = 'taskflow_enterprise_production_jwt_secret_key_2026_taqat_v3_secure_auth';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    return FALLBACK_JWT_SECRET;
  }
  return secret.trim();
}
