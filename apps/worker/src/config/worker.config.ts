// Explore Bharat Safar — Worker Configuration
// Reference: EBS-BLU-49-REPO Section 5.1

export const workerConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD || 'local_dev_redis_secret_password_16chars',
  },
  concurrency: {
    certificates: 5,
    media: 3,
    invoices: 5,
    notifications: 10,
  },
  certificateHmacSecret:
    process.env.CERTIFICATE_HMAC_SECRET ||
    'ebs_certificate_tamper_proof_secret_hash_key_minimum_32_chars',
};
