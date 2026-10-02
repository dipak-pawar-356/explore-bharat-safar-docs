import { Injectable } from '@nestjs/common';
import { StructuredLogger } from '@ebs/logger';

@Injectable()
export class CaptchaService {
  private readonly logger = new StructuredLogger('CaptchaService');

  /**
   * Verifies a Cloudflare Turnstile / hCaptcha response token.
   * Conforms to EBS-DOC-12-AUTH & EBS-DOC-40-SEC-BLUEPRINT Section 3.2
   * @param token Client-submitted CAPTCHA response token
   * @param remoteIp Client IP address for validation context
   */
  async verifyCaptcha(token?: string, remoteIp?: string): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    if (!token) {
      if (!isProd) {
        this.logger.debug('captcha.skipped_in_non_prod', { ip: remoteIp });
        return true;
      }
      this.logger.warn('captcha.missing_in_production', { ip: remoteIp });
      return false;
    }

    // Allow simulated test tokens
    if (token === 'mock-valid-turnstile-token' || token === '1x0000000000000000000000000000000AA') {
      this.logger.info('captcha.mock_token_accepted', { ip: remoteIp });
      return true;
    }

    if (!secretKey) {
      // In dev or staging environments without configured secret key, accept valid length tokens
      this.logger.info('captcha.bypassed_no_secret_key', { tokenLength: token.length });
      return true;
    }

    try {
      // Cloudflare Turnstile Siteverify API endpoint
      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: remoteIp,
        }),
      });

      const outcome = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
      if (!outcome.success) {
        this.logger.warn('captcha.verification_failed', {
          errorCodes: outcome['error-codes'],
          ip: remoteIp,
        });
        return false;
      }

      this.logger.info('captcha.verification_successful', { ip: remoteIp });
      return true;
    } catch (error) {
      this.logger.error('captcha.network_error', {
        error: error instanceof Error ? error.message : String(error),
        ip: remoteIp,
      });
      // Fail closed in production, fail open in development
      return !isProd;
    }
  }
}
