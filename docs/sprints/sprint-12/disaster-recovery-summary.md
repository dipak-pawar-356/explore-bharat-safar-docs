# Explore Bharat Safar — Disaster Recovery & High Availability Summary
## RTO $\le$ 30m, RPO $\le$ 5m, Multi-AZ Resilience & Backup Automation

---

## 1. High Availability Invariants

| Dimension | Production Specification | SLA / Target |
| :--- | :--- | :--- |
| **Availability Target** | Multi-AZ Kubernetes cluster + Cloudflare Anycast | **99.95% Availability** |
| **Recovery Point Objective (RPO)** | Continuous PostgreSQL Write-Ahead Log (WAL) streaming to S3 | **$\le 5$ Minutes** |
| **Recovery Time Objective (RTO)** | Automated snapshot restore & DNS switchover | **$\le 30$ Minutes** |
| **Data Redundancy** | Cross-region S3 backup vault with SSE-KMS encryption | **99.999999999% Durability** |

---

## 2. Backup Pipeline & Retention Lifecycle

1. **Daily Snapshots**:
   - Automated `backup-postgres.sh` executes daily at 02:00 IST.
   - Generates gzip-compressed SQL dumps verified with SHA-256 checksums.
2. **S3 Storage Tiering**:
   - Days 1–30: S3 Standard-IA (Infrequent Access).
   - Days 31–90: S3 Glacier Flexible Retrieval.
   - Days 91–365: S3 Glacier Deep Archive.
   - Day 365: Automated purge.
3. **Restoration Drill Automation**:
   - `restore-drill.sh` executes every 90 days.
   - Restores backup to an isolated staging instance and verifies row count integrity across `places`, `villages`, `users`, and `bookings`.

---

## 3. High Availability Failover Orchestration

1. **PostgreSQL Multi-AZ Primary Failover**:
   - PgBouncer intercepts connection pool traffic.
   - In the event of primary AZ degradation, the standby replica is promoted to Master within 30 seconds.
2. **Redis Sentinel / Cluster Failover**:
   - Validated via `failover-redis.sh`.
   - Sentinel quorum promotes hot replica with zero loss of active user sessions.
3. **Queue DLQ Replay**:
   - BullMQ Dead Letter Queue recovery utility (`queue-recovery.sh`) enables inspection, retry, and drainage of poisoned tasks.
