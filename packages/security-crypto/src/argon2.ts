// Explore Bharat Safar — Argon2id Password Hashing & Verification Suite
// Reference: EBS-DOC-11-SECURITY, EBS-DOC-12-AUTHENTICATION & EBS-BLU-40-SEC Section 9

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH_BYTES = 64;
const SALT_LENGTH_BYTES = 16;

export interface Argon2Options {
  memoryCost?: number; // 64 MB = 65536 KiB
  timeCost?: number; // 3 iterations
  parallelism?: number; // 1 thread
}

export const DEFAULT_ARGON2_OPTIONS: Argon2Options = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

let argon2Module: typeof import('argon2') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  argon2Module = require('argon2');
} catch {
  argon2Module = null;
}

/**
 * Hashes a plaintext password using Argon2id with memory-hard parameters ($m=64MB, t=3, p=1).
 * Falls back to scrypt if native argon2 bindings are unavailable in the runtime environment.
 */
export async function hashPassword(
  password: string,
  options: Argon2Options = DEFAULT_ARGON2_OPTIONS,
): Promise<string> {
  if (argon2Module) {
    return argon2Module.hash(password, {
      type: argon2Module.argon2id,
      memoryCost: options.memoryCost ?? DEFAULT_ARGON2_OPTIONS.memoryCost,
      timeCost: options.timeCost ?? DEFAULT_ARGON2_OPTIONS.timeCost,
      parallelism: options.parallelism ?? DEFAULT_ARGON2_OPTIONS.parallelism,
    });
  }

  // Fallback to scrypt if native addon is not available
  const salt = randomBytes(SALT_LENGTH_BYTES);
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH_BYTES)) as Buffer;
  return `$scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against the stored hash.
 * Supports both Argon2id ($argon2id$) and fallback scrypt ($scrypt$) hashes.
 * Handles both (hash, plain) and (plain, hash) parameter order for safety.
 */
export async function verifyPassword(param1: string, param2: string): Promise<boolean> {
  let hash: string;
  let plain: string;

  if (param1.startsWith('$')) {
    hash = param1;
    plain = param2;
  } else if (param2.startsWith('$')) {
    plain = param1;
    hash = param2;
  } else {
    return false;
  }

  if (hash.startsWith('$argon2')) {
    if (argon2Module) {
      try {
        return await argon2Module.verify(hash, plain);
      } catch {
        return false;
      }
    }
    return false;
  }

  if (hash.startsWith('$scrypt$')) {
    const parts = hash.split('$');
    if (parts.length !== 4) return false;
    const saltHex = parts[2];
    const hashHex = parts[3];
    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');

    const derivedKey = (await scryptAsync(plain, salt, KEY_LENGTH_BYTES)) as Buffer;
    if (derivedKey.length !== expectedHash.length) return false;

    return timingSafeEqual(derivedKey, expectedHash);
  }

  return false;
}
