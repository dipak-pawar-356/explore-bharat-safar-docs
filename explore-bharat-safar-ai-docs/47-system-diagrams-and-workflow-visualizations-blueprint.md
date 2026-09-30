# Explore Bharat Safar — System Diagrams, Architecture Visualizations & Workflow Specifications (Part 8)

- **Document Identifier**: EBS-BLU-47-DIAG
- **Version**: 1.0.0
- **Classification**: Production Architectural Specification & System Blueprint
- **Domain**: Visual System Engineering, Distributed Workflows & Architecture Models
- **Status**: Approved & Authoritative
- **Author**: Chief Systems Architect, Principal Enterprise Modeler, Lead UML Specialist
- **Target Audience**: Software Engineers, Solutions Architects, UI/UX Designers, Test Automation Leads, SREs, Product Managers
- **Related Documents**:
  - `03-architecture.md` (System Architecture)
  - `09-api-design.md` (API Specifications)
  - `10-database-design.md` (Database Architecture)
  - `30-workflows.md` through `37-class-diagram.md` (UML Specification Series)
  - `40-enterprise-security-blueprint.md` through `46-documentation-standards-and-file-specifications-blueprint.md` (Authoritative Blueprints)
- **Last Updated**: 2026-09-28

---

## Executive Summary & Visual Modeling Mandate

This master blueprint consolidates every technical diagram, architectural visualization, sequence handshake, entity relationship, state machine, and operational workflow governing **Explore Bharat Safar**.

In accordance with **Part 8** of `MASTER_PROMPT.md`, all illustrations are rendered natively in **Mermaid syntax**, eliminating placeholder graphics and ensuring that every system component—from the Survey of India spatial engine to the double-entry fintech ledger—is visually, mathematically, and architecturally verified for immediate enterprise engineering implementation.

---

# SECTION I: MASTER ARCHITECTURE DIAGRAMS

## 1. High-Level Global System Architecture
The end-to-end topology unifies edge security, Kubernetes ingress, modular application microservices, asynchronous message queues, and multi-AZ persistence.

```mermaid
graph TB
    subgraph ClientPerimeter ["Explorer Client Ingress"]
        WebPWA["Next.js 14 Web PWA / Browser"]
        MobileApp["Future React Native / Native Mobile App"]
    end

    subgraph EdgeLayer ["Global Edge & Security (Cloudflare Enterprise)"]
        AnycastDNS["Anycast DNS Routing"]
        EdgeWAF["Cloudflare Enterprise WAF (OWASP CRS)"]
        EdgeDDoS["Layer 3 / 4 / 7 DDoS Mitigation"]
        TileCache["Vector Tile & Static Media CDN"]
        mTLS_Origin["Authenticated Origin Pulls (mTLS)"]
        
        AnycastDNS --> EdgeWAF --> EdgeDDoS --> TileCache --> mTLS_Origin
    end

    subgraph IngressGateway ["Traffic Orchestration & Gateway"]
        CloudNLB["AWS Network Load Balancer (NLB)"]
        TraefikIngress["Traefik 3.0 Ingress Gateway (K8s DaemonSet)"]
        JWTRateGuard["RS256 JWT Validator & Token Bucket Rate Limiter"]
        
        mTLS_Origin --> CloudNLB --> TraefikIngress --> JWTRateGuard
    end

    subgraph MicroservicesTier ["Application Microservices (NestJS Pods)"]
        AuthSvc["Identity & Auth Service"]
        GeoSvc["GIS Discovery Engine Service"]
        VillageSvc["Village Knowledge & Moderation Service"]
        BookingSvc["Booking & Inventory Engine"]
        FintechSvc["Fintech & Double-Entry Ledger"]
        SocialSvc["Social Graph & Feed Service"]
        CertSvc["Digital Certificate Authority"]
        AdminSvc["Super Admin Control Gateway"]

        JWTRateGuard --> AuthSvc & GeoSvc & VillageSvc & BookingSvc & FintechSvc & SocialSvc & CertSvc & AdminSvc
    end

    subgraph AsyncTier ["Asynchronous Message Queues & Workers"]
        RedisQueue[("Redis 7 Cluster (BullMQ Queues)")]
        MediaWorker["Sharp Media Transcoder Worker"]
        CertWorker["PDF/A-1b Certificate Worker"]
        InvoiceWorker["GST Invoice Worker"]
        NotificationWorker["Multi-Channel Notification Dispatcher"]
        CleanupWorker["DPDP 30-Day Medical Purger Worker"]
        WS_Gateway["Socket.io WebSocket Cluster"]

        MicroservicesTier --> RedisQueue
        RedisQueue --> MediaWorker & CertWorker & InvoiceWorker & NotificationWorker & CleanupWorker
        MicroservicesTier --> WS_Gateway
    end

    subgraph DataStorageTier ["Multi-Tier Persistence Vault"]
        PostgresPrimary[("PostgreSQL 16 Primary (Read/Write Multi-AZ)")]
        PostgresReplicas[("PostgreSQL 16 Read Replicas (GIS & Full-Text)")]
        PostGIS_Ext["PostGIS Spatial Extension"]
        RedisCache[("Redis 7 In-Memory Cache & Redlock Mutex")]
        S3Storage[("AWS S3 Multi-Bucket Vault (WORM Compliance)")]
        Vault["HashiCorp Vault (Dynamic Secrets & Key Management)"]

        MicroservicesTier --> PostgresPrimary
        MicroservicesTier --> PostgresReplicas
        MicroservicesTier --> RedisCache
        MicroservicesTier --> S3Storage
        MicroservicesTier --> Vault
        PostgresPrimary -. Streaming WAL .-> PostgresReplicas
    end

    WebPWA & MobileApp --> AnycastDNS
```

