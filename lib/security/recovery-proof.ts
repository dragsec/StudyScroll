import { createHmac, timingSafeEqual } from "node:crypto";

export const passwordRecoveryCookie = "studyscroll-password-recovery";
export const passwordRecoveryLifetimeSeconds = 10 * 60;

function recoverySecret() {
  const secret = process.env.AUTH_RECOVERY_HMAC_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function signature(userId: string, expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`studyscroll-password-recovery:v1:${userId}:${expiresAt}`)
    .digest("base64url");
}

export function createPasswordRecoveryProof(
  userId: string,
  now = Date.now(),
  secret = recoverySecret(),
) {
  if (!secret) return null;
  const expiresAt = Math.floor(now / 1000) + passwordRecoveryLifetimeSeconds;
  return `v1.${expiresAt}.${userId}.${signature(userId, expiresAt, secret)}`;
}

export function verifyPasswordRecoveryProof(
  value: string | undefined,
  userId: string,
  now = Date.now(),
  secret = recoverySecret(),
) {
  if (!value || !secret || value.length > 256) return false;
  const [version, rawExpiry, proofUserId, providedSignature, ...extra] = value.split(".");
  if (
    version !== "v1" ||
    extra.length > 0 ||
    proofUserId !== userId ||
    !/^\d{10}$/u.test(rawExpiry) ||
    !/^[A-Za-z0-9_-]{43}$/u.test(providedSignature ?? "")
  ) {
    return false;
  }

  const expiresAt = Number(rawExpiry);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < nowSeconds || expiresAt > nowSeconds + passwordRecoveryLifetimeSeconds) {
    return false;
  }

  const expected = Buffer.from(signature(userId, expiresAt, secret));
  const provided = Buffer.from(providedSignature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function passwordRecoveryProofExpiresAt(value: string) {
  const [, rawExpiry] = value.split(".");
  if (!/^\d{10}$/u.test(rawExpiry ?? "")) return null;
  const expiresAt = Number(rawExpiry);
  return Number.isSafeInteger(expiresAt) ? new Date(expiresAt * 1000) : null;
}
