# Explore Bharat Safar — Entity-Relationship (ER) Diagram & Schema Specifications

- **Document Identifier**: EBS-DOC-33-ERD
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Database Administrators, Data Architects, Backend Engineers, Analytics Leads
- **Related Documents**:
  - `03-architecture.md`
  - `05-drd.md`
  - `10-database-design.md`
  - `26-business-rules.md`
- **Last Updated**: 2026-09-28

---

## 1. Relational Modeling Philosophy & Entity Scope

This document details the complete relational architecture, entity cardinalities, foreign key mappings, and PostGIS spatial integrations for **Explore Bharat Safar**. The persistence model enforces strict referential integrity, normalizes administrative hierarchies into Third Normal Form (3NF), and supports zero-downtime schema migrations.

```mermaid
mindmap
  root((Relational Architecture))
    Identity & RBAC
      Users & Sessions
      Roles & Granular Permissions
      Audit Attribution
    Geographical Cartography
      States -> Districts -> Talukas
      Places & Miniature 3D Landmarks
      Categorical Hierarchies
    Rural Knowledge Fabric
      Villages & LGD Census Codes
      Gram Panchayat Profiles
      Staged Moderation Diffs
    Commercial Engine
      Experiences & Dynamic Batches
      Bookings & Participant Telemetry
      Financial Transactions & Invoices
      Cryptographic PDF Certificates
    Community Platform
      Traveller Profiles & Passports
      Expedition Journals & Media
      Ephemeral 24h Stories
      Niche Communities & Guilds
```

---

