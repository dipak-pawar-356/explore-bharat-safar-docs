// Explore Bharat Safar — RS256 Asymmetric Cryptographic Operations
// Reference: EBS-DOC-11-SECURITY & EBS-DOC-12-AUTHENTICATION

import { createSign, createVerify } from 'node:crypto';

/**
 * Signs data using RSA-SHA256 (RS256) private key.
 * @param data Data string to sign
 * @param privateKeyPem PEM formatted private key
 * @returns Base64 signature
 */
export function signRs256(data: string, privateKeyPem: string): string {
  const sign = createSign('RSA-SHA256');
  sign.update(data, 'utf8');
  return sign.sign(privateKeyPem, 'base64');
}

/**
 * Verifies an RS256 signature using the corresponding RSA public key.
 * @param data Data string that was signed
 * @param signature Base64 signature string
 * @param publicKeyPem PEM formatted public key
 * @returns boolean true if valid
 */
export function verifyRs256(data: string, signature: string, publicKeyPem: string): boolean {
  try {
    const verify = createVerify('RSA-SHA256');
    verify.update(data, 'utf8');
    return verify.verify(publicKeyPem, signature, 'base64');
  } catch {
    return false;
  }
}