---

## 2. Frontend Client Architecture (Next.js 14 App Router)
Illustrates component composition, client state management, WebGL rendering, and API communication.

```mermaid
graph TD
    subgraph ClientShell ["Next.js 14 App Shell Architecture"]
        Layout["Root Layout (app/layout.tsx)<br/>• ThemeProvider • AuthContext • QueryClient"]
        
        subgraph RouteGroups ["App Router Domains"]
            R_Discovery["(discovery)/ • /explore • /states • /places"]
            R_Villages["(villages)/ • /villages • /panchayat"]
            R_Bookings["(bookings)/ • /experiences • /checkout"]
            R_Social["(social)/ • /feed • /profile • /guilds"]
            R_Admin["(admin)/ • /console • /moderation"]
        end

        subgraph CoreComponents ["UI Component Architecture"]
            MapCanvas["GIS Map Canvas (MapLibre GL + TopoJSON)"]
            ThreeOverlay["Three.js WebGL 3D Landmark Overlay (Draco GLB)"]
            DrawerUI["Contextual Non-Modal Preview Drawers"]
            BookingWizard["Multi-Step Checkout & Redlock Timer Wizard"]
            SocialFeedView["Virtual Infinite Scroll Feed Grid"]
        end

        subgraph ClientStateHooks ["State Management & Hooks"]
            ZustandStore["Zustand Client Store (Active Viewport, Filters)"]
            TanStackQuery["TanStack Query v5 (Server State, Caching, SWR)"]
            HookForm["React Hook Form + Zod (Strict Form Schemas)"]
            useWebSocket["useWebSocket Hook (Real-time Inventory & Alerts)"]
        end

        subgraph NetworkBFF ["Client Ingress & BFF Layer"]
            AxiosClient["Axios HTTP Client (Correlation ID + JWT Interceptor)"]
            WSSocket["Socket.io Client (Real-time Seat Updates)"]
        end

        Layout --> RouteGroups
        RouteGroups --> CoreComponents
        CoreComponents --> ClientStateHooks
        ClientStateHooks --> NetworkBFF
    end
```

---

## 3. Backend Modular Architecture (NestJS Clean Architecture)
Service decoupling and dependency injection across internal modules.

