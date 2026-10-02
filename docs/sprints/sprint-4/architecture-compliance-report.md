# Explore Bharat Safar — Architecture Compliance Report
## Sprint 4: Gramodaya & Rural Bharat Knowledge System

- **Document Identifier**: EBS-REP-SPRINT-04-ARCH
- **Classification**: Engineering Architecture Compliance Audit
- **Status**: PASSED
- **Evaluator**: Principal Solutions Architect & Security Verification Lead

---

## 1. Compliance Against Enterprise Blueprints

### 1.1 Domain Boundary Isolation (EBS-BLU-42-VKS §1, EBS-DOC-03-ARCH)
- **Mandate**: Section 2 (Rural Knowledge System) must remain an independent, sovereign functional module. Under no circumstance shall Section 2 search or controllers query commercial trek packages, user social timelines, or payment records.
- **Verification**:
  - `VillagesService.searchVillages()` queries exclusively `prisma.village`.
  - Search where-clause filters are strictly quarantined to `deletedAt: null` and `approvalStatus: 'PUBLISHED'`.
  - Ingress and egress types strictly use contracts from `@ebs/types` (`VillageEntity`, `VillageLivingDossier`, `VillageSearchResponse`, `ArtisanProfileEntity`, `RuralHomestayEntity`).
  - Compliance Status: **100% COMPLIANT**.

### 1.2 Decentralized Administration & Staging Workflow (EBS-BLU-42-VKS §4, EBS-DOC-13-ADMIN §4)
- **Mandate**: Zero direct write grants to production `villages` or `village_panchayats` tables for Village Admins.
- **Verification**:
  - `VillagesService.submitUpdate()` routes all user mutations strictly to `prisma.villageUpdateStaging.create()`.
  - Production tables are modified only when a District Moderator or Super Admin explicitly executes `reviewStagedUpdate()` with `action: 'APPROVE'`.
  - Every action appends an immutable audit record via `AuditLogService.log()`.
  - Compliance Status: **100% COMPLIANT**.

### 1.3 Directory View Only Mandate for Homestays (EBS-BLU-42-VKS §9 & §13)
- **Mandate**: Homestays and community lodges must remain pure informational directory entries. No booking engine, inventory locking, or payment gateway triggers are allowed in Section 2.
- **Verification**:
  - `RuralHomestayEntity` enforces `isBookingDisabled: true`.
  - The UI showcases capacity, amenities, house rules, and cultural guidelines, but renders no "Book Now", "Reserve Slot", or payment checkout elements.
  - Compliance Status: **100% COMPLIANT**.

### 1.4 Sovereign Spatial Hierarchy Integrity (EBS-BLU-42-VKS §13)
- **Mandate**: Every Village belongs to exactly one Taluka, which belongs to exactly one District, which belongs to exactly one State.
- **Verification**:
  - Relational schema enforces foreign key constraints (`taluka_id UUID NOT NULL REFERENCES geo_spatial_schema.talukas(id) ON DELETE RESTRICT`).
  - Spatial centroids and hierarchy lookups strictly traverse `taluka -> district -> state`.
  - Compliance Status: **100% COMPLIANT**.

---

## 2. Architecture Boundary Matrix

| Architectural Layer | Target Module | Scope Boundary Check | Result |
| :--- | :--- | :--- | :--- |
| **API Gateway / Controller** | `VillagesController` | Only routes prefixed with `/villages` | **PASS** |
| **Domain Service** | `VillagesService` | Only operates on `rural_bharat_schema` | **PASS** |
| **Security Guards** | `VillageScopeGuard` | Enforces `assignedVillageId` check | **PASS** |
| **Data Contracts** | `@ebs/types` | Canonical contracts strictly typed | **PASS** |
| **Validation Layer** | `@ebs/validators` | Zod schemas enforce DPDP PII sanitization | **PASS** |
| **Web Presentation** | `features/village-registry` | Self-contained React components | **PASS** |
| **Admin Presentation** | `app/(admin)/village-admin` | Scoped CMS and moderation queue | **PASS** |
