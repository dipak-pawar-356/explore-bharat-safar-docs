# Explore Bharat Safar — Emergency Rollback Runbook
## Standard Operating Procedure: Rapid Reversion & Incident Containment

---

## 1. When to Initiate an Emergency Rollback

Trigger an immediate rollback under any of the following conditions:
- **5xx Error Rate > 1%** sustained for more than 2 minutes.
- **P99 API Latency > 1000ms** sustained for more than 3 minutes.
- **Critical Business Failure**: Inability to complete checkout, map vector rendering failure, or security breach signal.
- **Argo Rollouts Automated Abort**: Canary analysis failure limit exceeded.

---

## 2. Kubernetes / Argo Rollout Rollback Procedure

### Step 1: Abort Active Rollout & Revert
```bash
# If using Argo Rollouts:
kubectl argo rollouts abort ebs-api-rollout -n ebs-production
kubectl argo rollouts undo ebs-api-rollout -n ebs-production

# If using standard Helm / Kubernetes:
helm rollback explore-bharat-safar [PREVIOUS_REVISION] -n ebs-production
```

### Step 2: Instant Traffic Re-routing
```bash
# Force ingress traffic to previous stable replica service
kubectl patch service ebs-api-weighted -n ebs-production --type='json' -p='[{"op": "replace", "path": "/spec/trafficRouting/weight", "value": 0}]'
```

### Step 3: Verify Rollback Pod Health
```bash
kubectl get pods -n ebs-production -l app.kubernetes.io/name=ebs-api
kubectl logs -n ebs-production -l app.kubernetes.io/name=ebs-api --tail=100
```

---

## 3. Database Migration Reversion (If Applicable)

If the release included an incompatible database schema migration:
1. Put the API into maintenance mode / read-only mode via feature flag.
2. Execute down-migration script:
   ```bash
   pnpm prisma migrate resolve --rolled-back [MIGRATION_NAME]
   ```
3. Restart API pods to clear cached ORM metadata.

---

## 4. Post-Rollback Communication

1. Notify `#ops-incident` on Slack with timestamp, impacted version, and root cause summary.
2. Update the status page (`status.explorebharatsafar.in`) with incident resolution details.
3. Schedule an incident post-mortem within 24 hours.
