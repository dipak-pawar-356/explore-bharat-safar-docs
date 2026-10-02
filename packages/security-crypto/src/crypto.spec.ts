// Explore Bharat Safar — Cryptographic Foundation Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import {
  encryptAesGcm,
  decryptAesGcm,
  createHmacSha256Hex,
  verifyHmacSha256Hex,
  hashPassword,
  verifyPassword,
  signRs256,
  verifyRs256,
  generateSecureToken,
  hashToken,
  generateRecoveryCodes,
  generateDeviceFingerprint,
} from './index';

describe('AES-256-GCM Encryption Suite', () => {
  const sampleKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('should encrypt and decrypt plaintext accurately', () => {
    const secretMessage = 'Explore Bharat Safar — Confidential Payload';
    const encrypted = encryptAesGcm(secretMessage, sampleKey);

    assert.ok(encrypted.ciphertext, 'Ciphertext should be present');
    assert.ok(encrypted.iv, 'IV should be present');
    assert.ok(encrypted.tag, 'Auth tag should be present');

    const decrypted = decryptAesGcm(encrypted, sampleKey);
    assert.equal(decrypted, secretMessage);
  });

  it('should reject invalid key length', () => {
    assert.throws(() => {
      encryptAesGcm('test', 'short_key');
    }, /Invalid key length/);
  });

  it('should throw when payload has been tampered with', () => {
    const encrypted = encryptAesGcm('Integrity test', sampleKey);
    const tampered = {
      ...encrypted,
      ciphertext: Buffer.from('Tampered content').toString('base64'),
    };

    assert.throws(() => {
      decryptAesGcm(tampered, sampleKey);
    });
  });
});

describe('HMAC-SHA256 Digital Verification Suite', () => {
  const secret = 'super-secret-hmac-key-16chars';

  it('should generate digest and verify correctly', () => {
    const payload = 'Certificate-ID: EBS-CERT-2026-0001';
    const signature = createHmacSha256Hex(payload, secret);

    assert.equal(typeof signature, 'string');
    assert.equal(signature.length, 64); // 256 bits in hex

    const isValid = verifyHmacSha256Hex(payload, signature, secret);
    assert.equal(isValid, true);
  });

  it('should reject forged or mismatched signatures', () => {
    const payload = 'Certificate-ID: EBS-CERT-2026-0001';
    const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const isValid = verifyHmacSha256Hex(payload, forgedSignature, secret);
    assert.equal(isValid, false);
  });
});

describe('Password Hashing Suite (Argon2id & Fallback)', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'CorrectHorseBatteryStaple!2026';
    const hash = await hashPassword(password);

    assert.ok(
      hash.startsWith('$argon2id$') || hash.startsWith('$scrypt$'),
      'Hash should have standard cryptographic prefix ($argon2id$ or $scrypt$)',
    );

    const valid = await verifyPassword(password, hash);
    assert.equal(valid, true, 'Valid password verification');

    const validReversed = await verifyPassword(hash, password);
    assert.equal(validReversed, true, 'Parameter order flexibility');

    const wrong = await verifyPassword('WrongPassword123', hash);
    assert.equal(wrong, false, 'Invalid password rejection');

    const invalidHash = await verifyPassword(password, 'invalid-hash-string');
    assert.equal(invalidHash, false, 'Malformed hash rejection');
  });
});

describe('RS256 Asymmetric Signature Suite', () => {
  it('should sign and verify using RSA key pair', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const data = 'JWT Header + Payload data';
    const sig = signRs256(data, privateKey);
    assert.ok(sig.length > 0);

    const valid = verifyRs256(data, sig, publicKey);
    assert.equal(valid, true);

    const tamperedValid = verifyRs256('Tampered data', sig, publicKey);
    assert.equal(tamperedValid, false);
  });
});

describe('Cryptographic Tokens & Fingerprinting Suite', () => {
  it('should generate secure tokens with specified length', () => {
    const token = generateSecureToken(32);
    assert.equal(typeof token, 'string');
    assert.equal(token.length, 64); // 32 bytes in hex = 64 characters
  });

  it('should generate deterministic sha256 token hash', () => {
    const token = 'sample-secret-token-123';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  it('should generate 8 single-use emergency recovery codes', () => {
    const codes = generateRecoveryCodes(8, 10);
    assert.equal(codes.length, 8);
    for (const code of codes) {
      assert.equal(code.length, 10);
      assert.match(code, /^[A-Z0-9]+$/);
    }
  });

  it('should generate device fingerprint consistently', () => {
    const fp1 = generateDeviceFingerprint('Mozilla/5.0 Chrome', '192.168.1.1');
    const fp2 = generateDeviceFingerprint('Mozilla/5.0 Chrome', '192.168.1.1');
    const fp3 = generateDeviceFingerprint('Mozilla/5.0 Firefox', '192.168.1.1');

    assert.equal(fp1, fp2);
    assert.notEqual(fp1, fp3);
  });
});
