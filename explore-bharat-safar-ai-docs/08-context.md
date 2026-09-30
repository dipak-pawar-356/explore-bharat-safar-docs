# Explore Bharat Safar — System Context, Domain Boundaries & Architectural Landscape

- **Document Identifier**: EBS-DOC-08-CONTEXT
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Enterprise Solution Architects, Domain Leads, Security Officers, Systems Integrators, Technical Product Managers
- **Related Documents**:
  - `01-idea.md`
  - `02-specification.md`
  - `03-architecture.md`
  - `09-api-design.md`
  - `10-database-design.md`
  - `26-business-rules.md`
  - `29-third-party-services.md`
- **Last Updated**: 2026-09-28

---

## 1. System Context & Environmental Landscape

**Explore Bharat Safar** exists at the intersection of geographical information systems (GIS), rural knowledge preservation, experiential adventure tourism, and social community networking.

To preserve operational stability and prevent monolithic coupling, the platform enforces strict **Domain-Driven Design (DDD)** bounded contexts. Each domain encapsulates its own business logic, domain entities, and data access rules, communicating with adjacent domains exclusively via well-defined internal APIs, domain events, or Anti-Corruption Layers (ACL).

```mermaid
graph TD
    subgraph ExternalUsers["External Human Actors"]
        TravellerActor["Traveller / Explorer"]
        VillageAdminActor["Village Administrator"]
        BookingAdminActor["Expedition / Booking Admin"]
        ModeratorActor["Content / Social Moderator"]
        SuperAdminActor["Platform Super Admin"]
    end

    subgraph CoreSystem["Explore Bharat Safar System Boundary"]
        EBS_Platform["Explore Bharat Safar Core Platform"]
    end

    subgraph ExternalServices["External Technical Services"]
        PaymentGW["Payment Gateways (Razorpay / Cashfree)"]
        SMS_Email["Messaging Gateways (SES / Twilio / WhatsApp)"]
        GovDirectory["Gov Data / LGD Census Directory"]
        CloudStorage["S3-Compatible Object Vault"]
        CDN_WAF["Cloudflare Edge CDN / WAF"]
    end

    TravellerActor --> CDN_WAF
    VillageAdminActor --> CDN_WAF
    BookingAdminActor --> CDN_WAF
    ModeratorActor --> CDN_WAF
    SuperAdminActor --> CDN_WAF

    CDN_WAF --> EBS_Platform
    EBS_Platform <--> PaymentGW
    EBS_Platform --> SMS_Email
    EBS_Platform -.-> GovDirectory
    EBS_Platform <--> CloudStorage
```

---

## 2. Bounded Context Map (Domain-Driven Design)

The system is classified into **Core Domains**, **Supporting Domains**, and **Generic Domains**.

```mermaid
graph TB
    subgraph GenericDomains["Generic Subdomains"]
        IAM_Context["Identity & Access Management (IAM)"]
        Audit_Context["Immutable Audit & Compliance"]
    end

    subgraph CoreDomains["Core Business Domains"]
        GIS_Context["Bharat Discovery Engine (GIS Map)"]
        Village_Context["Village Knowledge & Rural Bharat"]
        Booking_Context["Travel & Experience Booking"]
        Social_Context["Traveller Social Platform"]
    end

    subgraph SupportingDomains["Supporting Subdomains"]
        Payment_Context["Payment Allocation & Ledger"]
        Cert_Context["Digital Certificate Synthesis"]
        Notification_Context["Multi-Channel Notifications"]
        Search_Context["Isolated Search Engines"]
        Media_Context["Media Transcoding & Storage"]
    end

    IAM_Context -->|Supplies Identity| CoreDomains
    GIS_Context -->|Referenced By ID| Booking_Context
    Booking_Context -->|Commands Payment| Payment_Context
    Booking_Context -->|Triggers Verification| Cert_Context
    Cert_Context -->|Generates Milestone| Social_Context
    CoreDomains -->|Publishes Events| Notification_Context
    CoreDomains -->|Appends Logs| Audit_Context
```

### 2.1 Domain Classifications & Strategic Value

| Domain Name | Category | Strategic Purpose & Business Value | Primary Aggregates |
| :--- | :--- | :--- | :--- |
| **Bharat Discovery Engine** | **Core Domain** | Provides the hierarchical, vectorized exploration of India down to taluka and attraction levels. High competitive differentiation. | `State`, `District`, `Taluka`, `Place`, `Landmark` |
| **Village Knowledge System** | **Core Domain** | Digitally archives and empowers over 600,000 rural villages and Gram Panchayats with multi-tier governance. | `Village`, `PanchayatProfile`, `PublicFacility`, `LocalDirectory` |
| **Experience Booking Engine**| **Core Domain** | High-concurrency batch scheduling, inventory locks, participant medical telemetry, and custom deposit rules. | `Experience`, `Batch`, `Booking`, `Participant` |
| **Traveller Social Platform**| **Core Domain** | Community engagement, travel journals, temporary stories, and verified traveller matchmaking. | `TravellerProfile`, `Post`, `Story`, `Community` |
| **Payment & Billing** | Supporting | Handles upfront partial payment math, payment gateway webhooks, refunds, and tax invoicing. | `PaymentTransaction`, `Invoice`, `LedgerEntry` |
| **Certificate Synthesis** | Supporting | Automated vector-grade PDF generation, HMAC signing, and public QR code verification. | `Certificate`, `VerificationDigest` |
| **Search Engine** | Supporting | Provides isolated, domain-specific text and spatial auto-complete without cross-domain bleed. | `SearchIndex`, `AutocompleteIndex` |
| **Identity & Access (IAM)** | Generic | Token issuance, password hashing, multi-factor authentication, and role authorization. | `User`, `Role`, `Permission`, `Session` |
| **Audit Logging** | Generic | Immutable system-wide trail recording all administrative mutations and security events. | `AuditLog` |

