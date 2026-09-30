# Explore Bharat Safar — Environment Configuration, Secrets Governance & Variable Matrix

- **Document Identifier**: EBS-DOC-28-ENV
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: DevOps Engineers, SREs, Backend Developers, Security Administrators
- **Related Documents**:
  - `03-architecture.md`
  - `11-security.md`
  - `12-authentication.md`
  - `22-deployment.md`
  - `23-devops.md`
- **Last Updated**: 2026-09-28

---

## 1. Secrets Management Philosophy & Governance

Configuration in **Explore Bharat Safar** adheres strictly to the **Twelve-Factor App** methodology. Application code is completely decoupled from configuration state. Secrets, encryption keys, and external API tokens are injected dynamically at runtime via Kubernetes Secrets managed through HashiCorp Vault or AWS Secrets Manager.

```mermaid
graph TD
    Vault[HashiCorp Vault / AWS Secrets Manager] --> ESO[Kubernetes External Secrets Operator]
    ESO --> K8sSecret[Encrypted Kubernetes Secret Objects]
    K8sSecret --> PodEnv[Pod Container Environment Ingestion]
    PodEnv --> ZodPipe[Zod Startup Validation Pipe (Fail-Fast)]
    ZodPipe -- Valid --> AppStart[Application Boots Successfully]
    ZodPipe -- Invalid --> CrashLoop[Fatal Crash & Alert Logged]
```

### 1.1 Non-Negotiable Rules
1. **Zero Secret Storage in Version Control**: Committing `.env` files or hardcoded credentials to Git triggers an immediate CI pipeline termination and credentials revocation.
2. **Fail-Fast Startup Validation**: The application instantiates a strict Zod validation schema upon boot. If any required variable is missing or malformed, the process exits with status code `1` before accepting network traffic.

---

## 2. Comprehensive Environment Variable Matrix

| Variable Identifier | Expected Data Type | Required in Prod | Sample Value / Format | Security Classification | Subsystem Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | String (`enum`) | Yes | `production` | Public | Core Runtime |
| `PORT` | Integer | Yes | `4000` | Public | Core Runtime |
| `DATABASE_URL` | String (URI) | Yes | `postgresql://usr:pwd@pg.internal:5432/ebs_db?sslmode=require` | **Secret** | Persistence |
| `REDIS_HOST` | String | Yes | `redis-cluster.internal` | Internal | Cache / Locks |
| `REDIS_PASSWORD` | String | Yes | `e8f9a2b4...` | **Secret** | Cache / Locks |
| `JWT_PRIVATE_KEY` | String (PEM) | Yes | `-----BEGIN RSA PRIVATE KEY-----...` | **High Secret** | Identity (IAM) |
| `JWT_PUBLIC_KEY` | String (PEM) | Yes | `-----BEGIN PUBLIC KEY-----...` | Internal | Identity (IAM) |
| `RAZORPAY_KEY_ID` | String | Yes | `rzp_live_8F9a21b` | Public / Edge | Payments |
| `RAZORPAY_KEY_SECRET` | String | Yes | `secret_99182f...` | **High Secret** | Payments |
| `RAZORPAY_WEBHOOK_SECRET`| String | Yes | `wh_sec_7a8b91...` | **High Secret** | Payments |
| `AWS_SES_REGION` | String | Yes | `ap-south-1` (Mumbai) | Public | Notifications |
| `AWS_SES_ACCESS_KEY` | String | Yes | `AKIAIOSFODNN7EXAMPLE` | **Secret** | Notifications |
| `S3_BUCKET_MEDIA` | String | Yes | `ebs-media-production-vault` | Internal | Object Vault |
| `S3_BUCKET_CERTS` | String | Yes | `ebs-certificates-vault` | Internal | Object Vault |
| `WHATSAPP_API_TOKEN` | String | Yes | `EAAIx91...` | **High Secret** | Notifications |

---

## 3. Runtime Environment Validation Schema (Zod Implementation)

```typescript
// src/config/env.validation.ts
import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(16),
  JWT_PRIVATE_KEY: z.string().includes('BEGIN RSA PRIVATE KEY'),
  JWT_PUBLIC_KEY: z.string().includes('BEGIN PUBLIC KEY'),
  RAZORPAY_KEY_ID: z.string().startsWith('rzp_'),
  RAZORPAY_KEY_SECRET: z.string().min(16),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(16),
  S3_BUCKET_MEDIA: z.string().min(3),
  S3_BUCKET_CERTS: z.string().min(3),
});

export function validateEnvironment(config: Record<string, unknown>) {
  const result = EnvironmentSchema.safeParse(config);
  if (!result.success) {
    console.error('CRITICAL: Malformed Environment Configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

---

## 4. Summary & Downstream Alignment

This environment specification enforces the secure injection, classification, and runtime validation of configuration parameters across Explore Bharat Safar. It interfaces directly with deployment manifests in `22-deployment.md` and DevOps pipelines in `23-devops.md`.
