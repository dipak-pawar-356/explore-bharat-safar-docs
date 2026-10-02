// Explore Bharat Safar — Certificate Cryptographic Hasher & Signing Service
// Reference: EBS-DOC-20-CERT Section 4 (HMAC-SHA256 Content Digest & Verification)

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, generateKeyPairSync } from 'node:crypto';
import * as QRCode from 'qrcode';
import {
  createHmacSha256Hex,
  verifyHmacSha256Hex,
  signRs256,
  verifyRs256,
} from '@ebs/security-crypto';

export interface ComputeDigestParams {
  certificateNumber: string;
  participantName: string;
  experienceIdOrTitle: string;
  completionDate: string;
}

@Injectable()
export class CertificateHasherService {
  private readonly logger = new Logger(CertificateHasherService.name);
  private readonly hmacSecret: string;
  private readonly privateKeyPem: string;
  private readonly publicKeyPem: string;

  constructor(private readonly configService: ConfigService) {
    this.hmacSecret =
      this.configService.get<string>('CERTIFICATE_HMAC_SECRET') ||
      'ebs_certificate_tamper_proof_secret_hash_key_minimum_32_chars';

    // RSA Keypair initialization for RS256 digital signing
    const configuredPrivKey = this.configService.get<string>('CERTIFICATE_RS256_PRIVATE_KEY');
    const configuredPubKey = this.configService.get<string>('CERTIFICATE_RS256_PUBLIC_KEY');

    if (configuredPrivKey && configuredPubKey) {
      this.privateKeyPem = configuredPrivKey.replace(/\\n/g, '\n');
      this.publicKeyPem = configuredPubKey.replace(/\\n/g, '\n');
    } else {
      // Deterministic fallback for test/dev environments
      const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      this.privateKeyPem = privateKey;
      this.publicKeyPem = publicKey;
    }
  }

  /**
   * Generates a unique, standardized certificate number conforming to:
   * EBS-CERT-YYYY-<SLUG4>-<HEX6>
   * Example: EBS-CERT-2026-HARI-8F3A21
   */
  generateCertificateNumber(
    experienceSlug: string,
    year: number = new Date().getFullYear(),
  ): string {
    const cleanSlug = experienceSlug
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const slugPrefix = cleanSlug.length >= 3 ? cleanSlug : 'EXPD';
    const entropyHex = randomBytes(3).toString('hex').toUpperCase();
    return `EBS-CERT-${year}-${slugPrefix}-${entropyHex}`;
  }

  /**
   * Computes canonical HMAC-SHA256 verification digest:
   * Verification Digest = HMAC-SHA256(Secret, C_num || P_name || E_id || D_comp)
   */
  computeVerificationDigest(params: ComputeDigestParams): string {
    const canonicalPayload = `${params.certificateNumber}:${params.participantName.trim()}:${params.experienceIdOrTitle.trim()}:${params.completionDate}`;
    return createHmacSha256Hex(canonicalPayload, this.hmacSecret);
  }

  /**
   * Verifies canonical HMAC-SHA256 verification digest using constant-time comparison.
   */
  verifyVerificationDigest(params: ComputeDigestParams, expectedDigest: string): boolean {
    const canonicalPayload = `${params.certificateNumber}:${params.participantName.trim()}:${params.experienceIdOrTitle.trim()}:${params.completionDate}`;
    return verifyHmacSha256Hex(canonicalPayload, expectedDigest, this.hmacSecret);
  }

  /**
   * Signs the verification digest using the platform RS256 private key.
   */
  createDigitalSignature(digest: string): string {
    return signRs256(digest, this.privateKeyPem);
  }

  /**
   * Verifies the RS256 digital signature against the verification digest using the public key.
   */
  verifyDigitalSignature(digest: string, signature: string): boolean {
    return verifyRs256(digest, signature, this.publicKeyPem);
  }

  /**
   * Synthesizes a high-contrast dynamic QR Code Data URL pointing to the public verification endpoint.
   */
  async generateVerificationQrCode(
    certificateNumber: string,
    digest: string,
    baseUrl: string = 'https://explorebharatsafar.in',
  ): Promise<string> {
    const shortDigest = digest.substring(0, 16);
    const verifyUrl = `${baseUrl}/verify/${certificateNumber}?hash=${shortDigest}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#1E293B', // Slate 800
          light: '#FFFFFF', // Pure white
        },
        width: 180,
      });
      return qrDataUrl;
    } catch (err: unknown) {
      this.logger.error(`Failed to generate QR Code for ${certificateNumber}`, err);
      throw err;
    }
  }

  /**
   * Returns the public key in PEM format for external verification.
   */
  getPublicKey(): string {
    return this.publicKeyPem;
  }
}