---

## 3. Inter-Domain Relationships & Integration Patterns

```mermaid
classDiagram
    direction LR
    class GISDomain {
        <<Core Domain>>
        +getPlaceById(placeId)
        +isBookingEnabled(placeId)
    }
    class BookingDomain {
        <<Core Domain>>
        +reserveSlots(batchId, count)
        +confirmBooking(bookingId)
    }
    class PaymentDomain {
        <<Supporting Domain>>
        +createPaymentIntent(amount, advance)
        +verifySignature(payload)
    }
    class CertificateDomain {
        <<Supporting Domain>>
        +generateCertificate(bookingId, participantId)
        +verifyDigest(certNumber)
    }

    GISDomain <.. BookingDomain : Customer/Supplier (Place Reference Only)
    BookingDomain --> PaymentDomain : Command (Customer/Supplier)
    BookingDomain --> CertificateDomain : Domain Event (TripCompletedEvent)
```

### 3.1 Formal Integration Contracts
1. **GIS Discovery $\leftrightarrow$ Booking Engine**:
   - The Place Details page in Section 1 references booking opportunities via the immutable `is_booking_enabled` boolean flag and an optional `experience_id` reference.
   - **Crucial Rule**: The GIS Place entity contains **zero** booking logic, pricing calculators, or batch inventory data. It simply provides a navigational bridge to the Booking Domain.
2. **Booking Engine $\rightarrow$ Payment Ledger**:
   - The Booking Engine creates an order and requests a payment intent from the Payment Domain.
   - The Payment Domain calculates the mandatory upfront deposit based on the Super Admin's configuration and manages external gateway communication via an Anti-Corruption Layer (ACL).
3. **Booking Engine $\rightarrow$ Certificate Engine**:
   - Upon completion of a trip batch, the Booking Admin verifies attendance.
   - The Booking Domain emits a `TripAttendanceVerifiedEvent`.
   - The Certificate Engine validates that `Outstanding Balance Due == 0.00` before triggering the asynchronous PDF generation worker.
4. **Certificate Engine $\rightarrow$ Traveller Social Profile**:
   - When a certificate is minted, a `CertificateIssuedEvent` is dispatched.
   - The Social Domain intercepts this event to automatically record a verified milestone badge onto the traveller's public travel timeline.

---

## 4. External Dependencies & Boundary Adaptations

```mermaid
graph LR
    subgraph CorePlatform["EBS Core System"]
        PaymentSvc["Payment Service"]
        GISMapSvc["GIS Map Service"]
        NotifSvc["Notification Service"]
    end

    subgraph ACL_Layer["Anti-Corruption Layers (Adapters)"]
        RazorpayAdapter["Razorpay Gateway Adapter"]
        CashfreeAdapter["Cashfree Fallback Adapter"]
        SESAdapter["AWS SES / SendGrid Adapter"]
        WhatsAppAdapter["Twilio WhatsApp Adapter"]
        MapboxTileAdapter["MVT / PostGIS Spatial Adapter"]
    end

    subgraph ExternalThirdParties["Third-Party Providers"]
        ExtRazorpay["Razorpay API / Webhooks"]
        ExtCashfree["Cashfree Payment Systems"]
        ExtSES["AWS Simple Email Service"]
        ExtWhatsApp["Meta WhatsApp Business API"]
        ExtOSM["OpenStreetMap / Survey of India Tiles"]
    end

    PaymentSvc --> RazorpayAdapter --> ExtRazorpay
    PaymentSvc -.-> CashfreeAdapter -.-> ExtCashfree
    NotifSvc --> SESAdapter --> ExtSES
    NotifSvc --> WhatsAppAdapter --> ExtWhatsApp
    GISMapSvc --> MapboxTileAdapter --> ExtOSM
```

---

## 5. Domain Invariants & Isolation Rules

- **Zero Search Cross-Bleed**: A search query originating in Section 1 (GIS Discovery) must never query tables or indexes belonging to Section 2 (Villages), Section 3 (Bookings), or Section 4 (Social).
- **Zero Direct Cross-Schema Writes**: The Social service cannot directly mutate tables belonging to the Booking or Identity schemas. All inter-domain state modifications must occur through validated API contracts or asynchronous event listeners.
- **Village Administration Sandbox**: A Village Admin's token provides access restricted to their assigned village record. They are completely quarantined from accessing or modifying any other village, booking record, or system configuration.

---

## 6. Summary & Downstream Alignment

This context document formally establishes the bounded contexts, interaction rules, and external boundaries of Explore Bharat Safar. These definitions dictate the REST/GraphQL endpoint structures in `09-api-design.md`, the relational schema boundaries in `10-database-design.md`, and the business rules in `26-business-rules.md`.
