# Explore Bharat Safar — Traveller Social Network & Community Platform

- **Document Identifier**: EBS-DOC-15-SOCIAL
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Social Platform Engineers, Community Managers, Content Moderators, Mobile Frontend Developers, Security Specialists
- **Related Documents**:
  - `02-specification.md`
  - `03-architecture.md`
  - `04-ui-ux.md`
  - `09-api-design.md`
  - `10-database-design.md`
  - `19-notification-system.md`
  - `26-business-rules.md`
- **Last Updated**: 2026-09-28

---

## 1. Social Platform Vision & Community Philosophy

The **Traveller Social Network** within **Explore Bharat Safar** is purposefully decoupled from generic, attention-extractive social networks. It is an intentional, outdoors- and heritage-focused community platform designed to foster authentic travel journaling, ethical exploration, peer safety advisories, and meaningful connections between verified travellers across Bharat.

```mermaid
mindmap
  root((Traveller Social Platform))
    Expedition Storytelling
      Long-Form Trail Journals
      Geo-Tagged Photo Showcases
      24-Hour Ephemeral Stories
    Automated Milestones
      Verified Travel Timelines
      State & District Visit Counters
      Cryptographic Certificate Badges
    Conscious Connections
      Solo Traveller Matchmaking
      Group Journey Communities
      Niche Cultural & Trekking Guilds
    Safety & Content Health
      Two-Tier Content Moderation
      Privacy-First Masking
      Anti-Spam Rate Limiters
```

---

## 2. Traveller Profiles & Automated Travel Timeline

Every registered user maintains a dedicated traveller profile that serves as their personal exploration passport.

```mermaid
graph TD
    UserActivity[Platform User Activity] --> EventInterceptor[Activity Interceptor]
    
    EventInterceptor -->|Trek Completed & Verified| E1[Add Milestone: 'Completed Harishchandragad Trek']
    EventInterceptor -->|Certificate Issued| E2[Attach Verified Certificate Badge & Link]
    EventInterceptor -->|Documented Hidden Place| E3[Add Milestone: 'Explored Ancient Stepwell, Patan']
    EventInterceptor -->|Verified Review Submitted| E4[Add Milestone: 'Reviewed Raigad Fort']

    E1 --> TimelineAggregator[Travel Timeline Engine]
    E2 --> TimelineAggregator
    E3 --> TimelineAggregator
    E4 --> TimelineAggregator

    TimelineAggregator --> ProfilePassport[Rendered Public Traveller Passport]
```

### 2.1 Profile Attributes & Verified Metrics
- **Identity & Bio**: Display Name, Unique `@username`, Avatar, Cover Photo, Regional Languages Spoken, Adventure Grade (`EXPLORER`, `TREKKER`, `MOUNTAINEER`, `CULTURAL_HISTORIAN`).
- **Verified Counters (Database Driven)**:
  - Total States & Union Territories Explored.
  - Total Administrative Districts Documented.
  - Completed Verified Expeditions & Treks.
  - Official Certificates Earned.
- **Privacy Controls**: Profile visibility configurable as `PUBLIC` (visible to all verified travellers) or `CONNECTIONS_ONLY`. Private contact details (phone, email) are permanently masked.

---

## 3. Home Feed Architecture & Post Formats

The social feed delivers a high-signal stream of verified travel narratives, trail advisories, and cultural discoveries.

```mermaid
graph LR
    subgraph PostIngestion["Post Composition & Publishing"]
        P1["Expedition Journal (Long-Form Markdown + Elevation Graph)"]
        P2["Photo Showcase (High-Res WebP Carousel + EXIF Validation)"]
        P3["Community Trail Advisory (Pinned Urgent Safety Alert)"]
        P4["24-Hour Ephemeral Story (Mobile Video / Photo + Geotag)"]
    end

    subgraph FeedDistribution["Feed Aggregation Pipeline"]
        ChronologicalFeed["Chronological Following Stream"]
        TrendingHeritage["Curated Cultural Discoveries"]
        RegionalAdvisory["Localized Safety Bulletins"]
    end

    PostIngestion --> FeedDistribution
```

