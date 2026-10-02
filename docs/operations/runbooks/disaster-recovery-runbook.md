# Explore Bharat Safar — Disaster Recovery & Multi-AZ Failover Runbook
## Standard Operating Procedure: Catastrophic Cloud Zone Outage & Full PITR Restoration

---

## 1. Failover Triggers & Authorization

- **Trigger**: Total cloud availability zone failure or primary database corruption.
- **Incident Lead**: SRE Lead / Head of Infrastructure.
- **Recovery Targets**:
  - RPO: $\le 5\text{ minutes}$ (maximum data loss).
  - RTO: $\le 30\text{ minutes}$ (maximum operational restore time).

---

## 2. Multi-AZ Database Failover Procedure

1. **Check Primary PostgreSQL Availability**:
   ```bash
   pg_isready -h pgbouncer.ebs-production.svc.cluster.local -p 5432
   ```
2. **Promote Standby Read Replica (AWS RDS / Multi-AZ)**:
   ```bash
   aws rds reboot-db-instance --db-instance-identifier ebs-production-postgres --force-failover
   ```
3. **Verify PgBouncer Reconnect**:
   PgBouncer automatically detects the newly promoted master within 10 seconds.
4. **Verify Application Liveness**:
   ```bash
   curl -s https://api.explorebharatsafar.in/health | jq .subsystems.database
   ```

---

## 3. Point-in-Time Recovery (PITR) Restoration Drill

To restore from cold backup in an alternate region:
1. Fetch latest daily snapshot:
   ```bash
   aws s3 cp s3://ebs-production-cold-backups/daily/latest.sql.gz /tmp/
   aws s3 cp s3://ebs-production-cold-backups/daily/latest.sql.gz.sha256 /tmp/
   ```
2. Run automated restoration validator:
   ```bash
   bash scripts/dr/restore-drill.sh /tmp/latest.sql.gz
   ```
3. Replay WAL archives streamed to `s3://ebs-production-cold-backups/wal/`.

---

## 4. Redis Cluster Failover

If the Redis primary fails:
1. Execute `scripts/dr/failover-redis.sh`.
2. Sentinel automatically promotes replica to Master.
3. Validate BullMQ queue connectivity:
   ```bash
   bash scripts/dr/queue-recovery.sh
   ```
