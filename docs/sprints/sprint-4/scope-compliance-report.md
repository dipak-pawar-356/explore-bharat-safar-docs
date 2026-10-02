# Explore Bharat Safar — Scope Compliance Report
## Sprint 4: Gramodaya & Rural Bharat Knowledge System

- **Document Identifier**: EBS-REP-SPRINT-04-SCOPE
- **Classification**: Engineering Scope & Milestone Gate Verification
- **Status**: APPROVED
- **Sprint Baseline**: 07-roadmap.md Phase 2, 42-village-knowledge-system-blueprint.md, 13-admin-panel.md

---

## 1. Explicit In-Scope Functional Verifications

| Requirement | Implementation Artifact | Compliance Evidence |
| :--- | :--- | :--- |
| **Gramodaya Rural Knowledge System** | `apps/api/src/modules/villages`, `@ebs/database`, `@ebs/types` | PostgreSQL `rural_bharat_schema` models: `villages`, `village_panchayats`, `village_updates_staging`. |
| **Village Registry & Monographs** | `apps/web/src/features/village-registry/village-monograph-layout.tsx`, `apps/web/src/app/(villages)/villages/[lgdCode]/page.tsx` | Comprehensive monograph layout detailing etymology, historical foundation, demographic metrics, elevation, and LGD codes. |
| **Gram Panchayat Civic Data** | `apps/web/src/features/village-registry/panchayat-civic-card.tsx`, `apps/web/src/app/(villages)/panchayat/[id]/page.tsx` | Gram Panchayat Bhavan details, Sarpanch and Gram Sevak desks, official landline, statutory public services list. |
| **Agrarian & Ecological Telemetry** | `apps/web/src/features/village-registry/agrarian-calendar.tsx` | Kharif, Rabi, Zaid crop schedules, indigenous varieties, stepwells (Barav) and Talao water sources. |
| **Cultural Heritage & Traditions** | `apps/web/src/features/village-registry/folk-heritage-cards.tsx` | Ancient shrines, sacred Devrai groves, annual Jatras, Lejim dances, and Gram Sabhas. |
| **Artisan & Craftsperson Directory** | `apps/web/src/features/village-registry/artisan-showcase.tsx`, `packages/types/src/village.types.ts` | Master artisans, craft categories, years of experience, awards, GI Tag provenance, heritage workshops. |
| **Rural Homestays Directory** | `apps/web/src/features/village-registry/village-homestays-guides.tsx`, `packages/types/src/village.types.ts` | Host profiles, guest capacity, room counts, amenities, house rules, cultural guidelines — Directory View Only. |
| **Multi-Tenant Scoped CMS** | `apps/web/src/app/(admin)/village-admin/registry-update/page.tsx`, `apps/api/src/common/guards/village-scope.guard.ts` | VillageScopeGuard tenant isolation restricting Village Admins strictly to assigned village. |
| **Moderation Staging & Review Queue** | `apps/web/src/app/(admin)/village-admin/moderation-queue/page.tsx`, `VillagesService.reviewStagedUpdate()` | Split-pane visual diff inspection, approve/reject workflow, mandatory audit commentary. |
| **Quarantined Village Search** | `apps/web/src/features/village-registry/village-search-bar.tsx`, `VillagesService.searchVillages()` | Dedicated search quarantined strictly to rural settlements and LGD codes. |

---

## 2. Negative Scope Governance (Forbidden Features)

| Forbidden Domain | Sprint Scheduled | Inspection Result |
| :--- | :--- | :--- |
| **Commercial Trek / Tour Bookings** | Sprint 5 | **0% implemented**. No booking endpoints, carts, or checkout flows in Section 2. |
| **Payment Gateway & Fintech Ledgers** | Sprint 5 | **0% implemented**. No UPI, card, or razorpay integrations in Section 2. |
| **Redis Distributed Lock Engine (Redlock)** | Sprint 5 | **0% implemented**. No inventory locks or seat reservation engines in Section 2. |
| **Cryptographic PDF Certificates** | Sprint 5 | **0% implemented**. No vector PDF generation service in Section 2. |
| **Traveller Social Network & Timeline** | Sprint 6 | **0% implemented**. No follower graphs, user feeds, or story upload workers. |
| **Ephemeral 24-Hour Stories** | Sprint 6 | **0% implemented**. No media story transcoding or TTL garbage collectors. |

---

## 3. Scope Gate Confirmation

Sprint 4 scope has been executed to completion. No Sprint 5 or future functionality has been introduced. Architectural module stubs remain intact. Ready to request coordinator and user approval prior to proceeding to Sprint 5.
