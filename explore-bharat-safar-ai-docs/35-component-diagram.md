# Explore Bharat Safar — System Component Architecture & Subsystem Specifications

- **Document Identifier**: EBS-DOC-35-COMPONENT
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Software Architects, Lead Component Engineers, Frontend/Backend Integrators, DevOps Specialists
- **Related Documents**:
  - `03-architecture.md`
  - `09-api-design.md`
  - `10-database-design.md`
  - `14-booking-system.md`
  - `16-map-engine.md`
  - `20-certificate-system.md`
- **Last Updated**: 2026-09-28

---

## 1. Component Architecture Philosophy

This document defines the structural component model of **Explore Bharat Safar**, illustrating the boundaries, internal ports, provided interfaces, and required dependencies across the entire distributed system.

```mermaid
graph TD
    ClientTier["Frontend Presentation Tier (Next.js)"]
    IngressTier["Ingress & Gateway Tier (NGINX / Cloudflare)"]
    BackendTier["Core Backend Application Tier (NestJS Modules)"]
    WorkerTier["Asynchronous Worker Tier (BullMQ)"]
    PersistenceTier["Persistence & Data Tier (PostgreSQL + Redis + S3)"]

    ClientTier <--> IngressTier
    IngressTier <--> BackendTier
    BackendTier <--> WorkerTier
    BackendTier <--> PersistenceTier
    WorkerTier <--> PersistenceTier
```

---

## 2. High-Level System Component Diagram

```mermaid
graph TB
    subgraph FrontendComponents["Frontend Subsystem (apps/web)"]
        MapCanvas["Interactive GIS Map Canvas (SVG)"]
        ThreeJSLayer["Three.js 3D Landmark Layer"]
        CheckoutWizard["Experience Checkout Wizard"]
        SocialFeedComp["Social Feed & Timeline Component"]
        AdminDashboardComp["Admin Console & Moderation Grid"]
        QueryClient["TanStack React Query Cache"]
    end

    subgraph BackendComponents["Backend Subsystem (apps/api)"]
        APIGateway["NestJS API Gateway Controller"]
        AuthModule["Identity & Access (IAM) Module"]
        DiscoveryModule["Bharat Discovery GIS Module"]
        VillageModule["Rural Knowledge & Village Module"]
        BookingModule["Booking & Inventory Module"]
        PaymentModule["Payment & Billing Adapter Module"]
        CertModule["Certificate Synthesis Module"]
        SocialModule["Social Platform & Community Module"]
        AdminModule["Global Governance & Audit Module"]
    end

    subgraph WorkerComponents["Async Worker Subsystem (apps/worker)"]
        CertWorker["PDFKit Vector Certificate Worker"]
        MediaWorker["Sharp Image Resizer & Video Transcoder"]
        NotifWorker["Multi-Channel Notification Worker"]
        StoryWorker["24h Ephemeral Story Garbage Collector"]
    end

    subgraph DataComponents["Persistence Subsystem"]
        PostgreSQL[("PostgreSQL 16 Primary + PostGIS 3.4")]
        RedisCluster[("Redis 7 Cluster (Cache, Redlock, Pub/Sub)")]
        S3Vault[("S3 Object Storage (Media & Certificates)")]
    end

    FrontendComponents <--> APIGateway
    APIGateway --> AuthModule
    APIGateway --> DiscoveryModule
    APIGateway --> VillageModule
    APIGateway --> BookingModule
    APIGateway --> PaymentModule
    APIGateway --> CertModule
    APIGateway --> SocialModule
    APIGateway --> AdminModule

    BookingModule <--> RedisCluster
    DiscoveryModule --> PostgreSQL
    VillageModule --> PostgreSQL
    BookingModule --> PostgreSQL
    PaymentModule --> PostgreSQL
    AdminModule --> PostgreSQL

    BookingModule -.->|Enqueue Job| CertWorker
    SocialModule -.->|Enqueue Job| MediaWorker
    BookingModule -.->|Enqueue Job| NotifWorker

    CertWorker --> S3Vault
    CertWorker --> PostgreSQL
    MediaWorker --> S3Vault
    StoryWorker --> PostgreSQL
```

---

## 3. Subsystem Component Breakdown & Interface Contracts

### 3.1 Bharat Discovery Engine Component (GIS Map)
- **Provided Interface**: `IGISDiscoveryService`
  - `getStatesDirectory(): Promise<StateSummaryDTO[]>`
  - `getStateBoundaries(stateId: string): Promise<GeoJSON.FeatureCollection>`
  - `getSimplifiedDistricts(stateId: string, zoom: number): Promise<GeoJSON.FeatureCollection>`
  - `getPlaceDossier(placeId: string): Promise<PlaceDossierDTO>`
- **Internal Dependencies**:
  - `PostGISGeometryAdapter`: Executes `ST_SimplifyPreserveTopology` queries.
  - `RedisSpatialCache`: Caches TopoJSON vector boundaries with a 24-hour TTL.

### 3.2 Experience Booking & Inventory Component
- **Provided Interface**: `IBookingService`
  - `reserveBatchSlots(batchId: string, count: number): Promise<ReservationTokenDTO>`
  - `confirmBookingPayment(bookingId: string, paymentRef: string): Promise<BookingConfirmationDTO>`
  - `verifyAttendance(bookingId: string, participantId: string): Promise<void>`
- **Internal Dependencies**:
  - `RedlockDistributedLock`: Manages atomic Redis slot reservation Lua scripts.
  - `PaymentGatewayPort`: Dispatches payment intents to external gateway adapters.

### 3.3 Digital Certificate Synthesis Component
- **Provided Interface**: `ICertificateService`
  - `triggerCertificateGeneration(bookingId: string, participantId: string): Promise<void>`
  - `verifyCertificateDigest(certNumber: string): Promise<CertificateVerificationDTO>`
- **Internal Dependencies**:
  - `PDFKitVectorRenderer`: Generates PDF/A-1b compliant vector documents.
  - `QRCodeMatrixEncoder`: Synthesizes embedded high-contrast dynamic QR codes.
  - `S3VaultUploader`: Streams finished PDF binaries to encrypted storage buckets.

---

## 4. Component Coupling & Port Invariants

1. **Zero Direct Database Cross-Access**: Components cannot query another domain's database tables directly. Inter-domain data retrieval executes exclusively through published domain service interfaces.
2. **Asynchronous Decoupling**: High-overhead tasks (video transcoding, PDF synthesis, transactional emailing) are strictly decoupled via BullMQ message queues.
3. **Pluggable Payment Adapters**: The `PaymentModule` implements the generic `IPaymentGatewayPort`, allowing hot-swapping between Razorpay and Cashfree without modifying core booking logic.

---

## 5. Summary & Downstream Alignment

This component architecture defines the modular structural blocks and interface boundaries of Explore Bharat Safar. It works in lockstep with the class diagrams in `37-class-diagram.md`, state diagrams in `36-state-diagram.md`, and API contracts in `09-api-design.md`.
