# Explore Bharat Safar — National Digital Travel Discovery Ecosystem

[![CI Pipeline](https://github.com/explore-bharat-safar/explore-bharat-safar/actions/workflows/ci-pipeline.yml/badge.svg)](https://github.com/explore-bharat-safar/explore-bharat-safar/actions/workflows/ci-pipeline.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-ef4444.svg)](https://turbo.build/repo)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](<>)

> **Explore Bharat Safar** is a sovereign, large-scale enterprise digital ecosystem for Bharat (India), unifying travel discovery, cultural heritage preservation, rural village knowledge registries (650,000+ Gram Panchayats), high-concurrency adventure booking with 15-minute distributed locks, and a traveller social network into a single, highly governed platform.

---

## 🏛️ Core Sovereignty Pillars

1. **Bharat Discovery Engine (Section 1)**: Interactive GIS vector cartography conforming to Survey of India sovereign borders, WebGL 3D miniature landmarks, and hierarchical drilldown ($India \rightarrow State \rightarrow District \rightarrow Taluka \rightarrow Place$).
2. **Rural Bharat Knowledge System (Section 2)**: Authoritative civic and cultural directory for 650,000+ villages with Local Government Directory (LGD) census mapping and DPDP Act compliance.
3. **Experience Booking Engine (Section 3)**: High-concurrency inventory reservation with Redis 7 Redlock distributed locks (15-min timeout), dynamic upfront advance percentages, double-entry financial ledger, and PDF/A-1b verifiable digital certificates.
4. **Traveller Social Network (Section 4)**: Vertical travel social graph, hybrid fan-out feeds, 24-hour ephemeral stories, community guilds, and Solo Explorer matching.

---

## 📂 Repository Topology

```text
explore-bharat-safar/
├── .github/                      # CI/CD workflows, container scans & PR templates
├── apps/                         # Deployable application services
│   ├── web/                      # Next.js 14+ App Router frontend
│   ├── api/                      # NestJS 10+ modular monolith backend (Fastify)
│   └── worker/                   # BullMQ background job processing service
├── packages/                     # Shared internal domain packages
│   ├── database/                 # PostgreSQL 16 + PostGIS schema & migrations
│   ├── types/                    # Universal TypeScript data contracts & DTOs
│   ├── ui/                       # Accessible Tailwind CSS + Radix UI design system
│   ├── config/                   # Centralized ESLint, TypeScript & Tailwind configs
│   ├── security-crypto/          # Argon2id, RS256, AES-256-GCM, HMAC cryptographic suite
│   ├── gis-core/                 # Spatial math, bounding box, Haversine & Douglas-Peucker
│   ├── logger/                   # Structured Pino logger with OpenTelemetry tracing context
│   ├── validators/               # Universal Zod validation schemas & env validator
│   └── analytics/                # Telemetry event schemas & Prometheus metric definitions
├── tooling/                      # Custom developer tooling & AST linters
│   ├── eslint-plugin-ebs-boundaries/  # Custom AST boundary rule enforcer
│   └── generators/               # Plop.js code scaffolders
├── infrastructure/               # Cloud IaC, Kubernetes manifests & edge rules
│   ├── terraform/                # Multi-AZ VPC, EKS, RDS PostGIS, Redis & S3 vaults
│   ├── k8s/                      # Kubernetes manifests, Traefik 3.0 ingress & Helm values
│   ├── docker/                   # Distroless multi-stage container specifications
│   └── cloudflare/               # Edge workers, WAF rules & CDN cache configuration
├── scripts/                      # Operational automation, DB seeding & DR scripts
└── docs/                         # ADRs, API specs & production incident runbooks
```

---

## 🚀 Quick Start & Development Setup

### Prerequisites

- **Node.js**: `v20.x` LTS (enforced via `.nvmrc`)
- **pnpm**: `v9.x` or `v12.x`
- **Docker**: Engine 25+ & Docker Compose (for PostgreSQL 16 + PostGIS and Redis 7)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/explore-bharat-safar/explore-bharat-safar.git
cd explore-bharat-safar
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

### 3. Start Local Infrastructure

```bash
docker compose up -d
```

### 4. Database Setup & Seeding

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Servers

```bash
pnpm dev
```

- **Web App**: `http://localhost:3000`
- **API Gateway**: `http://localhost:4000/api/v1`
- **Swagger Documentation**: `http://localhost:4000/api/docs`

---

## 🛡️ Architectural Governance & Quality Gates

Explore Bharat Safar enforces a strict 10-stage engineering quality gate:

- **Pre-commit**: Husky + `lint-staged` (ESLint strict + Prettier)
- **Type Checking**: `tsc --noEmit` across all workspaces
- **Module Boundaries**: `tooling/eslint-plugin-ebs-boundaries` prevents illegal imports
- **Zero Direct DB in Web**: `apps/web` cannot import `@ebs/database`
- **Zero Cross-Domain Coupling**: `apps/api` modules cannot directly import peer modules
- **PII Redaction**: Centralized structured logging masks sensitive fields before stdout

---

## 📜 Documentation Index

All architectural specifications, business rules, and blueprints reside in `explore-bharat-safar-ai-docs/`:

- `01-idea.md` through `39-future-updates.md`
- `40-enterprise-security-blueprint.md`
- `49-project-folder-and-repository-structure.md`
- `50-development-workflow.md`
- `51-technology-stack-decisions.md`
- `52-coding-standards-and-best-practices.md`
