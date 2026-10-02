// Explore Bharat Safar — Cryptographic Tokens & Identity Security Helpers
// Reference: EBS-DOC-12-AUTH & EBS-DOC-40-SEC-BLUEPRINT Section 4, 7 & 10

import { randomBytes, createHash } from 'node:crypto';

/**
 * Generates a cryptographically secure random token (hex encoded).
 * @param byteLength Number of random bytes (default 32 bytes = 256 bits of entropy)
 */
export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('hex');
}

/**
 * Computes a SHA-256 hash of an arbitrary token or string.
 * Used for storing indexed hashes of refresh tokens, backup codes, or session identifiers.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generates single-use emergency backup recovery codes for MFA / account recovery.
 * @param count Number of codes to issue (default 8)
 * @param length Character length per code (default 10)
 */
export function generateRecoveryCodes(count = 8, length = 10): string[] {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Base32-like, excludes ambiguous characters (O, 0, 1, I)
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = randomBytes(length);
    let code = '';
    for (let j = 0; j < length; j++) {
      code += charset[bytes[j] % charset.length];
    }
    codes.push(code);
  }

  return codes;
}

/**
 * Generates a SHA-256 browser / device fingerprint digest.
 */
export function generateDeviceFingerprint(userAgent = 'unknown', ipAddress = 'unknown'): string {
  return createHash('sha256').update(`${userAgent}:::${ipAddress}`).digest('hex');
}
