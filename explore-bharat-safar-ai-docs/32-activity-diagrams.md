# Explore Bharat Safar — System Activity Diagrams & Process Logic Flows

- **Document Identifier**: EBS-DOC-32-ACTIVITY
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Business Analysts, Systems Engineers, UX Researchers, QA Automation Engineers
- **Related Documents**:
  - `02-specification.md`
  - `03-architecture.md`
  - `14-booking-system.md`
  - `20-certificate-system.md`
  - `30-workflows.md`
  - `31-sequence-diagrams.md`
- **Last Updated**: 2026-09-28

---

## 1. Document Overview & Modeling Conventions

This document specifies the system activity diagrams for **Explore Bharat Safar**, illustrating the internal control logic, decision branching, parallel fork/join operations, and state transformations across all major functional modules. All diagrams conform to Mermaid flowchart and activity syntax.

---

## 2. Core Functional Activity Diagrams

### 2.1 Complete Traveller Exploration & Booking Activity

```mermaid
flowchart TD
    Start([User Arrives at Platform]) --> Browse[Browse Interactive Vector Map]
    Browse --> SelectState[Select State Polygon]
    SelectState --> ZoomState[Camera Zooms into State Bounding Box]
    ZoomState --> SelectDistrict[Select District Polygon]
    SelectDistrict --> SelectTaluka[Select Taluka Directory]
    SelectTaluka --> SelectPlace[Open Place Dossier]

    SelectPlace --> CheckBooking{Is Booking Enabled by Super Admin?}
    CheckBooking -- No --> ViewContentOnly[Read History, Logistics & Cultural Guides]
    ViewContentOnly --> End([Session Concluded])
    
    CheckBooking -- Yes --> ClickBook[Click 'Book Now' Button]
    ClickBook --> CheckAuth{Is User Authenticated?}
    CheckAuth -- No --> AuthModal[Prompt Login / Registration]
    AuthModal --> CheckAuth
    CheckAuth -- Yes --> SelectBatch[Select Available Departure Batch]
    
    SelectBatch --> TryLock{Acquire 15-Minute Slot Lock in Redis}
    TryLock -- Lock Failed --> NotifySoldOut[Display 'Slots Sold Out' Alert]
    NotifySoldOut --> SelectBatch
    
    TryLock -- Lock Acquired --> EnterParticipants[Enter Participant Details & Medical Form]
    EnterParticipants --> AcceptTerms[Accept Legal Terms & Expedition Waiver]
    AcceptTerms --> PayDeposit[Process Upfront Mandatory Deposit]
    
    PayDeposit --> PaymentGateway{Gateway Transaction Successful?}
    PaymentGateway -- Failed --> RetryPayment[Prompt Alternate Payment Method]
    RetryPayment --> PaymentGateway
    
    PaymentGateway -- Success --> ConfirmBooking[Order Confirmed: Status PARTIALLY_PAID / FULLY_PAID]
    ConfirmBooking --> OnTrail[On-Ground Expedition Executed]
    OnTrail --> VerifyAttendance[Trek Leader Verifies Attendance]
    
    VerifyAttendance --> CheckBalance{Outstanding Balance == 0.00?}
    CheckBalance -- No --> SettleDues[Traveller Settles Balance Online/Offline]
    SettleDues --> CheckBalance
    
    CheckBalance -- Yes --> GenerateCert[Automated Worker Synthesizes Vector PDF Certificate]
    GenerateCert --> AddMilestone[Append Verified Badge to Public Travel Timeline]
    AddMilestone --> End
```

---

### 2.2 Village Knowledge Curation & Approval Activity

```mermaid
flowchart TD
    V_Start([Village Admin Logs In]) --> V_Dashboard[Open Scoped Village Administration Console]
    V_Dashboard --> V_Edit[Update Healthcare, Public Utilities or History]
    V_Edit --> V_Upload[Upload Historical & Cultural Media]
    V_Upload --> V_Submit[Submit Update Payload]
    
    V_Submit --> V_Stage[Save in `village_updates_staging` as PENDING_APPROVAL]
    V_Stage --> V_NotifyMod[Enqueue in Regional Moderator Dashboard]
    
    V_NotifyMod --> V_ModReview[Regional Moderator Evaluates Submission Diffs]
    V_ModReview --> V_Decision{Meets Verification Standards?}
    
    V_Decision -- No --> V_Reject[Mark Status REJECTED with Mandatory Feedback]
    V_Reject --> V_NotifyVA[Alert Village Admin with Actionable Comments]
    V_NotifyVA --> V_Edit
    
    V_Decision -- Yes --> V_CheckHighStakes{Involves Contested Boundary or Legal Office?}
    V_CheckHighStakes -- Yes --> V_Escalate[Escalate to Super Admin for Final Sign-Off]
    V_Escalate --> V_SuperSignOff[Super Admin Authorizes Release]
    V_CheckHighStakes -- No --> V_DirectPublish[Moderator Authorizes Release]
    
    V_SuperSignOff --> V_MergeMaster
    V_DirectPublish --> V_MergeMaster[Merge Changes into Master Database Table]
    
    V_MergeMaster --> V_PurgeCache[Purge CDN Edge Cache for Village URL]
    V_PurgeCache --> V_AuditLog[Write Append-Only Immutable Audit Log]
    V_AuditLog --> V_End([Update Live on Public Directory])
```

---

### 2.3 Isolated Search Subsystem Activity

```mermaid
flowchart TD
    S_Start([User Enters Search Query]) --> S_Sanitize[Sanitize Input: Strip Control Chars & SQL Injections]
    S_Sanitize --> S_LengthCheck{Query Length >= 2 Characters?}
    S_LengthCheck -- No --> S_Idle[Wait for Additional Characters]
    
    S_LengthCheck -- Yes --> S_Route{Evaluate Originating Path}
    
    S_Route -- Path: /explore/* --> S1[Query Section 1: Places, Monuments & Territories Only]
    S_Route -- Path: /villages/* --> S2[Query Section 2: Rural Villages, Panchayats & PINs Only]
    S_Route -- Path: /bookings/* --> S3[Query Section 3: Treks, Expeditions & Batches Only]
    S_Route -- Path: /community/* --> S4[Query Section 4: Travellers, Posts & Guilds Only]
    
    S1 --> S_Cache{Cached in Redis?}
    S2 --> S_Cache
    S3 --> S_Cache
    S4 --> S_Cache
    
    S_Cache -- Hit --> S_Return[Return Sub-50ms JSON Autocomplete Results]
    S_Cache -- Miss --> S_ExecuteQuery[Execute Parameterized Database Query with Trigram/FTS]
    S_ExecuteQuery --> S_PersistCache[Store Query Results in Redis with 1h TTL]
    S_PersistCache --> S_Return
    S_Return --> S_End([Render Isolated Results Dropdown])
```

---

## 3. Summary & Downstream Alignment

These activity diagrams detail the internal state progressions and decision gates of Explore Bharat Safar. They work in tandem with `30-workflows.md` for operational processes, `31-sequence-diagrams.md` for messaging sequences, and `26-business-rules.md` for governance rules.
