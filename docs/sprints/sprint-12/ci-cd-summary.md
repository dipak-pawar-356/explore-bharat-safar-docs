# Explore Bharat Safar — CI/CD Automation & Release Pipeline Summary
## GitHub Actions Architecture, Quality Gates & Progressive Delivery

---

## 1. Automated Pipeline Architecture

```mermaid
flowchart LR
    Commit[Commit / PR] --> Gate1[Gate 1: Format & Lint]
    Gate1 --> Gate2[Gate 2: TypeScript Strict Check]
    Gate2 --> Gate3[Gate 3: Automated Unit & Spec Tests]
    Gate3 --> Gate4[Gate 4: Security Audit & Trivy Scan]
    Gate4 --> Build[Multi-Stage Distroless Build]
    Build --> DeployCanary[Canary Rollout: 10% Traffic]
    DeployCanary --> Analysis{Prometheus Analysis: 5xx < 0.5%, P99 < 500ms}
    Analysis -- Pass --> Promote[Promote to 100% Production]
    Analysis -- Fail --> Abort[Automated Rollback to Prior Tag]
```

---

## 2. Active Workflows Overview

1. **`ci-pipeline.yml`**:
   - Executes on all pull requests and pushes to `main`.
   - Runs Prettier check, ESLint, TypeScript `tsc --noEmit`, and monorepo test runner.
2. **`production-deploy.yml`**:
   - Triggered on release git tags (`v*`) or manual workflow dispatch.
   - Executes pre-flight verification, multi-stage Docker builds, Trivy container layer scanning, canary deployment (10% $\rightarrow$ 50% $\rightarrow$ 100%), and post-deployment smoke tests.
3. **`release.yml`**:
   - Automates semantic version bumping (`patch`, `minor`, `major`), changelog creation, and git tagging.
4. **`security-compliance.yml`**:
   - Nightly and PR scans for dependency CVEs (`pnpm audit --prod`), copyleft license violations, and secret leaks (Gitleaks).
