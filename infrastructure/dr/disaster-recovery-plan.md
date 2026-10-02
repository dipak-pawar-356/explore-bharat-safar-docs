# Explore Bharat Safar — Disaster Recovery & Business Continuity Architecture

## Reference: EBS-DOC-23-DEVOPS, EBS-BLU-45-INFRA, ISO 22301

---

## 1. High-Availability & Disaster Recovery Objectives

Explore Bharat Safar operates under strict sovereign enterprise availability targets:

- **Recovery Point Objective (RPO)**: $\le 5\text{ minutes}$. Maximum permissible data loss in the event of an unrecoverable catastrophic failure of an entire cloud region.
- **Recovery Time Objective (RTO)**: $\le 30\text{ minutes}$. Maximum time to restore fully operational status in an alternate cloud region.
- **Availability Target**: $99.95\%$ platform uptime across all public and administrative interfaces.

---

## 2. Multi-Tier High Availability Topology

```
[ Primary Production Zone (ap-south-1a / 1b) ]
         │
         ├── PostgreSQL 16 (Multi-AZ Synchronous Replication)
         │       └── Continuous WAL Archiving ──> S3 Encrypted Backup Vault
         │
         ├── Redis 7 Multi-AZ Cluster (Active Master + Hot Standby)
         │       └── Asynchronous AOF Persistence
         │
         └── Stateless Kubernetes Pods (EKS Multi-AZ Managed Nodes)
                 └── Anycast Routing via Cloudflare Edge
```

---

## 3. Automated Backup Pipeline

1. **Continuous Write-Ahead Log (WAL) Streaming**:
   - PostgreSQL WAL archives are streamed continuously to an S3 cold storage vault (`s3://ebs-production-cold-backups/wal/`) with SSE-KMS encryption.
   - Enables Point-in-Time Recovery (PITR) to any second within the 30-day retention window.
2. **Automated Daily Snapshots**:
   - `scripts/dr/backup-postgres.sh` executes daily at 02:00 IST.
   - Generates compressed, SHA-256 checksum-verified SQL dumps (`pg_dump`).
   - Retained for 30 days in S3 Standard-IA, transitioned to S3 Glacier after 90 days, purged after 365 days.
3. **Queue & Ephemeral State Preservation**:
   - BullMQ delayed and pending jobs are persisted in Redis AOF (Append-Only File) storage with `fsync everysec`.

---

## 4. Disaster Recovery Restoration Drill

Quarterly automated recovery simulations (`scripts/dr/restore-drill.sh`) validate business continuity:

1. Provisions an isolated staging RDS PostgreSQL instance.
2. Restores the latest daily dump and replays WAL archives up to $T - 5\text{ minutes}$.
3. Verifies schema checksums, foreign key consistency, and row counts across core tables (`Place`, `Village`, `Booking`, `User`).
4. Re-points staging API gateway and verifies `/health` readiness probes.
5. Emits an auditable compliance report confirming RTO/RPO targets.
