# Explore Bharat Safar — System State Machine Diagrams & Lifecycle Specifications

- **Document Identifier**: EBS-DOC-36-STATE
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Backend State Machine Engineers, Quality Assurance Leads, Workflow Specialists, Database Architects
- **Related Documents**:
  - `02-specification.md`
  - `03-architecture.md`
  - `14-booking-system.md`
  - `20-certificate-system.md`
  - `21-payment-system.md`
  - `26-business-rules.md`
- **Last Updated**: 2026-09-28

---

## 1. State Machine Modeling Philosophy

Every critical entity within **Explore Bharat Safar** transitions through finite, deterministic state machines. State changes are guarded by strict business rules, require authorized role triggers, and write immutable audit records upon every mutation.

```mermaid
mindmap
  root((System State Machines))
    Commercial State Machines
      Booking Lifecycle
      Payment Transaction State
      Cancellation & Refund State
    Governance State Machines
      Village Staging & Approval
      Review & Post Moderation
      Certificate Minting Lifecycle
    Identity & Media State Machines
      User Account Security State
      Ephemeral 24h Story Lifespan
```

---

## 2. Core State Machine Diagrams

### 2.1 Booking Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT : User Initiates Checkout
    DRAFT --> PENDING_PAYMENT : Terms Signed & 15-Min Slot Lock Acquired
    PENDING_PAYMENT --> EXPIRED : Lock Timeout (> 15 mins without payment)
    EXPIRED --> [*]

    PENDING_PAYMENT --> PARTIALLY_PAID : Advance Deposit Captured (e.g. 25%)
    PENDING_PAYMENT --> FULLY_PAID : 100% Upfront Paid

    PARTIALLY_PAID --> FULLY_PAID : Remaining Balance Settled Online / Offline
    PARTIALLY_PAID --> CANCELLED : Cancelled before Departure
    FULLY_PAID --> CANCELLED : Cancelled before Departure

    CANCELLED --> REFUND_INITIATED : Cancellation Policy Evaluated
    REFUND_INITIATED --> REFUNDED : Payout Reconciled via Gateway

    FULLY_PAID --> TRIP_COMPLETED : Trek Concluded & Attendance Verified
    PARTIALLY_PAID --> TRIP_COMPLETED : Alert: Balance Due Blocks Certificate
    
    TRIP_COMPLETED --> CERTIFICATE_ISSUED : Attendance Verified & Balance == 0.00
    CERTIFICATE_ISSUED --> ARCHIVED : Retention Period Reached
    REFUNDED --> ARCHIVED
    ARCHIVED --> [*]
```

---

### 2.2 Village Submission & Approval Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Village Admin Edits Info
    DRAFT --> PENDING_APPROVAL : Submitted to Staging Queue
    PENDING_APPROVAL --> UNDER_REVIEW : Regional Moderator Claims Ticket
    
    UNDER_REVIEW --> REJECTED : Fails Verification (Mandatory Reason Note)
    REJECTED --> DRAFT : Returned to Village Admin for Fixes
    
    UNDER_REVIEW --> MODERATOR_APPROVED : Standard Verification Passed
    MODERATOR_APPROVED --> SUPER_ADMIN_REVIEW : High-Stakes Boundary / Office Change
    SUPER_ADMIN_REVIEW --> PUBLISHED : Super Admin Authorizes Release
    MODERATOR_APPROVED --> PUBLISHED : Standard Update Auto-Published
    
    PUBLISHED --> ARCHIVED : Superceded by Newer Version
    PUBLISHED --> [*]
```

---

### 2.3 Payment Transaction Lifecycle

```mermaid
stateDiagram-v2
    [*] --> CREATED : Order Payment Intent Initialized
    CREATED --> PENDING : Gateway Handshake Initiated
    PENDING --> CAPTURED : Webhook: Payment Successful (HMAC Verified)
    PENDING --> FAILED : Payment Declined / Bank Timeout
    FAILED --> [*]

    CAPTURED --> REFUND_PENDING : User Initiates Cancellation
    REFUND_PENDING --> PARTIALLY_REFUNDED : Penalty Deducted per Policy
    REFUND_PENDING --> FULLY_REFUNDED : 100% Cancellation Waiver Applied
    PARTIALLY_REFUNDED --> [*]
    FULLY_REFUNDED --> [*]
```

