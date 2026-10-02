// Explore Bharat Safar — AES-256-GCM Field-Level Encryption
// Complies with FIPS 140-3 & Enterprise Security Blueprint (EBS-BLU-40-SEC)

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64
  tag: string; // Base64
}

/**
 * Encrypts a UTF-8 string with AES-256-GCM.
 * @param plaintext The string to encrypt
 * @param keyHex 32-byte (64 hex characters) encryption key
 */
export function encryptAesGcm(plaintext: string, keyHex: string): EncryptedPayload {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid key length: AES-256 requires exactly 32 bytes (64 hex characters)');
  }

  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 * Throws if the payload has been tampered with or key is invalid.
 */
export function decryptAesGcm(payload: EncryptedPayload, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid key length: AES-256 requires exactly 32 bytes (64 hex characters)');
  }

  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(payload.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}
