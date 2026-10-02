export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
    tag: string;
}
/**
 * Encrypts a UTF-8 string with AES-256-GCM.
 * @param plaintext The string to encrypt
 * @param keyHex 32-byte (64 hex characters) encryption key
 */
export declare function encryptAesGcm(plaintext: string, keyHex: string): EncryptedPayload;
/**
 * Decrypts an AES-256-GCM encrypted payload.
 * Throws if the payload has been tampered with or key is invalid.
 */
export declare function decryptAesGcm(payload: EncryptedPayload, keyHex: string): string;
//# sourceMappingURL=aes-gcm.d.ts.map