---

### 2.4 Digital Certificate Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING_PREREQUISITES : Batch Concluded
    PENDING_PREREQUISITES --> ENQUEUED : Attendance Verified & Balance == 0.00
    PENDING_PREREQUISITES --> BLOCKED_BALANCE : Outstanding Dues Pending
    BLOCKED_BALANCE --> ENQUEUED : Dues Cleared Online/Offline
    
    ENQUEUED --> SYNTHESIZING : BullMQ Worker Claims Job
    SYNTHESIZING --> STORED_AND_SEALED : PDF Rendered & Dynamic QR Attached
    STORED_AND_SEALED --> ISSUED : Uploaded to S3 Vault & User Notified
    ISSUED --> REVOKED : Disciplinary Action / Fraud Detection (Exceptional)
    ISSUED --> [*]
```

---

### 2.5 User Account Lifecycle & Security States

```mermaid
stateDiagram-v2
    [*] --> PENDING_VERIFICATION : User Registers Account
    PENDING_VERIFICATION --> ACTIVE : Email Verification Link Clicked
    
    ACTIVE --> LOCKED_TEMPORARY : 5 Consecutive Failed Login Attempts
    LOCKED_TEMPORARY --> ACTIVE : 15-Minute Cooldown Expires or Password Reset
    
    ACTIVE --> SUSPENDED : Terms of Service Violation / Malicious Spam
    SUSPENDED --> ACTIVE : Reinstated by Super Admin
    
    ACTIVE --> DEACTIVATED : User Requests Account Closure (Soft Delete)
    DEACTIVATED --> [*]
```

---

### 2.6 Ephemeral 24-Hour Story Lifecycle

```mermaid
stateDiagram-v2
    [*] --> UPLOADING : Pre-Signed Storage URL Issued
    UPLOADING --> ACTIVE : Magic Bytes Verified & Story Published
    ACTIVE --> EXPIRED : Exactly 24 Hours (86,400s) Elapsed
    EXPIRED --> ARCHIVED : Automated Worker Updates Database Status
    ARCHIVED --> COLD_STORAGE : Moved to Cold Object Storage Tier
    COLD_STORAGE --> [*]
```

---

## 3. Comprehensive State Transition Guard Matrix

| Entity | Current State | Target State | Triggering Event / Action | Mandatory Guard Condition |
| :--- | :--- | :--- | :--- | :--- |
| **Booking** | `PENDING_PAYMENT` | `PARTIALLY_PAID` | Gateway Webhook Received | HMAC signature valid; advance deposit amount matched; lock active. |
| **Booking** | `PARTIALLY_PAID` | `FULLY_PAID` | Balance Payment Cleared | `Outstanding Balance Due == 0.00`. |
| **Booking** | `TRIP_COMPLETED` | `CERTIFICATE_ISSUED`| Async Certificate Job | Attendance verified by Trek Leader; `Balance Due == 0.00`. |
| **Village Update**| `PENDING_APPROVAL` | `PUBLISHED` | Moderator / Super Admin Sign-Off | Verified with official records; audit log generated. |
| **Certificate** | `ENQUEUED` | `STORED_AND_SEALED` | PDFKit Synthesis Worker | HMAC verification hash embedded; valid S3 URI returned. |
| **Story** | `ACTIVE` | `ARCHIVED` | Scheduled Cron Job | `published_at <= NOW() - INTERVAL '24 HOURS'`. |

---

## 4. Summary & Downstream Alignment

This state diagram specification establishes the deterministic lifecycles and validation guards across Explore Bharat Safar. It interfaces directly with database triggers in `10-database-design.md`, business rules in `26-business-rules.md`, and class models in `37-class-diagram.md`.
