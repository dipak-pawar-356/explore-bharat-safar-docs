# Explore Bharat Safar — System Class Diagrams & Object Domain Models

- **Document Identifier**: EBS-DOC-37-CLASS
- **Version**: 1.0.0
- **Status**: Approved
- **Author**: Enterprise Architecture & Solutions Engineering Team
- **Target Audience**: Backend Engineers, Software Architects, Domain Modeling Specialists, QA Engineers
- **Related Documents**:
  - `03-architecture.md`
  - `05-drd.md`
  - `09-api-design.md`
  - `10-database-design.md`
  - `26-business-rules.md`
- **Last Updated**: 2026-09-28

---

## 1. Domain Modeling Philosophy & Class Architecture

This document specifies the object-oriented domain classes, aggregates, value objects, and repository interfaces across all subsystems of **Explore Bharat Safar**. Models enforce strict encapsulation, domain-driven invariants, and decoupled persistence abstractions.

```mermaid
mindmap
  root((Class Hierarchy))
    Identity Aggregate
      User
      Role
      Permission
      Session
    Geographical Cartography
      State
      District
      Taluka
      Place
      Landmark3D
    Rural Knowledge Aggregate
      Village
      VillagePanchayat
      VillageUpdateStaging
    Commercial & Booking
      Experience
      Batch
      Booking
      Participant
      PaymentTransaction
      Certificate
    Social & Community
      TravellerProfile
      Post
      Story
      Community
```

---

## 2. Comprehensive Subsystem Class Diagrams

### 2.1 Geographical Discovery Aggregate

```mermaid
classDiagram
    class State {
        +UUID id
        +String name
        +String isoCode
        +Polygon boundary
        +Point centroid
        +getDistricts() List~District~
    }
    class District {
        +UUID id
        +UUID stateId
        +String name
        +Polygon boundary
        +Point centroid
        +getTalukas() List~Taluka~
    }
    class Taluka {
        +UUID id
        +UUID districtId
        +String name
        +Polygon boundary
        +Point centroid
        +getPlaces() List~Place~
        +getVillages() List~Village~
    }
    class Place {
        +UUID id
        +UUID talukaId
        +String name
        +String slug
        +Point coordinates
        +Int elevationMeters
        +Boolean isBookingEnabled
        +Float averageRating
        +enableBooking() void
        +disableBooking() void
    }
    class Landmark3D {
        +UUID id
        +UUID placeId
        +String name
        +String modelUri
        +Float renderScale
        +getProjectionMatrix() Matrix4
    }

    State "1" *-- "many" District : contains
    District "1" *-- "many" Taluka : contains
    Taluka "1" *-- "many" Place : encompasses
    Place "1" *-- "0..1" Landmark3D : visualizes
```

---

### 2.2 Booking, Financial & Certificate Aggregates

```mermaid
classDiagram
    class Experience {
        +UUID id
        +UUID placeId
        +String title
        +String difficultyLevel
        +Decimal basePrice
        +Int upfrontDepositPercentage
        +Boolean isActive
        +getUpcomingBatches() List~Batch~
    }
    class Batch {
        +UUID id
        +UUID experienceId
        +Date startDate
        +Date endDate
        +Int totalCapacity
        +Int availableSlots
        +reserveSlots(count) Boolean
        +releaseSlots(count) void
    }
    class Booking {
        +UUID id
        +String bookingNumber
        +UUID userId
        +UUID batchId
        +Decimal totalAmount
        +Decimal advancePaid
        +Decimal balanceDue
        +BookingStatus status
        +markPartiallyPaid(amount) void
        +markFullyPaid() void
        +cancel() void
    }
    class Participant {
        +UUID id
        +UUID bookingId
        +String fullName
        +Int age
        +String emergencyPhone
        +Boolean isAttendanceVerified
        +verifyAttendance() void
    }
    class PaymentTransaction {
        +UUID id
        +UUID bookingId
        +String gatewayRef
        +Decimal amount
        +TransactionStatus status
        +capture() Boolean
    }
    class Certificate {
        +UUID id
        +String certificateNumber
        +UUID participantId
        +UUID bookingId
        +Date completionDate
        +String verificationHash
        +String pdfVaultUri
        +verifySignature() Boolean
    }

    Experience "1" *-- "many" Batch : schedules
    Batch "1" *-- "many" Booking : holds
    Booking "1" *-- "many" Participant : registers
    Booking "1" *-- "many" PaymentTransaction : settles
    Participant "1" *-- "0..1" Certificate : earns
```

---

### 2.3 Rural Bharat Village Aggregate

```mermaid
classDiagram
    class Village {
        +UUID id
        +UUID talukaId
        +String lgdCode
        +String nameEn
        +String nameLocal
        +String pincode
        +Point centroid
        +Int population
        +ApprovalStatus status
        +assignAdmin(userId) void
    }
    class VillagePanchayat {
        +UUID id
        +UUID villageId
        +String gramPanchayatName
        +String gramSevakName
        +String officePhone
        +updateContacts(data) void
    }
    class VillageUpdateStaging {
        +UUID id
        +UUID villageId
        +UUID submittedBy
        +UpdateType type
        +JSON payload
        +StagingStatus status
        +approve(moderatorId) void
        +reject(moderatorId, reason) void
    }

    Village "1" *-- "1" VillagePanchayat : governs
    Village "1" *-- "many" VillageUpdateStaging : stages
```

---

### 2.4 Traveller Social Aggregate

```mermaid
classDiagram
    class TravellerProfile {
        +UUID id
        +UUID userId
        +String username
        +String displayName
        +Int visitedStatesCount
        +Int visitedDistrictsCount
        +Int completedExpeditionsCount
        +Boolean isPublic
        +incrementVisits(stateId, districtId) void
    }
    class Post {
        +UUID id
        +UUID profileId
        +PostType type
        +String title
        +String content
        +List~String~ mediaUris
        +Int reactionCount
        +addReaction(userId, type) void
    }
    class TemporaryStory {
        +UUID id
        +UUID profileId
        +String mediaUri
        +DateTime publishedAt
        +DateTime expiresAt
        +StoryStatus status
        +isExpired() Boolean
        +archive() void
    }

    TravellerProfile "1" *-- "many" Post : authors
    TravellerProfile "1" *-- "many" TemporaryStory : publishes
```

---

## 3. Summary & Downstream Alignment

This class diagram specification provides the object-oriented structure and method contracts for Explore Bharat Safar. It interfaces directly with database tables in `10-database-design.md`, component architecture in `35-component-diagram.md`, and business logic rules in `26-business-rules.md`.