```mermaid
flowchart TD
    subgraph NestKernel ["NestJS Modular Monolith Kernel"]
        AppModule["AppModule (Root Orchestrator)"]
        
        subgraph CoreSubsystems ["Independent Domain Modules"]
            AuthModule["AuthModule (Argon2id, RS256, MFA, RTR)"]
            GeoModule["GeoSpatialModule (PostGIS, Vector Tiles, ST_AsMVT)"]
            VillageModule["VillageModule (LGD Registry, Cadastral, Staging Queue)"]
            BookingModule["BookingModule (Inventory Mutex, Redlock, Batches)"]
            PaymentModule["PaymentModule (Razorpay / Cashfree HMAC Webhooks)"]
            SocialModule["SocialModule (Hybrid Fan-Out, Stories, Guilds)"]
            CertModule["CertificateModule (PDFKit Vector Engine, HMAC Verification)"]
            AuditModule["AuditModule (Write-Only Immutability Interceptor)"]
        end

        subgraph SharedInfrastructure ["Shared Kernel & Adapters"]
            PrismaPostgres["PostgreSQL / PostGIS Repository Adapter"]
            RedisService["Redis 7 Cluster Cache & Mutex Adapter"]
            S3Service["AWS S3 Pre-Signed URL & Storage Adapter"]
            QueueProducer["BullMQ Queue Producer Adapter"]
            LoggerInterceptor["Structured JSON Logging & Telemetry"]
        end

        AppModule --> CoreSubsystems
        CoreSubsystems --> SharedInfrastructure
    end
```

---

## 4. Database Architecture & Partitioning Topology

```mermaid
graph TB
    subgraph PostgresCluster ["PostgreSQL 16 Enterprise Partitioned Topology"]
        subgraph Schemas ["Logical Schema Segregation"]
            S_Identity["identity_schema • users • credentials • mfa_factors"]
            S_Geo["geo_spatial_schema • states • districts • talukas • places"]
            S_Rural["rural_bharat_schema • villages • panchayats • staging"]
            S_Booking["booking_schema • experiences • batches • orders (Partitioned)"]
            S_Payment["payment_schema • payments (Partitioned) • ledger"]
            S_Social["social_schema • profiles • posts • stories • guilds"]
            S_Audit["audit_schema • audit_logs (Monthly Range Partitioned)"]
        end

        subgraph TablePartitioning ["Native Range Partitioning Strategy"]
            Orders_2026["orders_2026 (RANGE 2026-01-01 to 2027-01-01)"]
            Orders_2027["orders_2027 (RANGE 2027-01-01 to 2028-01-01)"]
            Audit_M01["audit_logs_2026_01 (Monthly Partition)"]
            Audit_M02["audit_logs_2026_02 (Monthly Partition)"]
        end

        subgraph IndexingEngines ["Specialized Spatial & Text Indexes"]
            GiST_Index["PostGIS GiST (geometry, location_coords, centroid)"]
            GIN_Trgm["PostgreSQL GIN Trigram (name, title, description)"]
            BRIN_Index["BRIN Timestamp Indexes (audit_logs, payments)"]
        end

        Schemas --> TablePartitioning
        Schemas --> IndexingEngines
    end
```

---

## 5. Cloud Infrastructure Topology (Multi-AZ AWS / EKS)

```mermaid
flowchart TD
    subgraph EdgePerimeter ["Perimeter Defense (Cloudflare)"]
        CF_DNS["Cloudflare Geo-DNS"] --> CF_WAF["Cloudflare WAF & Layer 7 DDoS"]
        CF_WAF --> CF_mTLS["Authenticated Origin Pulls (Client Cert)"]
    end

    subgraph AWS_VPC ["AWS Virtual Private Cloud (VPC: 10.0.0.0/16)"]
        subgraph PublicSubnets ["Public Subnets (Multi-AZ: us-east-1a, 1b, 1c)"]
            NLB["AWS Network Load Balancer (NLB)"]
            NAT_GW["NAT Gateways (Egress Only)"]
        end

        subgraph PrivateAppSubnets ["Private Kubernetes Subnets (Non-Routable)"]
            EKS_Cluster["Amazon EKS 1.29 Production Cluster"]
            TraefikPods["Traefik Ingress Controller Pods"]
            AppPods["Next.js Frontend & NestJS Backend Pods"]
            WorkerPods["BullMQ Background Processing Pods"]
            
            TraefikPods --> AppPods & WorkerPods
        end

        subgraph SecureDataSubnets ["Isolated Database Subnets (Zero Internet Egress)"]
            RDS_Primary["Amazon RDS PostgreSQL 16 (Multi-AZ Primary)"]
            RDS_Standby["Amazon RDS PostgreSQL 16 (Synchronous Standby)"]
            ElastiCache["Amazon ElastiCache Redis 7 Cluster (6 Nodes)"]
            
            RDS_Primary -. Synchronous Replication .-> RDS_Standby
        end

        CF_mTLS --> NLB --> TraefikPods
        AppPods --> RDS_Primary
        AppPods --> ElastiCache
        WorkerPods --> RDS_Primary
        WorkerPods --> ElastiCache
        WorkerPods --> NAT_GW
    end
```