## 2. High-Level Domain Relationship Map

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : places
    USERS ||--o| TRAVELLER_PROFILES : maintains
    USERS ||--o{ AUDIT_LOGS : triggers
    USERS ||--o{ USER_ROLES : holds
    ROLES ||--o{ USER_ROLES : assigned_to

    STATES ||--o{ DISTRICTS : contains
    DISTRICTS ||--o{ TALUKAS : contains
    TALUKAS ||--o{ PLACES : encompasses
    TALUKAS ||--o{ VILLAGES : encompasses

    PLACES ||--o| EXPERIENCES : links_booking
    PLACES ||--o{ LANDMARKS_3D : visualizes

    EXPERIENCES ||--o{ BATCHES : schedules
    BATCHES ||--o{ BOOKINGS : reserves
    BOOKINGS ||--o{ BOOKING_PARTICIPANTS : registers
    BOOKINGS ||--o{ PAYMENTS : settles
    BOOKING_PARTICIPANTS ||--o| CERTIFICATES : earns

    VILLAGES ||--o| VILLAGE_PANCHAYATS : governs
    VILLAGES ||--o{ VILLAGE_UPDATES_STAGING : stages

    TRAVELLER_PROFILES ||--o{ POSTS : authors
    TRAVELLER_PROFILES ||--o{ TEMPORARY_STORIES : publishes
    TRAVELLER_PROFILES ||--o{ TIMELINE_EVENTS : generates
```

---

## 3. Detailed Entity Schema & Attribute Specification

### 3.1 Spatial & Discovery Entities

```mermaid
erDiagram
    STATES {
        uuid id PK
        varchar name
        varchar iso_code UK
        geometry boundary_geom
        geometry centroid_geom
        jsonb overview_dossier
    }
    DISTRICTS {
        uuid id PK
        uuid state_id FK
        varchar name
        geometry boundary_geom
        geometry centroid_geom
        jsonb emergency_directory
    }
    TALUKAS {
        uuid id PK
        uuid district_id FK
        varchar name
        geometry boundary_geom
        geometry centroid_geom
    }
    PLACES {
        uuid id PK
        uuid taluka_id FK
        varchar name
        varchar slug UK
        uuid_array category_ids
        geometry coordinates
        boolean is_booking_enabled
        uuid linked_experience_id
        numeric average_rating
    }
    LANDMARKS_3D {
        uuid id PK
        uuid place_id FK
        varchar name
        varchar model_asset_uri
        geometry coordinates
        numeric render_scale
    }

    STATES ||--o{ DISTRICTS : "1 to N"
    DISTRICTS ||--o{ TALUKAS : "1 to N"
    TALUKAS ||--o{ PLACES : "1 to N"
    PLACES ||--o{ LANDMARKS_3D : "1 to N"
```

---

### 3.2 Booking, Fintech & Certification Entities

```mermaid
erDiagram
    EXPERIENCES {
        uuid id PK
        uuid place_id FK
        varchar title
        varchar difficulty_level
        numeric base_price
        int mandatory_upfront_percentage
        boolean is_active
    }
    BATCHES {
        uuid id PK
        uuid experience_id FK
        date start_date
        date end_date
        int total_capacity
        int available_slots
        varchar batch_status
    }
    BOOKINGS {
        uuid id PK
        varchar booking_number UK
        uuid user_id FK
        uuid batch_id FK
        numeric total_amount
        numeric advance_amount_paid
        numeric balance_amount_due
        varchar booking_status
        timestamp terms_accepted_at
    }
    BOOKING_PARTICIPANTS {
        uuid id PK
        uuid booking_id FK
        varchar full_name
        int age
        varchar emergency_phone
        boolean is_attendance_verified
    }
    PAYMENTS {
        uuid id PK
        uuid booking_id FK
        varchar gateway_reference UK
        numeric amount_paid
        varchar transaction_status
    }
    CERTIFICATES {
        uuid id PK
        varchar certificate_number UK
        uuid participant_id FK
        uuid booking_id FK
        date completion_date
        varchar verification_hash
        varchar pdf_vault_uri
    }

    EXPERIENCES ||--o{ BATCHES : "1 to N"
    BATCHES ||--o{ BOOKINGS : "1 to N"
    BOOKINGS ||--o{ BOOKING_PARTICIPANTS : "1 to N"
    BOOKINGS ||--o{ PAYMENTS : "1 to N"
    BOOKING_PARTICIPANTS ||--o| CERTIFICATES : "1 to 1"
```

---

### 3.3 Rural Bharat & Village Entities

```mermaid
erDiagram
    VILLAGES {
        uuid id PK
        uuid taluka_id FK
        varchar lgd_code UK
        varchar name_en
        varchar name_local
        varchar pincode
        geometry centroid
        int population_count
        varchar approval_status
        uuid assigned_admin_user_id FK
    }
    VILLAGE_PANCHAYATS {
        uuid id PK
        uuid village_id FK
        varchar gram_panchayat_name
        varchar gram_sevak_name
        varchar office_phone
    }
    VILLAGE_UPDATES_STAGING {
        uuid id PK
        uuid village_id FK
        uuid submitted_by FK
        varchar update_type
        jsonb payload
        varchar status
        uuid reviewed_by FK
    }

    VILLAGES ||--o| VILLAGE_PANCHAYATS : "1 to 1"
    VILLAGES ||--o{ VILLAGE_UPDATES_STAGING : "1 to N"
```

---

## 4. Key Cardinality Constraints & Invariants

1. **Foreign Key Integrity**: All foreign keys strictly enforce `ON DELETE RESTRICT` for geographical entities (`states`, `districts`, `talukas`) and financial ledgers (`bookings`, `payments`) to prevent accidental cascade destruction of historical records.
2. **One-to-One Certificate Mapping**: `certificate_schema.certificates.participant_id` enforces a unique constraint (`UNIQUE NOT NULL`), ensuring that a participant can never be issued duplicate certificates for the same completed expedition.
3. **Soft-Delete Filtering**: All primary tables contain a `deleted_at TIMESTAMP WITH TIME ZONE NULL` column. Unique indexes must include the `WHERE deleted_at IS NULL` predicate to allow re-use of slugs or emails if a prior record is soft-deleted.

---

## 5. Summary & Downstream Alignment

This entity-relationship specification establishes the structural schema and integrity rules for Explore Bharat Safar. It works directly with the database DDL in `10-database-design.md`, API contracts in `09-api-design.md`, and business rules in `26-business-rules.md`.
