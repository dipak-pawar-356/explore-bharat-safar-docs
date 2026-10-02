// Explore Bharat Safar — Vault & Secret Management Abstraction
// Supports HashiCorp Vault, AWS Secrets Manager, and Kubernetes External Secrets

import * as fs from 'fs';
import * as path from 'path';

export interface IVaultSecretProvider {
  getSecret(key: string, defaultValue?: string): Promise<string>;
  getSecretSync(key: string, defaultValue?: string): string;
}

export class VaultSecretService implements IVaultSecretProvider {
  private static instance: VaultSecretService;
  private readonly secretCache: Map<string, string> = new Map();
  private readonly vaultMountPath: string;

  constructor(vaultMountPath = '/vault/secrets') {
    this.vaultMountPath = vaultMountPath;
  }

  public static getInstance(): VaultSecretService {
    if (!VaultSecretService.instance) {
      VaultSecretService.instance = new VaultSecretService();
    }
    return VaultSecretService.instance;
  }

  /**
   * Retrieves a secret key asynchronously, checking:
   * 1. In-memory cache
   * 2. HashiCorp Vault Agent / Kubernetes volume mount file
   * 3. Process environment variable fallback
   */
  public async getSecret(key: string, defaultValue?: string): Promise<string> {
    return this.getSecretSync(key, defaultValue);
  }

  /**
   * Synchronous secret resolver for bootstrap configuration
   */
  public getSecretSync(key: string, defaultValue?: string): string {
    if (this.secretCache.has(key)) {
      return this.secretCache.get(key)!;
    }

    // 1. Try reading from Vault injected filesystem
    try {
      const filePath = path.join(this.vaultMountPath, key);
      if (fs.existsSync(filePath)) {
        const val = fs.readFileSync(filePath, 'utf8').trim();
        if (val) {
          this.secretCache.set(key, val);
          return val;
        }
      }
    } catch {
      // Injected file not available, proceed to env fallback
    }

    // 2. Try reading from process.env
    const envVal = process.env[key];
    if (envVal !== undefined && envVal !== '') {
      this.secretCache.set(key, envVal);
      return envVal;
    }

    // 3. Default value fallback
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(
      `[VaultSecretService] Required production secret '${key}' could not be resolved from Vault or Environment.`,
    );
  }

  public clearCache(): void {
    this.secretCache.clear();
  }
}
