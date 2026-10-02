export interface Argon2Options {
    memoryCost?: number;
    timeCost?: number;
    parallelism?: number;
}
export declare const DEFAULT_ARGON2_OPTIONS: Argon2Options;
/**
 * Hashes a plaintext password using Argon2id with memory-hard parameters ($m=64MB, t=3, p=1).
 * Falls back to scrypt if native argon2 bindings are unavailable in the runtime environment.
 */
export declare function hashPassword(password: string, options?: Argon2Options): Promise<string>;
/**
 * Verifies a plaintext password against the stored hash.
 * Supports both Argon2id ($argon2id$) and fallback scrypt ($scrypt$) hashes.
 * Handles both (hash, plain) and (plain, hash) parameter order for safety.
 */
export declare function verifyPassword(param1: string, param2: string): Promise<boolean>;
//# sourceMappingURL=argon2.d.ts.map