---

# SECTION II: MASTER RELATIONAL ENTITY-RELATIONSHIP DIAGRAM (ERD)

The complete cross-domain relational model covering all 22 core platform entities:

```mermaid
erDiagram
    USERS ||--o| TRAVELLER_PROFILES : "owns"
    USERS ||--o{ BOOKING_ORDERS : "places"
    USERS ||--o{ PAYMENTS : "submits"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ VILLAGE_UPDATES_STAGING : "submits"
    
    STATES ||--|{ DISTRICTS : "contains"
    DISTRICTS ||--|{ TALUKAS : "contains"
    TALUKAS ||--o{ PLACES : "contains"
    TALUKAS ||--o{ VILLAGES : "contains"
    
    CATEGORIES ||--o{ PLACE_CATEGORIES : "categorizes"
    PLACES ||--o{ PLACE_CATEGORIES : "assigned"
    PLACES ||--o| LANDMARKS_3D : "represented_by"
    PLACES ||--o{ EXPERIENCES : "hosts"
    
    VILLAGES ||--o| VILLAGE_PROFILES : "detailed_by"
    VILLAGES ||--o| VILLAGE_PANCHAYATS : "governed_by"
    VILLAGES ||--o{ VILLAGE_UPDATES_STAGING : "staged_updates"
    VILLAGES ||--o{ VILLAGE_REVIEWS : "reviewed_in"
    
    EXPERIENCES ||--|{ BATCHES : "scheduled_in"
    EXPERIENCES ||--o{ ADDONS : "offers"
    BATCHES ||--o{ BOOKING_ORDERS : "reserved_by"
    
    BOOKING_ORDERS ||--|{ ORDER_PARTICIPANTS : "registers"
    BOOKING_ORDERS ||--o{ ORDER_ADDONS : "selects"
    BOOKING_ORDERS ||--|{ PAYMENTS : "settled_via"
    BOOKING_ORDERS ||--o| TERMS_ACCEPTANCE : "accepts"
    BOOKING_ORDERS ||--o{ CERTIFICATES : "generates"
    
    TRAVELLER_PROFILES ||--o{ POSTS : "authors"
    TRAVELLER_PROFILES ||--o{ TEMPORARY_STORIES : "publishes"
    TRAVELLER_PROFILES ||--o{ TRAVEL_MILESTONES : "earns"
    TRAVELLER_PROFILES ||--o{ FOLLOWERS : "following"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string role
        boolean is_active
        timestamp created_at
    }

    STATES {
        uuid id PK
        string name UK
        string iso_code UK
        geometry boundary_geom
        geometry centroid_geom
    }

    DISTRICTS {
        uuid id PK
        uuid state_id FK
        string name
        geometry boundary_geom
    }

    TALUKAS {
        uuid id PK
        uuid district_id FK
        string name
        geometry boundary_geom
    }

    PLACES {
        uuid id PK
        uuid taluka_id FK
        string name
        string slug UK
        geometry location_coords
        boolean booking_enabled_by_admin
    }

    VILLAGES {
        uuid id PK
        uuid taluka_id FK
        string lgd_code UK
        string name_en
        string name_local
        geometry centroid
        geometry cadastral_boundary
    }

    EXPERIENCES {
        uuid id PK
        uuid place_id FK
        string title
        string slug UK
        numeric base_price_inr
        int upfront_payment_percentage
    }

    BATCHES {
        uuid id PK
        uuid experience_id FK
        date batch_start_date
        int total_capacity
        int available_slots
    }

    BOOKING_ORDERS {
        uuid id PK
        string order_number UK
        uuid user_id FK
        uuid batch_id FK
        string status
        numeric total_amount_inr
        numeric balance_due_inr
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK
        string gateway_name
        string gateway_payment_id UK
        numeric amount_inr
        string status
    }

    CERTIFICATES {
        uuid id PK
        string certificate_number UK
        uuid order_id FK
        uuid participant_id FK
        string hmac_verification_hash UK
        string pdf_asset_url
    }
```

