# Explore Bharat Safar — Security Hardening & Edge WAF Summary
## Defense-in-Depth Architecture, Zero-Trust Policies & CIS Benchmarks

---

## 1. Multi-Layer Defense Architecture

```
[ Layer 1: Edge (Cloudflare Anycast) ]
  • TLS 1.3 Termination & HSTS Preload
  • OWASP Core Ruleset (CRS) SQLi/XSS/RCE Blocking
  • Rate Limiting (10 req/min Auth, 150 req/min Search)
  • Edge Worker CSP Injection & Bot Shield

[ Layer 2: Ingress & Network (Kubernetes) ]
  • Ingress Rate Limiting & TLS Termination
  • Zero-Trust NetworkPolicies Restricting Egress
  • Strict ServiceAccount Scoping via AWS IRSA

[ Layer 3: Container Runtime ]
  • Distroless Base Images (No package managers or shells)
  • Non-Root User Execution (UID 10001, GID 10001)
  • Read-Only Root Filesystem with /tmp ephemeral volume
  • Trivy Container Scanning with Zero High/Critical Tolerance

[ Layer 4: Application & Secrets ]
  • HashiCorp Vault Dynamic Secret Injection
  • Argon2id Password Hashing & AES-256-GCM Token Encryption
  • DPDP Act 2023 DLP Sanitization Pipeline
```

---

## 2. Production Security Headers

Injected at edge via `infrastructure/cloudflare/workers/security-headers.ts`:
- **`Strict-Transport-Security`**: `max-age=63072000; includeSubDomains; preload`
- **`Content-Security-Policy`**: `default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.explorebharatsafar.in wss://api.explorebharatsafar.in; frame-ancestors 'none';`
- **`X-Frame-Options`**: `DENY`
- **`X-Content-Type-Options`**: `nosniff`
- **`Referrer-Policy`**: `strict-origin-when-cross-origin`
- **`Permissions-Policy`**: `camera=(), microphone=(), geolocation=(self), payment=(self)`
