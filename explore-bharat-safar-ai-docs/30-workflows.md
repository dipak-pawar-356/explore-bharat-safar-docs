# Explore Bharat Safar — End-to-End System Workflows & Operational Process Specifications

- **Document Identifier**: EBS-DOC-30-WORKFLOWS
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Business Analysts, Systems Architects, Operations Leads, Fullstack Engineers, QA Engineers
- **Related Documents**:
  - `02-specification.md`
  - `03-architecture.md`
  - `13-admin-panel.md`
  - `14-booking-system.md`
  - `20-certificate-system.md`
  - `26-business-rules.md`
- **Last Updated**: 2026-09-28

---

## 1. Workflow Architecture & Process Philosophy

This document defines the canonical operational workflows, cross-functional lifecycles, and governance state machines of **Explore Bharat Safar**. Every interaction—from a user discovering an ancient fort on the GIS map to a Village Admin curating local heritage or a trekker receiving a cryptographic certificate—is modeled as a deterministic, auditable workflow.

```mermaid
mindmap
  root((System Workflows))
    Administrative & Governance
      Two-Tier Village Moderation
      CMS & Editorial Publishing
      Manual Attendance & Cert Clearance
    Commercial & Financial
      Experience Creation to Batch Slotting
      Partial Upfront Payment & Checkout
      Pre-Departure Balance Settlement
      Cancellation & Tiered Refunds
    Discovery & Immersion
      Hierarchical Geo Navigation
      Isolated Multi-Domain Search
    Community & Social
      Expedition Post Moderation
      24-Hour Ephemeral Story Lifecycle
      Verified Review Submission
```

---

## 2. Core Operational Workflows

### 2.1 The Master Booking & Expedition Lifecycle Workflow

```mermaid
flowchart TD
    A[Admin Creates Experience & Departure Batches] --> B[Traveller Selects Batch & Number of Slots]
    B --> C[System Locks Slots in Redis: 15-min TTL]
    C --> D[Traveller Fills Participant Medical Info & Accepts Legal Waiver]
    D --> E[System Computes Upfront % Deposit: e.g. 25%]
    E --> F[Payment Gateway Captures Advance Deposit]
    F --> G[Booking Confirmed & Slots Decremented Permanently]
    
    G --> H[48 Hours to Departure: Automated Balance Reminder]
    H --> I[Balance Settled Online or Offline at Base Camp]
    I --> J[Expedition Commences On-Trail]
    J --> K[Trek Leader Logs Verified On-Trail Attendance]
    
    K --> L{All Gates Cleared: Attendance Verified & Balance == 0.00?}
    L -- No --> M[Alert: Certificate Blocked Pending Settlement]
    L -- Yes --> N[Asynchronous Worker Mints Vector PDF Certificate]
    N --> O[Dynamic QR Encoded & Certificate Stored in S3 Vault]
    O --> P[User Receives Download Link & Milestone Added to Timeline]
    P --> Q[User Submits Verified Expedition Review]
```

---

### 2.2 The Village Knowledge Curation & Approval Workflow

```mermaid
sequenceDiagram
    autonumber
    actor VA as Village Admin
    participant S as Web Portal
    participant DB as Staging Database
    actor Mod as Regional Moderator
    actor SA as Super Admin
    participant ProdDB as Production PostgreSQL
    participant CDN as Edge Cache

    VA->>S: Submits Gram Panchayat Contacts & Heritage Photos
    S->>DB: INSERT into `village_updates_staging` (Status: 'PENDING_APPROVAL')
    S-->>VA: Issue Tracking Ticket ID
    
    Mod->>DB: Fetch Staged Submissions for Assigned District
    Mod->>Mod: Verify Information with Official Directory / Local Bodies
    alt Modification Rejected
        Mod->>DB: Set Status = 'REJECTED' with Mandatory Feedback
        DB-->>VA: Notification: "Update Returned with Comments"
    else Modification Approved
        Mod->>DB: Set Status = 'MODERATOR_APPROVED'
        opt High-Stakes Boundary / Office Modification
            Mod->>SA: Escalate to Super Admin for Final Sign-Off
            SA->>DB: Authorize Final Sign-Off
        end
        DB->>ProdDB: Merge Changes into `rural_bharat_schema.villages`
        ProdDB->>CDN: Invalidate Edge Cache for Village URL
        ProdDB-->>VA: Notification: "Changes Published to Live Directory"
    end
```

---

### 2.3 The Bharat Discovery Engine Hierarchical Map Flow

```mermaid
flowchart TD
    M1[User Opens National Bharat Vector Map] --> M2[Hover / Click Miniature 3D Landmark]
    M2 --> M3[Display Rich Non-Modal Drawer Preview]
    M3 -->|Click 'Explore Deeply'| M4[Zoom into State Bounding Box]
    
    M4 --> M5[Display State Dossier & Embedded District Map]
    M5 -->|Click District Polygon| M6[Zoom into District Bounding Box]
    
    M6 --> M7[Display District Profile & Embedded Taluka Map]
    M7 -->|Click Taluka Polygon| M8[Display Taluka Directory & Monument Pins]
    
    M8 -->|Click Place Pin| M9[Open Comprehensive Place Details Page]
    M9 --> M10{Is Booking Enabled by Super Admin?}
    M10 -- No --> M11[Render Full History, Logistics, Gallery & Reviews Only]
    M10 -- Yes --> M12[Render Prominent 'Book Now' CTA linking to Booking Engine]
```

---

### 2.4 The Payment & Financial Settlement Workflow

```mermaid
sequenceDiagram
    autonumber
    actor T as Traveller
    participant B as Booking Engine
    participant P as Payment Engine
    participant GW as Razorpay / Cashfree
    participant DB as Ledger Database
    participant Inv as Invoicing Service

    T->>B: Confirms Reservation Summary
    B->>P: Request Payment Intent (Total, Advance %, Balance)
    P->>GW: Create Order with Webhook URL
    GW-->>T: Render Payment Modal (UPI / Card / NetBanking)
    T->>GW: Completes Authorization
    GW->>P: POST /api/v1/payments/webhook (HMAC Signature Header)
    P->>P: Verify Cryptographic Signature & Replay Nonce
    P->>DB: Insert Transaction Record & Update Booking Status
    P->>Inv: Trigger GST Tax Invoice Synthesis (SAC 998555)
    Inv->>T: Dispatch Invoice via Email & WhatsApp
```

---

### 2.5 The Social Content Publishing & Moderation Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT : User Composes Expedition Journal / Story
    DRAFT --> SUBMITTED : User Clicks 'Publish'
    SUBMITTED --> NLP_PII_SCAN : Automated Regex & PII Filter
    NLP_PII_SCAN --> FLAGGED : Violation Detected
    NLP_PII_SCAN --> PUBLISHED : Automated Clearance Passed
    
    PUBLISHED --> USER_REPORTED : > 3 Community User Flags
    USER_REPORTED --> MOD_REVIEW : Enqueued in Moderator Console
    FLAGGED --> MOD_REVIEW : Enqueued for Verification
    
    MOD_REVIEW --> PUBLISHED : Approved by Moderator
    MOD_REVIEW --> REMOVED : Rejected / Censored by Moderator
    REMOVED --> [*]
```

---

## 3. Summary & Downstream Alignment

These system workflows define the exact operational sequences and decision branches for Explore Bharat Safar. They provide the structural blueprints for the sequence diagrams in `31-sequence-diagrams.md`, activity diagrams in `32-activity-diagrams.md`, and business rules in `26-business-rules.md`.