---

# SECTION III: MULTI-TIER DATA FLOW DIAGRAMS (DFD)

## 1. DFD Level 0 (System Context Diagram)
Represents the entire Explore Bharat Safar boundary interacting with external entities.

```mermaid
flowchart LR
    Explorer["Explorer User"] -->|Search, Bookings, Stories| EBS["Explore Bharat Safar Platform"]
    EBS -->|Maps, Orders, Certificates, Feeds| Explorer

    VillageAdmin["Village Admin"] -->|Staged Village Updates| EBS
    EBS -->|Review Status & Audit Confirmations| VillageAdmin

    SuperAdmin["Super Admin / Moderator"] -->|Approval Directives, Config, Toggles| EBS
    EBS -->|Audit Reports, Telemetry, Moderation Queues| SuperAdmin

    EBS -->|Card / UPI Auth Requests| PayGateway["Razorpay / Cashfree Payment Gateways"]
    PayGateway -->|Signed Payment Webhooks| EBS

    EBS -->|SOI Geometry Ingestion| SOI["Survey of India Spatial Services"]
```

## 2. DFD Level 1 (Functional Subsystem Partitioning)

```mermaid
flowchart TD
    User["User Client"] --> P1["1.0 Identity & Session Subsystem"]
    P1 --> Store_Identity[("identity_schema")]

    User --> P2["2.0 Bharat Discovery GIS Subsystem"]
    P2 --> Store_Geo[("geo_spatial_schema")]

    User --> P3["3.0 Rural Bharat Knowledge Subsystem"]
    P3 --> Store_Rural[("rural_bharat_schema")]

    User --> P4["4.0 Experience Booking & Inventory Subsystem"]
    P4 --> Store_Booking[("booking_schema")]
    P4 --> Mutex_Redis[("Redis Redlock Mutex")]

    P4 --> P5["5.0 Fintech & Double-Entry Payment Subsystem"]
    P5 --> Store_Payment[("payment_schema")]

    P4 --> P6["6.0 Digital Certificate Authority Subsystem"]
    P6 --> Store_Cert[("certificate_schema")]

    User --> P7["7.0 Traveller Social Network Subsystem"]
    P7 --> Store_Social[("social_schema")]

    P1 & P3 & P4 & P5 & P7 --> P8["8.0 Centralized Audit Logging Subsystem"]
    P8 --> Store_Audit[("audit_schema (WORM S3)")]
```

## 3. DFD Level 2 (High-Risk Ingress: Booking, Payment & Staging)

```mermaid
flowchart TD
    Client["Explorer Checkout Client"] --> ValSlot["4.1 Validate Slot Availability"]
    ValSlot --> LockMut["4.2 Acquire Redlock Mutex lock:batch:ID"]
    LockMut --> Decrement["4.3 Decrement Available Inventory"]
    Decrement --> CreateOrder["4.4 Create Order Record (status: PENDING_PAYMENT)"]
    CreateOrder --> TriggerPay["5.1 Initialize Gateway Order (Razorpay)"]
    TriggerPay --> ClientPay["5.2 Client Completes UPI / NetBanking"]
    ClientPay --> WebhookRec["5.3 Ingress Webhook Receiver"]
    WebhookRec --> HMACVal{"5.4 Verify HMAC-SHA256 Signature"}
    HMACVal -->|Invalid| Reject["Reject Webhook (400 Bad Request)"]
    HMACVal -->|Valid| LedgerCommit["5.5 Commit Double-Entry Ledger & Confirm Order"]
    LedgerCommit --> ReleaseMut["4.5 Release Mutex & Broadcast SSE Inventory Update"]
```

---

# SECTION IV: COMPREHENSIVE SEQUENCE DIAGRAMS

## 1. High-Concurrency Slot Reservation Flow (Redis Redlock)

