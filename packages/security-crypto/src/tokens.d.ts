/**
 * Generates a cryptographically secure random token (hex encoded).
 * @param byteLength Number of random bytes (default 32 bytes = 256 bits of entropy)
 */
export declare function generateSecureToken(byteLength?: number): string;
/**
 * Computes a SHA-256 hash of an arbitrary token or string.
 * Used for storing indexed hashes of refresh tokens, backup codes, or session identifiers.
 */
export declare function hashToken(token: string): string;
/**
 * Generates single-use emergency backup recovery codes for MFA / account recovery.
 * @param count Number of codes to issue (default 8)
 * @param length Character length per code (default 10)
 */
export declare function generateRecoveryCodes(count?: number, length?: number): string[];
/**
 * Generates a SHA-256 browser / device fingerprint digest.
 */
export declare function generateDeviceFingerprint(userAgent?: string, ipAddress?: string): string;
//# sourceMappingURL=tokens.d.ts.map