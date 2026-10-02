# Explore Bharat Safar — Production Readiness Checklist (50 Points)
## Reference: EBS-DOC-38-CHK, EBS-DOC-22-DEPLOY, EBS-DOC-23-DEVOPS

---

### 1. Security & Identity
- [x] **Sec-1**: TLS 1.3 enforced on Cloudflare edge and Kubernetes ingress.
- [x] **Sec-2**: HSTS `max-age=63072000; includeSubDomains; preload` enabled.
- [x] **Sec-3**: Strict Content-Security-Policy (CSP) headers applied without wildcard scripts.
- [x] **Sec-4**: `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` verified.
- [x] **Sec-5**: OWASP Core Ruleset (CRS) enabled in Cloudflare WAF.
- [x] **Sec-6**: Rate limiting active on authentication (10 req/min) and search (150 req/min).
- [x] **Sec-7**: Zero hardcoded secrets in repository; Vault / SecretStore integration active.
- [x] **Sec-8**: All containers run as non-root user (`UID 10001`).
- [x] **Sec-9**: Multi-stage distroless base images (`gcr.io/distroless/nodejs20-debian12:nonroot`).
- [x] **Sec-10**: Container layer vulnerability scanning (Trivy) zero high/critical tolerance.

---

### 2. Infrastructure & Orchestration
- [x] **Infra-1**: Multi-AZ Kubernetes cluster topology (minimum 3 availability zones).
- [x] **Infra-2**: Horizontal Pod Autoscaler (HPA) configured for CPU 70% and Memory 80%.
- [x] **Infra-3**: Vertical Pod Autoscaler (VPA) in recommendation mode for rightsizing.
- [x] **Infra-4**: Pod Disruption Budgets (`minAvailable: 2`) configured for all workloads.
- [x] **Infra-5**: Pod anti-affinity enabled to distribute replicas across distinct physical nodes.
- [x] **Infra-6**: NetworkPolicies enforcing Zero-Trust namespace isolation.
- [x] **Infra-7**: Graceful pod termination with `terminationGracePeriodSeconds: 60`.
- [x] **Infra-8**: Liveness and readiness probes configured for all services.
- [x] **Infra-9**: Production Helm chart versioned (v1.0.0) and linted.
- [x] **Infra-10**: Node disk and memory pressure alerts active.

---

### 3. Data Persistence & Caching
- [x] **Data-1**: PostgreSQL 16 Multi-AZ primary with synchronous hot standby.
- [x] **Data-2**: Continuous Write-Ahead Log (WAL) archiving to S3 vault.
- [x] **Data-3**: PgBouncer connection pooling configured to prevent backend exhaustion.
- [x] **Data-4**: Redis 7 Cluster / Sentinel configured for multi-node failover.
- [x] **Data-5**: Redis memory eviction policy set to `volatile-lru`.
- [x] **Data-6**: Redis AOF persistence enabled (`fsync everysec`).
- [x] **Data-7**: S3 bucket lifecycle policies transitioning backups to Glacier.
- [x] **Data-8**: Daily automated PostgreSQL backups scheduled with SHA-256 checksums.
- [x] **Data-9**: Recovery Time Objective (RTO $\le$ 30 mins) validated via drill script.
- [x] **Data-10**: Recovery Point Objective (RPO $\le$ 5 mins) validated via WAL streaming.

---

### 4. Edge, Networking & CDN
- [x] **Net-1**: Cloudflare Anycast edge routing configured.
- [x] **Net-2**: HTTP/2 and HTTP/3 (QUIC) enabled.
- [x] **Net-3**: Immutable static asset caching (1 year TTL) for Next.js and TopoJSON.
- [x] **Net-4**: Dynamic discovery aggregation facet caching (5 min TTL) with SWR.
- [x] **Net-5**: Sensitive administrative and checkout routes bypassed from edge cache.
- [x] **Net-6**: AVIF / WebP automatic image optimization configured at edge.
- [x] **Net-7**: Brotli and Gzip compression enabled for all text payloads.
- [x] **Net-8**: DDoS mitigation and bot management rules active.
- [x] **Net-9**: Sovereign GIS TopoJSON edge distribution verified across all 28 states.
- [x] **Net-10**: Cloudflare Under Attack emergency mode standby verified.

---

### 5. Observability & SRE Operations
- [x] **Obs-1**: Deep subsystem health check (`GET /health`) active.
- [x] **Obs-2**: Prometheus exposition endpoint (`GET /metrics`) collecting golden signals.
- [x] **Obs-3**: W3C `Server-Timing` headers injected on all HTTP responses.
- [x] **Obs-4**: OpenTelemetry collector pipeline ingesting distributed traces.
- [x] **Obs-5**: Grafana Executive SLA/SLO dashboard tracking 99.95% target.
- [x] **Obs-6**: Error budget burn rate alerts configured.
- [x] **Obs-7**: P1 Critical alerts routed to PagerDuty with immediate on-call escalation.
- [x] **Obs-8**: P2 Warning alerts routed to Slack `#ops-alerts`.
- [x] **Obs-9**: Deployment runbooks, rollback playbooks, and severity matrix documented.
- [x] **Obs-10**: Automated canary deployment with automated abort & rollback verified.