```mermaid
sequenceDiagram
    autonumber
    actor User as Explorer
    participant API as Booking Controller
    participant Redlock as Redis Redlock Service
    participant DB as PostgreSQL Master
    participant SSE as WebSocket / SSE Gateway

    User->>API: POST /api/v1/bookings/reserve { batchId: "B104", slots: 2 }
    API->>Redlock: Acquire Mutex: lock:batch:B104 (TTL: 15m)
    alt Mutex Granted & Capacity >= 2
        Redlock-->>API: Mutex Acquired
        API->>DB: INSERT INTO orders (status: 'PENDING_PAYMENT', expires_at: NOW() + 15m)
        API->>DB: UPDATE batches SET available_slots = available_slots - 2
        API->>Redlock: Release Mutex
        API->>SSE: Emit "batch:inventory_changed" { available: 1 }
        API-->>User: 201 Created { orderId, checkoutExpiresIn: 900 }
    else Capacity < 2 (Sold Out)
        Redlock-->>API: Mutex Acquired
        API->>Redlock: Release Mutex
        API-->>User: 409 Conflict { errorCode: "EBS-BKG-SLOT-UNAVAILABLE" }
    end
```

## 2. Double-Entry Payment Webhook Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Gateway as Razorpay Payment Gateway
    participant Ingress as Payment Webhook Controller
    participant Crypto as HMAC Verification Engine
    participant DB as PostgreSQL (Serializable Isolation)
    participant Ledger as Double-Entry Ledger Table
    participant Queue as BullMQ Notification Queue

    Gateway->>Ingress: POST /api/v1/payments/webhooks/razorpay (Payload + X-Razorpay-Signature)
    Ingress->>Crypto: Compute HMAC-SHA256(Payload, WebhookSecret)
    Crypto->>Crypto: timingSafeEqual(Computed, Received)
    alt Signature Valid
        Crypto-->>Ingress: Validated (True)
        Ingress->>DB: BEGIN TRANSACTION (SERIALIZABLE)
        Ingress->>DB: INSERT INTO payments (status: 'SUCCESS', amount, gateway_payment_id)
        Ingress->>DB: UPDATE orders SET total_paid = total_paid + amount, status = 'CONFIRMED'
        Ingress->>Ledger: Record Credit: User Account | Record Debit: Escrow Clearing
        Ingress->>DB: COMMIT TRANSACTION
        Ingress->>Queue: Enqueue: send-booking-confirmation-email
        Ingress-->>Gateway: HTTP 200 OK
    else Signature Invalid (Potential Tampering)
        Crypto-->>Ingress: Rejected (False)
        Ingress->>DB: INSERT INTO audit_schema.security_alerts (reason: "WEBHOOK_SIG_FORGERY")
        Ingress-->>Gateway: HTTP 400 Bad Request
    end
```

## 3. Automated Digital Certificate Issuance Handshake

```mermaid
sequenceDiagram
    autonumber
    actor Leader as Trek Leader / Admin
    participant API as Operations Controller
    participant DB as PostgreSQL 16
    participant Queue as BullMQ: certificate-generator
    participant Worker as PDF/A-1b Vector Rendering Worker
    participant S3 as AWS S3 WORM Vault
    actor Explorer as Explorer User

    Leader->>API: POST /api/v1/admin/batches/:id/attendance { participantId, attended: true }
    API->>DB: UPDATE order_participants SET attendance_verified = TRUE
    API->>DB: SELECT balance_due_inr FROM orders WHERE id = participant.order_id
    alt Attended == TRUE AND BalanceDue == 0.00
        API->>Queue: Enqueue: generate-certificate { participantId, batchId }
        API-->>Leader: 200 OK (Attendance Recorded & Certificate Queued)
        Worker->>DB: Fetch Participant Name, Experience Title, Completion Date
        Worker->>Worker: Calculate HMAC-SHA256(Secret, certId || name || date)
        Worker->>Worker: Render ISO 19005-1 PDF/A-1b with Dynamic QR Code
        Worker->>S3: Archive PDF Document in Vault
        Worker->>DB: INSERT INTO certificates (cert_number, hmac_hash, pdf_url)
        Worker-->>Explorer: Push Notification: "Your Certificate is Ready for Download"
    else BalanceDue > 0.00
        API-->>Leader: 200 OK (Attendance Recorded; Certificate Blocked Due to Balance Due)
    end
