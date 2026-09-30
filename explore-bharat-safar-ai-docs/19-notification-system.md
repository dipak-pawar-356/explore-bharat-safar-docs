# Explore Bharat Safar — Multi-Channel Notification Architecture & Delivery Pipeline

- **Document Identifier**: EBS-DOC-19-NOTIF
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Backend Notification Engineers, DevOps SREs, Messaging Integrators, Frontend WebSocket Developers, Security Analysts
- **Related Documents**:
  - `02-specification.md`
  - `03-architecture.md`
  - `09-api-design.md`
  - `14-booking-system.md`
  - `15-social-media.md`
  - `20-certificate-system.md`
  - `29-third-party-services.md`
- **Last Updated**: 2026-09-28

---

## 1. Notification Mission & Architecture Overview

The **Notification System** of **Explore Bharat Safar** delivers critical transactional, operational, community, and security alerts across five coordinated communication channels. It guarantees that time-critical booking confirmations, emergency trail advisories, village moderation tickets, and completion certificates reach stakeholders reliably and without delay.

```mermaid
graph TD
    TriggerEvent[Domain Event: Booking / Village / Social] --> EventRouter[Notification Dispatch Router]
    EventRouter --> PriorityQueue[BullMQ Redis Priority Queues]
    
    subgraph WorkerTier["Async Notification Workers"]
        HighPriorityWorker[High-Priority Worker: OTP / Booking / Security]
        NormalPriorityWorker[Normal-Priority Worker: Certs / Moderation]
        BatchWorker[Batch Worker: Social Reactions / Digests]
    end

    PriorityQueue --> HighPriorityWorker
    PriorityQueue --> NormalPriorityWorker
    PriorityQueue --> BatchWorker

    HighPriorityWorker --> WSAdapter[WebSockets / In-App Socket.io]
    HighPriorityWorker --> SMSAdapter[SMS Gateway / Gupshup / Twilio]
    NormalPriorityWorker --> EmailAdapter[Transactional Email / AWS SES]
    NormalPriorityWorker --> WhatsAppAdapter[WhatsApp Business API]
    BatchWorker --> PushAdapter[Web Push / VAPID Gateway]
```

---

## 2. Multi-Channel Dispatch Taxonomy

| Notification Category | In-App WebSocket | Transactional Email | SMS Gateway | WhatsApp API | Web Push |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication OTP & Security Alerts** | No | Yes (Instant) | Yes (Priority 1) | No | No |
| **Booking Advance Payment Confirmed** | Yes (Toast) | Yes (PDF Invoice)| Yes (Short SMS) | Yes (PDF Ticket) | Yes |
| **Trip Departure Countdown (48h/24h)** | Yes | Yes (Packing List) | Yes | Yes (Location Pin)| Yes |
| **Certificate Generated & Ready** | Yes (Badge) | Yes (PDF Attached)| No | Yes (Direct Link)| Yes |
| **Village Update Approved / Rejected**| Yes (Admin UI)| Yes (Formal Log) | No | No | No |
| **Social Follow / Comment / Reaction**| Yes (Drawer) | No (Or Daily Digest)| No | No | Optional |

---

## 3. Asynchronous Queue Architecture & Reliability (BullMQ)

```mermaid
sequenceDiagram
    autonumber
    participant Svc as Booking Service
    participant Q as BullMQ Redis Queue
    participant W as Notification Worker
    participant Ext as External Gateway (SES / Twilio)
    participant DLQ as Dead Letter Queue (DLQ)

    Svc->>Q: Enqueue Job: `BOOKING_CONFIRMED` { bookingId, userId, channels }
    Q->>W: Dequeue Job Payload
    W->>W: Evaluate User Channel Preferences & Idempotency Key
    W->>Ext: Dispatch API Request to Email / WhatsApp Gateway
    alt Gateway Dispatched Successfully
        Ext-->>W: 200 OK (Message Reference ID)
        W->>W: Record Delivery in `notification_logs`
    else Gateway Fails (Network Timeout / Rate Limit)
        Ext-->>W: 503 Service Unavailable
        W->>Q: Retry Job with Exponential Backoff (3 Attempts, Jitter)
        Note over Q,W: If 3 Attempts Fail
        W->>DLQ: Route to Dead Letter Queue for SRE Inspection
        W->>Svc: Trigger Internal Operational Alert
    end
```

### 3.1 Idempotency & Deduplication Engine
To prevent duplicate alerts during network retries or concurrent webhook handling, every notification generates a deterministic deduplication key stored in Redis with a 5-minute expiration:

$$\text{Dedup Key} = \text{MD5}\left(\text{UserId} \,\|\, \text{EventType} \,\|\, \text{EntityId} \,\|\, \text{Channel}\right)$$

If an incoming job matches an active deduplication key in Redis, it is acknowledged and discarded without re-sending.

---

## 4. User Notification Preference Matrix

Travellers maintain granular control over non-essential communications via their profile settings:

```typescript
export interface INotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
    webPush: boolean;
  };
  categories: {
    bookingAlerts: boolean; // Mandatory True (Cannot be disabled)
    trailSafetyAdvisories: boolean; // Mandatory True
    socialInteractions: boolean; // Follows, comments, reactions
    communityAnnouncements: boolean;
    weeklyCulturalNewsletter: boolean;
  };
}
```

---

## 5. Summary & Downstream Alignment

This notification architecture specification ensures reliable, multi-channel alerting across Explore Bharat Safar. It interfaces directly with the booking engine in `14-booking-system.md`, the certificate synthesis engine in `20-certificate-system.md`, and third-party integrations in `29-third-party-services.md`.
