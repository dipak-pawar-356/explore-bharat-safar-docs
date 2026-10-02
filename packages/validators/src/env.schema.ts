// Explore Bharat Safar — Environment Validation Schema
// Reference: EBS-DOC-28-ENV (Environment Configuration, Secrets Governance & Variable Matrix)

import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(16).default('local_dev_redis_secret_password_16chars'),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DATA_ENCRYPTION_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  S3_BUCKET_MEDIA: z.string().optional(),
  S3_BUCKET_CERTS: z.string().optional(),
  S3_BUCKET_QUARANTINE: z.string().optional(),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_SES_REGION: z.string().default('ap-south-1'),
  AWS_SES_ACCESS_KEY: z.string().optional(),
  AWS_SES_SECRET_KEY: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  JWT_SECRET: z
    .string()
    .min(32)
    .default('ebs_super_secure_jwt_dev_secret_key_minimum_32_characters_long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(30),
  EMAIL_FROM: z.string().email().default('noreply@explorebharatsafar.in'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
  exitOnError = true,
): Environment {
  const result = EnvironmentSchema.safeParse(config);
  if (!result.success) {
    // Fail-fast startup rule (EBS-DOC-28-ENV)
    const errorFormatted = JSON.stringify(result.error.format(), null, 2);
    process.stderr.write(`CRITICAL: Malformed Environment Configuration:\n${errorFormatted}\n`);
    const isTest = config.NODE_ENV === 'test' || process.env.NODE_ENV === 'test';
    if (exitOnError && !isTest) {
      process.exit(1);
    }
    throw new Error(`Malformed Environment Configuration: ${errorFormatted}`);
  }
  return result.data;
}