```

## 4. Decentralized Village Staging Moderation Flow

```mermaid
sequenceDiagram
    autonumber
    actor VA as Assigned Village Admin
    participant API as Village Ingress API
    participant Staging as village_updates_staging Table
    actor Mod as District Moderator
    participant LiveDB as villages (Production Table)
    participant Audit as Immutable Audit Log

    VA->>API: POST /api/v1/villages/:id/updates { updateType: "FACILITY_EDIT", payload: {...} }
    API->>API: Assert RBAC: user.assigned_village_id == :id
    API->>Staging: INSERT INTO village_updates_staging (status: 'PENDING_APPROVAL')
    Staging-->>VA: 202 Accepted (Update Staged for Review)
    
    Mod->>API: GET /api/v1/moderation/queue?district=Pune
    API-->>Mod: Deliver Staged Update Payloads
    
    alt Moderator Approves Update
        Mod->>API: POST /api/v1/moderation/:stagingId/review { action: "APPROVE" }
        API->>LiveDB: Merge Staging JSON Payload to Production Record
        API->>Staging: UPDATE status = 'APPROVED'
        API->>Audit: Append Audit Record (Mod ID, Action, Timestamp, Diff)
        API-->>VA: Push Notification: "Village Update Approved & Published"
    else Moderator Rejects Update
        Mod->>API: POST /api/v1/moderation/:stagingId/review { action: "REJECT", comments: "Inaccurate Coordinates" }
        API->>Staging: UPDATE status = 'REJECTED', review_comments = "Inaccurate Coordinates"
        API->>Audit: Append Rejection Audit Record
        API-->>VA: Push Notification: "Update Rejected: Inaccurate Coordinates"
    end
```

---

# SECTION V: FINITE STATE MACHINE MODELS

## 1. Booking Order Lifecycle State Machine (11 Canonical States)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Explorer Selects Experience & Batch
    DRAFT --> PENDING_PAYMENT: Slot Locked (15m Redlock Mutex)
    PENDING_PAYMENT --> EXPIRED: 15m Timer Expires Without Payment
    EXPIRED --> [*]: Slots Restored to Batch Inventory
    
    PENDING_PAYMENT --> PARTIALLY_PAID: Advance Paid (< 100%)
    PENDING_PAYMENT --> FULLY_PAID: Full Payment Received (100%)
    
    PARTIALLY_PAID --> FULLY_PAID: Balance Payment Cleared Prior to Departure
    
    PARTIALLY_PAID --> CONFIRMED: Upfront Advance Verified
    FULLY_PAID --> CONFIRMED: 100% Payment Confirmed
    
    CONFIRMED --> COMPLETED: Trip Executed & Attendance Verified
    
    COMPLETED --> CERTIFICATE_ISSUED: Attendance == TRUE & Balance == 0.00
    
    CONFIRMED --> CANCELLED_BY_USER: User Requests Cancellation
    CONFIRMED --> CANCELLED_BY_ADMIN: Weather / Force Majeure Cancellation
    
    CANCELLED_BY_USER --> REFUND_INITIATED: Cancellation Matrix Applied
    CANCELLED_BY_ADMIN --> REFUND_INITIATED: 100% Refund Queued
    
    REFUND_INITIATED --> REFUNDED: Gateway Disburses Refund
    
    REFUNDED --> ARCHIVED: Closed in Accounting Ledger
    CERTIFICATE_ISSUED --> ARCHIVED: Review Submitted or 90 Days Closed
```

## 2. Ephemeral Travel Story 24-Hour Lifecycle

```mermaid
stateDiagram-v2
    [*] --> UPLOADING: Pre-Signed S3 URL Generated
    UPLOADING --> QUARANTINED: Binary Ingress in S3 Quarantine Bucket
    QUARANTINED --> PROCESSING: ClamAV Virus Scan & Sharp EXIF Scrub
    PROCESSING --> ACTIVE: Transcoded WebP/AVIF & Redis 24h TTL Set
    ACTIVE --> EXPIRED: 24 Hours Elapsed (Redis Keyspace Expiry)
    EXPIRED --> ARCHIVED: Removed from Active Feed (Moved to Private User Archive)
    ARCHIVED --> [*]
```

