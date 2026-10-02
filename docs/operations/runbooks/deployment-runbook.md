# Explore Bharat Safar — Production Deployment Runbook
## Standard Operating Procedure: Canary & Blue-Green Release Operations

---

## 1. Overview & Pre-Flight Gating

This runbook guides DevOps engineers and SREs through production deployments. All deployments follow automated GitOps practices with Canary or Blue-Green rollout strategies.

---

## 2. Pre-Deployment Verification

1. **Verify CI Pipeline Green**:
   Confirm all checks on `main` or the release branch (`release/*`) have passed.
2. **Review Image Scan Results**:
   Confirm Trivy scan detected zero `CRITICAL` or `HIGH` vulnerabilities.
3. **Check Database Migration Status**:
   ```bash
   pnpm prisma migrate status
   ```
4. **Inspect Error Budgets**:
   Check Grafana `ebs-executive-sla-slo` dashboard to ensure remaining 30-day error budget is $> 20\%$.

---

## 3. Canary Deployment Execution

1. **Trigger Automated Production Deployment**:
   Push a semantic version git tag (e.g., `git push origin v1.0.1`) or dispatch the GitHub Actions `production-deploy.yml` workflow.
2. **Phase 1: Canary 10% Traffic Weight (15 Minutes)**:
   - Traffic splits $10\%$ to the new image revision and $90\%$ to stable pods.
   - Prometheus automated metric evaluation runs:
     - 5xx HTTP error rate must remain $< 0.5\%$.
     - P99 latency must remain $< 500\text{ms}$.
3. **Phase 2: Canary 50% Traffic Weight (10 Minutes)**:
   - Traffic splits $50/50$.
   - Monitor database connection pool and Redis memory.
4. **Phase 3: 100% Full Promotion**:
   - Canary promoted to stable production.
   - Old replica set scaled down over a 300s grace window.

---

## 4. Post-Deployment Verification

Run the production smoke test suite:
```bash
bash scripts/deploy/production-smoke-tests.sh https://explorebharatsafar.in
```
Verify `/health` endpoint:
```bash
curl -s https://api.explorebharatsafar.in/health | jq .
```
