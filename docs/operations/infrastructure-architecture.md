# Explore Bharat Safar — Infrastructure Architecture Documentation
## Reference: EBS-BLU-45-INFRA, EBS-DOC-22-DEPLOY, EBS-DOC-23-DEVOPS

---

## 1. System Overview

Explore Bharat Safar's infrastructure is an enterprise-grade, cloud-agnostic, containerized system deployed across multi-AZ Kubernetes clusters and fronted by Cloudflare's global Anycast edge network.

---

## 2. Directory Layout & Key Components

```
infrastructure/
├── cloudflare/
│   ├── rules/
│   │   ├── waf-rules.json            # OWASP CRS, SQLi/XSS, and rate limiting rules
│   │   └── cache-rules.json          # Tiered CDN edge caching (static, TopoJSON, facets)
│   └── workers/
│       ├── security-headers.ts       # HSTS, CSP, and privacy header enforcement
│       └── edge-router.ts            # Fast path edge routing and DDOS mitigation
├── docker/
│   ├── Dockerfile.api                # Multi-stage distroless Fastify API container
│   ├── Dockerfile.web                # Multi-stage distroless Next.js 14 Standalone container
│   ├── Dockerfile.worker             # Multi-stage distroless BullMQ background processor
│   └── init-db.sql                   # Database bootstrap and PostGIS extension init
├── dr/
│   └── disaster-recovery-plan.md     # RPO <= 5m, RTO <= 30m recovery architecture
├── k8s/
│   ├── base/
│   │   ├── apps/                     # Workload deployments (api, web, worker)
│   │   ├── autoscaling/              # HPA and VPA recommendation manifests
│   │   ├── config/                   # Declarative production ConfigMaps
│   │   ├── ingress/                  # Ingress and TLS termination manifests
│   │   └── network-policies/         # Zero-Trust namespace isolation
│   ├── helm/
│   │   └── explore-bharat-safar/     # Enterprise Helm v1.0.0 Chart
│   ├── overlays/
│   │   ├── production/               # Kustomize production overlay
│   │   └── staging/                  # Kustomize staging overlay
│   ├── strategies/
│   │   ├── canary-rollout.yaml       # Argo Rollouts progressive canary delivery
│   │   ├── blue-green.yaml           # Blue-Green active/preview service router
│   │   └── rolling-update.yaml       # Zero-downtime rolling update configuration
│   └── vault/
│       └── vault-agent-injector.yaml # ExternalSecrets / Vault secret injector
├── monitoring/
│   ├── alertmanager/
│   │   └── alertmanager.yaml         # AlertManager notification routing (PagerDuty/Slack)
│   ├── grafana/dashboards/
│   │   ├── ebs-executive-sla-slo.json
│   │   ├── ebs-api-performance.json
│   │   └── ebs-infrastructure-health.json
│   ├── otel/
│   │   └── otel-collector-config.yaml # OpenTelemetry pipeline
│   └── prometheus/
│       └── alert-rules.yaml          # P1 Critical and P2 Warning SRE alert rules
└── terraform/
    ├── environments/                 # dev, staging, prod terraform root configs
    └── modules/                      # vpc, eks, rds_postgis, redis_cluster, s3_vaults
```