### 3.1 Post Content Models
1. **Expedition Journal**: Structured Markdown log supporting elevation gain diagrams, GPX trail previews, packing retrospectives, and water-source updates.
2. **Photo Showcase**: Progressive image carousels with validated latitude/longitude EXIF tags anchored to existing Section 1 place records.
3. **Community Trail Advisory**: High-priority safety updates (e.g., landslide road closures, seasonal river surges, forest department permit freezes) requiring moderator fast-track approval.
4. **Temporary Stories**: 24-hour disappearing media clips displaying active trail moments with location stickers.

---

## 4. Ephemeral Stories & Garbage Collection Architecture

Temporary stories expire automatically after 24 hours to prevent media storage bloat:

```mermaid
sequenceDiagram
    autonumber
    actor Traveller as User Client
    participant API as Social API Service
    participant S3 as S3 Object Store
    participant DB as Social Database
    participant Worker as Story Archival Cron (BullMQ)

    Traveller->>API: POST /api/v1/social/stories { media, caption, location }
    API->>S3: Upload Story Asset (24h Cache Header)
    API->>DB: INSERT into temporary_stories (status: 'ACTIVE', expires_at: NOW() + 24h)
    API-->>Traveller: 201 Created (Story Published)

    Note over Worker,DB: Every 10 Minutes: Cron Worker Evaluates Expired Records
    Worker->>DB: SELECT id FROM temporary_stories WHERE status = 'ACTIVE' AND expires_at <= NOW()
    Worker->>DB: UPDATE temporary_stories SET status = 'ARCHIVED'
    Worker->>S3: Move Asset from Hot Tier to Glacier/Cold Storage
```

---

## 5. Solo & Group Traveller Connection Engine

### 5.1 Solo Traveller Matchmaking Algorithm
To help solo explorers discover compatible companions without broadcasting private contact details:
- **Match Parameters**:
  - Target Destination / Region (e.g., *Kinnaur Valley, Himachal Pradesh*)
  - Planned Departure Window (Date $\pm 3\text{ days}$)
  - Trek Difficulty Rating & Pacing
  - Gender Preferences (e.g., *Women-Only Solo Circles*)
- **Safety Mechanism**: The system facilitates in-app introductions via double opt-in messaging. Personal phone numbers or external handles are screened by automated regex filters to prevent unsolicited spam.

### 5.2 Niche Travel Communities & Guilds
Specialized community boards organized by geographic and activity interest:
- *Western Ghats Monsoon Trekkers*
- *Himalayan High-Altitude Mountaineers*
- *Ancient Temple Architecture & Inscriptions Guild*
- *Rural Homestay & Agro-Tourism Enthusiasts*
- *Bicycle Touring Bharat*

---

## 6. Content Moderation & Safety Architecture

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Post / Review Submitted
    SUBMITTED --> NLP_FILTER : Automated Regex & PII Scan
    NLP_FILTER --> FLAGGED : Violation Detected
    NLP_FILTER --> PUBLISHED : Automated Clearance Passed
    
    PUBLISHED --> REPORTED : User Reports Post (> 3 Flags)
    REPORTED --> MOD_QUEUE : Enqueued in Moderator Dashboard
    FLAGGED --> MOD_QUEUE : Enqueued for Review
    
    MOD_QUEUE --> PUBLISHED : Moderator Approves / Dismisses Flags
    MOD_QUEUE --> REMOVED : Moderator Removes Post (Warning Issued)
    REMOVED --> [*]
```

### 6.1 Verified Reviews Enforcement
- Only travellers who have a completed booking (`status == 'TRIP_COMPLETED'`) with verified on-ground attendance can submit verified reviews for trips and experiences.
- Reviews evaluate distinct operational facets: Guide Expertise, Trail Safety, Food Quality, Camp Cleanliness, and Value for Money.

---

## 7. Summary & Downstream Alignment

This social network specification defines the community dynamics, media lifecycles, and safety protocols of Explore Bharat Safar. It integrates directly with the notification system in `19-notification-system.md`, certificate system in `20-certificate-system.md`, and business rules in `26-business-rules.md`.
