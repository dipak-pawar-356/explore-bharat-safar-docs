/**
 * Computes an HMAC-SHA256 digest in hex format.
 */
export declare function createHmacSha256Hex(data: string, secret: string): string;
/**
 * Computes an HMAC-SHA256 digest in Base64 format.
 */
export declare function createHmacSha256Base64(data: string, secret: string): string;
/**
 * Performs timing-safe comparison to prevent timing attacks.
 */
export declare function verifyHmacSha256Hex(data: string, expectedSignature: string, secret: string): boolean;
//# sourceMappingURL=hmac.d.ts.map