---

# SECTION VI: DOMAIN CLASS DIAGRAMS

Object-oriented domain modeling for core entities:

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String passwordHash
        +UserRole role
        +Boolean isActive
        +register()
        +login()
        +resetPassword()
    }

    class Place {
        +UUID id
        +String name
        +String slug
        +Point coordinates
        +Boolean bookingEnabledByAdmin
        +renderDossier()
        +checkBookingAvailability()
    }

    class Village {
        +UUID id
        +String lgdCode
        +String nameEn
        +String nameLocal
        +Point centroid
        +MultiPolygon boundary
        +submitUpdate()
    }

    class Experience {
        +UUID id
        +String title
        +String slug
        +DifficultyLevel difficulty
        +Decimal basePrice
        +Integer upfrontPaymentPercentage
        +publish()
        +unpublish()
    }

    class Batch {
        +UUID id
        +Date startDate
        +Date endDate
        +Integer totalCapacity
        +Integer availableSlots
        +reserveSlots(count: Integer)
        +releaseSlots(count: Integer)
    }

    class BookingOrder {
        +UUID id
        +String orderNumber
        +BookingStatus status
        +Decimal totalAmount
        +Decimal balanceDue
        +calculatePayable()
        +confirmPayment()
    }

    class Certificate {
        +UUID id
        +String certificateNumber
        +String hmacHash
        +String pdfUrl
        +verifyAuthenticity()
        +generateQRCode()
    }

    User "1" --> "1" TravellerProfile
    Place "1" --> "*" Experience
    Experience "1" --> "*" Batch
    Batch "1" --> "*" BookingOrder
    BookingOrder "1" --> "*" Certificate
    Taluka "1" --> "*" Village
    Taluka "1" --> "*" Place
```

---

# SECTION VII: ERROR RECOVERY & EXCEPTION DECISION TREES

```mermaid
flowchart TD
    ErrorEvent["System Exception Intercepted"] --> ErrorType{"Exception Classification"}
    
    ErrorType -->|Concurrency Conflict| E1["Redis Redlock Acquisition Failure"]
    E1 --> E1_Action["Return HTTP 409 Conflict<br/>Inform User: 'Slot currently held by another user. Try again or join waitlist.'"]

    ErrorType -->|Payment Verification Failure| E2["Webhook Signature Mismatch"]
    E2 --> E2_Action["Log Critical Security Alert<br/>Return HTTP 400 Bad Request<br/>Do NOT Commit Order to Database"]

    ErrorType -->|Cartographic Validation Failure| E3["Third-Party Map Tile Misrepresents Borders"]
    E3 --> E3_Action["Intercept Tile Stream<br/>Apply Survey of India Official GeoJSON Mask<br/>Log Compliance Warning"]

    ErrorType -->|Unauthorized Village Edit| E4["Village Admin Targets Foreign Village ID"]
    E4 --> E4_Action["Return HTTP 403 Forbidden<br/>Log Security Audit Strike<br/>Block Write Request"]
```

---

# SECTION VIII: FUTURE ARCHITECTURE EXTENSIONS

```mermaid
graph TB
    subgraph FutureExtensions ["Explore Bharat Safar Architectural Roadmap"]
        Ext1["1. Offline-First PWA & Satellite Cache<br/>(Cached trail maps & offline attendance recording)"]
        Ext2["2. AI-Powered Cultural Travel Guide<br/>(Fine-tuned LLM for state folklore & village histories)"]
        Ext3["3. Augmented Reality (AR) Trail Navigation<br/>(Camera overlay identifying Himalayan peaks & fort bastions)"]
        Ext4["4. Virtual Reality (VR) Heritage Expeditions<br/>(360° photogrammetric tours of inaccessible caves & temples)"]
        Ext5["5. Blockchain Sovereign Credentialing<br/>(Decentralized verifiable credentials for trekking certificates)"]
    end
```

---

## Conclusion & Architectural Sign-Off

This comprehensive visual blueprint encapsulates every technical diagram, workflow, and sequence required to execute the complete **Explore Bharat Safar** ecosystem. All development squads, infrastructure engineers, and QA automation teams shall strictly build against these authoritative visual contracts.
