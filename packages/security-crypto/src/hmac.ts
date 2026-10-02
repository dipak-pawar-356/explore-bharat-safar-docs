// Explore Bharat Safar — HMAC-SHA256 Digital Verification Suite
// Reference: EBS-DOC-20-CERT & EBS-DOC-21-PAY

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Computes an HMAC-SHA256 digest in hex format.
 */
export function createHmacSha256Hex(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

/**
 * Computes an HMAC-SHA256 digest in Base64 format.
 */
export function createHmacSha256Base64(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data, 'utf8').digest('base64');
}

/**
 * Performs timing-safe comparison to prevent timing attacks.
 */
export function verifyHmacSha256Hex(
  data: string,
  expectedSignature: string,
  secret: string,
): boolean {
  const calculated = createHmacSha256Hex(data, secret);
  const calculatedBuf = Buffer.from(calculated, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');

  if (calculatedBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(calculatedBuf, expectedBuf);
}
