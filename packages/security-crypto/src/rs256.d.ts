/**
 * Signs data using RSA-SHA256 (RS256) private key.
 * @param data Data string to sign
 * @param privateKeyPem PEM formatted private key
 * @returns Base64 signature
 */
export declare function signRs256(data: string, privateKeyPem: string): string;
/**
 * Verifies an RS256 signature using the corresponding RSA public key.
 * @param data Data string that was signed
 * @param signature Base64 signature string
 * @param publicKeyPem PEM formatted public key
 * @returns boolean true if valid
 */
export declare function verifyRs256(data: string, signature: string, publicKeyPem: string): boolean;
//# sourceMappingURL=rs256.d.ts.map