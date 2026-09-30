# Explore Bharat Safar — Official Coding Standards, Clean Architecture & Engineering Best Practices (Part 13)

- **Document Identifier**: EBS-STD-52-CODE
- **Version**: 1.0.0
- **Classification**: Authoritative Engineering Standard & Code Quality Specification
- **Domain**: Enterprise Software Engineering, Code Quality, Architecture Governance, Security & Performance Standards
- **Status**: Approved & Authoritative
- **Author**: Distinguished Software Engineer, Principal Full Stack Architect, Technical Director, Enterprise Software Architect, Staff Engineer, Engineering Excellence Lead, Code Quality Specialist, DevSecOps Architect, Performance Engineer, Solution Architect
- **Target Audience**: All Software Engineers, AI Agents, Technical Leads, Engineering Managers, Code Reviewers, Contributors, DevOps/SRE Leads, Security Officers
- **Related Documents**:
  - `MASTER_PROMPT.md` (Master Project Charter & Core Directives)
  - `01-idea.md` through `39-future-updates.md` (Core System Specifications)
  - `40-enterprise-security-blueprint.md` (Zero-Trust Security & Compliance Matrix)
  - `41-bharat-discovery-engine-blueprint.md` (Spatial Vector & 3D WebGL Cartography)
  - `42-village-knowledge-system-blueprint.md` (Rural Bharat Cadastral System & DPDP Act)
  - `43-travel-booking-and-experience-management-blueprint.md` (Redlock Mutex & Ledger Engine)
  - `44-traveller-social-network-and-community-blueprint.md` (Travel Social Graph & Feeds)
  - `45-core-technical-architecture-and-infrastructure-blueprint.md` (Infrastructure Blueprint)
  - `46-documentation-standards-and-file-specifications-blueprint.md` (Documentation Standards)
  - `47-system-diagrams-and-workflow-visualizations-blueprint.md` (System Diagrams Blueprint)
  - `48-business-logic-validation-rules-and-quality-gates-blueprint.md` (Quality Gates Blueprint)
  - `49-project-folder-and-repository-structure.md` (Enterprise Monorepo Topology)
  - `50-development-workflow.md` (SDLC Governance & GitOps Lifecycle)
  - `51-technology-stack-decisions.md` (Enterprise Technology Decision Record)
- **Last Updated**: 2026-09-28

---

## Executive Summary & Engineering Constitution Charter

This master document constitutes the **Official Engineering Constitution, Clean Architecture Standards, and Code Quality Specification** for the entire **Explore Bharat Safar** enterprise digital ecosystem.

Engineered to sustain a **10–20 year operational horizon**, Explore Bharat Safar is an enterprise-scale, distributed, cloud-native platform unifying four sovereign pillars:
1. **Bharat Discovery Engine (Pillar 1)**: Interactive GIS mapping, WebGL 3D landmarks, Survey of India-compliant cartography, and hierarchical spatial drilldowns.
2. **Rural Bharat Knowledge System (Pillar 2)**: Authoritative cultural, civic, and demographic registry covering 650,000+ villages, Gram Panchayats, and Local Government Directory (LGD) cadastral codes under DPDP Act compliance.
3. **Experience Booking Engine (Pillar 3)**: High-concurrency inventory reservation, 15-minute distributed slot locks via Redlock mutexes, dynamic upfront payment percentages, double-entry financial ledger accounting, and verifiable vector PDF/A-1b completion certificates.
4. **Traveller Social Network (Pillar 4)**: Expedition-focused social graph, hybrid fan-out feeds, 24-hour ephemeral stories, verified badges, community guilds, and chronological travel timelines.

Every developer, AI agent, engineering lead, contributor, and automated CI/CD pipeline is legally and operationally bound by this document. Zero deviation is permitted without a formal Architecture Decision Record (ADR) approved by the Architecture Review Board (ARB).

---

## Master Layer Dependency Architecture & Governance Topology

The Explore Bharat Safar codebase enforces a strict unidirectional, acyclic dependency model modeled after Clean Architecture and Domain-Driven Design (DDD).

```mermaid
graph TD
    subgraph EnterpriseMonorepo ["Explore Bharat Safar — Monorepo Architecture"]
        subgraph Layer1_Domain ["Layer 1: Enterprise Domain & Types (Innermost Core)"]
            Types["packages/types<br/>• Pure Interfaces & Enums<br/>• Domain Entity Signatures<br/>• Zero External Dependencies"]
        end

        subgraph Layer2_Validation ["Layer 2: Domain Validation & Security Core"]
            Validators["packages/validators<br/>• Pure Zod Schemas<br/>• Input / Output Contracts"]
            Crypto["packages/security-crypto<br/>• Argon2id, RS256, AES-GCM<br/>• Pure Cryptographic Primitives"]
            GISCore["packages/gis-core<br/>• Spatial Math & Projection Math<br/>• Turf.js Geometry Contracts"]
        end

        subgraph Layer3_Infrastructure ["Layer 3: Persistence & Shared Infrastructure"]
            DB["packages/database<br/>• Prisma Client & PostGIS Extensions<br/>• PostgreSQL Repository Implementations"]
            Logger["packages/logger<br/>• OpenTelemetry & Pino Envelopes"]
            UI["packages/ui<br/>• Radix Primitives + Tailwind Tokens<br/>• Accessible Headless Presentation"]
        end

        subgraph Layer4_Applications ["Layer 4: Deployable Applications (Outermost Ring)"]
            WebApp["apps/web<br/>• Next.js 14+ App Router<br/>• React Server Components (RSC)<br/>• Client Islands"]
            APIApp["apps/api<br/>• NestJS 10+ Modular Monolith<br/>• Fastify HTTP & RPC Adapters<br/>• Redlock Mutex Orchestration"]
            WorkerApp["apps/worker<br/>• BullMQ Distributed Job Processors<br/>• PDF/A-1b Generation & Media Pipelines"]
        end
    end

    Layer4_Applications --> Layer3_Infrastructure
    Layer4_Applications --> Layer2_Validation
    Layer4_Applications --> Layer1_Domain
    Layer3_Infrastructure --> Layer2_Validation
    Layer3_Infrastructure --> Layer1_Domain
    Layer2_Validation --> Layer1_Domain

    classDef core fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef val fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef infra fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef app fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class Layer1_Domain,Types core;
    class Layer2_Validation,Validators,Crypto,GISCore val;
    class Layer3_Infrastructure,DB,Logger,UI infra;
    class Layer4_Applications,WebApp,APIApp,WorkerApp app;
```

---

## Master Engineering Decision Matrix

The following decision matrix codifies the foundational architectural paradigms for all engineering teams:

| Architectural Area | Selected Standard | Disallowed Pattern | Primary Rationale | Enforcement Tooling |
| :--- | :--- | :--- | :--- | :--- |
| **Language Paradigm** | TypeScript 5.4+ Strict Mode (`noImplicitAny`, `strictNullChecks`) | Loose JavaScript, `any`, `unknown` without narrowing | Mathematical compile-time type safety; elimination of null-pointer exceptions | ESLint `@typescript-eslint/no-explicit-any` |
| **Monorepo Topology** | Turborepo + pnpm workspaces | Polyrepo or unmanaged Lerna setups | Atomic multi-package refactoring, remote computational caching, dependency isolation | `turbo.json`, `pnpm-workspace.yaml` |
| **Frontend Architecture**| Next.js 14+ App Router with React Server Components (RSC) | Pages Router, full Client-Side Rendering (CSR) monoliths | Zero-bundle-size server components, streaming SSR, native SEO indexing | Next.js Compiler & Core Web Vitals CI |
| **Backend Architecture** | NestJS 10+ Modular Monolith on Fastify | Ad-hoc Express scripts, tangled microservice webs | Strict DDD module encapsulation, high-throughput async Fastify core, sub-48h extraction path | Architecture Unit Tests (`dependency-cruiser`) |
| **Data Persistence** | PostgreSQL 16 + PostGIS 3.4 via Prisma ORM & Raw Spatial Queries | Unindexed NoSQL, dual-write split databases | ACID relational guarantees for booking ledgers; spatial spatial indexing (`GIST`) | Prisma Migrate + Schema Linter |
| **Distributed Locking** | Redlock Algorithm across Redis 7.2 Cluster | Optimistic locking only, in-memory local locks | Zero double-booking guarantee during flash sales and peak reservation windows | Redlock Integration Test Harness |
| **Validation Layer** | Zod runtime schema validation at every network boundary | Manual `if-else` type assertions, unchecked casting | Fail-fast schema enforcement, automatic TypeScript type inference | Custom NestJS ZodValidationPipe |
| **Component System** | Radix UI Headless Primitives + Tailwind CSS Design Tokens | Heavy monolithic UI component libraries (MUI, AntD) | 100% WCAG 2.1 AA accessibility compliance, zero CSS runtime overhead | `@axe-core/playwright` CI Audit |

---

## Architectural Governance & Engineering Quality Gates

Explore Bharat Safar enforces a mandatory **10-Stage Engineering Quality Gate** through automated GitHub Actions pipelines before any code artifact can be staged or merged into the production trunk:

```mermaid
flowchart LR
    G1["Gate 1<br/>Pre-Commit<br/>(Husky / Lint-Staged)"] --> G2["Gate 2<br/>Type Check<br/>(tsc --noEmit)"]
    G2 --> G3["Gate 3<br/>Static Linter<br/>(ESLint Strict)"]
    G3 --> G4["Gate 4<br/>SAST & Secrets<br/>(Trivy / Gitleaks)"]
    G4 --> G5["Gate 5<br/>Unit Tests<br/>(Vitest / AAA)"]
    G5 --> G6["Gate 6<br/>Integration<br/>(PostGIS Testcontainers)"]
    G6 --> G7["Gate 7<br/>E2E Journeys<br/>(Playwright)"]
    G7 --> G8["Gate 8<br/>Accessibility<br/>(Axe-Core WCAG AA)"]
    G8 --> G9["Gate 9<br/>Performance<br/>(Lighthouse CI)"]
    G9 --> G10["Gate 10<br/>Image Sign<br/>(Cosign / OCI)"]
```

---

## Master RACI Responsibility Matrix

| Engineering Deliverable / Artifact | Software Engineer | AI Agent / Assistant | Tech Lead / Staff Eng | DevSecOps / SRE | Security Officer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Domain Interfaces (`packages/types`)** | Accountable | Consulted | Responsible | Informed | Informed |
| **Zod Schema Contracts (`packages/validators`)** | Responsible | Responsible | Accountable | Informed | Consulted |
| **Backend Domain Logic (`apps/api`)** | Responsible | Responsible | Accountable | Informed | Consulted |
| **Frontend RSC & Island Architecture (`apps/web`)**| Responsible | Responsible | Accountable | Informed | Informed |
| **Database Migrations & Spatial DDL** | Responsible | Consulted | Accountable | Consulted | Informed |
| **Cryptographic & Auth Workflows** | Responsible | Consulted | Accountable | Informed | Responsible |
| **CI/CD Pipelines & Quality Gates** | Informed | Informed | Consulted | Responsible | Accountable |
| **Production Incident Post-Mortem** | Consulted | Informed | Accountable | Responsible | Consulted |

---

# SECTION 1: ENGINEERING PRINCIPLES

### 1.1 Purpose
The purpose of the Engineering Principles standard is to establish immutable foundational axioms that guide every technical decision, code commit, and architectural design within the Explore Bharat Safar digital ecosystem. It guarantees predictability, long-term system stability, fault tolerance, and absolute clarity across a 20-year operational horizon.

### 1.2 Rules
1. **Boring Technology Axiom**: Standard, battle-tested technologies with deep community validation and proven operational characteristics MUST be chosen over bleeding-edge, unproven alternatives.
2. **Deterministic Predictability**: Given identical state and inputs, software components and backend services MUST yield deterministic outputs with zero unmanaged side effects.
3. **Graceful Degradation & Resilience**: Systems MUST remain partially functional during partial network partitions, database read-replica lags, or third-party downstream outages.
4. **Idempotency Mandate**: Every mutating operation across network boundaries (API mutations, queue consumers, payment webhooks) MUST be strictly idempotent using unique deduplication keys.
5. **Traceability by Design**: Every transaction, error, state transition, and audit event MUST be fully traceable via unified distributed correlation IDs (`x-correlation-id`).

### 1.3 Best Practices
- Model domain failure states explicitly rather than relying on generic exceptions.
- Favor explicit data contracts over implicit assumptions; never accept dynamic polymorphic untyped payloads.
- Treat infrastructure and infrastructure configuration as immutable software artifacts versioned alongside code.
- Design every subsystem with automated observability (metrics, logs, traces) embedded from the first commit.

### 1.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An experience reservation command handler accepts a strongly typed input containing an `Idempotency-Key` header and returns a deterministic result envelope: `Result<ReservationSuccessToken, ReservationDomainError>`. If executed twice with the same key, it returns the cached result without duplicate slot consumption.
- *Conceptual Negative Pattern*: A booking route receives an untyped JSON payload, generates a new reservation row on every invocation without idempotency checking, and throws an unhandled generic system crash when inventory is exhausted.

### 1.5 Common Mistakes
- Choosing exotic databases or frameworks based on hype rather than operational resilience.
- Writing asynchronous message consumers that execute non-idempotent operations, causing duplicate payments or notifications upon network retries.
- Concealing underlying failure modes by catching exceptions silently without emitting diagnostic telemetry.

### 1.6 Review Checklist
- [ ] Does this design rely on boring, battle-tested technologies proven at enterprise scale?
- [ ] Are all network-facing mutation endpoints and background job processors strictly idempotent?
- [ ] Can the system degrade gracefully if dependent downstream services (e.g., SMS, Weather) fail?
- [ ] Is every state transition observable via structured logs and correlation tracking?

### 1.7 Quality Checklist
- [ ] Architectural Decision Record (ADR) exists for any architectural divergence.
- [ ] Failure paths have automated unit and integration tests asserting graceful fallback.
- [ ] Chaos testing scenarios verify system behavior during infrastructure degradation.

### 1.8 Security Considerations
- Ensure fallback and degraded modes do not inadvertently bypass authentication, authorization, or DPDP Act compliance checks.
- Prevent denial-of-service vectors caused by un-idempotent endpoints being subjected to aggressive client retries.

### 1.9 Performance Considerations
- Design idempotency stores in distributed Redis clusters with precise TTL eviction windows to avoid memory leaks.
- Minimize cold-path overhead during healthy operations while maintaining circuit-breaking mechanisms.

### 1.10 Future Scalability
- Systems designed with deterministic idempotency can transition seamlessly from modular monolith deployments to isolated event-driven microservices without rewrite.

---

# SECTION 2: CLEAN CODE PRINCIPLES

### 2.1 Purpose
Clean Code Principles ensure that the Explore Bharat Safar codebase reads like well-authored prose. Code is read significantly more often than it is written; this standard mandates radical readability, clear intent, small cohesive units, and the elimination of cognitive friction for all human engineers and AI agents.

### 2.2 Rules
1. **Intention-Revealing Naming**: Names of variables, functions, classes, and types MUST express intent without requiring comments to explain their purpose.
2. **Single Level of Abstraction (SLA)**: Functions and methods MUST operate at a single consistent level of abstraction from entry to exit.
3. **Function Size and Arity**: Functions MUST be small (ideally under 30 lines) and maintain minimal arity (maximum 3 parameters; use parameter objects for larger sets).
4. **Zero Dead Code**: Unused code, commented-out code blocks, and obsolete tests MUST NOT exist in the repository; version control retains history.
5. **No Side Effects in Query Functions**: Functions that query data MUST NOT mutate state (Command-Query Separation).

### 2.3 Best Practices
- Keep cyclomatic complexity below 10 for any given function or method.
- Prefer early returns (guard clauses) over deeply nested conditional blocks.
- Replace magic numbers and arbitrary string literals with named domain constants or frozen configuration objects.
- Write self-documenting code where the function signature and variable names clearly convey the business rule.

### 2.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A validation routine uses guard clauses: verifying participant age threshold, checking slot availability, and returning a typed validation failure immediately upon constraint breach, rather than embedding triple-nested `if` conditions.
- *Conceptual Negative Pattern*: A 250-line monolithic function named `process()` that extracts HTTP query parameters, parses dates, queries PostgreSQL directly, updates user loyalty points, generates a PDF, and sends an email.

### 2.5 Common Mistakes
- Leaving orphaned commented-out code blocks with developer initials or dates.
- Naming variables with cryptic abbreviations (e.g., `chkUsrFlg` instead of `isUserVerifiedForBooking`).
- Mixing low-level string manipulation with high-level business orchestration inside the same service method.

### 2.6 Review Checklist
- [ ] Is the business intent immediately obvious without reading external comments?
- [ ] Are functions small, focused, and operating at a single level of abstraction?
- [ ] Have all magic numbers and arbitrary strings been extracted into typed constants?
- [ ] Are nested conditionals eliminated in favor of early return guard clauses?

### 2.7 Quality Checklist
- [ ] Static analysis tools enforce maximum cyclomatic complexity $< 10$.
- [ ] Dead code detection (`ts-prune` / ESLint `no-unused-vars`) reports zero warnings.
- [ ] Automated formatters (Prettier) enforce consistent layout and indentation across all files.

### 2.8 Security Considerations
- Clear code structures make security flaws, logic vulnerabilities, and unauthorized bypasses readily visible during peer reviews.
- Obfuscated or overly clever code frequently masks severe authorization and boundary check bugs.

### 2.9 Performance Considerations
- Small, focused functions enable JavaScript engines (V8) to optimize execution paths and inline hotspots effectively.
- Eliminating dead code directly minimizes browser JavaScript bundle sizes and server memory footprint.

### 2.10 Future Scalability
- Clean code drastically reduces onboarding time for new contributors and enables autonomous AI agents to execute refactoring tasks safely and predictably.

---

# SECTION 3: SOLID PRINCIPLES

### 3.1 Purpose
The SOLID Principles standard governs object-oriented and modular structural design across the Explore Bharat Safar backend services, domain models, and application architecture. It ensures that software components remain decoupled, extensible, testable, and resilient to ongoing feature expansion.

### 3.2 Rules
1. **Single Responsibility Principle (SRP)**: Every module, class, or service MUST have one, and only one, reason to change, encapsulating a single cohesive business capability.
2. **Open/Closed Principle (OCP)**: Software entities MUST be open for extension but closed for modification. New platform behaviors (e.g., a new payment gateway) MUST be added via polymorphic strategies or composition rather than editing existing core classes.
3. **Liskov Substitution Principle (LSP)**: Subtypes and interface implementations MUST be fully substitutable for their base types without altering system correctness or violating preconditions.
4. **Interface Segregation Principle (ISP)**: Clients MUST NOT be forced to depend on interfaces they do not use. Large monolithic interfaces MUST be split into small, client-specific role interfaces.
5. **Dependency Inversion Principle (DIP)**: High-level business policy modules MUST NOT depend on low-level infrastructure modules. Both MUST depend on abstractions (interfaces).

### 3.3 Best Practices
- Define payment, notification, and storage providers behind abstract domain port interfaces (Hexagonal / Clean Architecture).
- Use constructor injection exclusively for class dependencies, avoiding hidden service locators or global singletons.
- Keep domain interfaces narrow, often containing 1 to 4 cohesive method contracts.
- Ensure that extending functionality never requires modifying unit test suites of previously existing features.

### 3.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An abstract `PaymentGatewayPort` interface defines `initiateTransaction()` and `verifyWebhook()`. Concrete implementations for `RazorpayAdapter` and `CashfreeAdapter` implement this interface. The core `BookingService` depends solely on `PaymentGatewayPort`, allowing gateways to be swapped or added without modifying `BookingService`.
- *Conceptual Negative Pattern*: A `BookingService` containing an internal `switch(gatewayType)` statement that hardcodes SDK calls for Razorpay, Cashfree, and UPI directly inside the core reservation checkout method.

### 3.5 Common Mistakes
- Creating "God classes" (e.g., `ExperienceManager`) that manage CRUD, bookings, media uploads, reviews, and search indexing all in one class.
- Forcing a lightweight read-only client to implement an interface containing mutation, batch deletion, and export methods.
- Throwing `NotImplementedException` in a subclass method, directly violating the Liskov Substitution Principle.

### 3.6 Review Checklist
- [ ] Does every class and module have a single, well-defined operational responsibility?
- [ ] Can new integrations or features be added via polymorphic extension without altering existing code?
- [ ] Are domain services strictly decoupled from third-party vendor SDKs via interface abstractions?
- [ ] Are interfaces cohesive, lean, and tailored to specific client needs?

### 3.7 Quality Checklist
- [ ] Dependency inversion is strictly enforced via NestJS dependency injection tokens.
- [ ] Unit tests test domain services against mocked interface contracts, requiring zero live network connections.
- [ ] Architecture linters verify that high-level domain packages have zero imports from infrastructure packages.

### 3.8 Security Considerations
- Interface segregation ensures that components with limited privileges are not exposed to high-privilege operations (e.g., ledger reconciliation or refund execution).
- Loose coupling prevents security vulnerabilities in vendor SDKs from propagating directly into core domain entities.

### 3.9 Performance Considerations
- Decoupled interfaces allow performance-critical components (e.g., vector tile queries) to swap underlying data access adapters (e.g., memory-mapped caching) transparently.
- Dependency injection overhead in NestJS is resolved at application bootstrap, incurring zero runtime performance penalty per request.

### 3.10 Future Scalability
- Adherence to SOLID principles enables the Explore Bharat Safar modular monolith to seamlessly extract distinct bounded contexts into autonomous microservices when scaling demands require it.

---

# SECTION 4: DRY PRINCIPLE (DON'T REPEAT YOURSELF)

### 4.1 Purpose
The DRY Principle standard ensures that every distinct piece of knowledge, business logic, and domain truth within the Explore Bharat Safar platform has a single, unambiguous, authoritative representation. It eliminates divergent logic, inconsistent validation rules, and synchronization defects across the full stack.

### 4.2 Rules
1. **Single Source of Truth for Domain Knowledge**: Core business rules (e.g., cancellation refund percentages, cadastral hierarchy rules) MUST exist in exactly one authoritative location.
2. **Schema-Driven Type Sharing**: TypeScript types MUST be derived directly from shared Zod schemas (`packages/validators`) or Prisma models (`packages/database`), never duplicated manually between frontend and backend.
3. **Accidental vs. Essential Duplication**: Two blocks of code that look identical but evolve for different business reasons MUST NOT be prematurely unified. DRY applies to domain knowledge, not superficial syntax similarity.
4. **Shared Calculation Utilities**: Mathematical computations (e.g., Harvesine distance, geospatial bounding boxes, dynamic advance fees) MUST reside in centralized domain packages (`packages/gis-core`, `packages/types`).

### 4.3 Best Practices
- Export Zod schemas from `packages/validators` and infer TypeScript types via `z.infer<typeof Schema>` for shared API requests and responses.
- Centralize UI design tokens (colors, typography, spacing) inside Tailwind configuration and Radix themes rather than hardcoding CSS hex values.
- Centralize error codes and message templates in domain enum registries.

### 4.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: The validation schema for a village cadastral record is defined once in `packages/validators/src/village.validator.ts`. The Next.js client form uses this schema for client-side validation, and the NestJS controller uses the same schema via a validation pipe for server-side enforcement.
- *Conceptual Negative Pattern*: The frontend defines an interface `VillageFormInput` with custom regex checks, while the backend defines a separate class `CreateVillageDto` with slightly different regex rules, leading to form submissions that pass on the client but fail on the server.

### 4.5 Common Mistakes
- Manually recreating DTO interfaces in `apps/web` that mirror NestJS DTOs in `apps/api` instead of importing from `packages/types`.
- Prematurely abstracting two completely unrelated UI components into a single complex component with twenty conditional props just because they share a border and padding.
- Hardcoding tax rates or cancellation fee percentages in multiple service files.

### 4.6 Review Checklist
- [ ] Are data contracts and validation rules imported from shared monorepo packages?
- [ ] Are domain calculations implemented in a single canonical service?
- [ ] Has superficial code duplication been distinguished from true domain logic duplication?
- [ ] Are design tokens and constant values referenced from central registries?

### 4.7 Quality Checklist
- [ ] Type inference checks ensure zero duplicate type declarations across `apps/web` and `apps/api`.
- [ ] Automated duplication scanners (e.g., SonarQube / jscpd) verify that duplicated code blocks do not exceed 3% across the monorepo.

### 4.8 Security Considerations
- Duplicating validation logic creates security holes where an attacker can bypass client-side checks with inputs that an inconsistent backend validator inadvertently accepts.
- A single authoritative validation schema ensures universal sanitization and strict rejection of malicious payloads.

### 4.9 Performance Considerations
- Shared packages reduce compilation overhead and leverage Turborepo caching to eliminate redundant build steps across the workspace.
- Deduplicated utility libraries minimize the client-side JavaScript bundle footprint.

### 4.10 Future Scalability
- When business regulations change (e.g., new DPDP Act compliance rules or GST tax brackets), updating the single authoritative source of truth immediately updates the entire platform synchronously.

---

# SECTION 5: KISS PRINCIPLE (KEEP IT SIMPLE, STUPID)

### 5.1 Purpose
The KISS Principle standard mandates that simplicity MUST be chosen over complexity in all architectural, design, and implementation activities. In an enterprise system of Explore Bharat Safar's magnitude, unnecessary complexity is the primary catalyst for bugs, security vulnerabilities, performance regressions, and maintainability failure.

### 5.2 Rules
1. **Simplicity Over Cleverness**: Code MUST be written so that any competent software engineer can comprehend its logic without mental gymnastics. Clever hacks, esoteric language features, and cryptic one-liners are strictly forbidden.
2. **Flat Hierarchies**: Component hierarchies, class inheritance trees, and directory structures MUST remain as flat as practically possible. Avoid inheritance beyond two levels; prefer composition.
3. **Minimal Abstraction Depth**: Do NOT introduce design patterns (e.g., Abstract Factory, Visitor, Bridge) unless the concrete domain problem explicitly demands that flexibility.
4. **Standard Data Structures**: Use standard native data structures (Arrays, Maps, Sets, plain objects) rather than building bespoke container abstractions.

### 5.3 Best Practices
- Write linear, readable code paths that flow naturally from top to bottom.
- Prefer explicit iteration loops or standard array methods (`map`, `filter`, `reduce`) over complex recursive routines unless working with inherently recursive trees (e.g., administrative district hierarchies).
- Question every new dependency, layer, or wrapper class added to the project.

### 5.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Fetching experience details using a straightforward database query through Prisma, mapping to a DTO with a plain object transformation function, and returning it directly to the caller.
- *Conceptual Negative Pattern*: Introducing an abstract generic query builder pipeline with four intermediate adapter layers, a dynamic reflection-based property mapper, and a custom event emitter just to fetch a single record by its primary key.

### 5.5 Common Mistakes
- Designing for hypothetical future scenarios that may never occur, resulting in convoluted wrapper classes.
- Utilizing overly complex regular expressions for simple string matching tasks.
- Over-engineering state management by introducing global event brokers for state that belongs locally within a single component.

### 5.6 Review Checklist
- [ ] Is this the simplest architectural solution that correctly satisfies the business requirement?
- [ ] Can a junior or mid-level engineer understand this code without extensive explanation?
- [ ] Has accidental complexity been eliminated from data pipelines and component hierarchies?
- [ ] Are abstractions justified by concrete, present requirements?

### 5.7 Quality Checklist
- [ ] Code reviews explicitly evaluate simplicity and readability.
- [ ] Complexity metrics flag any module with excessive nesting or indirection.

### 5.8 Security Considerations
- Simple code has a significantly smaller attack surface. Complex, convoluted control flows frequently hide critical authentication, authorization, and data validation flaws.
- Simpler validation schemas are easier to mathematically verify and audit against penetration testing vectors.

### 5.9 Performance Considerations
- Simple, un-abstracted execution paths execute faster in modern runtimes, with minimal memory allocation overhead and optimal CPU cache locality.
- Modern JavaScript engines optimize straightforward, predictable code paths far more aggressively than polymorphic, deeply nested abstractions.

### 5.10 Future Scalability
- Simple architectures scale effortlessly because they are easy to debug, benchmark, profile, partition, and refactor when real traffic bottlenecks emerge.

---

# SECTION 6: YAGNI PRINCIPLE (YOU AREN'T GONNA NEED IT)

### 6.1 Purpose
The YAGNI Principle standard mandates that engineering teams MUST NOT build features, abstractions, configurations, or infrastructure based on speculative future requirements. Implementation MUST be strictly bounded by approved product specifications (`01-idea.md` through `51-technology-stack-decisions.md`).

### 6.2 Rules
1. **Speculative Coding Prohibited**: Do NOT write code, database columns, API parameters, or config toggles for features that are not defined in the current sprint or approved specification.
2. **No Premature Optimization**: Do NOT implement complex caching layers, sharding schemes, or microservice splits before profiling confirms that simpler architectures cannot meet SLA targets.
3. **No Unused Configuration Toggles**: Every configuration variable and feature flag MUST correspond to an active operational requirement. Dead or speculative flags are prohibited.
4. **Refactor When Needed, Not Before**: Add extensibility hooks only when a second or third concrete use case actually arrives, not in anticipation of hypothetical future requirements.

### 6.3 Best Practices
- Focus on delivering high-quality, fully tested solutions for current user stories.
- Delete speculative code immediately upon discovery during pull request reviews.
- Rely on automated refactoring tools and strong TypeScript typing to adapt code when new requirements genuinely emerge.

### 6.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Implementing a booking cancellation policy that supports the currently defined refund tiers (full refund $> 7$ days, 50% refund $> 48$ hours, 0% refund $< 48$ hours) using clear business rules.
- *Conceptual Negative Pattern*: Building a generic, dynamic mathematical rules engine that parses user-defined expression trees from the database to support hypothetical arbitrary cancellation formulas that have never been requested.

### 6.5 Common Mistakes
- Adding unused generic type parameters to classes and functions "just in case" they are needed later.
- Creating unused database columns with speculative names like `custom_metadata_2` or `future_flag`.
- Implementing complex multi-tenant routing logic for subsystems that are strictly single-tenant.

### 6.6 Review Checklist
- [ ] Does every line of code correspond directly to an approved specification or acceptance criterion?
- [ ] Are there any speculative parameters, options, or unused abstractions in this change?
- [ ] Has premature optimization been avoided in favor of clean, idiomatic solutions?
- [ ] Are all database fields actively utilized by current business workflows?

### 6.7 Quality Checklist
- [ ] Acceptance criteria in sprint tickets trace directly to code implementations without feature creep.
- [ ] Schema audits verify that all database tables and columns have active application consumers.

### 6.8 Security Considerations
- Unused, speculative code paths are rarely tested thoroughly, creating hidden vulnerabilities and unmonitored attack vectors in production.
- Eliminating speculative features minimizes the total attack surface of the application.

### 6.9 Performance Considerations
- Avoiding speculative features prevents codebase bloat, reduces memory consumption, and keeps cold-start initialization times minimal.
- Omitting speculative database columns keeps table row sizes compact, maximizing database buffer cache efficiency.

### 6.10 Future Scalability
- A codebase free from speculative clutter is agile and malleable, allowing teams to pivot and scale rapidly when real-world production demands emerge.

---

# SECTION 7: CLEAN ARCHITECTURE RULES

### 7.1 Purpose
Clean Architecture Rules establish a rigorous boundary model where domain business rules sit at the center of the system, completely independent of frameworks, databases, UI layers, and external tools. This guarantees that core business logic remains testable, durable, and immune to framework obsolescence over a multi-decade lifecycle.

### 7.2 Rules
1. **The Dependency Rule**: Source code dependencies MUST point strictly inwards. Inner circles (Domain Entities and Use Cases) MUST know nothing about outer circles (Controllers, Gateways, Databases, Frameworks).
2. **Framework Independence**: Core business logic MUST NOT import or inherit from framework classes (e.g., NestJS decorators, Next.js server components, Express types).
3. **Database Independence**: Domain entities MUST be plain TypeScript objects or classes with zero ORM annotations (e.g., no TypeORM or Prisma decorators in domain entities).
4. **Interface Inversion via Ports and Adapters**: Outer layers interact with inner layers through defined input ports; inner layers invoke outer infrastructure services through defined output ports (interfaces).
5. **Isolated Data Transfer Objects (DTOs)**: Data crossing architectural boundaries MUST be formatted as plain DTOs or immutable value objects, never raw database entity instances or HTTP request objects.

### 7.3 Best Practices
- Organize domain logic into `Entity`, `ValueObject`, `UseCase` (or `Command/Query Handler`), and `RepositoryPort` interfaces.
- Implement database access in adapter classes that implement domain repository ports and translate between database records and domain entities.
- Ensure that use cases can be executed and unit-tested in complete isolation from the network, HTTP server, and physical database.

### 7.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An inner domain entity `ExperienceBooking` enforces invariant rules (e.g., capacity limits and status transitions). An application use case `ReserveExperienceSlotUseCase` coordinates the reservation using a `BookingRepositoryPort` interface. The outer infrastructure layer provides `PrismaBookingRepository` implementing that port.
- *Conceptual Negative Pattern*: A NestJS controller that imports the Prisma client directly, queries the database inside the route handler, modifies database columns directly, and calls the Stripe SDK without any intermediate use case or domain layer.

### 7.5 Common Mistakes
- Importing UI or HTTP types (e.g., `Request`, `Response`, Next.js types) into domain use cases or entities.
- Allowing database schema changes to directly force breaking changes in core business logic.
- Bypassing the domain layer to write "quick" database updates directly in HTTP controllers.

### 7.6 Review Checklist
- [ ] Do all dependencies point strictly inwards toward the domain core?
- [ ] Is the domain layer completely free of framework, ORM, and UI library imports?
- [ ] Are external infrastructure services accessed solely through domain port interfaces?
- [ ] Can all business use cases be tested without spinning up an HTTP server or database?

### 7.7 Quality Checklist
- [ ] Architecture linters (`dependency-cruiser`) run in CI to fail the build if inner layers import outer layers.
- [ ] Domain unit test coverage exceeds 95% with zero test doubles for frameworks.

### 7.8 Security Considerations
- Isolating business invariants in the domain layer ensures that security rules (e.g., maximum booking capacities, age restrictions) cannot be bypassed by alternative entry points (e.g., web, CLI, background workers).
- Strict DTO boundaries prevent Mass Assignment and Object Injection vulnerabilities.

### 7.9 Performance Considerations
- Clean architecture enables targeted caching at the adapter boundary (e.g., Redis repository cache) without dirtying business use cases.
- In-memory domain entities execute business rules with minimal memory and GC overhead.

### 7.10 Future Scalability
- Clean architecture allows database engines (e.g., transitioning from PostgreSQL to a distributed SQL engine) or web frameworks to be upgraded or replaced with zero impact on core domain business rules.

---

# SECTION 8: DOMAIN DRIVEN DESIGN (DDD) GUIDELINES

### 8.1 Purpose
Domain-Driven Design (DDD) Guidelines ensure that the Explore Bharat Safar software model precisely mirrors the real-world problem domain of Bharat's travel, cultural heritage, village knowledge, and adventure booking ecosystems. It establishes a shared Ubiquitous Language and prevents cross-domain model contamination.

### 8.2 Rules
1. **Ubiquitous Language Mandate**: Every term used in code, classes, methods, database tables, and API contracts MUST match the official vocabulary established in the platform specifications (e.g., `CadastralCode`, `Taluka`, `GramPanchayat`, `ExperienceBatch`, `SlotLock`).
2. **Strict Bounded Contexts**: The platform MUST be segmented into sovereign Bounded Contexts (Discovery Context, Village Knowledge Context, Booking Context, Social Context, Identity Context). Entities MUST NOT be shared directly across bounded contexts.
3. **Aggregate Roots as Consistency Boundaries**: Modifications to any entity within an aggregate MUST occur exclusively through its Aggregate Root. External objects may only hold references to the Aggregate Root's identifier.
4. **Value Objects for Immutable Concepts**: Domain concepts without conceptual identity (e.g., `GeoCoordinates`, `CurrencyAmount`, `DateRange`, `Address`) MUST be modeled as immutable Value Objects that validate their own invariants upon instantiation.
5. **Anti-Corruption Layers (ACL)**: When communicating across bounded contexts or integrating with third-party systems, an Anti-Corruption Layer MUST translate external models into local domain language.

### 8.3 Best Practices
- Keep aggregates small and focused on enforcing transactional consistency invariants.
- Publish Domain Events (e.g., `BookingConfirmedDomainEvent`, `VillageRecordApprovedDomainEvent`) to notify other bounded contexts of state changes asynchronously.
- Enforce invariant validation in the constructor of Value Objects and Aggregate Roots.

### 8.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A `GeoPoint` value object enforces that latitude is between $-90$ and $+90$ and longitude is between $-180$ and $+180$ at creation. An `ExperienceBatch` aggregate root manages a collection of `Slot` entities and enforces that total booked slots never exceed `maxCapacity`.
- *Conceptual Negative Pattern*: A raw database row where `latitude` and `longitude` are floating-point numbers modified arbitrarily in fifteen different files, with no centralized validation of geographical boundaries.

### 8.5 Common Mistakes
- Creating massive "mega-aggregates" that group an entire geographic state with all its districts, talukas, and villages into a single transactional object.
- Sharing a single `User` entity across the entire system instead of modeling distinct domain concepts: `Explorer` in the social context, `Participant` in the booking context, and `Citizen` in the village context.
- Mutating child entities directly from external services without passing through the aggregate root.

### 8.6 Review Checklist
- [ ] Does the terminology in code match the domain's official Ubiquitous Language?
- [ ] Are aggregate boundaries small and focused strictly on transactional invariants?
- [ ] Are value objects immutable and self-validating?
- [ ] Are cross-context interactions mediated via domain events and anti-corruption layers?

### 8.7 Quality Checklist
- [ ] Domain model glossary is maintained and audited against codebase naming.
- [ ] Invariant unit tests verify that aggregates reject invalid state transitions.

### 8.8 Security Considerations
- Self-validating value objects prevent invalid, malformed, or hostile data (e.g., out-of-range coordinates or negative payment values) from entering the domain model.
- Bounded contexts enforce strict privilege segregation, ensuring that a compromise in the social context cannot tamper with the financial booking context.

### 8.9 Performance Considerations
- Small aggregate roots eliminate database lock contention, ensuring high transaction throughput even under heavy concurrent booking loads.
- Eventual consistency via domain events allows disparate bounded contexts to scale their compute and storage independently.

### 8.10 Future Scalability
- Bounded contexts with clean boundaries can be extracted directly into autonomous microservices or distributed event streams as organizational and traffic demands scale.

---

# SECTION 9: SEPARATION OF CONCERNS (SoC)

### 9.1 Purpose
Separation of Concerns ensures that every distinct technical and architectural concern within Explore Bharat Safar is isolated into independent layers and modules. This prevents UI rendering code from leaking into business calculations, and database access logic from entangling HTTP controllers.

### 9.2 Rules
1. **Four-Tier Architectural Segregation**: Code MUST be organized into four non-overlapping tiers:
   - *Presentation Tier*: User interface, HTML rendering, client state, and HTTP serialization.
   - *Application Tier*: Use case orchestration, command handling, and transaction boundaries.
   - *Domain Tier*: Enterprise business rules, aggregate invariants, and core algorithms.
   - *Infrastructure Tier*: Database persistence, caching, third-party network clients, and message queues.
2. **Zero Cross-Tier Leakage**: Presentation components (e.g., React components) MUST NEVER execute database queries, direct SQL, or low-level cryptographic hashing.
3. **Cross-Cutting Concerns Isolation**: Logging, authentication, authorization, caching, and distributed tracing MUST be handled via middleware, interceptors, or decorators, never hardcoded into business workflows.

### 9.3 Best Practices
- Keep React components purely focused on transforming props into accessible UI elements.
- Encapsulate server actions and API route handlers so they only parse inputs, invoke application use cases, and format HTTP responses.
- Implement security guards as declarative NestJS interceptors or Next.js route middleware.

### 9.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An HTTP controller parses incoming JSON via a Zod pipe, invokes `CreateReviewCommand`, catches domain results, and maps them to standard HTTP status codes. Logging and latency metrics are automatically captured by an overarching telemetry interceptor.
- *Conceptual Negative Pattern*: A React Server Component that directly opens a database connection pool, validates user session cookies with raw SQL queries, executes an update transaction, and outputs an HTML table in a single file.

### 9.5 Common Mistakes
- Writing validation rules inside React UI render functions.
- Scattering audit logging and security checks manually across fifty individual service methods instead of utilizing cross-cutting interceptors.
- Mixing formatting logic (e.g., currency formatting, date localization) into backend database queries.

### 9.6 Review Checklist
- [ ] Are presentation, application, domain, and infrastructure responsibilities clearly separated?
- [ ] Are cross-cutting concerns (logging, auth, metrics) implemented via middleware/interceptors?
- [ ] Are UI components free of direct database access and low-level business rules?
- [ ] Is data formatting cleanly separated from domain business logic?

### 9.7 Quality Checklist
- [ ] Architectural boundary linters verify that presentation packages have zero database dependencies.
- [ ] Unit tests for business logic run without presentation or infrastructure dependencies.

### 9.8 Security Considerations
- Centralizing authentication and authorization in cross-cutting middleware guarantees that security policies are applied consistently without depending on developer memory.
- Isolating input sanitization at the presentation boundary prevents malicious payloads from penetrating deeper system layers.

### 9.9 Performance Considerations
- Separating concerns enables independent performance optimization: database queries can be tuned with indexes, while UI components can be optimized with fine-grained memoization.
- Clean layer separation allows caching tiers (HTTP cache, Redis cache, database query cache) to be applied at the optimal architectural level.

### 9.10 Future Scalability
- Distinct concerns can be independently scaled, rewritten, or relocated. For instance, presentation can expand from Web to Native Mobile while reusing 100% of existing application and domain services.

---

# SECTION 10: FEATURE-BASED ARCHITECTURE RULES

### 10.1 Purpose
Feature-Based Architecture Rules govern code organization by vertical business capabilities rather than horizontal technical layers. This guarantees high cohesion within features, low coupling between features, and enables autonomous squad development across Explore Bharat Safar's expansive scope.

### 10.2 Rules
1. **Vertical Slice Organization**: Code MUST be organized primarily by business feature (e.g., `features/destinations`, `features/villages`, `features/bookings`, `features/stories`) rather than horizontal technical buckets (e.g., all components in one folder, all services in another).
2. **Feature Co-location**: All assets required for a feature—including UI components, hooks, state slices, API clients, validation schemas, and unit tests—MUST be co-located within that feature's directory.
3. **Public Feature API via Barrel Exports**: Each feature directory MUST expose an authoritative `index.ts` file serving as its public API contract. External features MUST only import from this barrel file, never deep-linking into internal feature files.
4. **Zero Cross-Feature Internal Access**: Feature $A$ MUST NOT import internal implementation details of Feature $B$. Shared utilities MUST be promoted to common packages (`packages/ui`, `packages/types`).

### 10.3 Best Practices
- Structure features with a standard internal topology: `components/`, `hooks/`, `services/`, `types/`, `validators/`, `tests/`, and `index.ts`.
- Keep feature boundaries aligned with DDD Bounded Contexts.
- When two features need to communicate, use domain events or explicit shared contract packages.

### 10.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: In `apps/web/src/features/village-registry/`, the folder contains `components/VillageCard.tsx`, `hooks/useVillageData.ts`, `services/village-client.ts`, `tests/VillageCard.test.tsx`, and an `index.ts` exporting only `VillageCard` and `useVillageData`.
- *Conceptual Negative Pattern*: A global `src/components/` folder containing 500 flat component files, where `VillageCard.tsx` directly imports an internal helper file located five directories deep inside `src/features/bookings/internal/helpers/slot-math.ts`.

### 10.5 Common Mistakes
- Creating circular dependencies between features by having Feature $A$ import Feature $B$, and Feature $B$ import Feature $A$.
- Retaining deep, cross-feature relative imports (`../../features/booking/components/Button.tsx`).
- Leaving features bloated with generic utilities that rightfully belong in `packages/ui` or `packages/types`.

### 10.6 Review Checklist
- [ ] Is code organized into cohesive vertical feature directories?
- [ ] Are tests, components, and hooks co-located with their parent feature?
- [ ] Do external consumers interact strictly through the feature's public `index.ts`?
- [ ] Are there zero deep relative imports into another feature's internal directories?

### 10.7 Quality Checklist
- [ ] ESLint `import/no-restricted-paths` enforces strict boundaries between feature folders.
- [ ] Circular dependency checks (`madge` / `eslint-plugin-import`) pass with zero cycles.

### 10.8 Security Considerations
- Feature isolation ensures that security vulnerabilities or data leaks within an experimental feature cannot compromise critical financial or identity features.
- Public feature contracts make access permissions and data exposure explicit and easily auditable.

### 10.9 Performance Considerations
- Feature-based architecture maps directly to Next.js dynamic imports and code splitting, ensuring users only download the JavaScript required for the specific feature they are viewing.
- Turborepo caches builds on a feature-package level, drastically speeding up CI execution times.

### 10.10 Future Scalability
- Highly cohesive, loosely coupled vertical slices can be extracted into separate monorepo packages or independent micro-frontends with minimal friction as engineering squads expand.

---

# SECTION 11: COMPONENT DESIGN STANDARDS

### 11.1 Purpose
Component Design Standards govern the architecture, composition, and lifecycle of user interface components in Explore Bharat Safar. They ensure that UI elements remain modular, accessible, predictable, easily testable, and strictly decoupled from business logic.

### 11.2 Rules
1. **Container / Presentational Segregation**: UI components MUST be divided into Presentational ("Dumb") components and Container ("Smart") components. Presentational components handle visual rendering and receive all data/callbacks via props; Containers handle data fetching and state orchestration.
2. **Prop Immutability**: Component props MUST be treated as strictly read-only immutable contracts. Mutating props directly is strictly forbidden.
3. **Single Responsibility per Component**: A component MUST render a single cohesive piece of the interface. If a component exceeds 150 lines of code, it MUST be decomposed into smaller sub-components.
4. **Explicit Prop Interface**: Every component MUST define an explicit, typed TypeScript interface for its props. Generic `any` or untyped spread objects are prohibited.
5. **Radix Primitive Foundation**: Interactive UI primitives (modals, dropdowns, accordions, tooltips) MUST be built on top of accessible Radix UI primitives to ensure complete keyboard navigation and ARIA compliance.

### 11.3 Best Practices
- Favor composition (`children` and slot props) over complex boolean configuration flags.
- Co-locate component-specific sub-components within the parent component's directory.
- Implement loading and error fallback states for every container component using Suspense and Error Boundaries.

### 11.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A `DestinationCard` presentational component accepts `title`, `imageUrl`, `rating`, and `onSelect` callback via a strongly typed `DestinationCardProps` interface. It contains zero `fetch` calls and renders accessible markup with semantic HTML.
- *Conceptual Negative Pattern*: A `DestinationCard` that internally fetches data from an API, manages URL query parameters, parses JSON, and directly alters the global DOM window object.

### 11.5 Common Mistakes
- Passing deeply nested object props when only two scalar fields are needed, leading to unnecessary re-renders.
- "Prop drilling" data through eight layers of components instead of leveraging composition or context.
- Hardcoding layout styles (e.g., fixed margins, absolute positioning) inside reusable design system components.

### 11.6 Review Checklist
- [ ] Is the component cleanly separated into presentational or container responsibilities?
- [ ] Is the component under 150 lines and focused on a single UI responsibility?
- [ ] Does the component define a strict, typed TypeScript interface for its props?
- [ ] Are interactive states accessible via keyboard and screen readers?

### 11.7 Quality Checklist
- [ ] Storybook or Component Playground documentation exists for all shared presentational components.
- [ ] Unit tests render the component with varied props and assert semantic DOM outputs using `@testing-library/react`.

### 11.8 Security Considerations
- All user-generated content rendered within components MUST be properly sanitized to prevent Cross-Site Scripting (XSS).
- Never render raw HTML strings (`dangerouslySetInnerHTML`) without passing through an approved sanitization library (DOMPurify).

### 11.9 Performance Considerations
- Presentational components should be lightweight and pure, allowing React to optimize rendering and prevent unnecessary DOM diffing.
- Avoid defining functions or object literals inline inside JSX props within loops to minimize garbage collection churn.

### 11.10 Future Scalability
- Modular, headless presentational components can be restyled or adapted across diverse platforms (e.g., Web, React Native, PWA) without altering underlying business orchestration.

---

# SECTION 12: NEXT.JS STANDARDS

### 12.1 Purpose
Next.js Standards define mandatory patterns for utilizing the Next.js 14+ App Router, React Server Components (RSC), Server Actions, and rendering paradigms across Explore Bharat Safar. They ensure optimal Core Web Vitals, maximum SEO visibility, and secure server-client execution boundaries.

### 12.2 Rules
1. **Server Components by Default**: All components inside `apps/web/app/` MUST be React Server Components (RSC) by default. The `'use client'` directive MUST only be used when client-side interactivity (state, effects, browser APIs, event listeners) is strictly required.
2. **Client Leaf Pattern**: Client components MUST be pushed to the furthest leaves of the component tree. Wrap client islands inside server components rather than converting whole pages into client components.
3. **Route Handlers and Server Actions**: Mutations MUST use Server Actions with comprehensive Zod input validation, or dedicated Route Handlers (`route.ts`) returning standardized RFC 7807 problem details.
4. **Data Fetching and Caching**: Fetch data directly in Server Components using native `fetch` with explicit cache tags (`next: { tags: [...] }`) and revalidation strategies (ISR). Direct database queries in RSC MUST be executed through repository abstractions.
5. **Streaming and Suspense**: Every dynamic page MUST implement a `loading.tsx` skeleton and wrap async components in React `Suspense` boundaries to guarantee rapid First Contentful Paint (FCP).

### 12.3 Best Practices
- Organize routes using Route Groups (e.g., `(marketing)`, `(auth)`, `(dashboard)`) to structure layouts without altering URL pathnames.
- Co-locate route-specific error handling via `error.tsx` and 404 handling via `not-found.tsx`.
- Use `generateMetadata` for dynamic, localized Open Graph and Twitter card SEO generation.

### 12.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A page `app/(discovery)/destinations/[slug]/page.tsx` is an async Server Component that fetches destination data, renders static content on the server, and nests an interactive client component `<SaveToFavoritesButton destinationId={id} />` marked with `'use client'`.
- *Conceptual Negative Pattern*: Marking the top-level `layout.tsx` or `page.tsx` with `'use client'`, causing the entire application tree, database client, and heavy dependencies to be shipped to the user's browser.

### 12.5 Common Mistakes
- Importing server-only packages (e.g., database clients, secret keys) into Client Components, triggering build failures or leaking secrets.
- Overusing `'use client'` at the page level simply to use a single `useState` hook.
- Neglecting to provide `loading.tsx`, causing blank white screens during server-side data resolution.

### 12.6 Review Checklist
- [ ] Are pages and layouts Server Components by default?
- [ ] Is `'use client'` strictly limited to interactive leaf components?
- [ ] Are async data fetches wrapped in Suspense boundaries with appropriate loading skeletons?
- [ ] Are mutations validated via Zod schemas inside Server Actions or Route Handlers?

### 12.7 Quality Checklist
- [ ] Next.js build (`next build`) runs with zero lint errors and zero type warnings.
- [ ] Core Web Vitals pass all thresholds: LCP $< 2.5s$, FID/INP $< 200ms$, CLS $< 0.1$.

### 12.8 Security Considerations
- Never expose environment variables containing private secrets to the client. Only variables prefixed with `NEXT_PUBLIC_` are allowed in client bundles.
- Server Actions MUST authenticate and authorize the requesting user session before executing any domain mutation; do not assume Server Actions are private internal functions.

### 12.9 Performance Considerations
- Server Components generate zero client-side JavaScript, dramatically reducing bundle sizes and eliminating client CPU hydration bottlenecks.
- Granular ISR cache tagging allows instant cache invalidation via `revalidateTag()` when content updates occur, maintaining static speed with dynamic freshness.

### 12.10 Future Scalability
- Strict adherence to Next.js App Router standards ensures seamless compatibility with future React compiler optimizations, partial prerendering (PPR), and edge runtime deployments.

---

# SECTION 13: REACT STANDARDS

### 13.1 Purpose
React Standards establish clean, robust, and idiomatic development patterns for all client-side React code within Explore Bharat Safar. They eliminate common memory leaks, rendering cascades, race conditions, and improper state synchronization across the platform.

### 13.2 Rules
1. **Functional Components Exclusively**: All React components MUST be written as pure functional components. Class components are strictly prohibited.
2. **Pure Render Functions**: Component render functions MUST be pure. They MUST NOT mutate external variables, trigger side effects, or initiate network requests during the render phase.
3. **Strict Hook Dependency Arrays**: All `useEffect`, `useCallback`, and `useMemo` hooks MUST explicitly declare all referenced variables in their dependency arrays. Disabling ESLint `react-hooks/exhaustive-deps` is strictly forbidden.
4. **Custom Hooks for Stateful Logic**: Stateful logic shared across components MUST be extracted into custom hooks prefixed with `use` (e.g., `useSlotAvailability`, `useGeoLocation`).
5. **Keys in Iterations**: Elements generated from array iterations MUST have a unique, stable `key` prop derived from the entity's unique identifier (e.g., `destination.id`). Using array index as a key is strictly prohibited for dynamic lists.

### 13.3 Best Practices
- Keep state local to the component that requires it; lift state up only when siblings genuinely require synchronization.
- Use functional state updates (`setCount(prev => prev + 1)`) when new state depends on previous state to prevent stale closures.
- Favor controlled components for form inputs, validated through React Hook Form and Zod resolvers.

### 13.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A custom hook `useVillageSearch(query)` encapsulates debounce logic, triggers an abort controller upon query changes to cancel inflight requests, and returns `{ data, isLoading, error }` state.
- *Conceptual Negative Pattern*: A component with a `useEffect` that triggers a data fetch, updates state, and omits the query variable from its dependency array with an `// eslint-disable-next-line` comment, causing stale search results and memory leaks.

### 13.5 Common Mistakes
- Executing side effects (like updating local storage or writing to the DOM) directly inside the component body instead of inside `useEffect`.
- Mutating state objects directly (e.g., `user.profile.name = 'New'`) instead of producing new immutable references.
- Creating infinite render loops by instantiating new unmemoized object references in hook dependency arrays.

### 13.6 Review Checklist
- [ ] Are all components functional and pure during render?
- [ ] Do all hook dependency arrays declare all referenced dependencies without disabling lint rules?
- [ ] Are array iteration keys unique, stable domain IDs?
- [ ] Is complex or reusable stateful logic cleanly extracted into custom hooks?

### 13.7 Quality Checklist
- [ ] ESLint rules `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` are enforced as blocking errors in CI.
- [ ] React StrictMode is enabled across all development and testing environments.

### 13.8 Security Considerations
- Prevent client-side script execution by never passing unsanitized user inputs to `href` attributes (preventing `javascript:...` URL injection).
- Ensure client-side state does not hold sensitive authentication tokens or plaintext passwords in persistent unencrypted browser memory.

### 13.9 Performance Considerations
- Avoid excessive or premature use of `useCallback` and `useMemo`; apply them only when passing callbacks to memoized children or computing computationally expensive algorithms.
- Use React Transitions (`useTransition`) for non-urgent UI updates to maintain input responsiveness during heavy rendering tasks.

### 13.10 Future Scalability
- Idiomatic React following strict purity and hook rules seamlessly integrates with the React 19 Compiler, automatic memoization, and concurrent rendering architectures.

---

# SECTION 14: TYPESCRIPT STANDARDS

### 14.1 Purpose
TypeScript Standards establish the highest standard of mathematical type safety across Explore Bharat Safar. By leveraging static analysis, nominal typing, and strict compiler enforcement, this standard eliminates entire classes of runtime defects before code ever reaches production environments.

### 14.2 Rules
1. **Strict Mode Compiler Mandate**: All packages and applications MUST enable TypeScript strict mode (`"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`, `"noUncheckedIndexedAccess": true`).
2. **Absolute Zero `any` Policy**: The `any` type is strictly forbidden across the entire codebase. Code containing `any` will fail automated CI quality gates. Use `unknown` with runtime type guards if dynamic typing is required.
3. **Discriminated Unions for Complex State**: Multi-state entities and API responses MUST be modeled as Discriminated Unions with a common discriminant property (e.g., `type: 'success' | 'error' | 'loading'`).
4. **Branded Nominal Types for Domain IDs**: Domain entity identifiers MUST use branded nominal types (e.g., `type UserId = string & { readonly __brand: unique symbol }`) to prevent passing a `VillageId` where a `DestinationId` is expected.
5. **No Non-Null Assertions**: The non-null assertion operator (`!`) is strictly forbidden. Nullable values MUST be safely narrowed using optional chaining (`?.`), nullish coalescing (`??`), or explicit guard conditions.

### 14.3 Best Practices
- Leverage TypeScript utility types (`Pick`, `Omit`, `Readonly`, `Partial`, `Record`) to derive types cleanly rather than writing redundant declarations.
- Prefer `interface` for public object contracts and polymorphic inheritance; prefer `type` for unions, intersections, and primitive aliases.
- Use `as const` assertions to freeze literal arrays and configuration objects.

### 14.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Modeling booking state as a discriminated union:
  - `{ status: 'pending'; reservationExpiresAt: Date }`
  - `{ status: 'confirmed'; confirmationCode: string; paidAmount: number }`
  - `{ status: 'cancelled'; cancellationReason: string; refundAmount: number }`
  Enforces compile-time exhaustiveness checks in switch statements.
- *Conceptual Negative Pattern*: Defining an interface with six optional fields: `status: string; reservationExpiresAt?: Date; confirmationCode?: string; paidAmount?: number; cancellationReason?: string`, allowing invalid state combinations to compile without error.

### 14.5 Common Mistakes
- Using type assertions (`as SomeType`) to bypass compiler errors instead of writing proper runtime type guards.
- Overusing complex, unreadable generic type gymnastics that slow down the compiler and confuse other engineers.
- Failing to handle `undefined` when accessing array indices when `noUncheckedIndexedAccess` is enabled.

### 14.6 Review Checklist
- [ ] Is TypeScript strict mode fully enabled without any relaxed compiler flags?
- [ ] Are there zero instances of `any` or forced non-null assertions (`!`)?
- [ ] Are complex domain states modeled as discriminated unions?
- [ ] Are domain identifiers protected via branded types?

### 14.7 Quality Checklist
- [ ] Automated type check (`tsc --noEmit`) passes with zero errors across all monorepo packages.
- [ ] ESLint rules `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-non-null-assertion` are configured as errors.

### 14.8 Security Considerations
- Strict null checks prevent undefined property dereferencing crashes, eliminating denial-of-service attack vectors caused by malformed payloads.
- Nominal type branding prevents catastrophic parameter swap vulnerabilities (e.g., transferring funds to the wrong user account ID).

### 14.9 Performance Considerations
- Clean, non-circular type definitions ensure fast TypeScript compiler evaluation and rapid IDE autocomplete responsiveness.
- Type narrowing at boundaries eliminates the need for redundant, repetitive runtime defensive checks throughout internal layers.

### 14.10 Future Scalability
- A rock-solid, strictly typed codebase provides the foundation for fearless automated refactoring, effortless library upgrades, and reliable AI-assisted feature development.

---


# PART II: UNIVERSAL NAMING CONVENTIONS & MONOREPO MODULAR BOUNDARIES

## Master Naming Convention & Casing Matrix

The following authoritative matrix dictates the required casing, prefixes, suffixes, and formats across all tiers of the Explore Bharat Safar codebase:

| Code Element / Artifact | Standard Casing | Prefix Convention | Suffix Convention | Canonical Example |
| :--- | :--- | :--- | :--- | :--- |
| **Folders & Directories** | `kebab-case` | None (or Route Groups `(name)`) | None | `village-registry/`, `(marketing)/` |
| **Component Files** | `PascalCase` | None | `.tsx` | `DestinationHero.tsx` |
| **Service / Logic Files** | `kebab-case` | None | `.service.ts`, `.util.ts` | `booking-lock.service.ts` |
| **Scalar Variables** | `camelCase` | None | None | `currentExplorerCount` |
| **Boolean Flags** | `camelCase` | `is`, `has`, `can`, `should` | None | `isBookingConfirmed`, `hasCompletedKyc` |
| **Constants & Enums** | `SCREAMING_SNAKE`| None | None | `MAX_BATCH_CAPACITY`, `RETRY_LIMIT` |
| **Functions & Methods** | `camelCase` | Verb (`get`, `create`, `calc`) | None | `calculateDynamicAdvanceFee()` |
| **Event Handlers** | `camelCase` | `handle` (internal) / `on` (props)| None | `handleSlotSelect()`, `onSlotSelect` |
| **Classes & Providers** | `PascalCase` | None | `Service`, `Repository` | `ExperienceBookingService` |
| **Interfaces (Public)** | `PascalCase` | None (Zero `I` prefix) | None | `PaymentGatewayPort` |
| **Type Aliases & DTOs** | `PascalCase` | None | `Dto`, `Input`, `Payload` | `CreateVillageRecordDto` |
| **Custom Hooks** | `camelCase` | `use` | None | `useSlotReservation()` |
| **API Endpoints (REST)** | `kebab-case` | `/api/v1/` | Plural Resource Nouns | `/api/v1/experience-batches` |
| **Database Tables** | `snake_case` | Schema qualified | Plural Nouns | `booking_schema.experience_batches` |
| **Database Columns** | `snake_case` | None | `_id` for Foreign Keys | `total_amount_in_paise`, `taluka_id` |
| **Environment Variables**| `SCREAMING_SNAKE`| Domain Prefix (`NEXT_PUBLIC_`) | None | `DATABASE_URL`, `REDIS_CLUSTER_URL` |

---

# SECTION 15: NAMING CONVENTIONS

### 15.1 Purpose
The Naming Conventions standard establishes universal linguistic and grammatical rules across all layers of Explore Bharat Safar. Precise, predictable naming reduces cognitive load, eliminates ambiguity during code reviews, and ensures seamless navigation across millions of lines of code.

### 15.2 Rules
1. **Universal Grammar Mandate**: Names MUST be written in correct, idiomatic English. Abbreviations, slang, colloquialisms, and transliterated vernacular words (except officially recognized Indian administrative terms like `Taluka`, `GramPanchayat`, `ZillaParishad`) are strictly prohibited.
2. **Contextual Exclusivity**: Names MUST NOT duplicate their enclosing context. For example, within a class `VillageService`, a method MUST be named `findById()`, NOT `findVillageById()`.
3. **Pronounceable and Searchable**: All identifiers MUST be pronounceable and easily searchable via IDE global text search tools.
4. **Length and Scope Proportion**: The length of an identifier MUST be proportional to the size of its enclosing scope. Small loop variables in short utility functions may be short, whereas global types and domain entities MUST be descriptive.

### 15.3 Best Practices
- Favor clarity over brevity; never omit vowels to shorten names (e.g., use `participant` instead of `prtcpnt`).
- Establish naming standards early in sprint planning and document them in the domain glossary.
- Use antonym pairs symmetrically: `open`/`close`, `start`/`stop`, `create`/`destroy`, `lock`/`unlock`, `min`/`max`.

### 15.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An entity property named `bookingHoldExpirationTimestamp` accurately describes its content and time unit.
- *Conceptual Negative Pattern*: A property named `exp_dt` which could mean expiration date, experience date, export date, or expense date.

### 15.5 Common Mistakes
- Using vague, meaningless names like `data`, `info`, `item`, `temp`, or `obj`.
- Combining two different casing conventions in the same file (e.g., mixing `snake_case` and `camelCase` for TypeScript variables).
- Inconsistent terminology across modules (e.g., using `client` in one module, `customer` in another, and `user` in a third to represent the same concept).

### 15.6 Review Checklist
- [ ] Are all identifiers descriptive, pronounceable, and intention-revealing?
- [ ] Do names avoid redundant enclosing context prefixes?
- [ ] Are domain terms consistent with the official platform Ubiquitous Language?
- [ ] Are antonym pairs used consistently throughout the module?

### 15.7 Quality Checklist
- [ ] Automated spell-checkers (`cspell`) run in CI to catch typos in code identifiers.
- [ ] Linter rules enforce casing conventions across all file types.

### 15.8 Security Considerations
- Clear naming prevents accidental exposure of sensitive fields (e.g., naming a field `passwordHash` rather than `password` clearly alerts reviewers to what is being handled).
- Cryptographic keys and tokens MUST be explicitly named with their security classification (e.g., `ephemeralSigningSecret`).

### 15.9 Performance Considerations
- Clear naming has zero runtime performance impact in production because minification and tree-shaking mangle local variable names.
- Well-named modular files enable fast search indexing in developer IDEs and build tooling.

### 15.10 Future Scalability
- Consistent naming allows automated code generation, AST-based refactoring, and AI coding agents to operate with near-zero error rates.

---

# SECTION 16: FOLDER NAMING RULES

### 16.1 Purpose
Folder Naming Rules define the directory hierarchy and naming patterns for all packages, features, routes, and modules. They ensure cross-platform compatibility across Windows, Linux, and macOS file systems, and integrate cleanly with Next.js App Router routing mechanics.

### 16.2 Rules
1. **Strict `kebab-case` Default**: All directory names MUST be in lowercase `kebab-case` (e.g., `village-registry/`, `experience-booking/`). Spaces, underscores, and camelCase directories are strictly prohibited.
2. **Next.js Route Group Conventions**: Route groups that do not affect the URL pathname MUST be enclosed in parentheses (e.g., `(marketing)/`, `(dashboard)/`, `(auth)/`).
3. **Next.js Dynamic Segment Conventions**: Dynamic route segments MUST be enclosed in single square brackets (e.g., `[slug]/`, `[districtId]/`). Catch-all segments MUST use ellipsis (e.g., `[...catchAll]/`).
4. **Next.js Parallel Route Slots**: Parallel route slot directories MUST be prefixed with an at-symbol (e.g., `@modal/`, `@analytics/`).
5. **Private Folder Convention**: Folders that contain internal implementation details that should not be routed MUST be prefixed with an underscore (e.g., `_components/`, `_lib/`).

### 16.3 Best Practices
- Keep directory depth to a maximum of 4 to 5 levels to avoid Windows `MAX_PATH` file path length limits.
- Co-locate tests in a dedicated `__tests__/` directory directly within the feature or component folder.
- Group related features into domain-level directories under `src/features/`.

### 16.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `apps/web/app/(discovery)/destinations/[stateSlug]/[placeSlug]/page.tsx`
- *Conceptual Negative Pattern*: `apps/web/app/Destination Discovery/State_Places/PlaceDetails Page/page.tsx`

### 16.5 Common Mistakes
- Using capital letters in folder names on Windows or macOS (case-insensitive file systems), which breaks on Linux CI/CD environments.
- Creating deeply nested folders with redundant names (e.g., `bookings/booking-details/booking-details-card/`).
- Using spaces or special punctuation characters in folder names.

### 16.6 Review Checklist
- [ ] Are all directory names strictly lowercase `kebab-case`?
- [ ] Do Next.js App Router folders adhere to official grouping and dynamic segment conventions?
- [ ] Is folder nesting kept reasonably flat ($< 5$ levels)?
- [ ] Are private implementation folders prefixed with `_` or encapsulated in feature boundaries?

### 16.7 Quality Checklist
- [ ] CI linting script checks file path naming for forbidden characters and casing violations.
- [ ] Cross-platform path validation runs on both Windows and Linux CI runners.

### 16.8 Security Considerations
- Proper directory structure prevents path traversal vulnerabilities in file-serving endpoints.
- Route groups and private folder conventions ensure internal utility files are never accidentally exposed as public HTTP routes by Next.js.

### 16.9 Performance Considerations
- Shallow, well-organized folder structures significantly improve module resolution speed during build and bundling steps.
- Prevents file system lock contention and inode exhaustion on high-throughput containerized environments.

### 16.10 Future Scalability
- A clean, standardized directory structure makes it simple to split large subdirectories into standalone monorepo packages when boundaries expand.

---

# SECTION 17: FILE NAMING RULES

### 17.1 Purpose
File Naming Rules enforce consistency and immediate clarity regarding the role, type, and framework behavior of every file in the repository.

### 17.2 Rules
1. **React Components in `PascalCase.tsx`**: Files whose primary export is a React component MUST use `PascalCase.tsx` (e.g., `DestinationHero.tsx`, `VillageCard.tsx`).
2. **Logic and Service Files in `kebab-case.suffix.ts`**: Non-component TypeScript files MUST use lowercase `kebab-case` with a descriptive dot-separated suffix:
   - Services: `*.service.ts`
   - Repositories: `*.repository.ts`
   - Controllers: `*.controller.ts`
   - Validators: `*.validator.ts`
   - Utilities: `*.util.ts`
   - Types & DTOs: `*.types.ts` or `*.dto.ts`
3. **Next.js App Router File Conventions**: Standard App Router files MUST use their official fixed lowercase names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `template.tsx`.
4. **Test Files**: Unit and integration test files MUST be named `*.spec.ts` or `*.test.tsx`, directly matching the file they test.
5. **Configuration Files**: Root configuration files MUST follow standard ecosystem naming: `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.json`.

### 17.3 Best Practices
- One primary export per file. If a file exports `VillageCard`, the file name must be `VillageCard.tsx`.
- Co-locate styling and test files right next to the component they serve.
- Keep file names concise yet completely unambiguous.

### 17.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `slot-lock.service.ts`, `slot-lock.service.spec.ts`, `BookingModal.tsx`, `BookingModal.test.tsx`.
- *Conceptual Negative Pattern*: `slotlockservice.ts`, `Component1.tsx`, `helper.ts`, `stuff.js`.

### 17.5 Common Mistakes
- Naming a service file with `PascalCase` (e.g., `UserService.ts` instead of `user.service.ts`).
- Naming a React component with `kebab-case` (e.g., `village-card.tsx` instead of `VillageCard.tsx`).
- Creating generic files like `utils.ts` or `helpers.ts` that become unmaintainable junk drawers.

### 17.6 Review Checklist
- [ ] Do React component files use `PascalCase.tsx`?
- [ ] Do non-component TypeScript files use `kebab-case` with standard architectural suffixes?
- [ ] Are test files named identically to their target implementation with `.test.` or `.spec.`?
- [ ] Does the file name match its primary export?

### 17.7 Quality Checklist
- [ ] ESLint `filenames/match-regex` enforces file naming patterns across the entire repository.
- [ ] Git pre-commit hooks reject files that violate naming standards.

### 17.8 Security Considerations
- Strict file extensions prevent accidental execution or improper bundling of sensitive configuration or script files.
- Ensures test files (`*.test.ts`) are completely excluded from production build outputs.

### 17.9 Performance Considerations
- Consistent file naming patterns allow Webpack, Turbopack, and Rollup to apply optimized compilation and tree-shaking rules based on glob matchers.
- Reduces lookup overhead in language servers and IDE tooling.

### 17.10 Future Scalability
- Standardized file suffixes make automated AST refactorings, codemods, and automated migrations trivial to execute at enterprise scale.

---

# SECTION 18: VARIABLE NAMING RULES

### 18.1 Purpose
Variable Naming Rules define standard conventions for naming local and member variables, ensuring that data types, semantics, and lifecycles are instantly recognizable.

### 18.2 Rules
1. **`camelCase` for Variables**: All local variables, object properties, and class instance fields MUST use `camelCase`.
2. **Boolean Prefixes Mandatory**: Boolean variables and flags MUST be prefixed with an auxiliary verb: `is`, `has`, `can`, `should`, `will`, or `did` (e.g., `isAvailable`, `hasActiveSubscription`, `canCancelBooking`).
3. **Plural Naming for Collections**: Arrays, Sets, and Maps MUST be named as plural nouns or prefixed with a collection descriptor (e.g., `villages`, `selectedParticipantIds`, `experienceBatchMap`).
4. **Single-Letter Variables Prohibited**: Single-letter variables (e.g., `x`, `i`, `v`, `d`) are strictly forbidden, except as standard mathematical indexes in tiny, localized array transformations.
5. **No Negative Booleans**: Avoid negative boolean names (e.g., use `isEnabled` instead of `isNotDisabled`) to eliminate confusing double negatives in conditional checks.

### 18.3 Best Practices
- Include physical units in variable names where applicable (e.g., `timeoutInMilliseconds`, `fileSizeInBytes`, `amountInPaise`).
- Prefix private class fields with `#` (native ECMAScript private fields) or TypeScript `private` keyword.
- Name maps after their key-to-value relationship (e.g., `userById`, `batchByExperienceId`).

### 18.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `const slotLockTimeoutInSeconds = 900;`, `const isSlotAvailable = true;`, `const talukas = ['Haveli', 'Pune City'];`
- *Conceptual Negative Pattern*: `const t = 900;`, `const flag = false;`, `const list = [];`

### 18.5 Common Mistakes
- Naming booleans with nouns or adjectives without verbs (e.g., `const ready = true;` instead of `const isReady = true;`).
- Using abbreviations that are ambiguous (e.g., `auth` could mean `isAuthenticated`, `author`, `authorizationHeader`, or `authenticate`).
- Retaining Hungarian notation (e.g., `strName`, `arrItems`).

### 18.6 Review Checklist
- [ ] Are all variables formatted in `camelCase`?
- [ ] Are boolean flags prefixed with appropriate verbs (`is`, `has`, `can`)?
- [ ] Do collections and arrays have clear plural names?
- [ ] Are physical units explicitly documented in variable names for numbers?

### 18.7 Quality Checklist
- [ ] ESLint rules `@typescript-eslint/naming-convention` validate variable and boolean naming.
- [ ] Automated code review bots flag single-letter variables in pull requests.

### 18.8 Security Considerations
- Explicit naming for sensitive variables (e.g., `sanitizedHtmlContent` vs `untrustedRawInput`) ensures developers and reviewers immediately spot improper sanitization.
- Prevents accidental logging of sensitive variables by making token and credential variables recognizable by telemetry redaction filters.

### 18.9 Performance Considerations
- Explicit, unambiguous variable names have zero performance overhead post-compilation.
- Clear variable lifecycles prevent accidental memory retention in closures.

### 18.10 Future Scalability
- Descriptive variables enable automated AI reasoning and programmatic refactoring across massive codebases without semantic confusion.

---

# SECTION 19: FUNCTION NAMING RULES

### 19.1 Purpose
Function Naming Rules ensure that all functions, methods, and procedures clearly describe the action they execute and what they return.

### 19.2 Rules
1. **Verb-Noun `camelCase` Pattern**: Function and method names MUST begin with a strong, descriptive verb followed by a noun phrase (e.g., `calculateDynamicDeposit()`, `fetchVillageByCadastralCode()`, `publishDomainEvent()`).
2. **Standard Verb Semantics**:
   - `get*`: Fast in-memory retrieval with no side effects.
   - `fetch*`: Asynchronous network or database call.
   - `calculate*` / `compute*`: Algorithmic computation with no external I/O.
   - `create*` / `build*`: Instantiation of new objects or database entities.
   - `validate*`: Checking conditions; returns boolean or throws validation error.
   - `transform*` / `format*`: Converting data from one representation to another.
3. **Event Handler Naming**:
   - Internal handlers in components MUST be prefixed with `handle` (e.g., `handleSubmit`, `handleDateChange`).
   - Callback props passed to children MUST be prefixed with `on` (e.g., `onSubmit`, `onDateChange`).
4. **Predicate Functions**: Functions that return a boolean MUST be named like boolean variables (e.g., `isValidCadastralCode()`, `hasSufficientBalance()`).

### 19.3 Best Practices
- Avoid vague verbs like `process()`, `doStuff()`, `manage()`, or `run()`.
- Ensure the name accurately reflects all side effects (e.g., if a function saves to the database, name it `saveUser()`, not `checkUser()`).
- Keep async function names clean; do NOT append `Async` as a suffix unless resolving a naming collision with a synchronous counterpart.

### 19.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `calculateCancellationRefundAmount(booking, cancellationDate)`, `handleExperienceSlotLock(slotId)`.
- *Conceptual Negative Pattern*: `dataHandler()`, `processBooking()`, `userAction()`.

### 19.5 Common Mistakes
- Naming a function `getUser()` when it performs an expensive multi-table SQL join, writes to a Redis cache, and sends an audit log.
- Mismatching handler props (e.g., passing a prop named `handleClick` instead of `onClick`).
- Giving identical names to functions with vastly different behaviors across different layers.

### 19.6 Review Checklist
- [ ] Does the function name start with a descriptive verb?
- [ ] Does the name accurately describe all actions and side effects performed by the function?
- [ ] Are event handlers named `handle*` and component callback props named `on*`?
- [ ] Are boolean predicates named `is*`, `has*`, or `can*`?

### 19.7 Quality Checklist
- [ ] Linter rules enforce verb-noun naming patterns for functions.
- [ ] Unit tests match function naming: `describe('calculateCancellationRefundAmount')`.

### 19.8 Security Considerations
- Accurately named functions prevent developers from calling destructive operations accidentally (e.g., distinguishing `softDeleteUser()` from `purgeUserDataPermanently()`).
- Security validation functions MUST explicitly convey whether they throw on failure or return a boolean.

### 19.9 Performance Considerations
- Clear distinction between in-memory `get*` and network-bound `fetch*` prevents developers from accidentally calling expensive remote operations inside tight loops.
- Facilitates accurate flamegraph profiling and APM tracing by providing readable call stacks.

### 19.10 Future Scalability
- Semantic function names allow automated API documentation generators (TypeDoc, Swagger) to generate crystal-clear documentation for enterprise partners and third-party developers.

---

# SECTION 20: CLASS NAMING RULES

### 20.1 Purpose
Class Naming Rules govern the structure and naming of object-oriented classes, ensuring their role, architectural layer, and domain identity are immediately apparent.

### 20.2 Rules
1. **`PascalCase` Noun Phrases**: Class names MUST be nouns or noun phrases written in `PascalCase` (e.g., `ExperienceBatch`, `TalukaBoundaryManager`).
2. **Mandatory Architectural Suffixes**: Concrete infrastructure and application classes MUST carry a suffix denoting their architectural archetype:
   - Services: `*Service` (e.g., `SlotReservationService`)
   - Repositories: `*Repository` (e.g., `PostgresVillageRepository`)
   - Controllers: `*Controller` (e.g., `VillageModerationController`)
   - Interceptors: `*Interceptor` (e.g., `TelemetryLoggingInterceptor`)
   - Guards: `*Guard` (e.g., `JwtRbacGuard`)
   - Strategies: `*Strategy` (e.g., `RazorpayPaymentStrategy`)
   - Factories: `*Factory` (e.g., `CertificatePdfFactory`)
3. **Domain Entities Suffix-Free**: Pure domain entities and aggregate roots in `packages/types` or domain cores MUST NOT carry technical suffixes (e.g., name the entity `Village`, NOT `VillageEntity`).
4. **Abstract Base Classes**: Abstract classes MUST be prefixed with `Abstract` or `Base` (e.g., `AbstractPaymentGatewayAdapter`).

### 20.3 Best Practices
- Name classes after what they represent in the domain, not how they are implemented.
- Avoid utility classes with only static methods; prefer pure functions in TypeScript modules.
- Ensure class names reflect their single responsibility.

### 20.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `class ExperienceBookingService`, `class RedisRedlockMutexAdapter`, `class CadastralBoundaryValueObject`.
- *Conceptual Negative Pattern*: `class BookingStuff`, `class DataHelper`, `class VillageClass`.

### 20.5 Common Mistakes
- Giving a class a generic name that masks multiple responsibilities (e.g., `SystemManager`).
- Forgetting the architectural suffix on NestJS services, leading to confusion between entities and services.
- Using abbreviations or acronyms without capitalizing them properly in `PascalCase` (e.g., `GisManager` instead of `GISManager` or vice versa; standardize on `GisManager`).

### 20.6 Review Checklist
- [ ] Is the class named as a `PascalCase` noun phrase?
- [ ] Does the class carry the appropriate architectural suffix (`Service`, `Repository`, `Controller`)?
- [ ] Are domain entities clean and free of technical suffixes?
- [ ] Are abstract classes explicitly prefixed with `Abstract` or `Base`?

### 20.7 Quality Checklist
- [ ] Architectural linter enforces that all classes in `*.service.ts` files end with the suffix `Service`.
- [ ] NestJS dependency injection modules register cleanly with matching token names.

### 20.8 Security Considerations
- Clear identification of security-critical classes (e.g., `AuthenticationService`, `AuthorizationGuard`) ensures they receive specialized scrutiny during security audits.
- Prevents accidental instantiation or mocking of security components in production runtime.

### 20.9 Performance Considerations
- Proper class organization facilitates JIT optimization and predictable memory layout in modern V8 runtimes.
- Clear lifecycle demarcation (singleton services vs request-scoped providers) prevents memory leaks in application containers.

### 20.10 Future Scalability
- Well-named classes provide clean injection points for enterprise middleware, transaction proxies, and distributed tracing decorators.

---

# SECTION 21: INTERFACE NAMING RULES

### 21.1 Purpose
Interface Naming Rules standardize public contracts, ports, and polymorphic abstractions across the entire Explore Bharat Safar enterprise monorepo.

### 21.2 Rules
1. **`PascalCase` Without `I` Prefix**: Interfaces MUST use `PascalCase` and MUST NOT be prefixed with `I` (e.g., use `PaymentGatewayPort`, NOT `IPaymentGatewayPort`). The `I` prefix is an obsolete Hungarian notation antipattern in modern TypeScript.
2. **Ports and Adapters Naming**: Domain port interfaces MUST carry the `Port` suffix (e.g., `NotificationPort`, `BookingRepositoryPort`, `SpatialIndexPort`).
3. **Capability / Role Interfaces**: Interfaces representing specific capabilities MUST be adjectives ending in `-able` or nouns describing the role (e.g., `Serializable`, `Auditable`, `Cacheable`).
4. **Component Props Interfaces**: Interfaces for React component props MUST be named by suffixing `Props` to the component name (e.g., `DestinationHeroProps`, `VillageCardProps`).
5. **State Interfaces**: Interfaces defining component or hook state MUST end with `State` (e.g., `SlotReservationState`).

### 21.3 Best Practices
- Define interfaces for public API boundaries and abstractions that have multiple implementations or are mocked in tests.
- Keep interfaces cohesive and segregated according to the Interface Segregation Principle (ISP).
- Document interface methods using TSDoc syntax.

### 21.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `interface PaymentGatewayPort`, `interface VillageCardProps`, `interface AuditRecord`.
- *Conceptual Negative Pattern*: `interface IPaymentGateway`, `interface IProps`, `interface IVillageData`.

### 21.5 Common Mistakes
- Prefixing interfaces with `I` out of habit from C# or legacy Java conventions.
- Creating a monolithic interface with 30 methods instead of small, focused role interfaces.
- Defining an interface that mirrors a database table 1:1 instead of representing the domain concept.

### 21.6 Review Checklist
- [ ] Are interfaces named in `PascalCase` without an `I` prefix?
- [ ] Do domain ports end with the `Port` suffix?
- [ ] Are React component prop interfaces named `[ComponentName]Props`?
- [ ] Are capability interfaces named with `-able` adjectives where appropriate?

### 21.7 Quality Checklist
- [ ] ESLint rule `@typescript-eslint/naming-convention` configured to reject `I` prefixed interfaces.
- [ ] Architecture checks ensure all domain ports reside in `packages/types` or domain core.

### 21.8 Security Considerations
- Interfaces define the security contract for external integrations, ensuring adapters implement required authentication and encryption protocols.
- Prevents data leakage by exposing only the minimal required contract to external consumers.

### 21.9 Performance Considerations
- TypeScript interfaces compile away completely at runtime, incurring zero bundle size or memory overhead in JavaScript.
- Well-defined interfaces enable clean mocking, dramatically accelerating unit test execution.

### 21.10 Future Scalability
- Stable, well-named interface contracts allow backend adapters (e.g., swapping payment providers or database drivers) to be rewritten with zero downstream disruption.

---

# SECTION 22: ENUM NAMING RULES

### 22.1 Purpose
Enum Naming Rules govern the declaration of finite, enumerated sets of constant domain values across Explore Bharat Safar, preventing magic strings and invalid state assignments.

### 22.2 Rules
1. **`PascalCase` Enum Names**: Enum names MUST be singular nouns written in `PascalCase` (e.g., `BookingStatus`, `VillageVerificationTier`, `ExperienceCategory`).
2. **`SCREAMING_SNAKE_CASE` or `PascalCase` Members**: Enum member keys MUST use `SCREAMING_SNAKE_CASE` (e.g., `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED_BY_EXPLORER`).
3. **String Value Assignment**: Enums MUST explicitly assign string values that match their domain identifier (e.g., `PENDING = 'PENDING'`). Numeric enums are strictly prohibited due to reverse-mapping pitfalls and lack of readability in database records.
4. **Const Objects over Enums Preference**: Where applicable, prefer TypeScript `as const` object maps or string union types over TypeScript `enum` keywords to optimize tree-shaking and avoid transpilation artifacts.

### 22.3 Best Practices
- Derive TypeScript union types from const objects using `(typeof MyConstMap)[keyof typeof MyConstMap]`.
- Store enums in `packages/types` to ensure synchronization between database schemas, backend services, and frontend UI.
- Use enums for finite, rarely changing domain concepts (e.g., order states, user roles).

### 22.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  - Enum declaration: `BookingStatus { PENDING_PAYMENT = 'PENDING_PAYMENT', CONFIRMED = 'CONFIRMED', EXPIRED = 'EXPIRED' }`
  - Or const object: `const BOOKING_STATUS = { PENDING: 'PENDING', CONFIRMED: 'CONFIRMED' } as const;`
- *Conceptual Negative Pattern*:
  - Implicit numeric enum: `enum Status { Pending, Confirmed, Cancelled }` (stores 0, 1, 2 in database, making SQL logs unreadable and error-prone during reordering).

### 22.5 Common Mistakes
- Using numeric enums that lead to subtle bugs when values are reordered or added.
- Pluralizing enum names (e.g., naming it `BookingStatuses` instead of `BookingStatus`).
- Inconsistent enum values that do not match the database string representations.

### 22.6 Review Checklist
- [ ] Is the enum named as a singular `PascalCase` noun?
- [ ] Are enum keys formatted in `SCREAMING_SNAKE_CASE`?
- [ ] Are all enum values explicitly assigned string literals?
- [ ] Are enums located in shared domain packages (`packages/types`)?

### 22.7 Quality Checklist
- [ ] ESLint rules enforce string values for all enum declarations.
- [ ] Database migration checks ensure enum values in TypeScript match PostgreSQL `CREATE TYPE` definitions.

### 22.8 Security Considerations
- String enums prevent injection attacks by restricting accepted inputs to an immutable, pre-approved whitelist of values.
- Prevents invalid privilege escalation by strictly enumerating user roles (`Role.EXPLORER`, `Role.VILLAGE_ADMIN`, `Role.SUPER_ADMIN`).

### 22.9 Performance Considerations
- `as const` string unions are completely erased during TypeScript compilation, resulting in zero runtime overhead and optimal bundle size.
- String enums in PostgreSQL can be represented as native enums or indexed `varchar` columns for fast equality matching.

### 22.10 Future Scalability
- Centralized string enums ensure that adding a new lifecycle state is tracked across all TypeScript switch statements via exhaustive compile-time checking.

---

# SECTION 23: TYPE NAMING RULES

### 23.1 Purpose
Type Naming Rules standardize TypeScript type aliases, nominal types, utility types, and DTO contracts across the entire Explore Bharat Safar platform.

### 23.2 Rules
1. **`PascalCase` for Type Aliases**: All type alias names MUST be written in `PascalCase` (e.g., `CadastralCode`, `CoordinatePair`, `RefundCalculationResult`).
2. **DTO and Input Suffixes**: Types representing network data transfer objects MUST carry clear functional suffixes:
   - Request inputs: `*Input` or `*Dto` (e.g., `CreateExperienceBatchInput`, `LockSlotDto`)
   - Query filters: `*Filter` or `*Query` (e.g., `VillageSearchFilter`, `ListBookingsQuery`)
   - Responses: `*Response` or `*Result` (e.g., `BookingConfirmationResponse`)
3. **Nominal Brand Types**: Branded type aliases MUST be suffixed with `Id` or `Code` (e.g., `UserId`, `VillageId`, `LgdCadastralCode`).
4. **Discriminated Union Types**: Discriminated union types MUST be named as a general concept, while member types specify the variant (e.g., union `PaymentState`, with variants `PendingPaymentState`, `CompletedPaymentState`, `FailedPaymentState`).

### 23.3 Best Practices
- Derive types from Zod schemas using `z.infer<typeof Schema>` to maintain absolute synchronization between validation and static types.
- Use utility types (`Readonly<T>`, `Partial<T>`, `Pick<T, K>`) rather than duplicating existing type definitions.
- Keep type alias names concise and semantically aligned with the domain.

### 23.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `type VillageId = string & { readonly __brand: unique symbol };`, `type CreateVillageRecordInput = z.infer<typeof createVillageSchema>;`
- *Conceptual Negative Pattern*: `type t_village = any;`, `type Data = object;`, `type VillageInputType = ...;` (redundant `Type` suffix).

### 23.5 Common Mistakes
- Appending the redundant suffix `Type` to type names (e.g., `UserType` instead of `User`).
- Creating loose union types with raw strings (e.g., `type Status = string`) instead of strict literal unions (`type Status = 'active' | 'suspended'`).
- Manually defining types that drift away from their corresponding runtime validation schemas.

### 23.6 Review Checklist
- [ ] Are type aliases named in `PascalCase` without redundant suffixes like `Type`?
- [ ] Do DTO types carry appropriate suffixes (`Input`, `Dto`, `Response`)?
- [ ] Are domain identifiers protected via branded types?
- [ ] Are types derived directly from Zod schemas where applicable?

### 23.7 Quality Checklist
- [ ] Static type checker validates that all exported types compile without errors.
- [ ] Automated schema synchronization checks verify type-schema parity.

### 23.8 Security Considerations
- Branded types prevent parameter swapping in critical security methods (e.g., preventing a `recipientUserId` from being swapped with an `actorUserId`).
- Strict literal types prevent invalid or malicious string values from passing type checking.

### 23.9 Performance Considerations
- Clean, non-recursive type definitions maintain high TypeScript compiler performance and rapid IDE feedback loops.
- All type aliases are erased at compile time, leaving zero runtime JavaScript footprint.

### 23.10 Future Scalability
- Strongly typed contracts enable automated OpenAPI specification generation and client SDK synthesis for future mobile and third-party integrations.

---

# SECTION 24: HOOK NAMING RULES

### 24.1 Purpose
Hook Naming Rules govern the naming, structure, and return contracts of React custom hooks, ensuring seamless state management, predictability, and compliance with React's Rules of Hooks.

### 24.2 Rules
1. **Mandatory `use` Prefix**: All custom hook names MUST begin with the lowercase prefix `use`, followed by a `PascalCase` descriptive name (e.g., `useSlotReservation`, `useVillageSearch`, `useGeoLocation`).
2. **Verb or Noun Phrase**: The name following `use` MUST clearly communicate what data or capability the hook provides (e.g., `useDebounce`, `useLocalStorage`, `useExperienceDetails`).
3. **Return Contract Conventions**:
   - For stateful hooks providing value and updater, return a tuple: `[value, setValue]` (matching `useState`).
   - For complex hooks managing multiple values, methods, and statuses, return a strongly typed object: `{ data, isLoading, error, refetch }`.
4. **No Conditional Hook Invocations**: Custom hooks MUST NOT be called conditionally or inside loops; their names MUST trigger React's static hook linters.

### 24.3 Best Practices
- Keep custom hooks focused on a single domain concern or interaction.
- Extract complex `useEffect` sequences and external subscriptions into dedicated custom hooks.
- Provide clear JSDoc / TSDoc annotations describing the hook's parameters and return structure.

### 24.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `function useSlotLock(slotId: SlotId): { isLocked: boolean; remainingSeconds: number; releaseLock: () => Promise<void> }`
- *Conceptual Negative Pattern*: `function slotManager()`, `function getBookingHook()`, `function useData()` (vague, non-descriptive).

### 24.5 Common Mistakes
- Naming a utility function with `use` when it does not call any React hooks internally.
- Naming a hook without `use` (e.g., `createBookingWatcher()`), which disables React's automatic hook rules enforcement.
- Returning an untyped generic array with ambiguous positional values.

### 24.6 Review Checklist
- [ ] Does the hook name start with the lowercase prefix `use`?
- [ ] Does the hook call at least one native React hook internally?
- [ ] Is the return signature strongly typed (predictable tuple or object)?
- [ ] Does the hook follow React's Rules of Hooks strictly?

### 24.7 Quality Checklist
- [ ] ESLint `react-hooks/rules-of-hooks` verifies proper usage and naming in CI.
- [ ] Hook unit tests (via `@testing-library/react-hooks`) verify lifecycle and cleanup behavior.

### 24.8 Security Considerations
- Custom hooks handling user inputs MUST NOT execute unsanitized DOM modifications or evaluate dynamic scripts.
- Hooks managing sensitive data (e.g., authentication tokens) MUST clean up memory on unmount to prevent credential residue.

### 24.9 Performance Considerations
- Hooks returning callback functions MUST memoize them using `useCallback` when passed to memoized child components.
- Ensure custom hooks unsubscribe from active WebSockets, intervals, and event listeners during their cleanup phase to prevent memory leaks.

### 24.10 Future Scalability
- Well-encapsulated custom hooks can be migrated directly into standalone cross-platform hook packages shared between Next.js Web and React Native mobile applications.

---

# SECTION 25: API NAMING RULES

### 25.1 Purpose
API Naming Rules establish a standardized, predictable RESTful routing structure across the entire Explore Bharat Safar backend, ensuring consistency for web clients, mobile apps, and third-party integrations.

### 25.2 Rules
1. **Plural Nouns for Resources**: Route endpoints MUST use plural nouns to identify resource collections (e.g., `/api/v1/villages`, `/api/v1/experience-batches`). Verbs in URI paths are strictly prohibited.
2. **Kebab-Case Paths**: Multi-word URI path segments MUST use lowercase `kebab-case` (e.g., `/api/v1/experience-batches`, `/api/v1/cultural-events`).
3. **Standard HTTP Verbs**: HTTP methods MUST strictly govern the operational intent:
   - `GET`: Safe, idempotent read operations.
   - `POST`: Create a new resource or execute a non-idempotent domain command.
   - `PUT`: Complete idempotent replacement of an existing resource.
   - `PATCH`: Partial update of an existing resource.
   - `DELETE`: Idempotent removal of a resource.
4. **Hierarchical Sub-Resources**: Nested relationships MUST reflect logical parent-child hierarchies (e.g., `/api/v1/experiences/:id/batches`, `/api/v1/villages/:id/stories`). Nesting MUST NOT exceed two levels; prefer query filters for deeper relationships.
5. **API Versioning**: All public endpoints MUST be prefixed with the API version (e.g., `/api/v1/`).

### 25.3 Best Practices
- Use query parameters for filtering, sorting, pagination, and field selection (e.g., `/api/v1/villages?district=pune&page=1&limit=20`).
- Return standard HTTP status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`, `500 Internal Error`.
- Use RFC 7807 Problem Details for all error response envelopes.

### 25.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `POST /api/v1/bookings`, `GET /api/v1/villages/624510`, `POST /api/v1/bookings/:id/cancellation`
- *Conceptual Negative Pattern*: `GET /api/v1/getAllVillages`, `POST /api/v1/delete-booking?id=123`, `POST /api/v1/villages/save`

### 25.5 Common Mistakes
- Using verbs in endpoint URIs (e.g., `/api/v1/createBooking`).
- Using inconsistent casing across routes (e.g., mixing `/api/v1/user_profiles` and `/api/v1/userProfiles`).
- Returning `200 OK` for error responses with an internal error code in the JSON body.

### 25.6 Review Checklist
- [ ] Are all route paths lowercase `kebab-case` with plural resource nouns?
- [ ] Are HTTP verbs used correctly according to their RESTful semantics?
- [ ] Are resource hierarchies limited to a maximum of two nesting levels?
- [ ] Are routes properly versioned with `/api/v1/`?

### 25.7 Quality Checklist
- [ ] OpenAPI (Swagger) specifications are automatically generated and validated in CI.
- [ ] API contract testing verifies that all endpoints return standard response envelopes and status codes.

### 25.8 Security Considerations
- Never expose sensitive internal database IDs or incremental integers in public URLs; use UUIDs or opaque public slugs.
- Apply strict rate-limiting policies to all public API endpoints (`429 Too Many Requests`).

### 25.9 Performance Considerations
- Design API endpoints to support cursor-based or keyset pagination for large datasets to maintain sub-50ms response times.
- Implement HTTP caching headers (`Cache-Control`, `ETag`) for static and semi-static read-only endpoints.

### 25.10 Future Scalability
- Versioned, RESTful endpoints allow new API generations (`/api/v2/`) to be introduced without breaking backward compatibility for older clients and mobile installations.

---

# SECTION 26: DATABASE NAMING RULES

### 26.1 Purpose
Database Naming Rules establish rigorous conventions for PostgreSQL 16 relational schemas, PostGIS spatial tables, columns, indexes, and constraints, ensuring high performance, maintainability, and zero ambiguity.

### 26.2 Rules
1. **`snake_case` Everywhere**: All database identifiers—including schema names, table names, column names, indexes, triggers, and foreign keys—MUST use lowercase `snake_case`.
2. **Plural Table Names**: Relational tables MUST use plural nouns representing collections of records (e.g., `users`, `experience_batches`, `village_records`).
3. **Primary and Foreign Key Conventions**:
   - Primary key columns MUST be named `id` and use UUIDv7 or ULID data types.
   - Foreign key columns MUST use the singular referenced table name followed by `_id` (e.g., `experience_id`, `village_id`, `user_id`).
4. **Standard Index Naming**:
   - B-tree Indexes: `idx_<table>_<column(s)>` (e.g., `idx_villages_cadastral_code`)
   - Unique Indexes: `uq_<table>_<column(s)>` (e.g., `uq_users_phone_number`)
   - Foreign Keys: `fk_<table>_<referenced_table>` (e.g., `fk_batches_experiences`)
   - Spatial Indexes (GIST): `spx_<table>_<geometry_column>` (e.g., `spx_villages_boundary`)
5. **Standard Timestamp Columns**: Every mutable table MUST include `created_at` and `updated_at` columns of type `TIMESTAMPTZ` defaulting to `CURRENT_TIMESTAMP`. Soft-delete tables MUST include `deleted_at` of type `TIMESTAMPTZ` (nullable).

### 26.3 Best Practices
- Explicitly group tables into logical PostgreSQL schemas (`identity_schema`, `discovery_schema`, `village_schema`, `booking_schema`, `social_schema`).
- Boolean columns MUST use prefixes matching application conventions: `is_*`, `has_*`, `can_*` (e.g., `is_verified`, `has_camping_facility`).
- Monetary amounts MUST be stored as integers representing the smallest currency unit (e.g., `amount_in_paise` for INR) to eliminate floating-point rounding errors.

### 26.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `CREATE TABLE booking_schema.experience_batches ( id UUID PRIMARY KEY, experience_id UUID NOT NULL, start_time TIMESTAMPTZ NOT NULL, max_capacity INT NOT NULL, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP );`
- *Conceptual Negative Pattern*: `CREATE TABLE BatchData ( BatchID INT PRIMARY KEY, ExpID INT, StartTime VARCHAR(50), Capacity FLOAT );`

### 26.5 Common Mistakes
- Using reserved SQL keywords as column names (e.g., `order`, `user`, `group`, `table`).
- Storing currency as `FLOAT` or `DOUBLE PRECISION` instead of `BIGINT` (paise) or `NUMERIC`.
- Missing GIST spatial indexes on PostGIS geometry columns, causing catastrophic full-table scans during geographic queries.

### 26.6 Review Checklist
- [ ] Are all database identifiers lowercase `snake_case`?
- [ ] Do tables have plural names and schemas assigned?
- [ ] Are foreign keys named `[singular_table]_id`?
- [ ] Are all indexes and constraints named according to standard prefix conventions?
- [ ] Are monetary amounts stored as integer paise?

### 26.7 Quality Checklist
- [ ] Prisma schema linter verifies naming conventions and foreign key definitions.
- [ ] Database migration checks ensure all foreign keys have supporting indexes.

### 26.8 Security Considerations
- Enforce Row-Level Security (RLS) policies using standardized column names (`user_id`, `tenant_id`).
- Never store plaintext passwords or unmasked sensitive PII in database columns.

### 26.9 Performance Considerations
- Consistent naming facilitates query optimization, index verification, and automated query analyzer tooling (pg_stat_statements).
- Proper spatial index naming ensures GIS query planners leverage spatial acceleration structures.

### 26.10 Future Scalability
- Standardized schemas and naming simplify database partitioning (e.g., partitioning booking ledgers by year or fiscal quarter) and read-replica routing.

---

# SECTION 27: ENVIRONMENT VARIABLE NAMING

### 27.1 Purpose
Environment Variable Naming Rules ensure configuration settings and secrets are systematically organized, validated at build and runtime, and protected against accidental client-side leakage.

### 27.2 Rules
1. **`SCREAMING_SNAKE_CASE`**: All environment variables MUST use uppercase `SCREAMING_SNAKE_CASE`.
2. **Domain Prefixing**: Variables MUST be prefixed with their subsystem or integration domain:
   - Database: `DATABASE_*` (e.g., `DATABASE_URL`, `DATABASE_POOL_MAX`)
   - Redis: `REDIS_*` (e.g., `REDIS_URL`, `REDIS_CLUSTER_NODES`)
   - Authentication: `AUTH_*` (e.g., `AUTH_JWT_SECRET`, `AUTH_TOKEN_EXPIRY`)
   - Razorpay: `RAZORPAY_*` (e.g., `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
   - AWS S3: `AWS_S3_*` (e.g., `AWS_S3_BUCKET_NAME`, `AWS_S3_REGION`)
3. **Client-Side Exposure Guard**: Next.js client-accessible variables MUST be explicitly prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_MAPLIBRE_TILES_URL`). Sensitive secrets MUST NEVER carry the `NEXT_PUBLIC_` prefix.
4. **Zero Secrets in Code**: Plaintext secret values MUST NEVER be committed to Git. Local development MUST use `.env.example` templates with mocked values; real secrets are injected via HashiCorp Vault or AWS Secrets Manager.
5. **Runtime Validation Mandate**: All environment variables MUST be validated at application bootstrap using an immutable Zod configuration schema. If any required variable is missing or malformed, the application MUST fail to start immediately.

### 27.3 Best Practices
- Group environment schemas into a dedicated `packages/env` or `config/env.ts` module.
- Provide clear descriptions and sample development values in `.env.example`.
- Rotate production secrets regularly using automated Vault secret rotation.

### 27.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `DATABASE_URL=postgresql://user:pass@localhost:5432/ebs`, `NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.explorebharatsafar.in/style.json`
- *Conceptual Negative Pattern*: `db=localhost`, `MY_SECRET=12345`, `NEXT_PUBLIC_RAZORPAY_API_SECRET=sec_live_987` (catastrophic secret leakage to client browser).

### 27.5 Common Mistakes
- Prefixing private API secrets with `NEXT_PUBLIC_`, causing Next.js to bake private keys into public browser JavaScript bundles.
- Using inconsistent naming (e.g., mixing `DB_PASS`, `DATABASE_PASSWORD`, and `POSTGRES_PWD`).
- Allowing the application to run with missing environment variables, failing hours later when a specific code path is triggered.

### 27.6 Review Checklist
- [ ] Are all variables uppercase `SCREAMING_SNAKE_CASE` with appropriate domain prefixes?
- [ ] Are only non-sensitive variables prefixed with `NEXT_PUBLIC_`?
- [ ] Is there zero private credential leakage into public bundles?
- [ ] Are all environment variables validated at startup via a strict Zod schema?

### 27.7 Quality Checklist
- [ ] Git pre-commit hooks and CI pipelines run `gitleaks` to block any committed secrets.
- [ ] Bootstrap configuration validation aborts container startup if required variables are missing.

### 27.8 Security Considerations
- Leaking private environment variables to client bundles is a severe security breach. Automated CI scans MUST parse generated Next.js client bundles for potential secrets.
- In production, inject environment variables directly into Kubernetes Pod specs from Kubernetes Secrets backed by Vault.

### 27.9 Performance Considerations
- Parse and validate environment variables once during application initialization; do not read or re-parse `process.env` on every request.
- Freeze the validated configuration object (`Object.freeze()`) to prevent runtime tampering.

### 27.10 Future Scalability
- Centralized, validated environment configuration ensures seamless portability across development, staging, canary, and multi-region production cloud environments.

---

# SECTION 28: IMPORT RULES

### 28.1 Purpose
Import Rules govern the structure, ordering, and paths of module dependencies across the Explore Bharat Safar monorepo, eliminating circular references and brittle relative paths.

### 28.2 Rules
1. **Path Aliases Mandatory**: Deep relative import paths (e.g., `../../../../services/user.service`) are strictly prohibited. Code MUST use configured TypeScript path aliases:
   - Shared packages: `@ebs/types`, `@ebs/validators`, `@ebs/ui`, `@ebs/database`
   - Application modules: `@/features/*`, `@/components/*`, `@/lib/*`
2. **Deterministic Import Ordering**: Imports MUST be grouped and ordered alphabetically within groups:
   - Group 1: Node.js standard built-ins (`node:fs`, `node:path`)
   - Group 2: External third-party packages (`react`, `next`, `@nestjs/common`)
   - Group 3: Monorepo shared packages (`@ebs/types`, `@ebs/validators`)
   - Group 4: Internal feature and component aliases (`@/features/...`)
   - Group 5: Relative local imports (`./sub-component`, `./utils`)
   - Group 6: Style imports (`./styles.css`)
3. **Type-Only Imports**: TypeScript types, interfaces, and DTO contracts MUST be imported using the explicit `import type` syntax (e.g., `import type { Village } from '@ebs/types'`).
4. **No Side-Effect Imports**: Imports that execute side effects upon evaluation (e.g., `import './init'`) are prohibited, except for root polyfills and global CSS imports.

### 28.3 Best Practices
- Enable automated import organization via ESLint (`eslint-plugin-import`) and Prettier.
- Avoid importing entire monolithic namespaces (e.g., `import * as Lodash from 'lodash'`); import specific named functions to enable tree-shaking.
- Keep import blocks clean and prune unused imports automatically on save.

### 28.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  ```typescript
  import type { VillageId } from '@ebs/types';
  import { useState } from 'react';
  import { Button } from '@ebs/ui';
  import { useVillageDetails } from '@/features/villages';
  ```
- *Conceptual Negative Pattern*:
  ```typescript
  import { VillageId } from '../../../../../packages/types/src/index';
  import * as React from 'react';
  import './side-effect-script';
  ```

### 28.5 Common Mistakes
- Using fragile relative paths that break when files are moved within the project hierarchy.
- Forgetting `import type`, causing TypeScript types to be retained in JavaScript compilation output, increasing bundle sizes.
- Mixing import statements randomly throughout the file instead of placing them at the top.

### 28.6 Review Checklist
- [ ] Are all non-local imports using configured `@ebs/*` or `@/*` path aliases?
- [ ] Are imports organized into the six standard deterministic groups?
- [ ] Are types imported exclusively via `import type`?
- [ ] Are there zero side-effect imports outside root entrypoints?

### 28.7 Quality Checklist
- [ ] ESLint rules `import/order` and `@typescript-eslint/consistent-type-imports` run as blocking CI errors.
- [ ] Unused import detection (`eslint-plugin-unused-imports`) removes dead imports automatically.

### 28.8 Security Considerations
- Path aliases prevent path traversal and arbitrary file inclusion vulnerabilities in dynamic import scenarios.
- Strict import ordering makes unauthorized or suspicious third-party package imports stand out immediately during code reviews.

### 28.9 Performance Considerations
- Type-only imports (`import type`) are completely stripped by the TypeScript compiler, ensuring zero impact on bundle sizes.
- Proper named imports enable Webpack and Rollup to perform aggressive dead-code elimination (tree-shaking).

### 28.10 Future Scalability
- Clean path aliases allow internal folder structures to be refactored or extracted into independent repositories without breaking consumers.

---

# SECTION 29: EXPORT RULES

### 29.1 Purpose
Export Rules standardize how modules, features, and packages expose their capabilities, ensuring robust tree-shaking, predictable refactoring, and clear public API boundaries.

### 29.2 Rules
1. **Named Exports Mandatory**: All code modules, services, utilities, and components MUST use explicit Named Exports (e.g., `export const VillageCard = ...`).
2. **Default Exports Restricted**: Default exports (`export default`) are strictly prohibited, except where mandated by framework routing conventions (e.g., Next.js `page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`).
3. **Feature Barrel Containment**: Every feature directory MUST expose an `index.ts` file that acts as its public API gatekeeper. Only symbols intended for external consumption may be exported from `index.ts`.
4. **No Wildcard Re-exports**: Wildcard re-exports (`export * from './internal'`) are strictly prohibited in public packages to prevent unintentional exposure of private internal helpers and breaking tree-shaking.
5. **Explicit Export Contracts**: Packages in `packages/*` MUST explicitly define their entrypoints and exports within `package.json` using the standard `exports` field.

### 29.3 Best Practices
- Keep barrel files (`index.ts`) lean to prevent accidental circular dependencies and bundler bloat.
- Export types and interfaces alongside the concrete implementations that satisfy them.
- Use explicit named aliases when resolving export naming collisions.

### 29.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  - Component export: `export const DestinationCard = (props: DestinationCardProps) => { ... };`
  - Feature public barrel: `export { DestinationCard } from './components/DestinationCard'; export type { DestinationCardProps } from './types';`
- *Conceptual Negative Pattern*:
  - Anonymous default export: `export default function(props) { ... };`
  - Wildcard leak: `export * from './all-internal-helpers';`

### 29.5 Common Mistakes
- Using default exports for components, which allows different developers to import them under arbitrary, conflicting names (e.g., `import Foo from './DestinationCard'` vs `import Bar from './DestinationCard'`).
- Exporting internal utility functions from package entrypoints, making them impossible to change without breaking downstream consumers.
- Creating massive root barrel files that import and re-export the entire application, destroying bundler tree-shaking.

### 29.6 Review Checklist
- [ ] Are named exports used exclusively (except for Next.js App Router route files)?
- [ ] Are all public feature interfaces exported cleanly through the feature's `index.ts`?
- [ ] Are there zero wildcard re-exports (`export *`) in public packages?
- [ ] Does `package.json` define explicit `exports` maps for shared packages?

### 29.7 Quality Checklist
- [ ] ESLint rule `import/no-default-export` is enabled across all non-route files.
- [ ] Tree-shaking verification tests ensure unused named exports are excluded from production bundles.

### 29.8 Security Considerations
- Explicit exports prevent private cryptographic routines, admin helpers, or database clients from being accidentally exposed to client-side bundles.
- Limits the attack surface by enforcing strict public interface contracts for each module.

### 29.9 Performance Considerations
- Named exports enable bundlers (Turbopack, esbuild, Rollup) to perform precise static analysis and eliminate unused code.
- Prevents loading unnecessary module graphs into memory during server startup.

### 29.10 Future Scalability
- Strict export boundaries allow internal refactorings to proceed safely without fear of breaking external consumers relying on uncontracted internal files.

---

# SECTION 30: MODULE BOUNDARY RULES

### 30.1 Purpose
Module Boundary Rules enforce architectural encapsulation between monorepo packages, preventing spaghetti dependencies and ensuring that modules can be developed, tested, and extracted independently.

### 30.2 Rules
1. **Unidirectional Dependency Flow**: Dependencies MUST flow strictly from outer applications (`apps/*`) to shared infrastructure (`packages/*`) to domain core (`packages/types`). Reverse dependencies are strictly prohibited.
2. **No Sibling App Dependencies**: Applications in `apps/*` (e.g., `apps/web` and `apps/api`) MUST NEVER import code directly from each other. Shared logic MUST reside in `packages/*`.
3. **Domain Boundary Isolation**: Domain modules inside `apps/api` (e.g., Discovery, Village, Booking, Social) MUST interact only via defined public services or domain event buses, never reaching directly into another module's database tables or internal repositories.
4. **Boundary Verification in CI**: Module boundaries MUST be statically validated on every pull request using automated dependency analysis tools (`dependency-cruiser`).

### 30.3 Best Practices
- Define clear boundaries in `turbo.json` and enforce package workspaces via `pnpm-workspace.yaml`.
- Use TypeScript project references to enforce compile-time project boundaries.
- Treat every internal package in `packages/*` as if it were an open-source library published to a private registry.

### 30.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `apps/web` imports DTOs from `@ebs/types` and UI components from `@ebs/ui`. `apps/api` imports database access from `@ebs/database`. Neither app imports from the other.
- *Conceptual Negative Pattern*: `apps/web` directly imports a database utility file from `apps/api/src/modules/booking/booking.service.ts`.

### 30.5 Common Mistakes
- Bypassing module boundaries by using relative paths like `../../apps/api/src/...`.
- Creating a shared package that depends on a deployable application package.
- Allowing domain modules to execute cross-boundary SQL joins across separate database schemas.

### 30.6 Review Checklist
- [ ] Does the change respect the unidirectional package hierarchy?
- [ ] Are applications completely isolated from each other?
- [ ] Is cross-domain communication handled via public interfaces or event buses?
- [ ] Does `dependency-cruiser` pass with zero boundary violations?

### 30.7 Quality Checklist
- [ ] Automated dependency graph validation fails CI if any forbidden cross-boundary import is detected.
- [ ] Turborepo task graph confirms an acyclic build pipeline.

### 30.8 Security Considerations
- Isolating module boundaries ensures that a security breach in a low-trust domain (e.g., public social feed) cannot compromise a high-trust domain (e.g., payment ledger).
- Prevents database credentials from being imported into frontend client applications.

### 30.9 Performance Considerations
- Clean boundaries enable Turborepo to cache build and test outputs with high granularity, rebuilding only the packages that have actually changed.
- Prevents circular dependency resolution overhead during application runtime startup.

### 30.10 Future Scalability
- Cleanly isolated modules can be decoupled and deployed as independent microservices or serverless functions in less than 48 hours without refactoring business logic.

---

# SECTION 31: DEPENDENCY RULES

### 31.1 Purpose
Dependency Rules govern the introduction, versioning, and management of internal and external software dependencies across Explore Bharat Safar, preventing dependency hell, bloat, and supply-chain vulnerabilities.

### 31.2 Rules
1. **Explicit Manifest Declarations**: Every package and application MUST explicitly declare all direct dependencies in its local `package.json`. Relying on phantom dependencies hoisted to the monorepo root is strictly prohibited.
2. **Exact Version Pinning**: Production dependencies MUST be pinned to exact semantic versions (e.g., `"react": "18.3.1"`). Floating version ranges (`^` or `~`) are strictly prohibited for production dependencies to prevent unexpected upstream breaking changes.
3. **Workspace Protocol for Internal Packages**: Internal package dependencies MUST use the pnpm workspace protocol: `"@ebs/types": "workspace:*"`.
4. **Zero Unapproved Dependencies**: Adding any new external dependency requires review against the Third-Party Library Policy (Section 65) and approval from the Technical Director.

### 31.3 Best Practices
- Run `pnpm audit` regularly to detect known vulnerabilities in the dependency tree.
- Use Renovate or Dependabot with automated CI verification for scheduled dependency updates.
- Prune unused dependencies continuously using `depcheck`.

### 31.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `"dependencies": { "zod": "3.23.8", "@ebs/validators": "workspace:*" }`
- *Conceptual Negative Pattern*: `"dependencies": { "zod": "^3.0.0", "left-pad": "latest" }`

### 31.5 Common Mistakes
- Importing a package in `apps/web` that is only declared in the root `package.json`, causing subtle build failures in container environments.
- Using `*` or `latest` for third-party production dependencies.
- Installing massive libraries to use a single helper function (e.g., installing all of Moment.js instead of native Date APIs or date-fns).

### 31.6 Review Checklist
- [ ] Are all dependencies explicitly declared in the local package's `package.json`?
- [ ] Are external production dependencies pinned to exact versions?
- [ ] Are internal monorepo dependencies using `workspace:*`?
- [ ] Has any newly introduced library been vetted against the third-party policy?

### 31.7 Quality Checklist
- [ ] CI pipeline validates pnpm lockfile consistency with `--frozen-lockfile`.
- [ ] Dependency linters confirm zero phantom dependencies across all workspace packages.

### 31.8 Security Considerations
- Exact version pinning and frozen lockfiles protect the build pipeline against malicious upstream supply-chain tampering and poisoned package updates.
- Automated security scanning with Trivy and Snyk verifies all dependencies against the National Vulnerability Database (NVD).

### 31.9 Performance Considerations
- Pinned, deduplicated dependencies reduce total install times and disk footprint across CI runners and developer workstations.
- Prevents shipping multiple conflicting versions of the same library (e.g., two versions of React) in the client bundle.

### 31.10 Future Scalability
- Deterministic, lockfile-enforced dependencies ensure reproducible builds across any cloud environment, whether building today or five years in the future.

---

# SECTION 32: CODE ORGANIZATION

### 32.1 Purpose
Code Organization standards define the standard internal directory layout for all deployable applications and shared packages, ensuring instant familiarity for any engineer working across any repository subsystem.

### 32.2 Rules
1. **Standard Application Layout (`apps/web` & `apps/api`)**:
   - `src/`: Root of all source code.
   - `src/app/`: Next.js App Router pages and layouts, or NestJS application modules.
   - `src/features/`: Vertical domain feature slices.
   - `src/components/`: App-specific UI components (not yet generalized to `@ebs/ui`).
   - `src/lib/`: App-specific utility singletons (API client, telemetry bootstrap).
   - `src/styles/`: Global stylesheets and Tailwind configurations.
2. **Standard Shared Package Layout (`packages/*`)**:
   - `src/`: Pure TypeScript source files.
   - `src/index.ts`: Authoritative public export barrel.
   - `__tests__/`: Unit and integration test suites.
   - `package.json`: Manifest defining entrypoints, exports, and dependencies.
   - `tsconfig.json`: TypeScript configuration extending root base.
3. **Test Co-location**: Unit tests MUST be co-located right next to the code file they test (e.g., `user.service.ts` and `user.service.spec.ts`).

### 32.3 Best Practices
- Keep root configuration files clean, delegating package-specific configs to individual packages.
- Maintain an `ADR/` (Architecture Decision Records) folder within `docs/` for historical decision tracking.
- Group large features into logical sub-modules before they become unmanageable.

### 32.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  ```
  apps/web/src/features/destinations/
  ├── components/
  │   ├── DestinationHero.tsx
  │   └── DestinationHero.test.tsx
  ├── hooks/
  │   └── useDestinationFilter.ts
  ├── types/
  │   └── index.ts
  └── index.ts
  ```
- *Conceptual Negative Pattern*: A single `src/` directory containing 80 mixed files with no categorization, where components, tests, CSS, and database queries sit in the same folder.

### 32.5 Common Mistakes
- Creating an arbitrary folder structure for each new feature, breaking workspace consistency.
- Separating tests into an isolated top-level directory distant from the source files, discouraging engineers from updating tests when refactoring.
- Placing temporary experimental files in production source trees.

### 32.6 Review Checklist
- [ ] Does the directory layout conform strictly to the standard application or package layout?
- [ ] Are unit tests co-located with their target source files?
- [ ] Are shared packages organized with clean `src/` and `src/index.ts` entrypoints?
- [ ] Are configuration files organized consistently across all packages?

### 32.7 Quality Checklist
- [ ] Repository structure linters verify directory hierarchy against the architecture blueprint.
- [ ] CI ensures that build scripts operate uniformly across all packages via Turborepo pipelines.

### 32.8 Security Considerations
- Consistent layout makes unauthorized configuration files, rogue endpoints, or shadow scripts immediately identifiable during security audits.
- Ensures test files and development mocks are isolated and never compiled into production artifacts.

### 32.9 Performance Considerations
- Predictable structure allows build tools to configure targeted cache boundaries and parallelize builds efficiently.
- Speeds up IDE file indexing and autocomplete response times.

### 32.10 Future Scalability
- A uniform codebase structure allows engineering teams to rotate between squads or onboard new engineers with zero ramp-up time regarding codebase layout.

---

# SECTION 33: SHARED CODE RULES

### 33.1 Purpose
Shared Code Rules govern the lifecycle, eligibility, and governance of code that is shared across multiple applications and features, preventing premature generalization and bloated "common" buckets.

### 33.2 Rules
1. **Rule of Three**: Code MUST NOT be extracted into a shared package (`packages/*`) until it is actively required by at least three independent features or applications. Premature sharing is the root of bad abstractions.
2. **Domain Agnosticism for Shared Utilities**: Shared packages (like `@ebs/ui` or `@ebs/gis-core`) MUST remain strictly domain-agnostic. They MUST NOT contain business rules specific to a single feature.
3. **Zero Circular Dependencies Between Shared Packages**: Shared packages MUST maintain a strict hierarchy (e.g., `@ebs/validators` may import `@ebs/types`, but `@ebs/types` can NEVER import `@ebs/validators`).
4. **Semantic Versioning and Change Impact**: Any change to a shared package in `packages/*` MUST be evaluated for backward compatibility across all consuming applications.

### 33.3 Best Practices
- When sharing domain logic, place it in `@ebs/types` or a dedicated bounded domain package, not in a generic "utils" folder.
- Maintain comprehensive unit test suites for all shared code, targeting 100% test coverage.
- Provide clear TSDoc documentation and usage examples for all shared components and utilities.

### 33.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A mathematical utility that computes Harvesine distance between two coordinates is required by the Bharat Discovery Engine, the Village Knowledge System, and the Booking Distance Calculator. It is properly extracted into `@ebs/gis-core` with exhaustive unit tests.
- *Conceptual Negative Pattern*: Extracting a `VillageCard` component with hardcoded village database queries into `@ebs/ui` simply because a developer thought "maybe someone else will use this card someday."

### 33.5 Common Mistakes
- Creating a generic `packages/common` or `packages/utils` dumping ground that accumulates hundreds of unrelated, unmaintained functions.
- Modifying a shared package to fix an issue in App $A$ while inadvertently breaking App $B$ and App $C$.
- Adding heavy third-party dependencies to a shared package, forcing all consumers to bundle those dependencies.

### 33.6 Review Checklist
- [ ] Does the shared code satisfy the Rule of Three or represent an authoritative shared contract?
- [ ] Is the shared code completely free of feature-specific business logic?
- [ ] Does the change maintain zero circular dependencies between shared packages?
- [ ] Are all consuming applications tested against the updated shared code?

### 33.7 Quality Checklist
- [ ] 100% unit test coverage for all functions in shared packages.
- [ ] Turborepo runs integration tests across all downstream consumer apps whenever a shared package is modified.

### 33.8 Security Considerations
- Security flaws in shared code propagate to every application across the enterprise. Shared packages MUST undergo rigorous security code reviews and automated SAST analysis.
- Shared packages must never embed hardcoded secrets, internal IP addresses, or environment-specific credentials.

### 33.9 Performance Considerations
- Shared packages MUST be strictly tree-shakeable, ensuring consuming applications only bundle the exact functions they import.
- Avoid large monolithic shared bundles; prefer modular, fine-grained entrypoints.

### 33.10 Future Scalability
- High-quality, decoupled shared packages can eventually be published to private npm registries and consumed by external partner applications or native mobile development teams.

---

# SECTION 34: REUSABLE COMPONENT RULES

### 34.1 Purpose
Reusable Component Rules govern the creation and maintenance of design system components in `@ebs/ui`, ensuring visual consistency, complete accessibility, and zero business-logic coupling across the platform.

### 34.2 Rules
1. **Zero Business Logic Coupling**: Components in `@ebs/ui` MUST be 100% presentation-focused. They MUST NOT import application-specific services, API clients, database models, or business state.
2. **Design Token Compliance**: All colors, typography, border radii, shadows, and spacing MUST use the centralized Tailwind design tokens defined in `06-styleguide.md`. Hardcoded CSS hex colors or arbitrary pixel values are strictly forbidden.
3. **Accessibility First (WCAG 2.1 AA)**: Every reusable component MUST be accessible out of the box: supporting full keyboard navigation (`Tab`, `Enter`, `Space`, `Escape`), proper ARIA roles, focus visible indicators, and high contrast.
4. **Radix Primitive Core**: Interactive components (Dialogs, Dropdowns, Tooltips, Accordions, Tabs) MUST wrap Radix UI headless primitives rather than custom unvetted DOM manipulation.
5. **Variant Management via `cva`**: Component visual variants MUST be managed using Class Variance Authority (`cva`) for deterministic, type-safe Tailwind class composition.

### 34.3 Best Practices
- Expose a `ref` prop forwarding to the underlying HTML element using `React.forwardRef`.
- Allow consumers to pass custom classes via an optional `className` prop, merged safely using `clsx` and `tailwind-merge`.
- Document every reusable component in Storybook with visual examples for all variants, sizes, and states.

### 34.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An accessible `Button` component created with `cva` supporting variants (`primary`, `secondary`, `destructive`), sizes (`sm`, `md`, `lg`), and an `isLoading` spinner state, forwarding DOM refs and handling focus rings.
- *Conceptual Negative Pattern*: A `CustomButton` that contains an inline `onClick` handler that calls `fetch('/api/v1/book')` and has hardcoded styles `style={{ backgroundColor: '#FF9933' }}`.

### 34.5 Common Mistakes
- Adding business-specific props (e.g., `villageData` or `bookingId`) to a generic UI component.
- Overriding Radix accessibility behaviors, breaking keyboard focus trapping or screen reader announcements.
- Neglecting to provide disabled and focus-visible states for interactive elements.

### 34.6 Review Checklist
- [ ] Is the component completely decoupled from business logic and application state?
- [ ] Are all styles derived from official design tokens without hardcoded values?
- [ ] Does the component meet WCAG 2.1 AA accessibility standards?
- [ ] Are variants managed cleanly via Class Variance Authority (`cva`)?
- [ ] Does the component forward refs cleanly to the underlying DOM node?

### 34.7 Quality Checklist
- [ ] Automated accessibility audits (`@axe-core/playwright`) pass with zero violations on all component stories.
- [ ] Visual regression tests (Playwright visual comparisons) verify styling across light and dark themes.

### 34.8 Security Considerations
- Reusable components that render text or children MUST NOT bypass React's built-in XSS protection.
- Ensure custom icon or SVG rendering components validate SVG markup against malicious script injection vectors.

### 34.9 Performance Considerations
- Headless, token-based components generate zero runtime CSS-in-JS overhead; styles are compiled into static atomic CSS classes.
- Ensure component icons are imported individually to prevent bundling entire icon font libraries.

### 34.10 Future Scalability
- A pristine design system allows the entire platform to undergo complete visual rebrands or theme overhauls simply by modifying central design tokens, without touching component logic.

---

# SECTION 35: FEATURE ISOLATION

### 35.1 Purpose
Feature Isolation ensures that each major business feature within Explore Bharat Safar operates as an autonomous, self-contained unit that can be developed, tested, and modified without creating ripple effects in other features.

### 35.2 Rules
1. **Autonomous Vertical Slices**: Each feature directory MUST encapsulate its own UI, state, services, validation schemas, and unit tests.
2. **Explicit Public Interface**: External features MUST interact with a feature solely through its root `index.ts` file. Deep imports into another feature's internal directories are strictly forbidden and blocked by linter rules.
3. **Decoupled Cross-Feature Communication**: Features MUST communicate via loosely coupled mechanisms: shared domain events, URL query parameters, or state lifted to shared parent layouts. Direct synchronous coupling between features is prohibited.
4. **Feature Toggles for Progressive Rollout**: Major new features MUST be wrapped in feature toggles, allowing them to be enabled or disabled dynamically without deploying new code.

### 35.3 Best Practices
- Design features so that deleting a feature directory cleanly removes the feature from the application with minimal edits to route registration files.
- Avoid shared mutable state between features; favor message passing or event-driven updates.
- Keep feature-specific constants and types internal to that feature unless three or more features require them.

### 35.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: The `village-registry` feature publishes a `VillageSelectedEvent` to the client event bus. The `map-engine` feature subscribes to this event and flies the camera to the village coordinates, with zero direct dependency between the two feature modules.
- *Conceptual Negative Pattern*: The `village-registry` component directly imports `mapInstance` from `map-engine/internal/webgl-canvas.ts` and mutates its internal camera state directly.

### 35.5 Common Mistakes
- Tight coupling where Feature $A$ cannot compile or pass unit tests without importing Feature $B$.
- Sharing database transactions across multiple feature services, creating massive lock contention and tight database coupling.
- Creating hidden dependencies between features via untyped global window objects.

### 35.6 Review Checklist
- [ ] Is the feature completely self-contained within its vertical directory?
- [ ] Are all cross-feature interactions mediated through public contracts or event buses?
- [ ] Can the feature be enabled or disabled via feature flags?
- [ ] Do unit tests for this feature execute with all other features mocked or detached?

### 35.7 Quality Checklist
- [ ] ESLint boundary rules prevent unauthorized imports between feature directories.
- [ ] Feature toggle integration tests verify application stability in both enabled and disabled states.

### 35.8 Security Considerations
- Feature isolation ensures that vulnerabilities or compromised dependencies within one feature cannot access or manipulate the memory space and data of another feature.
- Enables granular permission checks and feature-level access gating at the feature boundary.

### 35.9 Performance Considerations
- Isolated features enable Next.js to code-split and lazy-load JavaScript chunks, delivering lightning-fast initial page loads.
- Prevents unused feature code from bloating the critical rendering path.

### 35.10 Future Scalability
- Fully isolated features provide the blueprint for organizational scaling, allowing independent engineering squads to own and deploy distinct features with zero merge conflicts.

---


# PART III: STATE, RESILIENCE, SECURITY, PERFORMANCE & UX STANDARDS

# SECTION 36: STATE MANAGEMENT STANDARDS

### 36.1 Purpose
State Management Standards govern the distribution, lifecycle, and synchronization of data across client and server tiers in Explore Bharat Safar, preventing state duplication, cache desynchronization, and memory leaks.

### 36.2 Rules
1. **Server State vs. Client State Segregation**: Server state (data stored in PostgreSQL / Redis) MUST be managed using React Server Components (RSC) and TanStack Query (React Query). Never duplicate server records into global client stores (e.g., Redux or Zustand).
2. **URL as the Primary Source of Truth**: Shareable UI state—such as active map coordinates, search filters, pagination offsets, and selected modal IDs—MUST be serialized into URL search parameters (`searchParams`).
3. **Minimal Local Client State**: Ephemeral UI state (e.g., dropdown open/close, active tab index, form draft inputs) MUST remain local to the component using `useState` or `useReducer`.
4. **Zustand for App-Wide Client Coordination**: Where cross-component client state is strictly necessary (e.g., audio guide player state, offline sync queue), lightweight Zustand stores MUST be used. Redux is strictly prohibited due to boilerplate and bundle size overhead.
5. **State Mutation via Server Actions / Route Handlers**: Mutations MUST execute on the server via Next.js Server Actions or NestJS REST routes with optimistic updates managed through TanStack Query or React `useOptimistic`.

### 36.3 Best Practices
- Keep state as close to the consuming leaf component as possible.
- Normalize complex relational client data into key-by-ID maps rather than deeply nested arrays.
- Implement explicit cache invalidation tags (`revalidateTag`) to guarantee immediate consistency after mutations.

### 36.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Destination search filters are read from URL search parameters `?state=kerala&category=trekking`. Selecting a filter updates the URL, triggering a streaming server component refresh. The client holds zero duplicate filter state.
- *Conceptual Negative Pattern*: Storing destinations, user profile, cart items, and active UI modals all in a monolithic, un-normalized Redux store with 40 actions and reducers.

### 36.5 Common Mistakes
- Syncing server data into local `useState` via `useEffect`, causing desynchronization bugs and race conditions.
- Storing transient UI flags in global stores, making components difficult to test and reuse.
- Forgetting to encode/decode URL search parameters properly, breaking on special characters.

### 36.6 Review Checklist
- [ ] Is server state managed via RSC and TanStack Query rather than client stores?
- [ ] Is shareable filter and navigation state stored in the URL?
- [ ] Is client-only state kept strictly local or managed via small Zustand stores?
- [ ] Are mutations followed by appropriate cache invalidation?

### 36.7 Quality Checklist
- [ ] State persistence tests verify that URL parameters correctly reconstruct view states.
- [ ] Store unit tests verify state transitions without mounting full React trees.

### 36.8 Security Considerations
- Never store sensitive authentication tokens, unmasked PII, or financial payment details in client-side global state or `localStorage`.
- Sanitize state read from URL parameters to prevent DOM-based XSS attacks.

### 36.9 Performance Considerations
- Minimizing global client state eliminates unnecessary whole-tree React re-renders.
- URL-driven state leverages browser HTTP caching and edge-rendered ISR caches effectively.

### 36.10 Future Scalability
- Clean separation between server and client state enables instant compatibility with React Server Actions, Streaming SSR, and offline PWA service worker caching.

---

# SECTION 37: ERROR HANDLING STANDARDS

### 37.1 Purpose
Error Handling Standards ensure that exceptions and system failures across Explore Bharat Safar are captured, categorized, safely communicated to users, and comprehensively recorded for engineering root-cause analysis without leaking sensitive system internals.

### 37.2 Rules
1. **Domain Exception Hierarchy**: All business errors MUST inherit from a base `DomainException` class, carrying an immutable machine-readable error code, HTTP status mapping, and sanitized user message.
2. **RFC 7807 Problem Details Envelopes**: All API error responses MUST strictly adhere to the RFC 7807 Problem Details standard:
   ```json
   {
     "type": "https://api.explorebharatsafar.in/errors/INSUFFICIENT_SLOT_CAPACITY",
     "title": "Insufficient Slot Capacity",
     "status": 409,
     "detail": "Requested batch has only 2 slots remaining, but 4 were requested.",
     "instance": "/api/v1/experience-batches/eb_123/lock",
     "correlationId": "ebs-trace-98765"
   }
   ```
3. **No Uncaught Exceptions in Production**: Every route handler, server action, and background worker MUST be wrapped in global exception filters. Uncaught exceptions MUST be caught, logged with stack traces internally, and returned to clients as sanitized `500 Internal Server Error` envelopes.
4. **React Error Boundaries**: UI routes and dynamic islands MUST be wrapped in React Error Boundaries (`error.tsx`), providing contextual fallback UI with retry triggers rather than crashing the entire page.
5. **No Swallowed Exceptions**: Empty `catch` blocks or logging an error without rethrowing or handling it are strictly prohibited.

### 37.3 Best Practices
- Distinguish between Operational Errors (expected business failures: slot full, invalid phone) and Programmer Errors (bugs, null dereference, unhandled network drop).
- Preserve original error causality using the ES2022 `Error.cause` property.
- Include the distributed correlation ID (`x-correlation-id`) in every user-facing error message to assist support triage.

### 37.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An invalid booking attempt throws `SlotCapacityExceededException('Capacity full', { batchId, requestedSlots })`. The global NestJS exception filter intercepts it, emits a structured error log, and returns a 409 RFC 7807 envelope.
- *Conceptual Negative Pattern*: A `try-catch` block that catches `any` error, executes `console.log(err)`, and returns `res.status(200).json({ success: false, message: 'something failed' })`.

### 37.5 Common Mistakes
- Returning raw database stack traces or SQL syntax errors to the client, exposing schema topology to attackers.
- Throwing plain strings or untyped objects (e.g., `throw 'Error occurred'`).
- Silently failing inside background workers, causing tasks to vanish without retry or dead-letter queue escalation.

### 37.6 Review Checklist
- [ ] Do business exceptions inherit from standard domain error classes?
- [ ] Are API error responses compliant with RFC 7807 Problem Details?
- [ ] Do React UI routes have functional `error.tsx` fallback boundaries?
- [ ] Are stack traces and internal identifiers completely stripped from user responses?

### 37.7 Quality Checklist
- [ ] Automated integration tests verify that all documented error codes are correctly returned under failure conditions.
- [ ] Static analysis tools flag any empty `catch` blocks or bare `console.error` calls.

### 37.8 Security Considerations
- Information disclosure via verbose error messages is a critical OWASP vulnerability. Stack traces, database connection strings, and server file paths MUST NEVER be sent to clients.
- Rate-limit error-generating endpoints (e.g., login, PIN verification) to prevent brute-force enumeration.

### 37.9 Performance Considerations
- Avoid using exceptions for normal, predictable control flow; exceptions should indicate exceptional conditions.
- Error boundary rendering should be lightweight and avoid triggering secondary cascading data fetches.

### 37.10 Future Scalability
- Standardized RFC 7807 problem details allow multi-platform client applications (web, iOS, Android, partner APIs) to parse and handle errors programmatically with zero ambiguity.

---

# SECTION 38: LOGGING STANDARDS

### 38.1 Purpose
Logging Standards define structured, asynchronous, and high-performance observability practices across Explore Bharat Safar, enabling real-time debugging, automated alerting, and audit compliance across millions of daily operations.

### 38.2 Rules
1. **Structured JSON Exclusively**: All logs MUST be output as structured JSON to `stdout` via Pino or OpenTelemetry logger. Plain-text unstructured strings and `console.log()` are strictly prohibited in production code.
2. **Mandatory Log Schema Attributes**: Every log entry MUST include the following standard metadata:
   - `timestamp`: ISO 8601 UTC string.
   - `level`: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
   - `service`: Service name (e.g., `apps/api`, `apps/worker`).
   - `correlationId`: Distributed trace ID (`x-correlation-id`).
   - `context`: Class, module, or feature context.
   - `message`: Clear, human-readable description of the event.
3. **Zero PII Logging Mandate (DPDP Act Compliance)**: Personally Identifiable Information (PII)—including Aadhaar numbers, PAN numbers, full mobile numbers, email addresses, passwords, credit card numbers, and bank account details—MUST NEVER be logged. Sensitive fields MUST be redacted using automated masking filters.
4. **Log Level Discipline**:
   - `error`: Unexpected exceptions, system crashes, data corruption, payment gateway downtime.
   - `warn`: Recoverable anomalies, fallback activation, slow query warnings, rate-limit thresholds reached.
   - `info`: Key business milestones (e.g., `BookingConfirmed`, `BatchOpened`, `PaymentInitiated`).
   - `debug` / `trace`: Fine-grained operational diagnostics, strictly disabled in production.

### 38.3 Best Practices
- Log at the start and end of critical state mutations with duration metrics.
- Pass error objects directly into the logger rather than converting them to strings to preserve stack traces in JSON format.
- Configure log aggregation (e.g., Grafana Loki, AWS CloudWatch, Datadog) to parse structured fields for alerting.

### 38.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `logger.info({ correlationId, batchId, slotCount, durationMs }, 'Experience slots successfully locked');`
- *Conceptual Negative Pattern*: `console.log('User ' + user.name + ' with phone ' + user.phone + ' paid with password ' + user.password);`

### 38.5 Common Mistakes
- Leaving `console.log()` statements scattered throughout application code.
- Logging full HTTP request headers, inadvertently capturing `Authorization` bearer tokens and session cookies.
- Emitting millions of `debug` logs per minute in production, degrading CPU throughput and exhausting log storage budgets.

### 38.6 Review Checklist
- [ ] Are all logs structured JSON emitted via the centralized logger?
- [ ] Is the log level appropriate for the event's operational importance?
- [ ] Are all PII fields (mobile, email, identity documents) completely masked or omitted?
- [ ] Is the distributed `correlationId` attached to all logs?

### 38.7 Quality Checklist
- [ ] Automated CI scanner detects and blocks any commit containing `console.log`.
- [ ] Automated PII redaction test suite verifies that logging sensitive DTOs redacts all protected fields.

### 38.8 Security Considerations
- Logging plaintext credentials or session tokens allows anyone with log reader permissions to hijack accounts.
- Automated secret-masking filters must run at the logging transport layer to catch accidental leaks.

### 38.9 Performance Considerations
- Pino performs asynchronous logging via worker threads to ensure logging operations never block the event loop.
- Production log level MUST be set to `info` or above to maintain sub-millisecond execution overhead.

### 38.10 Future Scalability
- OpenTelemetry-compliant structured logs allow seamless integration with distributed tracing collectors and APM platforms as the system scales to millions of users.

---

# SECTION 39: VALIDATION STANDARDS

### 39.1 Purpose
Validation Standards establish fail-fast, schema-driven input validation across all network and process boundaries in Explore Bharat Safar, preventing malformed data, schema corruption, and injection attacks.

### 39.2 Rules
1. **Zod as the Single Validation Authority**: All runtime validation MUST be executed using Zod schemas (`packages/validators`). Manual `if-else` type validation or legacy validator libraries (e.g., Joi, class-validator) are prohibited.
2. **Boundary Validation Mandate**: Every piece of data entering the system—HTTP request bodies, query parameters, route segments, Server Action inputs, environment variables, WebSocket messages, and queue payloads—MUST be validated before any business logic executes.
3. **Fail-Fast Policy**: Invalid inputs MUST be rejected immediately with an RFC 7807 `400 Bad Request` or `422 Unprocessable Entity` response detailing specific field-level validation errors.
4. **Strict Schema Constraints**: Schemas MUST enforce strict constraints (e.g., `.min()`, `.max()`, `.regex()`, `.trim()`, `.email()`). Use `.strict()` on object schemas to reject unexpected, unauthorized properties (preventing mass assignment).
5. **Sanitization Within Validation**: Data sanitization (stripping HTML tags, trimming whitespace, normalizing casing) MUST be declared directly within the Zod schema transformation pipeline.

### 39.3 Best Practices
- Share validation schemas between frontend forms (React Hook Form + `@hookform/resolvers/zod`) and backend NestJS validation pipes.
- Derive TypeScript types directly from schemas via `z.infer<typeof Schema>` to guarantee 100% type-schema synchronization.
- Provide clear, user-friendly, localized error messages within schema declarations.

### 39.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A schema validating an Indian mobile number: `z.string().trim().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')`.
- *Conceptual Negative Pattern*: An API controller accepting an untyped object and checking `if (!req.body.phone) return error;` with no length, format, or injection sanitization.

### 39.5 Common Mistakes
- Validating data on the client side only, leaving server API endpoints vulnerable to forged curl requests.
- Using loose schemas like `z.any()` or `z.record(z.unknown())` for network inputs.
- Duplicating validation logic across three different layers with slightly different regex patterns.

### 39.6 Review Checklist
- [ ] Is input validation performed at every system boundary using Zod?
- [ ] Are schemas strict and configured to reject unknown properties?
- [ ] Are types derived directly from schemas via `z.infer`?
- [ ] Are validation error responses clear, informative, and formatted as RFC 7807?

### 39.7 Quality Checklist
- [ ] Comprehensive unit tests test validation schemas with positive, negative, and boundary-value inputs.
- [ ] NestJS global `ZodValidationPipe` intercepts and validates all controller parameters automatically.

### 39.8 Security Considerations
- Schema validation is the primary defense against SQL injection, NoSQL injection, buffer overflow, and Cross-Site Scripting (XSS).
- Rejecting unexpected fields via `.strict()` prevents Mass Assignment vulnerabilities where attackers attempt to set privileged fields like `isAdmin: true`.

### 39.9 Performance Considerations
- Zod schemas parse and validate inputs in microseconds. Fast boundary rejection saves database and CPU resources from processing bad requests.
- Compile reusable schemas once at application startup; do not re-instantiate schema objects per request.

### 39.10 Future Scalability
- Universal Zod schemas enable automated generation of OpenAPI specifications and client-side SDK validation across future platforms.

---

# SECTION 40: AUTHENTICATION CODING STANDARDS

### 40.1 Purpose
Authentication Coding Standards establish impenetrable identity verification, token lifecycle management, and session governance across Explore Bharat Safar, adhering to Zero-Trust and DPDP Act security requirements.

### 40.2 Rules
1. **Argon2id Password Hashing**: Passwords MUST be hashed exclusively with Argon2id using industry-standard memory, time, and parallelism parameters. MD5, SHA-1, SHA-256, and bcrypt are strictly forbidden.
2. **Dual-Token Architecture (RS256 JWT + Refresh Tokens)**:
   - Access tokens MUST be short-lived (15 minutes maximum), signed with asymmetric RS256 private keys, and validated with public keys.
   - Refresh tokens MUST be opaque cryptographically random strings (256-bit) stored as hashes in PostgreSQL/Redis with rolling rotation on every use.
3. **HTTP-Only, Secure, SameSite Cookies**: Tokens destined for browser clients MUST be transmitted via `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Never store authentication tokens in `localStorage` or `sessionStorage` (preventing XSS token theft).
4. **Multi-Factor Authentication (MFA)**: Administrative accounts, village moderators, and high-privilege roles MUST enforce TOTP (Time-Based One-Time Password) or SMS OTP multi-factor authentication.
5. **Instant Session Revocation**: The authentication engine MUST support instantaneous session revocation across all active devices by invalidating the user's session token family in Redis.

### 40.3 Best Practices
- Rotate JWT signing keys automatically every 90 days using JWKS (JSON Web Key Set) endpoints.
- Enforce strict rate-limiting on all authentication endpoints (`/auth/login`, `/auth/otp-verify`, `/auth/refresh`) using Redis sliding-window limiters.
- Emit immutable audit logs for all authentication events: logins, failed attempts, password resets, and session revocations.

### 40.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An authentication service verifies credentials via Argon2id, generates an RS256 access JWT containing minimal claims (`sub`, `roles`, `sessionId`), sets it in an `HttpOnly` cookie, and stores the hashed refresh token in Redis with a 7-day TTL.
- *Conceptual Negative Pattern*: Generating a symmetric HS256 JWT with no expiration date containing the user's password hash and full profile, returned in the JSON body and saved in browser `localStorage`.

### 40.5 Common Mistakes
- Storing plaintext tokens in browser web storage, making them trivial to exfiltrate via XSS attacks.
- Using symmetric keys (HS256) shared between auth and API services, where a leak in any service compromises the entire token signing authority.
- Failing to invalidate previous refresh tokens upon token reuse, enabling replay attacks.

### 40.6 Review Checklist
- [ ] Are passwords hashed using Argon2id with verified cost parameters?
- [ ] Are access tokens short-lived ($\le 15\text{ mins}$) and signed with RS256?
- [ ] Are tokens delivered via `HttpOnly`, `Secure`, `SameSite=Strict` cookies?
- [ ] Is instant session revocation implemented via Redis token tracking?

### 40.7 Quality Checklist
- [ ] Security test suite verifies token expiration, signature tampering rejection, and replay detection.
- [ ] Rate-limiting tests confirm authentication endpoints block brute-force attempts after 5 failures.

### 40.8 Security Considerations
- Short token lifespans minimize the window of vulnerability if an access token is intercepted in transit.
- Public key verification allows microservices to validate user identity without possessing the private signing key.

### 40.9 Performance Considerations
- Public key JWT verification occurs entirely in memory without requiring a database query on every HTTP request.
- Redis session lookups execute in sub-millisecond timeframes.

### 40.10 Future Scalability
- Standards-compliant RS256 JWT and JWKS architecture allows Explore Bharat Safar to act as an OpenID Connect (OIDC) identity provider for future government tourism and civic integrations.

---

# SECTION 41: AUTHORIZATION STANDARDS

### 41.1 Purpose
Authorization Standards govern access control across Explore Bharat Safar, ensuring that every authenticated actor can only access or mutate resources they are explicitly permitted to manage under Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).

### 41.2 Rules
1. **Default Deny Mandate**: All endpoints, operations, and resources MUST default to "Access Denied." Access is granted only when an explicit policy rule matches the actor's permissions.
2. **Multi-Tier Authorization Model**:
   - *Role-Based Access Control (RBAC)*: Coarse-grained roles (`EXPLORER`, `VILLAGE_MODERATOR`, `EXPERIENCE_ORGANIZER`, `SUPER_ADMIN`) enforced via declarative route guards.
   - *Attribute-Based Access Control (ABAC)*: Fine-grained resource ownership checks (e.g., "Can this explorer cancel *this specific* booking?").
3. **No Client-Side Authorization Trust**: Client UI visibility controls (hiding a button) are strictly for user experience. The backend MUST independently evaluate authorization on every API request and Server Action.
4. **Multi-Tenant Village Isolation**: Village Moderators and Gram Panchayat representatives MUST be strictly confined to their authorized administrative LGD code boundary; accessing or modifying adjacent village data is blocked at the query level.
5. **Direct Object Reference Protection (IDOR)**: Endpoints accepting resource IDs MUST verify that the requesting user has explicit ownership or administrative rights over that specific entity ID.

### 41.3 Best Practices
- Centralize authorization policy rules using Casbin or declarative policy service functions.
- Enforce ownership checks at the domain service layer rather than scattering checks across controllers.
- Return `403 Forbidden` when an actor is authenticated but lacks permission; return `404 Not Found` if revealing the existence of the resource is itself a security risk.

### 41.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A booking cancellation handler extracts `userId` from the verified session, fetches `booking`, and verifies `if (booking.userId !== userId && !user.hasRole(SUPER_ADMIN)) throw new ForbiddenException();`
- *Conceptual Negative Pattern*: A route `/api/v1/bookings/:id/cancel` that cancels the booking directly by the URL ID without verifying whether the requesting user owns that booking.

### 41.5 Common Mistakes
- Relying solely on role checks while omitting resource ownership checks (classic IDOR vulnerability).
- Checking authorization only on the frontend, allowing attackers to invoke API routes directly.
- Hardcoding user IDs or admin bypass logic in application code.

### 41.6 Review Checklist
- [ ] Does access default to denied unless explicitly permitted?
- [ ] Are coarse roles enforced via guards AND fine-grained ownership verified in services?
- [ ] Are IDOR vulnerabilities prevented by validating entity ownership on every mutation?
- [ ] Is village administrator data strictly partitioned by LGD cadastral codes?

### 41.7 Quality Checklist
- [ ] Automated authorization test matrix tests every route against every role (Explorer, Moderator, Admin, Anonymous).
- [ ] Pen-testing automated scripts verify IDOR immunity across all resource endpoints.

### 41.8 Security Considerations
- IDOR and Broken Object Level Authorization (BOLA) are ranked #1 in OWASP API Security Top 10. Rigorous ownership checks are critical.
- Ensure administrative role escalation routes require re-authentication and multi-party approval.

### 41.9 Performance Considerations
- Cache role-permission mappings in memory or Redis with short TTLs to prevent database hits on every authorization check.
- Combine ownership checks directly into SQL `WHERE` clauses (e.g., `WHERE id = :id AND user_id = :userId`) to evaluate authorization and fetch data in a single round-trip.

### 41.10 Future Scalability
- Clean ABAC policies easily scale to accommodate complex organizational structures, such as State Tourism Boards, Regional District Collectors, and verified Commercial Guilds.

---

# SECTION 42: SECURITY CODING STANDARDS

### 42.1 Purpose
Security Coding Standards establish comprehensive application-layer defenses across Explore Bharat Safar, eliminating the OWASP Top 10 vulnerabilities and safeguarding the integrity, confidentiality, and availability of national cultural and personal travel data.

### 42.2 Rules
1. **Injection Prevention Mandate**:
   - SQL Injection: Raw SQL string concatenation is strictly forbidden. All database queries MUST use parameterized queries via Prisma ORM or typed tagged template literals.
   - Command Injection: Executing shell commands (`exec`, `spawn`) with user-supplied arguments is strictly prohibited.
2. **Cross-Site Scripting (XSS) Prevention**: All user-supplied text rendered in HTML MUST be automatically escaped by React. When rendering rich text or markdown, it MUST be sanitized using DOMPurify with a strict tag whitelist.
3. **Content Security Policy (CSP Level 3)**: HTTP response headers MUST deliver a strict CSP header disallowing `'unsafe-inline'` and `'unsafe-eval'`, enforcing nonce-based script execution.
4. **Cross-Site Request Forgery (CSRF) Defense**: State-changing endpoints MUST validate anti-CSRF tokens or enforce `SameSite=Strict` cookie policies coupled with custom origin verification headers (`Origin`, `Referer`).
5. **Cryptographic Data Protection**: Sensitive columns in PostgreSQL (e.g., government identity numbers, emergency contact details) MUST be encrypted at rest using AES-256-GCM with keys managed via AWS KMS / Vault.

### 42.3 Best Practices
- Configure security headers using Helmet: `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.
- Implement automated rate-limiting and IP throttling on sensitive public endpoints.
- Conduct automated SAST (Static Application Security Testing) and DAST (Dynamic Application Security Testing) on every release branch.

### 42.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An experience search query uses parameterized queries: `prisma.experience.findMany({ where: { title: { contains: searchTerm, mode: 'insensitive' } } })`.
- *Conceptual Negative Pattern*: `db.query("SELECT * FROM experiences WHERE title LIKE '%" + req.query.search + "%'")` (catastrophic SQL injection vulnerability).

### 42.5 Common Mistakes
- Using `dangerouslySetInnerHTML` in React without running input through DOMPurify.
- Disabling CORS protections by setting `Access-Control-Allow-Origin: *` on authenticated endpoints.
- Storing unencrypted Aadhaar or PAN card numbers in the database, violating Indian regulatory statutes.

### 42.6 Review Checklist
- [ ] Are all database queries fully parameterized with zero string interpolation?
- [ ] Is all user-generated content sanitized before rendering?
- [ ] Are production HTTP security headers (CSP, HSTS, X-Frame-Options) configured?
- [ ] Is sensitive personal data encrypted at rest using AES-256-GCM?

### 42.7 Quality Checklist
- [ ] Automated security scans with Trivy and SonarQube report zero high or critical vulnerabilities.
- [ ] SAST tools verify parameterized query enforcement across all database access layers.

### 42.8 Security Considerations
- Security must be layered in depth: edge WAF, application middleware, domain validation, database constraints, and encrypted storage.
- Compliance with the Digital Personal Data Protection (DPDP) Act 2023 requires purpose limitation, explicit consent tracking, and data minimization.

### 42.9 Performance Considerations
- Hardware-accelerated AES-NI cryptographic instructions ensure AES-256-GCM field encryption introduces less than 1ms overhead per transaction.
- Parameterized queries allow PostgreSQL to cache query execution plans, improving overall database performance.

### 42.10 Future Scalability
- Zero-Trust security architecture ensures that future system expansions, third-party vendor integrations, and government API connections can proceed without compromising core data integrity.

---

# SECTION 43: PERFORMANCE STANDARDS

### 43.1 Purpose
Performance Standards guarantee that Explore Bharat Safar delivers sub-second response times, silky-smooth 60 FPS cartographic animations, and minimal bandwidth consumption, even under peak national holiday traffic surges and low-bandwidth 3G/4G rural networks.

### 43.2 Rules
1. **Core Web Vitals Performance Budget**:
   - Largest Contentful Paint (LCP): $\le 2.0\text{ seconds}$ on 4G networks.
   - First Input Delay (FID) / Interaction to Next Paint (INP): $\le 100\text{ milliseconds}$.
   - Cumulative Layout Shift (CLS): $\le 0.05$.
2. **API Latency Budgets**:
   - Read Endpoints (Cached / Static): $P_{95} \le 50\text{ ms}$, $P_{99} \le 100\text{ ms}$.
   - Complex Spatial GIS Queries: $P_{95} \le 150\text{ ms}$, $P_{99} \le 300\text{ ms}$.
   - Mutating Commands (Booking / Payment): $P_{95} \le 250\text{ ms}$, $P_{99} \le 500\text{ ms}$.
3. **JavaScript Bundle Budget**: Initial critical client JavaScript bundle MUST NOT exceed $120\text{ KB}$ (gzipped). Route chunks MUST NOT exceed $50\text{ KB}$ (gzipped).
4. **Database Query Hygiene**:
   - Full table scans on tables with $> 1,000$ rows are strictly prohibited.
   - The N+1 query antipattern is strictly forbidden; all relational queries MUST use eager batch loading via Prisma `include` or DataLoader.
5. **Multi-Tier Caching Mandate**: Data MUST be cached at the edge (Cloudflare CDN), in memory (Redis Cluster), and in the browser (HTTP Cache headers), with explicit invalidation tags.

### 43.3 Best Practices
- Lazy-load heavy third-party scripts (e.g., MapLibre, Three.js) only when their enclosing UI component enters the viewport.
- Optimize database queries by analyzing `EXPLAIN ANALYZE` output on all new migration queries.
- Use Brotli compression for all text-based network assets.

### 43.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Fetching destination details with its reviews and host info in a single batch query using DataLoader, with the result cached in Redis with a 1-hour TTL and tagged with `dest_123`.
- *Conceptual Negative Pattern*: Iterating through 50 destinations in a loop and executing `prisma.review.findMany({ where: { destinationId } })` on every iteration (51 consecutive roundtrips to PostgreSQL).

### 43.5 Common Mistakes
- Importing massive libraries into the critical rendering path instead of dynamic imports (`next/dynamic`).
- Failing to add database indexes on foreign key columns used in `WHERE` and `JOIN` clauses.
- Executing un-paginated queries (`SELECT * FROM villages`) that attempt to load 650,000 records into Node.js memory.

### 43.6 Review Checklist
- [ ] Does the change stay within the Core Web Vitals and JavaScript bundle budgets?
- [ ] Are all database queries indexed and verified with `EXPLAIN ANALYZE`?
- [ ] Has the N+1 query problem been eliminated via eager batch loading?
- [ ] Are heavy visualization components lazy-loaded via dynamic imports?

### 43.7 Quality Checklist
- [ ] Lighthouse CI fails pull requests that score below 90 on Performance.
- [ ] Automated k6 load tests verify API latency budgets under 5,000 virtual users.

### 43.8 Security Considerations
- Aggressive query limits and pagination prevent denial-of-service (DoS) attacks caused by resource-exhaustion queries.
- Caching layers must partition caches appropriately to avoid caching private user data in public edge caches.

### 43.9 Performance Considerations
- PostGIS spatial queries MUST utilize bounding-box pre-filtering (`&&`) before executing computationally intensive geometry operations (`ST_Contains`, `ST_Intersects`).
- Connection pooling via PgBouncer ensures database stability during high-concurrency connection spikes.

### 43.10 Future Scalability
- Sub-second baseline performance ensures the platform can scale linearly by adding stateless container pods behind load balancers without saturating the persistence tier.

---

# SECTION 44: ACCESSIBILITY STANDARDS (WCAG 2.1 AA)

### 44.1 Purpose
Accessibility Standards guarantee that Explore Bharat Safar is fully accessible to all individuals across Bharat, including users with visual, auditory, motor, or cognitive disabilities, complying strictly with WCAG 2.1 Level AA and national accessibility mandates.

### 44.2 Rules
1. **WCAG 2.1 Level AA Mandate**: All user interfaces across `apps/web` MUST achieve full compliance with WCAG 2.1 Level AA guidelines.
2. **Complete Keyboard Operability**: Every interactive element (buttons, links, form inputs, modal dialogs, map controls) MUST be fully operable via keyboard navigation alone (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, arrow keys). Focus MUST NEVER be trapped unpredictably.
3. **Visible Focus Indicators**: Interactive elements MUST exhibit a high-contrast, clearly visible focus ring when focused via keyboard navigation (`focus-visible:ring-2`).
4. **Color Contrast Minimums**:
   - Normal text ($< 18\text{pt}$ or $< 14\text{pt}$ bold): Minimum contrast ratio of $4.5:1$ against its background.
   - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) and UI components/borders: Minimum contrast ratio of $3:1$.
5. **Semantic HTML & ARIA Attributes**: Standard semantic HTML elements (`<button>`, `<main>`, `<nav>`, `<article>`, `<header>`) MUST be used in place of generic `<div>` clickables. ARIA attributes MUST be applied to convey state (`aria-expanded`, `aria-selected`, `aria-live`) where native HTML is insufficient.

### 44.3 Best Practices
- Provide accessible alt text for all informative images; decorative images MUST have an empty `alt=""` attribute.
- Ensure screen readers announce dynamic content updates (e.g., search results count, booking errors) via `aria-live="polite"` regions.
- Provide a visible "Skip to Main Content" link at the top of every page layout.

### 44.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An accessible modal dialog built with Radix Dialog that traps focus within the modal while open, closes on `Escape`, restores focus to the trigger button upon closure, and announces its title via `aria-labelledby`.
- *Conceptual Negative Pattern*: `<div onClick={handleClick}>Book Slot</div>` (inaccessible via keyboard, invisible to screen readers, missing role and tabindex).

### 44.5 Common Mistakes
- Removing the default focus outline (`outline: none`) without providing a custom visible focus ring.
- Using color alone to convey critical status (e.g., showing green for available and red for full without accompanying text or icons).
- Neglecting to associate `<label>` elements with their corresponding form `<input>` via `htmlFor` / `id`.

### 44.6 Review Checklist
- [ ] Can the entire user journey be completed using only a keyboard?
- [ ] Do text elements satisfy the 4.5:1 color contrast ratio across both light and dark themes?
- [ ] Are form inputs explicitly linked to accessible labels?
- [ ] Are ARIA roles and live regions used correctly for dynamic states?

### 44.7 Quality Checklist
- [ ] Automated accessibility testing via `@axe-core/playwright` runs in CI and fails on any WCAG AA violation.
- [ ] Manual screen reader audits (NVDA / VoiceOver) verify accessibility on all core user journeys.

### 44.8 Security Considerations
- Accessible error announcements ensure that users with disabilities are clearly informed of security failures (e.g., expired sessions, failed authentication) without confusion.
- Do not announce sensitive masked credentials (e.g., passwords) via screen reader announcements.

### 44.9 Performance Considerations
- Semantic HTML renders natively in browser engines, requiring fewer DOM nodes and zero JavaScript execution compared to custom div-based interactive hacks.
- Headless Radix primitives provide accessibility with zero runtime CSS overhead.

### 44.10 Future Scalability
- Clean, semantic, and accessible HTML architecture provides the ideal structured content required for voice-assisted navigation and emerging AI screen agents.

---

# SECTION 45: RESPONSIVE DESIGN STANDARDS

### 45.1 Purpose
Responsive Design Standards ensure that Explore Bharat Safar provides an exceptional, visually stunning, and ergonomically optimized experience across all screen form factors, from compact budget Android smartphones to high-resolution 4K desktop displays.

### 45.2 Rules
1. **Mobile-First CSS Strategy**: Styles MUST be authored using a mobile-first approach. Base utility classes represent mobile screens; responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) apply progressively as screen widths expand.
2. **Standardized Tailwind Breakpoints**:
   - `sm`: $640\text{px}$ (Large smartphones, landscape)
   - `md`: $768\text{px}$ (Tablets, portrait)
   - `lg`: $1024\text{px}$ (Tablets landscape, small laptops)
   - `xl`: $1280\text{px}$ (Desktops, standard monitors)
   - `2xl`: $1536\text{px}$ (Large desktop displays)
3. **Touch Target Sizing**: On mobile and touch-enabled devices, all interactive touch targets (buttons, links, icons, list items) MUST have a minimum physical dimension of $44 \times 44\text{px}$ to prevent mis-clicks.
4. **Fluid Typography and Spacing**: Typography and layout spacing MUST scale smoothly across viewports using CSS `clamp()` and proportional rem units, preventing text overflow and awkward line wraps.
5. **No Horizontal Scroll on Mobile**: Viewports MUST NOT exhibit unintentional horizontal scrolling at any screen width down to $320\text{px}$.

### 45.3 Best Practices
- Test layouts across standard device viewport presets: iPhone SE ($375\text{px}$), Pixel ($412\text{px}$), iPad ($768\text{px}$), and MacBook ($1440\text{px}$).
- Replace complex multi-column data tables on mobile screens with responsive card lists or stacked attribute views.
- Ensure bottom navigation bars and floating action buttons do not obscure critical content or operating system gesture bars.

### 45.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A grid layout styled as `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`, gracefully transitioning from a single column on mobile to four columns on desktop.
- *Conceptual Negative Pattern*: A fixed width layout styled with `style={{ width: '1200px' }}`, causing massive horizontal scrollbars on mobile devices and clipping content.

### 45.5 Common Mistakes
- Authoring desktop-first CSS using `max-width` media queries, conflicting with Tailwind's mobile-first architecture.
- Designing tiny icon buttons ($24 \times 24\text{px}$) with no touch padding, making them frustrating to tap on mobile touchscreens.
- Using fixed pixel heights on text containers, causing text to clip when users adjust browser font scale settings.

### 45.6 Review Checklist
- [ ] Is styling authored strictly using mobile-first Tailwind utilities?
- [ ] Are all touch targets at least $44 \times 44\text{px}$ on mobile screens?
- [ ] Does the page render with zero horizontal scrollbar down to $320\text{px}$?
- [ ] Do complex multi-column layouts degrade gracefully into single-column mobile views?

### 45.7 Quality Checklist
- [ ] Visual regression testing runs across mobile ($375\text{px}$), tablet ($768\text{px}$), and desktop ($1440\text{px}$) viewports.
- [ ] Chrome DevTools mobile emulation audits verify viewport meta tags and touch target sizing.

### 45.8 Security Considerations
- Responsive layouts must ensure that critical security notices, disclaimer banners, and terms checkboxes remain visible and tap-able across all viewports.
- Prevent responsive reflow from causing clickjacking vectors where overlapping elements capture unintended user taps.

### 45.9 Performance Considerations
- Mobile-first CSS ensures mobile devices parse the minimal required styles first, reducing CSS evaluation time on lower-powered mobile CPUs.
- Avoid rendering hidden heavy desktop DOM trees on mobile; use conditional rendering where layouts diverge drastically.

### 45.10 Future Scalability
- Fluid, tokenized responsive layouts easily adapt to foldable mobile devices, smart displays, and emerging wearable form factors.

---

# SECTION 46: SEO STANDARDS

### 46.1 Purpose
SEO Standards ensure that Explore Bharat Safar's vast cultural, geographic, and travel discovery repository is fully discoverable, indexed, and richly rendered by search engines worldwide, driving organic exploration of Bharat's heritage.

### 46.2 Rules
1. **Dynamic Metadata on All Public Routes**: Every public Next.js page MUST export a dynamic `generateMetadata()` function that generates unique, descriptive `title`, `description`, `canonical`, and Open Graph (`og:*`) tags.
2. **JSON-LD Structured Data Mandate**: Pages representing domain entities MUST embed Schema.org-compliant JSON-LD structured data:
   - Destinations & Attractions: `TouristAttraction`, `Place`
   - Villages: `AdministrativeArea`, `CivicStructure`
   - Bookable Experiences: `Event`, `Trip`, `Product`
   - Cultural Articles: `Article`, `BlogPosting`
3. **Canonical URL Enforcement**: Every indexed page MUST define an authoritative canonical link (`<link rel="canonical" ... />`) to eliminate duplicate content penalties caused by tracking parameters or alternate URL slugs.
4. **Dynamic XML Sitemaps**: Dynamic XML sitemaps MUST be generated programmatically (`app/sitemap.ts`) for all published destinations, villages, and experiences, partitioned to adhere to the 50,000 URLs-per-sitemap limit.
5. **Robots and Indexation Governance**: Staging environments, administrative consoles, user account dashboards, and booking checkout flows MUST be strictly excluded from search indexation via `robots.txt` and `noindex, nofollow` headers.

### 46.3 Best Practices
- Keep page titles concise and descriptive: `[Destination Name] — Explore Bharat Safar`.
- Keep meta descriptions between 140 and 160 characters, highlighting unique cultural or experiential aspects.
- Automatically generate dynamic Open Graph preview images using `@vercel/og` or SVG image generators.

### 46.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A village page renders dynamic JSON-LD defining `@context: "https://schema.org"`, `@type: "AdministrativeArea"`, `name: "Ralegan Siddhi"`, `containedInPlace: { name: "Ahmednagar District" }`.
- *Conceptual Negative Pattern*: A destination page with a static hardcoded `<title>Explore Bharat Safar</title>`, zero meta description, and no structured data.

### 46.5 Common Mistakes
- Leaving client-side rendered (CSR) text invisible to search engine crawlers that do not execute complex JavaScript bundles.
- Emitting broken canonical URLs that point to `localhost` or HTTP staging URLs in production.
- Forgetting to exclude private authenticated dashboards from search indexes.

### 46.6 Review Checklist
- [ ] Does the page generate dynamic metadata with unique title and description?
- [ ] Is Schema.org JSON-LD structured data embedded for the domain entity?
- [ ] Is a valid canonical URL tag present on the page?
- [ ] Are private and transactional pages protected with `noindex` headers?

### 46.7 Quality Checklist
- [ ] Google Rich Results Test validates all JSON-LD schemas with zero errors.
- [ ] Automated SEO audit in CI confirms 100% of public routes have valid metadata and canonical tags.

### 46.8 Security Considerations
- Ensure internal system identifiers, private draft content, and unverified user submissions are excluded from public sitemaps and search indexing.
- Prevent SEO poisoning by escaping all dynamic parameters inserted into metadata tags.

### 46.9 Performance Considerations
- Cache metadata lookups and sitemap generation using Next.js ISR (Incremental Static Regeneration) to prevent database spikes during search engine crawls.
- Ensure structured data JSON-LD scripts are compact and serialized cleanly.

### 46.10 Future Scalability
- Comprehensive Schema.org structured data feeds directly into emerging AI search engines, knowledge graphs, and voice assistants (Google Assistant, Perplexity, Apple Intelligence).

---

# SECTION 47: IMAGE OPTIMIZATION STANDARDS

### 47.1 Purpose
Image Optimization Standards ensure Explore Bharat Safar delivers rich, breathtaking visual photography of Bharat's landscapes and cultural heritage with minimal file weights, zero layout shifts, and rapid rendering across diverse devices.

### 47.2 Rules
1. **Next.js `<Image />` Mandatory**: All images rendered in the web frontend MUST use the Next.js `<Image />` component. Raw HTML `<img>` tags are strictly prohibited.
2. **Modern Format Delivery (AVIF / WebP)**: The image pipeline MUST automatically negotiate and serve next-generation AVIF and WebP formats based on browser support capabilities.
3. **Responsive `sizes` Attribute**: All images MUST specify an explicit `sizes` attribute matching their responsive CSS layout breakpoints, preventing mobile devices from downloading full-resolution desktop images.
4. **Dimensions or Fill Mandate**: Every image MUST define explicit `width` and `height` attributes, or use `fill` within a positioned parent container with an explicit aspect ratio, guaranteeing zero Cumulative Layout Shift (CLS).
5. **Priority Loading for LCP**: Images appearing above the fold that qualify as the Largest Contentful Paint (LCP) element MUST carry the `priority` attribute. All other images MUST use default lazy loading (`loading="lazy"`).

### 47.3 Best Practices
- Generate small, low-resolution blurry placeholders (`placeholder="blur"`) for hero photography to provide instant visual feedback while full images load.
- Serve user-uploaded media through an image transformation CDN (e.g., Cloudflare Images, AWS CloudFront) with on-the-fly resizing and watermarking.
- Compress source images to an 85% visual quality threshold before storage.

### 47.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `<Image src={heroImageUrl} alt="Majestic Western Ghats mist" fill priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" placeholder="blur" blurDataURL={blurDataUrl} className="object-cover" />`
- *Conceptual Negative Pattern*: `<img src="https://mybucket.s3.amazonaws.com/raw-40mb-photo.jpg" />` (catastrophic bandwidth drain, massive CLS, blocks page render).

### 47.5 Common Mistakes
- Omitting the `sizes` attribute on `fill` images, forcing Next.js to serve the maximum $3840\text{px}$ image width to mobile browsers.
- Marking every image on the page with `priority`, defeating the purpose of prioritization and choking browser network queues.
- Storing uncompressed, raw 50MB photography directly in user storage buckets.

### 47.6 Review Checklist
- [ ] Are all images rendered using Next.js `<Image />`?
- [ ] Do images specify explicit dimensions or `fill` with an aspect ratio?
- [ ] Is the `priority` attribute reserved exclusively for above-the-fold hero images?
- [ ] Are responsive `sizes` accurately defined to match CSS layout rules?

### 47.7 Quality Checklist
- [ ] Core Web Vitals audit verifies Cumulative Layout Shift (CLS) $\le 0.05$ on image-heavy pages.
- [ ] Image format audit confirms $> 95\%$ of delivered images are served as AVIF or WebP.

### 47.8 Security Considerations
- Validate user-uploaded image files against magic-byte signatures to prevent malicious executable files disguised as images.
- Strip all EXIF metadata (specifically GPS coordinates and camera serial numbers) from uploaded images prior to public serving to protect user privacy under the DPDP Act.

### 47.9 Performance Considerations
- Serving properly sized AVIF images reduces image payload weights by up to 60–80% compared to legacy JPEG formats.
- Blur placeholders eliminate perceived load latency, creating a premium, polished user experience.

### 47.10 Future Scalability
- Abstracted image URLs and CDN-backed resizing allow the platform to migrate to next-generation image formats (e.g., JPEG XL) seamlessly via CDN edge rule updates.

---

# SECTION 48: ANIMATION STANDARDS

### 48.1 Purpose
Animation Standards define motion design principles, performance constraints, and accessibility rules for all user interface animations, transitions, and WebGL visualizations across Explore Bharat Safar.

### 48.2 Rules
1. **60 FPS Performance Mandate**: All animations MUST run at a sustained 60 frames per second ($16.6\text{ms}$ frame budget) on standard hardware. Animations MUST animate only GPU-accelerated CSS properties: `transform` and `opacity`. Animating layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`) is strictly prohibited.
2. **Strict `prefers-reduced-motion` Compliance**: All animations and motion sequences MUST honor the user's operating system `prefers-reduced-motion` setting. When enabled, animations MUST be disabled or replaced with immediate cross-fades.
3. **Motion Purpose and Intent**: Animations MUST serve a clear functional purpose: guiding user attention, communicating spatial hierarchy, or confirming user actions. Decorative, gratuitous, or distracting motion is forbidden.
4. **Duration and Easing Standards**:
   - Micro-interactions (hover, active, toggle): $150\text{ms} - 250\text{ms}$ with `ease-out`.
   - Structural transitions (dialog open, drawer slide): $300\text{ms} - 400\text{ms}$ with `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Motion duration MUST NOT exceed $500\text{ms}$ for standard UI transitions.
5. **GSAP & WebGL Resource Management**: Complex motion timelines and Three.js WebGL rendering contexts MUST pause or throttle their render loops when their canvas element scrolls out of the active viewport (via `IntersectionObserver`).

### 48.3 Best Practices
- Use Tailwind CSS transition utilities for standard hover and state transitions.
- Use Framer Motion for complex React component layout animations.
- Use GSAP (GreenSock) for high-performance coordinated narrative timelines and map camera flight sequences.

### 48.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An interactive card with `transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transform-none`, providing tactile feedback while respecting accessibility preferences.
- *Conceptual Negative Pattern*: Animating a card expansion by transitioning CSS `height` from `100px` to `500px` over 2 seconds, triggering massive CPU layout reflows and stuttering at 15 FPS.

### 48.5 Common Mistakes
- Animating `left` and `top` properties instead of `transform: translate3d()`, causing continuous browser repaint cycles.
- Running unthrottled WebGL `requestAnimationFrame` render loops in the background when the user switches browser tabs, draining mobile battery life.
- Failing to clean up GSAP timelines on component unmount, causing catastrophic JavaScript memory leaks.

### 48.6 Review Checklist
- [ ] Do animations strictly animate `transform` and `opacity` properties?
- [ ] Is `prefers-reduced-motion` supported across all animated elements?
- [ ] Are animation durations kept within the $150\text{ms} - 400\text{ms}$ functional window?
- [ ] Are WebGL render loops and GSAP tickers properly cleaned up on unmount?

### 48.7 Quality Checklist
- [ ] Chrome DevTools Rendering / Performance audit verifies zero layout thrashing and steady 60 FPS.
- [ ] Automated accessibility test confirms all motion is neutralized when `prefers-reduced-motion: reduce` is simulated.

### 48.8 Security Considerations
- Ensure dynamic animation parameters cannot be injected with malicious scripts or unvalidated CSS strings.
- Prevent flashing or high-frequency strobing animations ($> 3\text{ flashes/sec}$) that can trigger photosensitive epileptic seizures.

### 48.9 Performance Considerations
- Leveraging GPU hardware composition (`will-change: transform` used sparingly) prevents CPU thread blocking.
- Pausing off-screen canvas loops preserves critical CPU/GPU cycles for main thread interactions.

### 48.10 Future Scalability
- Modular motion design tokens ensure animation timing and easing curves remain unified across the web platform and future native mobile apps.

---


# PART IV: DOMAIN SUBSYSTEMS, QUALITY ENGINEERING & CODE REVIEW WORKFLOW

# SECTION 49: GIS DEVELOPMENT STANDARDS (BHARAT DISCOVERY ENGINE — PILLAR 1)

### 49.1 Purpose
GIS Development Standards govern spatial data architecture, coordinate reference systems, cartographic accuracy, and WebGL rendering for the Bharat Discovery Engine, ensuring compliance with the National Geospatial Policy and the Survey of India guidelines.

### 49.2 Rules
1. **Survey of India Boundary Compliance Mandate**: All cartographic representations, external borders, and territorial visualizations of the Republic of India MUST strictly comply with official Survey of India boundary specifications. Depicting incorrect, incomplete, or distorted international borders of India is a criminal offense under national law and is strictly forbidden.
2. **WGS 84 (EPSG:4326) Persistence & Web Mercator (EPSG:3857) Rendering**:
   - All spatial coordinates stored in PostgreSQL / PostGIS MUST use WGS 84 geographic coordinates (`SRID=4326`).
   - All client-side map rendering (MapLibre GL / Mapbox) MUST project coordinates into Web Mercator (`EPSG:3857`).
3. **Mapbox Vector Tiles (MVT) for Dense Data**: Large spatial datasets (e.g., nationwide village boundaries, trekking routes, district boundaries) MUST be served as vector tiles (`.mvt` / `.pbf`) generated dynamically via PostGIS `ST_AsMVT()` or pre-rendered via Martin/Tippecanoe, NEVER as raw massive GeoJSON payloads over HTTP.
4. **GIST Spatial Indexing Mandate**: Every PostgreSQL table containing `GEOMETRY` or `GEOGRAPHY` columns MUST have an active Generalized Search Tree (GIST) index (e.g., `CREATE INDEX spx_places_geom ON places USING GIST (geom);`).
5. **Hierarchical Spatial Zoom Level Discipline**:
   - Zoom 0–4: National overview and International boundaries.
   - Zoom 5–7: State boundaries and major highways.
   - Zoom 8–10: District boundaries and major destinations.
   - Zoom 11–13: Taluka boundaries, trekking trails, and regional hubs.
   - Zoom 14+: Village cadastral plots, local points of interest, and 3D landmark models.

### 49.3 Best Practices
- Pre-simplify complex polygon geometries using `ST_SimplifyPreserveTopology()` to minimize vector tile byte sizes at lower zoom levels.
- Cluster map markers dynamically on the client using Supercluster to maintain 60 FPS frame rates during pan and zoom gestures.
- Encapsulate all spatial coordinate mathematics inside `@ebs/gis-core` with Turf.js abstractions.

### 49.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Serving village boundary polygons through a dynamic vector tile endpoint `/api/v1/tiles/villages/{z}/{x}/{y}.pbf` that executes PostGIS `ST_AsMVT` with bounding-box clipping (`ST_TileEnvelope`) and GIST index acceleration.
- *Conceptual Negative Pattern*: A REST endpoint `/api/v1/villages/all-boundaries` that serializes 650,000 unindexed GeoJSON polygons into a 450MB JSON response downloaded by the client browser.

### 49.5 Common Mistakes
- Storing coordinates in reverse order (e.g., storing `[latitude, longitude]` instead of standard GeoJSON `[longitude, latitude]`).
- Performing spatial distance calculations using Cartesian formulas (`Math.sqrt`) instead of geodesic Harvesine or PostGIS `ST_Distance(geography)`.
- Forgetting to destroy MapLibre map instances upon component unmount, leaking WebGL contexts.

### 49.6 Review Checklist
- [ ] Are national boundaries 100% compliant with Survey of India standards?
- [ ] Are spatial coordinates stored with SRID 4326 in PostGIS?
- [ ] Do all spatial columns have GIST indexes?
- [ ] Are dense spatial datasets served via MVT vector tiles rather than raw GeoJSON?
- [ ] Are coordinates formatted as `[longitude, latitude]` in GeoJSON payloads?

### 49.7 Quality Checklist
- [ ] Automated boundary validation test suite verifies national border geometry against Survey of India reference polygons.
- [ ] Tile rendering benchmarks confirm tile generation latency $P_{95} \le 50\text{ms}$.

### 49.8 Security Considerations
- Validate bounding box parameters (`minX`, `minY`, `maxX`, `maxY`) against numerical ranges to prevent SQL injection or computational DoS in spatial queries.
- Ensure restricted defense installations and sensitive governmental zones are redacted from public map layers in accordance with national geospatial defense guidelines.

### 49.9 Performance Considerations
- PostGIS bounding box filters (`&&`) MUST execute before exact geometry calculations (`ST_Contains`) to reduce polygon processing time by orders of magnitude.
- Limit max tile cache size in browser memory to prevent mobile device memory crashes.

### 49.10 Future Scalability
- Standardized MVT vector tiles allow seamless offline caching in Progressive Web Apps (PWAs) and native mobile apps for travelers navigating low-connectivity rural regions.

---

# SECTION 50: BOOKING MODULE STANDARDS (EXPERIENCE BOOKING ENGINE — PILLAR 3)

### 50.1 Purpose
Booking Module Standards govern high-concurrency inventory reservation, distributed slot locking, double-entry financial ledger accounting, and cryptographic completion certificate generation for the Experience Booking Engine.

### 50.2 Rules
1. **Redlock Distributed Mutex Mandate**: Slot locking during checkout MUST use the Redlock distributed locking algorithm across a multi-node Redis cluster. Local in-memory locks or un-synchronized database locks are strictly prohibited.
2. **15-Minute Slot Lock TTL Invariant**: When an explorer initiates checkout, slots MUST be locked for exactly 15 minutes ($900\text{ seconds}$). If checkout is not completed within the TTL, the lock MUST automatically expire and return inventory to the pool with zero human intervention.
3. **Idempotency Key Enforcement**: All booking creation and payment capture commands MUST require a unique, client-generated `Idempotency-Key` header (UUIDv4) stored in Redis with a 24-hour TTL, preventing double-charging on network retries.
4. **Double-Entry Financial Ledger**: All monetary movements (advances, balance payments, organizer payouts, platform fees, refunds) MUST be recorded as immutable credits and debits in a double-entry ledger table. Updating account balances via mutable `UPDATE accounts SET balance = balance + X` is strictly forbidden.
5. **ISO 19005-1 PDF/A-1b Cryptographic Certificates**: Completion certificates MUST be generated as vector PDF/A-1b documents signed with an asymmetric HMAC-SHA256 signature and dynamic verification QR code linking to an immutable verification URL.

### 50.3 Best Practices
- Execute final booking state transitions within ACID database transactions using `SELECT ... FOR UPDATE` row-level locks on the batch record.
- Send booking confirmations and cancellation alerts asynchronously via BullMQ background worker queues to keep API latency under $250\text{ms}$.
- Store monetary values strictly as integers in paise (INR $\times 100$) to prevent floating-point inaccuracies.

### 50.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An explorer reserves 2 slots for a trek batch. A Redlock mutex `lock:batch:eb_789` is acquired. The service verifies available capacity $\ge 2$, creates an `inventory_hold` record with `expires_at = now() + 15m`, releases the mutex, and returns a checkout session token.
- *Conceptual Negative Pattern*: A booking route reads available capacity, allows the user to browse payment options for 20 minutes with no lock, and blindly creates an order without checking capacity again, leading to oversold expeditions.

### 50.5 Common Mistakes
- Decrementing capacity immediately before payment confirmation without an automatic expiration mechanism, causing phantom inventory exhaustion.
- Calculating refunds using floating-point math (e.g., `price * 0.5`), resulting in sub-paise fractional discrepancies.
- Allowing concurrent booking requests for the same slot to bypass inventory checks due to missing database transaction isolation levels.

### 50.6 Review Checklist
- [ ] Is inventory locking managed via distributed Redlock with a strict 15-minute TTL?
- [ ] Are all financial mutations backed by an immutable double-entry ledger?
- [ ] Are all mutation endpoints protected with mandatory idempotency keys?
- [ ] Are monetary values represented exclusively as integer paise?
- [ ] Are completion certificates rendered in verifiable PDF/A-1b format?

### 50.7 Quality Checklist
- [ ] High-concurrency load testing (k6) verifies zero overbooking when 1,000 concurrent users attempt to book the final 5 slots of an experience batch.
- [ ] Financial reconciliation script verifies that ledger credits exactly match debits ($= 0$) across all transactions.

### 50.8 Security Considerations
- Payment webhook handlers (Razorpay/Cashfree) MUST cryptographically verify the signature header before processing any state update.
- Ensure users cannot book experiences on behalf of unauthorized third parties without verified participant identity.

### 50.9 Performance Considerations
- Redlock acquisition and release operations execute in Redis in $< 2\text{ms}$, preventing bottlenecks during high-demand expedition drops.
- Heavy certificate PDF generation is offloaded to background BullMQ worker pods, ensuring zero degradation of user-facing web services.

### 50.10 Future Scalability
- Double-entry ledger architecture satisfies national financial audit standards and provides the foundation for multi-currency international bookings and automated GST tax filing.

---

# SECTION 51: SOCIAL PLATFORM STANDARDS (TRAVELLER SOCIAL NETWORK — PILLAR 4)

### 51.1 Purpose
Social Platform Standards govern the expedition-focused traveller social network, hybrid feed generation, 24-hour ephemeral stories, community guilds, and chronological travel timelines, guaranteeing real-time engagement with zero spam or privacy leaks.

### 51.2 Rules
1. **Hybrid Fan-Out Architecture**:
   - *Fan-out on Write*: For standard users with $< 5,000$ followers, publishing a post pushes its ID directly into the Redis timeline feeds of all followers.
   - *Fan-out on Read*: For high-profile explorers and verified ambassadors with $> 5,000$ followers, posts are pulled and merged into follower feeds on read, preventing write-amplification bottlenecks.
2. **Strict 24-Hour Ephemeral Story TTL**: Ephemeral travel stories MUST have an exact 24-hour time-to-live (`expires_at = created_at + 24 hours`). Expired stories MUST be immediately excluded from active story feeds and purged or archived via scheduled background cleanup jobs.
3. **Automated Content Moderation Pipeline**: All user-uploaded media (photos, journals, comments) MUST pass through an automated moderation pipeline (NSFW image detection, text hate-speech filtering) before becoming publicly visible in community feeds.
4. **Block and Report Isolation**: When User $A$ blocks User $B$, all interactions MUST be severed bidirectionally: User $B$ cannot view $A$'s profile, posts, stories, or location, and cannot comment on or message User $A$.
5. **Zero Geolocation Stalking (Privacy First)**: Real-time live coordinates of travelers MUST NEVER be published publicly. Only broad geographic locations (district or taluka level) may be tagged, and precise trail locations may only be revealed after an expedition has concluded.

### 51.3 Best Practices
- Implement cursor-based pagination (`created_at` + `id`) for infinite-scroll social feeds to eliminate duplicate or skipped items during continuous publishing.
- Store social feed timelines in Redis sorted sets (`ZADD` with timestamp as score) for sub-10ms feed retrieval.
- Compress and transcode uploaded story videos into optimized HLS streams via worker queues.

### 51.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An explorer uploads a 24-hour story. The worker generates thumbnails, runs NSFW safety checks, stores the media record with `expires_at = now() + 24h`, and adds the story reference to the village's active story ring in Redis.
- *Conceptual Negative Pattern*: Storing story photos in an unindexed SQL table, querying them with `WHERE created_at > NOW() - INTERVAL '24 hours'` on every homepage render, and displaying raw uncompressed 4K videos directly from mobile cameras.

### 51.5 Common Mistakes
- Using `OFFSET` pagination for social feeds, causing slow database queries and duplicate posts as new items are inserted at the top of the feed.
- Forgetting bidirectional block enforcement in search queries, allowing blocked users to appear in search suggestions.
- Retaining expired ephemeral media in public storage buckets, creating privacy violations.

### 51.6 Review Checklist
- [ ] Does feed generation use hybrid fan-out based on follower count?
- [ ] Are 24-hour stories strictly bounded by automated expiration?
- [ ] Is all user-generated content routed through automated moderation checks?
- [ ] Are bidirectional block and report relationships enforced across all feed queries?
- [ ] Are real-time exact GPS coordinates masked for personal safety?

### 51.7 Quality Checklist
- [ ] Feed latency benchmarks confirm $P_{95} \le 50\text{ms}$ for feed loading under high concurrency.
- [ ] Moderation filter tests verify 100% detection rate for prohibited text and imagery.

### 51.8 Security Considerations
- Protect against automated spam bots by enforcing CAPTCHA and rate limits on post creation and comment endpoints.
- Ensure private profiles and guild content cannot be accessed via direct IDOR URL manipulations.

### 51.9 Performance Considerations
- Pre-computing feeds in Redis sorted sets eliminates expensive multi-table relational joins during timeline queries.
- Media assets MUST be delivered via global CDN edge caches with adaptive bitrate streaming for video.

### 51.10 Future Scalability
- Decoupled social graph architecture can easily scale to millions of concurrent social interactions without impacting the critical booking or payment infrastructure.

---

# SECTION 52: VILLAGE SYSTEM STANDARDS (RURAL BHARAT KNOWLEDGE SYSTEM — PILLAR 2)

### 52.1 Purpose
Village System Standards govern the authoritative cultural, civic, and demographic registry covering 650,000+ Indian villages, Gram Panchayats, and Local Government Directory (LGD) cadastral codes under strict DPDP Act compliance.

### 52.2 Rules
1. **LGD Cadastral Code Invariance**: Every village record MUST be anchored to its official Local Government Directory (LGD) code issued by the Ministry of Panchayati Raj. LGD codes are immutable unique keys; no duplicate or orphaned village records may exist.
2. **Administrative Hierarchy Invariance**: Village records MUST strictly adhere to the national cadastral tree:
   $$\text{State} \longrightarrow \text{District} \longrightarrow \text{Taluka / Tehsil} \longrightarrow \text{Gram Panchayat} \longrightarrow \text{Village (LGD Code)}$$
3. **Multi-Stage Editorial Moderation Pipeline**: Public submissions or updates to village cultural data, heritage history, or local homestays MUST pass through a 3-tier moderation workflow:
   `DRAFT` $\longrightarrow$ `COMMUNITY_VERIFIED` $\longrightarrow$ `ADMIN_APPROVED` $\longrightarrow$ `PUBLISHED`.
   Unapproved submissions MUST NEVER be visible to the general public.
4. **DPDP Act 2023 Rural Privacy Governance**: Personal contact details of local artisans, homestay hosts, and village elders MUST NOT be published without explicit, auditable, revocable digital consent. Contact details must be masked (e.g., via platform proxy routing) to prevent exploitation.
5. **Cadastral Boundary Polygon Integrity**: Village boundary polygons MUST be validated for geometric validity using PostGIS `ST_IsValid()`. Self-intersecting or topologically corrupt polygons MUST be rejected upon import.

### 52.3 Best Practices
- Cache static village demographic and heritage profiles aggressively using Next.js ISR (Incremental Static Regeneration) with 24-hour revalidation.
- Maintain an immutable audit log (`village_audit_log`) recording every modification, editor identity, timestamp, and field-level diff.
- Index village names in both Latin script and local Indian vernacular scripts (Devanagari, Dravidian scripts) using PostgreSQL trigram indexes (`pg_trgm`) for fuzzy search.

### 52.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A village submission is validated against the official LGD directory registry, assigned a `DRAFT` status, and queued for review. When approved by the District Moderator, a domain event `VillageRecordPublishedEvent` is fired to trigger search re-indexing and ISR cache revalidation.
- *Conceptual Negative Pattern*: Allowing any anonymous user to edit village historical records directly in the production database with no review workflow, audit trail, or LGD code validation.

### 52.5 Common Mistakes
- Treating village names as unique identifiers instead of using official LGD codes (many Indian villages share identical names within the same state).
- Violating the administrative hierarchy by linking a village directly to a State without intermediate District and Taluka foreign keys.
- Publishing unmasked personal phone numbers of rural community members.

### 52.6 Review Checklist
- [ ] Is every village record bound to an immutable, valid LGD cadastral code?
- [ ] Does the record satisfy the full 5-tier administrative hierarchy?
- [ ] Does all user-contributed cultural data pass through the 3-tier moderation pipeline?
- [ ] Are personal contact details masked in compliance with the DPDP Act?
- [ ] Are village boundary geometries validated with `ST_IsValid()`?

### 52.7 Quality Checklist
- [ ] Cadastral integrity test verifies zero orphaned village records across all 650,000+ entries.
- [ ] Multilingual search tests verify fuzzy search accuracy across English and Indian regional scripts.

### 52.8 Security Considerations
- Protect administrative village management portals with multi-factor authentication (MFA) and strict LGD-scoped RBAC.
- Ensure bulk village data export endpoints are throttled and restricted to authenticated, audited governmental and research accounts.

### 52.9 Performance Considerations
- Store village vector boundaries as simplified TopoJSON/MVT to maintain fast map rendering across 650,000 entities.
- Vernacular trigram search indexes (`GIN` on `gin_trgm_ops`) guarantee sub-50ms search query response times across millions of text variations.

### 52.10 Future Scalability
- Robust LGD code alignment establishes Explore Bharat Safar as the definitive digital infrastructure ready for integration with national initiatives like Digital India, BharatNet, and Open Network for Digital Commerce (ONDC).

---

# SECTION 53: ADMIN PANEL STANDARDS

### 53.1 Purpose
Admin Panel Standards govern the internal administrative consoles, moderation feeds, and governance dashboards of Explore Bharat Safar, ensuring maximum operational efficiency, absolute accountability, and airtight protection of administrative capabilities.

### 53.2 Rules
1. **Immutable Audit Logging Mandate**: Every administrative action—approving a village submission, banning a user, issuing a refund, modifying commission rates, or updating platform settings—MUST be recorded in an immutable audit ledger (`admin_audit_logs`) recording `actor_id`, `action_type`, `resource_id`, `before_state`, `after_state`, `ip_address`, and `timestamp`.
2. **Granular Least-Privilege RBAC**: Administrative access MUST be governed by granular, least-privilege permissions (e.g., `village:approve`, `finance:refund`, `user:suspend`). Monolithic "God Admin" permissions are strictly forbidden.
3. **MFA Enforcement**: All administrative accounts MUST require Multi-Factor Authentication (TOTP or hardware security key) to authenticate. Session duration MUST NOT exceed 2 hours without re-authentication.
4. **Export Throttling and Watermarking**: Bulk data export operations (CSV, Excel) MUST be strictly rate-limited, logged, and electronically watermarked with the administrator's ID and timestamp to deter and track data exfiltration.
5. **Destructive Action Double-Confirmation**: Destructive administrative operations (e.g., permanently deleting data, banning organizers, triggering emergency locks) MUST require explicit dual-control (four-eyes principle) or typed phrase confirmation dialogs.

### 53.3 Best Practices
- Separate admin panel routes into a distinct Next.js route group `apps/web/app/(admin)/` or dedicated administration sub-domain.
- Implement comprehensive filtering, sorting, and batch-action capabilities across all moderation queues.
- Provide real-time operational health dashboards displaying active slot locks, booking throughput, and system error rates.

### 53.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An admin approving a refund invokes `ProcessRefundCommand`. The service validates the admin's `finance:refund` permission, verifies the double-entry transaction, updates the booking state, and writes an immutable record to `admin_audit_logs`.
- *Conceptual Negative Pattern*: A hidden `/admin/delete-all-users` route accessible by anyone who sets a cookie `role=admin`, which deletes database records without logging who performed the action.

### 53.5 Common Mistakes
- Allowing admin routes to bypass standard validation and security middleware.
- Displaying full, unmasked personal data (credit card numbers, full Aadhaar) on admin screens when only the last 4 digits are required for triage.
- Performing synchronous batch operations in the web process, causing browser HTTP timeouts during bulk updates.

### 53.6 Review Checklist
- [ ] Is every administrative action recorded in an immutable audit log?
- [ ] Is access governed by granular least-privilege permissions?
- [ ] Is MFA enforced for all administrative sessions?
- [ ] Are bulk data exports rate-limited and watermarked?
- [ ] Do destructive actions require explicit double-confirmation?

### 53.7 Quality Checklist
- [ ] Administrative permission matrix tests verify that restricted roles cannot access unauthorized admin actions.
- [ ] Audit log verification tests confirm audit entries cannot be updated or deleted even by administrators.

### 53.8 Security Considerations
- Administrative portals are the highest-value targets for attackers. They MUST be protected behind Cloudflare Access or VPN zero-trust perimeter gates.
- Implement automated anomaly detection that alerts security teams if an admin account triggers unusually high export or deletion volumes.

### 53.9 Performance Considerations
- Admin dashboard queries MUST query dedicated PostgreSQL read-replicas to prevent heavy analytical reports from impacting live booking transactions.
- Use virtualized lists (`react-virtual`) for rendering high-density data tables containing thousands of moderation items.

### 53.10 Future Scalability
- Modular, permission-based admin consoles can scale effortlessly to support decentralized regional administrative teams across all 28 states and 8 union territories of Bharat.

---

# SECTION 54: TESTING STANDARDS

### 54.1 Purpose
Testing Standards establish a comprehensive, automated quality engineering framework across Explore Bharat Safar. By enforcing deterministic testing methodologies and the testing pyramid, this standard guarantees zero-regression releases and absolute reliability across all platform capabilities.

### 54.2 Rules
1. **Testing Pyramid Mandate**: The test distribution MUST follow the industry-standard pyramid:
   - **70% Unit Tests**: Fast, isolated, in-memory tests of pure business logic and algorithms.
   - **20% Integration Tests**: Service and database adapter tests verifying boundary contracts.
   - **10% End-to-End (E2E) Tests**: High-value critical path user journeys across real browsers.
2. **Deterministic Test Execution**: Tests MUST be 100% deterministic. Flaky tests, tests depending on external live networks, and tests relying on indeterminate system clocks or random numbers are strictly forbidden.
3. **Continuous Integration Gate**: All test suites MUST execute automatically in GitHub Actions CI pipelines on every pull request. No code can be merged if a single test fails.
4. **Realistic Test Data via Factories**: Test data MUST be synthesized using type-safe factories (e.g., Fishery) and deterministic seeding scripts, NEVER using production customer data (protecting privacy).
5. **Mocking at Boundaries Only**: Unit tests MUST mock only external system boundaries (network HTTP calls, third-party payment gateways, message brokers). Mocking internal business logic or domain entities is strictly prohibited.

### 54.3 Best Practices
- Run tests in parallel across monorepo packages using Turborepo caching.
- Enforce the AAA (Arrange, Act, Assert) pattern across all test suites for uniform readability.
- Treat test code with the same high standards of clean code, linting, and refactoring as production code.

### 54.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A test suite for dynamic fee calculation defines 10 distinct parameterized test cases using `test.each()`, evaluating varied group sizes, peak season multipliers, and verifying exact integer paise outputs.
- *Conceptual Negative Pattern*: A 400-line test script that calls the live Razorpay production API, sleeps for 10 seconds using `setTimeout`, and asserts that a web page contains text without checking any assertions if the network times out.

### 54.5 Common Mistakes
- Writing E2E tests for simple edge cases that could be verified in 2 milliseconds via a unit test.
- Checking in hardcoded credentials or API keys inside test fixtures.
- Disabling failing tests with `.skip` or `xit` to pass CI deadlines.

### 54.6 Review Checklist
- [ ] Does the test suite adhere to the 70/20/10 testing pyramid?
- [ ] Are tests fully deterministic with zero dependence on live third-party APIs?
- [ ] Is test data generated safely using factories without production PII?
- [ ] Do tests mock exclusively at external architectural boundaries?

### 54.7 Quality Checklist
- [ ] CI pipeline executes the complete test matrix across all packages in $< 5\text{ minutes}$ using parallelization.
- [ ] Zero skipped or disabled tests permitted on the production trunk branch.

### 54.8 Security Considerations
- Never use real customer PII or production database dumps in testing environments (violates DPDP Act).
- Automated DAST security tests MUST run in staging environments prior to production canary releases.

### 54.9 Performance Considerations
- Unit tests MUST execute completely in memory with execution times $< 50\text{ms}$ per test file.
- Use Dockerized tmpfs ramdisks for Testcontainers PostgreSQL integration testing to achieve sub-second database operations.

### 54.10 Future Scalability
- A rock-solid, comprehensive test suite provides the ultimate safety net for future architectural refactoring, framework major upgrades, and automated AI code generation.

---

# SECTION 55: UNIT TESTING RULES

### 55.1 Purpose
Unit Testing Rules govern the authoring, structure, and execution of fast, isolated unit tests across Explore Bharat Safar, verifying that individual functions, domain entities, value objects, and algorithms function with mathematical correctness.

### 55.2 Rules
1. **Arrange-Act-Assert (AAA) Structure**: Every unit test MUST be clearly structured into three distinct, readable phases:
   - **Arrange**: Set up the test inputs, mocked boundary ports, and expected outputs.
   - **Act**: Execute the single function or method under test.
   - **Assert**: Verify the output, return values, and state changes with explicit assertions.
2. **Complete Isolation**: Unit tests MUST run purely in memory without spawning HTTP servers, connecting to physical databases, or accessing the local file system.
3. **Single Concept per Test**: Each unit test MUST verify a single business behavior or boundary condition. Combining multiple unrelated assertions across multiple actions in one test is forbidden.
4. **Boundary and Edge Case Coverage**: Tests MUST rigorously evaluate boundary conditions: zero values, empty arrays, maximum capacity thresholds, leap years, negative numbers, and invalid string formats.
5. **Vitest as Standard Runner**: Unit tests across the monorepo MUST use Vitest for blazing-fast in-memory execution and native ESM/TypeScript compilation.

### 55.3 Best Practices
- Name test files with `.spec.ts` for logic services and `.test.tsx` for React UI components.
- Use descriptive test names following the pattern: `it('should [expected behavior] when [condition]')`.
- Leverage parameterized tests (`test.each`) to test mathematical algorithms across diverse input matrices.

### 55.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  ```typescript
  describe('calculateDynamicAdvanceFee', () => {
    it('should return 20% advance when booking window is greater than 30 days', () => {
      // Arrange
      const batchDate = new Date('2026-11-01');
      const bookingDate = new Date('2026-09-01');
      const totalAmountInPaise = 100000;
      // Act
      const result = calculateDynamicAdvanceFee(totalAmountInPaise, batchDate, bookingDate);
      // Assert
      expect(result).toBe(20000);
    });
  });
  ```
- *Conceptual Negative Pattern*: A single test named `testEverything()` that creates 5 mock objects, calls 8 different service methods sequentially, and ends with `expect(true).toBe(true)`.

### 55.5 Common Mistakes
- Testing framework or library internals instead of testing domain business logic.
- Over-mocking, where the test mocks so many internal collaborators that it tests nothing meaningful.
- Relying on real system time (`new Date()`) instead of mocking the system clock with `vi.setSystemTime()`, causing tests to fail on different dates.

### 55.6 Review Checklist
- [ ] Is the test structured into clear Arrange, Act, and Assert sections?
- [ ] Does the test run completely in memory with zero external I/O?
- [ ] Does each test assert a single specific behavior?
- [ ] Are boundary values, empty states, and error paths thoroughly covered?

### 55.7 Quality Checklist
- [ ] Unit test execution completes in $< 10\text{ seconds}$ across the entire monorepo.
- [ ] Unit tests achieve $> 90\%$ line and branch coverage on core business logic packages.

### 55.8 Security Considerations
- Unit tests MUST explicitly test security boundary conditions (e.g., verifying that unauthorized roles throw `ForbiddenException`, or that negative payment amounts are rejected).
- Ensure test assertion error messages do not print sensitive test credentials to CI logs.

### 55.9 Performance Considerations
- In-memory execution without network or disk overhead ensures developers run unit tests continuously during local TDD cycles.
- Mock heavy math libraries or WebGL contexts in UI unit tests to keep component render tests sub-millisecond.

### 55.10 Future Scalability
- Comprehensive unit test suites provide instant verification during TypeScript compiler updates and automated library refactorings.

---

# SECTION 56: INTEGRATION TESTING RULES

### 56.1 Purpose
Integration Testing Rules govern the automated verification of communication channels, database queries, cache operations, and API contracts between multiple architectural components across Explore Bharat Safar.

### 56.2 Rules
1. **Real Infrastructure via Testcontainers**: Integration tests verifying database and cache operations MUST run against real, ephemeral containerized instances of PostgreSQL 16 (with PostGIS) and Redis 7.2 using Testcontainers. Mocking SQL or Redis commands in integration tests is strictly prohibited.
2. **Transaction Rollback Isolation**: Database integration tests MUST execute within isolated database transactions that roll back automatically at the end of each test, guaranteeing a pristine, pollution-free database state for subsequent tests.
3. **Supertest for API Contract Verification**: API endpoint integration tests MUST use Supertest to execute real HTTP requests against the NestJS application instance, verifying request validation, routing guards, status codes, and response envelopes.
4. **Third-Party Integration Mocking via WireMock**: External third-party HTTP APIs (Razorpay, SMS Gateway, Weather API) MUST be simulated using deterministic HTTP mock servers (e.g., WireMock or MSW), verifying network timeout handling and error responses.
5. **No Shared Mutable State**: Integration tests MUST be capable of running in parallel without data collisions, using unique identifiers (UUIDs) for generated test entities.

### 56.3 Best Practices
- Group integration tests in dedicated `test/integration/` directories.
- Run database migrations automatically against the Testcontainers PostgreSQL instance during test suite setup.
- Verify complex PostGIS spatial queries (e.g., polygon intersection, distance radius) against known geographic coordinate test sets.

### 56.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An integration test boots a Testcontainers PostgreSQL container with PostGIS, runs Prisma migrations, inserts a real village with polygon coordinates, queries the spatial endpoint via Supertest, and asserts that `ST_Contains` correctly returns the village for a point within its boundary.
- *Conceptual Negative Pattern*: An "integration test" that mocks the Prisma client with `vi.fn()` to return a hardcoded fake object, testing zero real SQL query execution or database constraint rules.

### 56.5 Common Mistakes
- Hardcoding static primary keys (`id: '1'`) across multiple tests, causing unique constraint collisions when tests run concurrently.
- Leaving test database records behind after test completion, causing subsequent test suites to fail intermittently.
- Overlooking slow query integration tests for complex joins and spatial calculations.

### 56.6 Review Checklist
- [ ] Do integration tests run against real PostgreSQL/PostGIS and Redis via Testcontainers?
- [ ] Are database mutations isolated via transaction rollback or clean teardowns?
- [ ] Are API contracts verified end-to-end via Supertest?
- [ ] Are third-party vendor APIs mocked deterministically via WireMock or MSW?

### 56.7 Quality Checklist
- [ ] Integration test suite executes successfully in CI inside Docker environments.
- [ ] All database queries, foreign key constraints, and spatial indexes are verified against real PostgreSQL.

### 56.8 Security Considerations
- Integration tests MUST verify that SQL injection attempts are neutralized by the ORM parameterization layer.
- Verify that authentication guards and RBAC interceptors correctly reject unauthorized requests at the HTTP layer.

### 56.9 Performance Considerations
- Reuse a single Testcontainers PostgreSQL container across multiple test suites within the same test worker to minimize container startup overhead.
- Utilize ramdisks (`tmpfs`) for database storage during integration test runs to achieve maximum I/O performance.

### 56.10 Future Scalability
- Real-infrastructure integration testing guarantees that database engine updates (e.g., upgrading PostGIS) or query planner shifts can be validated with complete confidence prior to production deployment.

---

# SECTION 57: END-TO-END (E2E) TESTING RULES

### 57.1 Purpose
End-to-End (E2E) Testing Rules govern automated browser-based testing of critical user journeys across Explore Bharat Safar, verifying that the frontend, backend, database, and asynchronous queues work together harmoniously from the user's perspective.

### 57.2 Rules
1. **Playwright as Standard E2E Framework**: All E2E test suites MUST be authored and executed using Microsoft Playwright. Legacy frameworks (Cypress, Selenium, Puppeteer) are prohibited.
2. **Critical Path Journeys Focus**: E2E tests MUST focus strictly on high-value, revenue-critical, and mission-critical user journeys:
   - Journey 1: Discover Destination $\rightarrow$ View 3D Landmark $\rightarrow$ Read Cultural History.
   - Journey 2: Search Village via Cadastral Filter $\rightarrow$ View Heritage Guide $\rightarrow$ Connect with Artisan.
   - Journey 3: Select Experience Batch $\rightarrow$ Lock Slot (15-min TTL) $\rightarrow$ Complete Mock Payment $\rightarrow$ Download Signed PDF/A-1b Certificate.
   - Journey 4: Traveller Sign-up $\rightarrow$ Upload Story $\rightarrow$ Publish Travel Journal.
3. **User-Facing Locators Mandate**: Playwright tests MUST locate elements using user-facing semantic locators (`getByRole`, `getByLabel`, `getByText`). Locating elements via fragile CSS classes or internal XPath selectors is strictly prohibited.
4. **Deterministic Mocking of External Payment Providers**: E2E tests running in automated CI MUST stub external payment gateways (Razorpay modal) using deterministic mock fixtures to prevent financial transactions and flaky third-party failures.
5. **Cross-Browser & Mobile Viewport Matrix**: E2E tests MUST execute across Chromium, Firefox, WebKit (Safari), and mobile device viewports (Pixel, iPhone).

### 57.3 Best Practices
- Execute E2E tests against preview deployments or staging environments in CI.
- Use Playwright trace files, video recordings, and screenshots automatically captured upon test failure for instant debugging.
- Implement explicit auto-waiting assertions (`await expect(locator).toBeVisible()`) rather than manual `page.waitForTimeout()`.

### 57.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  ```typescript
  test('explorer can successfully reserve experience slots', async ({ page }) => {
    await page.goto('/destinations/shivneri-fort');
    await page.getByRole('button', { name: /book expedition/i }).click();
    await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
    await page.getByRole('button', { name: /confirm reservation/i }).click();
    await expect(page.getByText(/slots held for 15:00 minutes/i)).toBeVisible();
  });
  ```
- *Conceptual Negative Pattern*:
  ```typescript
  test('book test', async ({ page }) => {
    await page.goto('/destinations/shivneri-fort');
    await page.waitForTimeout(5000); // Brittle arbitrary sleep
    await page.locator('.btn-primary-2 > div:nth-child(3)').click(); // Fragile CSS selector
  });
  ```

### 57.5 Common Mistakes
- Over-testing minor UI variations via E2E that should be covered by component unit tests.
- Using hardcoded `page.waitForTimeout(5000)` sleeps, drastically slowing down CI and causing flaky failures on slow runners.
- Writing tests that depend on the state left behind by previously executed tests.

### 57.6 Review Checklist
- [ ] Are tests authored using Playwright with user-facing semantic locators (`getByRole`)?
- [ ] Are tests focused exclusively on critical path user journeys?
- [ ] Are hardcoded arbitrary sleeps (`waitForTimeout`) completely absent?
- [ ] Do tests execute deterministically across Chromium, Firefox, and WebKit?

### 57.7 Quality Checklist
- [ ] Playwright test suite passes with zero flakiness across 10 consecutive CI runs.
- [ ] Failed tests automatically upload trace files and video artifacts to GitHub Actions.

### 57.8 Security Considerations
- Test user credentials used in E2E tests MUST be dedicated test accounts with zero access to live production databases.
- Ensure automated browser sessions test for clickjacking resistance and proper CSRF cookie handling.

### 57.9 Performance Considerations
- Run Playwright tests in parallel across multiple worker shards in CI to keep total E2E suite execution time under $10\text{ minutes}$.
- Mock heavy third-party tracking scripts (Google Analytics, Sentry) during E2E test runs to accelerate page load times.

### 57.10 Future Scalability
- Modular Playwright page object models (POM) allow UI changes to be updated in a single locator file without rewriting dozens of test specifications.

---

# SECTION 58: CODE COVERAGE TARGETS

### 58.1 Purpose
Code Coverage Targets establish quantitative minimum standards for test coverage across all packages in Explore Bharat Safar, ensuring that critical business logic, security guards, and financial workflows are rigorously tested before entering production.

### 58.2 Rules
1. **Domain-Specific Coverage Thresholds**:
   - **Booking, Ledger & Payment Subsystems**: Minimum **95% Statement & Branch Coverage**.
   - **Security, Auth & RBAC Subsystems**: Minimum **95% Statement & Branch Coverage**.
   - **Village Registry & Cadastral Hierarchy**: Minimum **90% Statement & Branch Coverage**.
   - **General Domain & API Routes**: Minimum **85% Statement & Branch Coverage**.
   - **Presentational UI Components**: Minimum **75% Statement Coverage**.
2. **Branch Coverage Priority**: High line coverage is insufficient on its own; all conditional branches (`if-else`, `switch`, ternary operators) MUST satisfy branch coverage thresholds.
3. **Zero Coverage Degradation Policy**: A pull request MUST NOT decrease the overall code coverage percentage of any package it modifies. CI quality gates will automatically reject any PR that causes coverage regression.
4. **Exclusion Governance**: Only configuration files (`*.config.ts`), database migration scripts, and pure type declarations (`*.types.ts`) may be excluded from coverage metrics. Exclusions MUST be explicitly justified in `vitest.config.ts`.

### 58.3 Best Practices
- Generate visual HTML coverage reports locally using `pnpm test:coverage` to identify untested logic paths during development.
- Integrate Codecov or SonarQube in GitHub Actions to comment detailed coverage diffs directly on pull requests.
- Focus on testing meaningful business outcomes rather than writing trivial tests simply to satisfy coverage quotas.

### 58.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A pull request modifying `SlotReservationService` introduces 40 new lines of code and includes 8 new unit test cases covering all edge cases, maintaining branch coverage at 98%.
- *Conceptual Negative Pattern*: A pull request introducing a new payment calculation method with zero tests, dropping the package's branch coverage from 95% to 88%, which gets blocked by the CI coverage gate.

### 58.5 Common Mistakes
- Writing "assertion-free" tests that execute code to inflate line coverage metrics without asserting correctness.
- Excluding critical business services from coverage configuration to bypass CI quality gates.
- Relying entirely on happy-path tests while neglecting error-path branch coverage.

### 58.6 Review Checklist
- [ ] Does the change meet or exceed the mandatory domain coverage threshold?
- [ ] Does the pull request maintain or increase the existing coverage percentage?
- [ ] Are all conditional branches and error paths verified?
- [ ] Are coverage exclusions limited strictly to config and type files?

### 58.7 Quality Checklist
- [ ] Automated CI gate (`vitest --coverage`) enforces minimum thresholds and blocks merging on failure.
- [ ] Codecov PR bot confirms positive or neutral coverage delta on every commit.

### 58.8 Security Considerations
- Untested code paths in authentication and financial services represent the primary targets for zero-day exploitation and edge-case attacks.
- High branch coverage ensures that input validation rejections and security exceptions are actively tested.

### 58.9 Performance Considerations
- Coverage instrumentation is enabled only during test suite execution; production builds compile with zero instrumentation overhead.
- Fast, parallelized test execution ensures that rigorous coverage checks do not slow down CI pipeline turnaround times.

### 58.10 Future Scalability
- Maintaining high coverage baselines allows large-scale architectural refactorings and dependency upgrades to proceed with near-zero defect leakage into production.

---

# SECTION 59: PULL REQUEST (PR) STANDARDS

### 59.1 Purpose
Pull Request Standards govern the process of proposing, documenting, and merging code changes into Explore Bharat Safar repository branches, ensuring high transparency, thorough reviewability, and zero disruption to the main trunk.

### 59.2 Rules
1. **Size Limit Mandate ($\le 400\text{ Lines of Code}$)**: A pull request MUST NOT exceed 400 lines of modified code (excluding auto-generated lockfiles and snapshots). Large features MUST be decomposed into smaller, sequential, independently reviewable pull requests.
2. **Mandatory PR Template Completion**: Every PR MUST complete the official Explore Bharat Safar PR template, including:
   - Context & Business Purpose (linking to Jira/GitHub Issue)
   - Architectural Summary of Changes
   - Verification Strategy & Test Results (with screenshots/recordings for UI changes)
   - Quality & Security Checklist Confirmation
3. **Automated CI Gate Pass Requirement**: All automated CI checks (Lint, Typecheck, Unit Tests, Integration Tests, E2E, SAST, Security Scan) MUST pass with green status before a PR can be merged.
4. **Mandatory Two-Approval Rule**: Every PR requires a minimum of **two independent peer approvals**, including at least one Staff Engineer / Tech Lead approval, before merging.
5. **Linear Git History via Squash & Merge**: Merging into the `main` trunk MUST be performed using **Squash and Merge**, producing a single clean, atomic commit conforming to Conventional Commits.

### 59.3 Best Practices
- Author self-reviews: Review your own PR diff thoroughly on GitHub before requesting peer reviews.
- Keep PR descriptions concise and focused on *why* the change was made, not just *what* changed.
- Rebase feature branches frequently against `origin/main` to resolve conflicts early.

### 59.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A PR titled `feat(booking): implement 15-minute Redlock slot reservation` containing 280 lines of code across 5 files, complete with unit tests, integration test logs, and clear acceptance criteria verification.
- *Conceptual Negative Pattern*: A massive PR titled `updates` modifying 75 files with 3,500 lines of code, combining UI redesign, database migration, and auth refactor with no description or test evidence.

### 59.5 Common Mistakes
- Submitting "mega-PRs" that take reviewers days to evaluate, leading to review fatigue and missed bugs.
- Merging PRs with broken CI builds using administrative override permissions.
- Leaving unresolved review comments before merging.

### 59.6 Review Checklist
- [ ] Is the PR under the 400-line threshold?
- [ ] Is the official PR template completely filled out with issue links?
- [ ] Have all automated CI quality gates passed?
- [ ] Have at least two qualified engineers approved the PR?
- [ ] Is the commit message formatted according to Conventional Commits?

### 59.7 Quality Checklist
- [ ] GitHub branch protection rules enforce passing CI, required approvals, and linear history.
- [ ] Automated PR size bots warn authors when changes exceed 400 lines of code.

### 59.8 Security Considerations
- Requiring two independent approvals prevents malicious insider threats or unauthorized code injection into production branches.
- Automated secret and vulnerability scanners must analyze every PR diff before approval.

### 59.9 Performance Considerations
- Small, focused PRs result in rapid code review cycles, reducing branch divergence and eliminating complex, high-risk merge conflicts.
- Squash and merge maintains a clean, linear git history that is easy to bisect and audit during incident investigations.

### 59.10 Future Scalability
- Rigorous PR standards allow hundreds of engineers and autonomous AI agents to collaborate simultaneously in a single monorepo without degrading codebase quality.

---

# SECTION 60: CODE REVIEW CHECKLIST & WORKFLOW

### 60.1 Purpose
The Code Review Checklist & Workflow establishes a multi-tier peer review rubric for evaluating all code changes in Explore Bharat Safar, balancing speed of delivery with uncompromising architectural integrity, security, and performance.

### 60.2 Rules
1. **Multi-Tier Review Hierarchy**:
   - **Tier 1 (Automated Bot Review)**: Linters, type checks, security scanners, and test suites run automatically; human reviewers do NOT review code until Tier 1 is completely green.
   - **Tier 2 (Peer Review)**: A squad peer evaluates domain logic, clean code adherence, test coverage, and naming standards.
   - **Tier 3 (Architectural / Lead Review)**: A Tech Lead or Staff Engineer evaluates architectural boundaries, security implications, database query efficiency, and scalability.
2. **Review Turnaround SLA**: Code reviews MUST be completed within **24 hours** of submission during standard working days.
3. **Constructive and Professional Tone**: Code reviews MUST be objective, constructive, and kind. Critique the code, never the author. Praise elegant solutions and explain the *rationale* behind requested changes.
4. **All Comments Must Be Resolved**: Every comment or question raised during review MUST be explicitly resolved or marked as addressed by the reviewer before merging.

### 60.3 Best Practices
- Reviewers should pull the branch locally and test it if the change involves complex UI interactions or data migrations.
- Use standard review prefixes: `[blocking]`, `[nit]`, `[question]`, `[suggestion]` to communicate the urgency of feedback.
- If a discussion requires more than three back-and-forth comments, hop on a quick call to align, then document the resolution on the PR.

### 60.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: A reviewer comments: `[blocking]: This PostGIS query lacks a bounding-box pre-filter (&&). On a table with 650,000 villages, this will cause a full table scan. Please add ST_TileEnvelope clipping as specified in Section 49.3.`
- *Conceptual Negative Pattern*: A reviewer comments: `This is bad. Rewrite it.` with no technical explanation or guidance.

### 60.5 Common Mistakes
- Reviewing formatting and indentation manually instead of delegating that entirely to Prettier and ESLint.
- Rubber-stamping PRs with "LGTM" without thoroughly reviewing test coverage or potential edge cases.
- Letting PRs sit in review queues for days, stalling engineering momentum.

### 60.6 Review Checklist (The Master Reviewer Rubric)
- [ ] **Architecture**: Does the code respect Clean Architecture boundaries and avoid circular imports?
- [ ] **Clean Code**: Are functions small, intention-revealing, and operating at a single level of abstraction?
- [ ] **Correctness**: Does the code accurately satisfy the business requirements without side effects?
- [ ] **Security**: Are all inputs validated with Zod, queries parameterized, and PII masked?
- [ ] **Performance**: Are database queries indexed, N+1 queries eliminated, and bundle size limits respected?
- [ ] **Accessibility**: Are interactive UI components accessible via keyboard and screen readers (WCAG AA)?
- [ ] **Tests**: Are unit and integration tests present, deterministic, and satisfying coverage targets?

### 60.7 Quality Checklist
- [ ] PR review template incorporates the 7-point master reviewer rubric.
- [ ] Engineering metrics track review turnaround times and review depth.

### 60.8 Security Considerations
- Code reviews serve as a primary defense against unauthorized backdoors, insecure cryptographic implementations, and OWASP Top 10 vulnerabilities.
- Any change touching authentication, financial ledger, or encryption logic requires sign-off from a designated Security Officer.

### 60.9 Performance Considerations
- Code reviews catch architectural performance regressions (e.g., missing indexes, unmemoized loops) long before they reach production profiling.
- Automated CI bots handle mechanical checks, allowing human reviewers to focus 100% of their attention on high-level architecture and logic.

### 60.10 Future Scalability
- A structured, respectful, and thorough code review culture fosters continuous learning, institutional knowledge sharing, and high engineering excellence across expanding teams.

---


# PART V: GOVERNANCE, RELEASE ENGINEERING & MASTER VERIFICATION CHECKLISTS

# SECTION 61: DOCUMENTATION STANDARDS

### 61.1 Purpose
Documentation Standards govern technical writing, in-code documentation, Architecture Decision Records (ADRs), and API specifications across Explore Bharat Safar, ensuring that the platform's architectural intent and operational requirements remain fully transparent and self-sustaining across a multi-decade horizon.

### 61.2 Rules
1. **TSDoc for All Public Interfaces**: Every exported interface, type, function, class, and service method MUST be documented using standard TSDoc syntax (`/** ... */`), detailing its business intent, parameter descriptions (`@param`), return values (`@returns`), and potential exceptions (`@throws`).
2. **Architecture Decision Records (ADR) Mandatory**: Any significant architectural change—introducing a new dependency, altering database topologies, modifying security models, or changing bounded context boundaries—MUST be proposed, reviewed, and recorded as an ADR in `docs/adr/`.
3. **OpenAPI / Swagger Contract Synchronization**: All backend REST endpoints MUST be fully annotated with NestJS Swagger decorators, ensuring the generated OpenAPI specification remains 100% synchronized with live code.
4. **Zero Outdated Documentation**: Modifying code without updating its corresponding documentation, tests, and comments in the same pull request is strictly forbidden.
5. **No Trivial Comments**: Comments MUST explain the *why* (business intent, regulatory reason, edge-case rationale), NEVER the *what* (stating what the code obviously does).

### 61.3 Best Practices
- Generate HTML API documentation automatically using TypeDoc as part of the CI documentation pipeline.
- Keep README files in each package's root explaining its responsibility, development setup, and testing commands.
- Include visual Mermaid diagrams within markdown documentation to clarify complex workflows and state transitions.

### 61.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*:
  ```typescript
  /**
   * Calculates the dynamic advance deposit required for an experience batch.
   *
   * In accordance with Business Rule 26.4, bookings made > 30 days prior
   * require a 20% advance; bookings <= 30 days require a 50% advance.
   *
   * @param totalAmountInPaise - Total booking price in integer paise (INR * 100).
   * @param batchStartDate - Start date of the scheduled expedition batch.
   * @param bookingDate - Timestamp when the reservation is initiated.
   * @returns The required advance amount in integer paise.
   * @throws {InvalidDateRangeException} When bookingDate is after batchStartDate.
   */
  ```
- *Conceptual Negative Pattern*:
  ```typescript
  // calculate advance
  function calc(a, b, c) { ... }
  ```

### 61.5 Common Mistakes
- Writing redundant comments that restate the code: `i++; // Increment i`.
- Leaving outdated comments after refactoring a function's behavior, confusing future developers.
- Committing large architectural changes without an approved Architecture Decision Record (ADR).

### 61.6 Review Checklist
- [ ] Are all public interfaces, methods, and types documented with TSDoc?
- [ ] Do comments explain the business "why" rather than the obvious "what"?
- [ ] Has an ADR been submitted if architectural patterns or dependencies were changed?
- [ ] Is OpenAPI documentation updated and accurate?

### 61.7 Quality Checklist
- [ ] TypeDoc builds cleanly with zero documentation syntax errors.
- [ ] OpenAPI schema validator confirms all endpoints have valid request/response schemas.

### 61.8 Security Considerations
- Ensure documentation and TSDoc examples do not contain real API keys, production tokens, or sensitive internal credentials.
- Security-critical functions MUST explicitly document their security assumptions and privilege requirements.

### 61.9 Performance Considerations
- TSDoc comments and in-code annotations are completely stripped during compilation and bundling, having zero impact on production bundle sizes or runtime performance.
- Clear documentation drastically accelerates incident response and debugging during live production outages.

### 61.10 Future Scalability
- High-quality, machine-readable TSDoc annotations and OpenAPI specs provide the semantic foundation required for autonomous AI coding agents to maintain and extend the platform safely.

---

# SECTION 62: GIT COMMIT MESSAGE STANDARDS

### 62.1 Purpose
Git Commit Message Standards establish a clean, readable, and machine-parsable version control history across Explore Bharat Safar, enabling automated semantic versioning, changelog generation, and rapid auditability.

### 62.2 Rules
1. **Conventional Commits 1.0.0 Mandate**: All commit messages MUST strictly adhere to the Conventional Commits specification:
   `<type>(<optional scope>): <description>`
2. **Standard Commit Types**:
   - `feat`: A new user-facing feature or domain capability.
   - `fix`: A bug fix in existing behavior.
   - `refactor`: Code change that neither fixes a bug nor adds a feature.
   - `perf`: Code change that improves runtime performance or reduces memory usage.
   - `test`: Adding missing tests or correcting existing tests.
   - `docs`: Documentation-only changes (markdown, TSDoc).
   - `chore`: Maintenance tasks, dependency updates, build tooling.
   - `ci`: Changes to CI/CD workflows and automation scripts.
3. **Mandatory Scope Notation**: The scope MUST indicate the affected package or feature: `feat(booking):`, `fix(village-registry):`, `refactor(gis-core):`, `perf(map-engine):`.
4. **Imperative Mood, Lowercase, No Period**: The description MUST be in the imperative mood ("add", "fix", "change", not "added", "fixes", "changing"), start with a lowercase letter, and MUST NOT end with a period.
5. **Breaking Changes Annotation**: Breaking changes MUST include an exclamation mark before the colon (`feat(api)!:`) and a `BREAKING CHANGE:` footer explaining the migration path.

### 62.3 Best Practices
- Keep the first line (header) under 72 characters for optimal display in git log and GitHub UI.
- Provide a detailed body paragraph separated by a blank line for complex commits, explaining the context and rationale.
- Reference issue and ticket numbers in the commit footer (`Closes #1234`, `Refs EBS-567`).

### 62.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `feat(booking): implement 15-minute Redlock distributed slot locking`
- *Conceptual Positive Breaking Change*:
  ```
  feat(api)!: migrate village coordinates to GeoJSON geometry object

  BREAKING CHANGE: The 'lat' and 'lng' scalar fields have been replaced
  by a GeoJSON Point object: { type: 'Point', coordinates: [lng, lat] }.
  ```
- *Conceptual Negative Pattern*: `Fixed stuff`, `wip`, `bug fix`, `updated files.`, `FEAT: ADD BOOKING`

### 62.5 Common Mistakes
- Using past tense: `fixed(auth): fixed login bug`.
- Capitalizing the description or ending with a trailing period.
- Combining unrelated changes into a single commit with a vague title.

### 62.6 Review Checklist
- [ ] Does the commit header conform to `<type>(<scope>): <description>`?
- [ ] Is the description in the imperative mood, lowercase, and without a trailing period?
- [ ] Is the header under 72 characters?
- [ ] Are breaking changes explicitly annotated with `!` and `BREAKING CHANGE:`?

### 62.7 Quality Checklist
- [ ] Git commit-msg hook (`commitlint` + Husky) enforces Conventional Commits before allowing commit creation.
- [ ] Automated changelog generator extracts release notes directly from commit history.

### 62.8 Security Considerations
- Commit messages are permanently preserved in Git history; NEVER include passwords, tokens, customer data, or internal IP addresses in commit messages.
- Commit signatures (GPG) verify author authenticity and prevent commit spoofing.

### 62.9 Performance Considerations
- Standardized commit messages allow semantic-release bots to compute release bumps (`patch`, `minor`, `major`) and publish changelogs automatically in CI.
- Clean git history makes `git bisect` fast and reliable for identifying the exact commit that introduced a performance regression.

### 62.10 Future Scalability
- Machine-readable commit history provides clear audit trails for regulatory compliance, ISO certification, and financial audits.

---

# SECTION 63: VERSION CONTROL BEST PRACTICES

### 63.1 Purpose
Version Control Best Practices govern branching strategies, repository hygiene, and code synchronization across Explore Bharat Safar, preventing branch divergence, merge conflicts, and un-tracked changes.

### 63.2 Rules
1. **Trunk-Based Development**: The repository follows Trunk-Based Development. The `main` branch is the authoritative production trunk and MUST always remain releasable. Long-lived feature branches lasting more than 3 days are strictly prohibited.
2. **Short-Lived Feature Branches**: Engineers MUST work on short-lived branches created from `main`, named with standard conventions:
   - `feature/<ticket-id>-<short-description>`
   - `bugfix/<ticket-id>-<short-description>`
   - `hotfix/<ticket-id>-<short-description>`
3. **Squash and Merge to Trunk**: Feature branches MUST be merged into `main` using GitHub's **Squash and Merge** strategy, consolidating branch commits into a single atomic commit.
4. **Mandatory GPG-Signed Commits**: All commits pushed to the repository MUST be cryptographically signed with a verified GPG key. Unsigned commits will be rejected by GitHub branch protection rules.
5. **Zero Direct Pushes to Protected Branches**: Direct pushes to `main`, `staging`, or release branches are blocked at the repository level; all changes MUST arrive via reviewed pull requests.

### 63.3 Best Practices
- Pull and rebase against `origin/main` daily to identify and resolve integration conflicts early.
- Delete feature branches immediately after merging to keep the remote repository clean.
- Use Git LFS (Large File Storage) for large binary assets; never commit multi-megabyte binaries directly to git trees.

### 63.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Creating branch `feature/EBS-342-village-moderation-queue`, rebasing regularly on `origin/main`, passing CI, and squash-merging with commit title `feat(village): implement 3-tier moderation queue`.
- *Conceptual Negative Pattern*: A developer works locally on a branch for two months with 150 unstructured commits, and attempts a 3-way merge into `main` with 40 merge conflict markers.

### 63.5 Common Mistakes
- Using `git merge main` inside a feature branch, polluting branch history with merge bubbles.
- Force-pushing (`git push -f`) to shared public branches, overwriting other engineers' work.
- Committing build artifacts (`dist/`, `.next/`, `node_modules/`) by omitting `.gitignore`.

### 63.6 Review Checklist
- [ ] Is the branch named according to standard conventions (`feature/`, `bugfix/`)?
- [ ] Has the branch been rebased against current `origin/main`?
- [ ] Are all commits cryptographically signed?
- [ ] Is the branch short-lived ($< 3\text{ days}$)?

### 63.7 Quality Checklist
- [ ] GitHub branch protection rules enforce passing status checks, code reviews, and signed commits.
- [ ] Automated branch cleanup bot deletes merged branches automatically.

### 63.8 Security Considerations
- Cryptographic commit signing prevents malicious actors from impersonating technical leads or injecting unauthorized commits into the codebase.
- Branch protection rules prevent accidental or malicious deletion of production release branches.

### 63.9 Performance Considerations
- Trunk-based development eliminates "merge hell" and minimizes the engineering overhead of resolving complex multi-file conflicts.
- Keeping the git repository free of large binary files ensures fast clone, fetch, and checkout times across CI runners and developer machines.

### 63.10 Future Scalability
- Trunk-based development paired with continuous deployment enables high-velocity engineering organizations to deploy dozens of updates to production daily with complete stability.

---

# SECTION 64: DEPENDENCY MANAGEMENT RULES

### 64.1 Purpose
Dependency Management Rules establish governance over package installation, version pinning, lockfile immutability, and dependency lifecycles across the Explore Bharat Safar monorepo workspace.

### 64.2 Rules
1. **pnpm as the Exclusive Package Manager**: All dependency management MUST be executed using `pnpm`. Running `npm` or `yarn` inside the repository is strictly prohibited and blocked by pre-install scripts.
2. **Immutable Lockfile Mandate in CI**: CI pipelines MUST install dependencies using `pnpm install --frozen-lockfile`. Modifying `pnpm-lock.yaml` inside CI environments is strictly forbidden.
3. **Workspace Protocol (`workspace:*`)**: Internal dependencies between packages MUST use the pnpm workspace protocol: `"@ebs/types": "workspace:*"`.
4. **Deduplication Enforcement**: The monorepo MUST maintain a single hoisted version of shared third-party packages (e.g., `react`, `zod`, `typescript`). Duplicate conflicting versions across packages are blocked via `pnpm dedupe --check`.
5. **Automated Vulnerability Scanning**: Any pull request introducing a dependency with a known Critical or High vulnerability (CVSS $\ge 7.0$) will be automatically blocked by CI security scans (`pnpm audit`, Trivy).

### 64.3 Best Practices
- Run `pnpm outdated` monthly to monitor available updates.
- Keep devDependencies strictly separated from production dependencies to minimize container image sizes.
- Verify package provenance and ensure published npm packages originate from verified GitHub Actions publishers.

### 64.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: `"dependencies": { "zod": "3.23.8", "@ebs/validators": "workspace:*" }` installed with `pnpm add zod --save-exact`.
- *Conceptual Negative Pattern*: `"dependencies": { "zod": "^3.0.0", "lodash": "latest" }` installed with standard `npm install`, creating a redundant `package-lock.json` file.

### 64.5 Common Mistakes
- Committing changes to `package.json` without committing the updated `pnpm-lock.yaml`, breaking CI builds.
- Installing production dependencies into `devDependencies` or vice-versa.
- Ignoring security warnings during local `pnpm install`.

### 64.6 Review Checklist
- [ ] Are dependencies managed exclusively with pnpm?
- [ ] Are internal monorepo packages referenced via `workspace:*`?
- [ ] Are external production dependencies pinned to exact versions?
- [ ] Is `pnpm-lock.yaml` synchronized and committed?

### 64.7 Quality Checklist
- [ ] `pnpm install --frozen-lockfile` runs cleanly in all CI pipelines.
- [ ] `pnpm dedupe --check` confirms zero redundant package versions in the lockfile.

### 64.8 Security Considerations
- Strict lockfiles protect against supply-chain compromise by pinning package cryptographic SHA-512 integrity hashes.
- Automated dependency bots (Renovate) must verify packages have been published for at least 7 days before proposing updates, mitigating zero-day malicious npm releases.

### 64.9 Performance Considerations
- pnpm's global content-addressable storage saves gigabytes of disk space and accelerates dependency installations by up to 300% compared to npm.
- Eliminating duplicate package versions keeps frontend JavaScript bundle sizes minimal.

### 64.10 Future Scalability
- Cohesive workspace dependency governance enables seamless multi-package refactorings and deterministic Docker container builds across diverse cloud architectures.

---

# SECTION 65: THIRD-PARTY LIBRARY POLICY

### 65.1 Purpose
The Third-Party Library Policy establishes a rigorous 8-point architectural rubric that any external library MUST pass before being introduced into the Explore Bharat Safar codebase, preventing bloat, license liabilities, and unmaintained code.

### 65.2 Rules
1. **The 8-Point Adoption Rubric**: Any proposed third-party library MUST be evaluated against:
   - *1. Business Necessity*: Cannot be reasonably implemented in $< 50\text{ lines}$ of clean TypeScript.
   - *2. License Compliance*: Must use permissive licenses: MIT, Apache-2.0, BSD-2/3-Clause, ISC. Copyleft licenses (GPL, AGPL, SSPL) are strictly forbidden.
   - *3. Active Maintenance*: Regular commits within the last 90 days; active issue triage.
   - *4. Community Adoption*: Established track record; widespread enterprise usage.
   - *5. Native TypeScript Support*: Must ship with first-class TypeScript types or official `@types/*`.
   - *6. Bundle Size Impact*: Client-side libraries MUST NOT exceed $25\text{ KB}$ (gzipped) without formal ADR approval.
   - *7. Tree-Shaking Support*: Must be authored in ECMAScript Modules (ESM) supporting tree-shaking.
   - *8. Zero Known Critical Vulnerabilities*: Pristine security record in Snyk / NVD.
2. **Formal Architecture Review Board (ARB) Approval**: Adding any new direct dependency to `apps/*` or `packages/*` requires explicit sign-off from the Tech Lead / Architect in the pull request.
3. **No Duplicate Libraries for the Same Purpose**: The codebase MUST maintain a single library for a given capability (e.g., date manipulation: native `Intl` + `date-fns`; do NOT mix `moment`, `dayjs`, and `luxon`).

### 65.3 Best Practices
- Inspect library bundle impact using `bundlephobia.com` before proposing a dependency.
- Encapsulate third-party libraries behind internal domain adapters (Ports and Adapters pattern) so the library can be replaced without refactoring business logic.
- Avoid libraries that bring hundreds of transitive dependencies (check dependency tree depth).

### 65.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: Adopting `date-fns` for complex date mathematics: MIT license, modular ESM tree-shaking, first-class TypeScript, zero transitive dependencies, $< 3\text{ KB}$ per imported function.
- *Conceptual Negative Pattern*: Installing `moment.js` (68KB, mutable, non-tree-shakeable, deprecated) simply to format a single timestamp that native `Intl.DateTimeFormat` handles in one line.

### 65.5 Common Mistakes
- Installing a library with a viral GPL license, which legally contaminates enterprise proprietary software.
- Adding unmaintained libraries whose last commit was 4 years ago.
- Installing massive full-suite UI libraries when only a single component is needed.

### 65.6 Review Checklist
- [ ] Does the library satisfy all 8 points of the adoption rubric?
- [ ] Is the license permissive (MIT, Apache-2.0, BSD)?
- [ ] Does the client bundle size impact stay within the 25KB budget?
- [ ] Is the library wrapped behind an internal adapter interface?

### 65.7 Quality Checklist
- [ ] License checker script (`license-checker`) verifies 100% compliance in CI.
- [ ] PR size analysis bot displays bundle impact delta for newly added packages.

### 65.8 Security Considerations
- Insecure third-party packages are the leading entry point for enterprise software breaches. Every new package is a potential vector for supply-chain backdoors.
- Prohibit packages that execute install-time scripts (`preinstall`, `postinstall`) unless explicitly whitelisted in `pnpm.onlyBuiltDependencies`.

### 65.9 Performance Considerations
- Enforcing tree-shaking and bundle budgets prevents "death by a thousand dependencies," keeping browser initial load times sub-second.
- Pure ESM libraries load faster in Node.js and Next.js development environments.

### 65.10 Future Scalability
- Encapsulating third-party tools behind domain ports ensures the Explore Bharat Safar platform can migrate between vendor SDKs over its 20-year lifecycle without core code churn.

---

# SECTION 66: DEPRECATION POLICY

### 66.1 Purpose
The Deprecation Policy governs the planned, orderly retirement of obsolete functions, API endpoints, database columns, and component interfaces across Explore Bharat Safar, preventing sudden breaking changes for active users and API consumers.

### 66.2 Rules
1. **Two-Minor-Release Transition Period**: Public APIs, components, and services MUST NOT be abruptly removed. Deprecated capabilities MUST be supported for a minimum of two minor releases (or 90 days) before removal.
2. **Standard `@deprecated` TSDoc Annotation**: Deprecated code MUST be annotated with `@deprecated` including the replacement method and removal timeline:
   ```typescript
   /**
    * @deprecated Deprecated since v1.2.0. Use {@link fetchVillageByCadastralCode} instead.
    * Scheduled for removal in v1.4.0.
    */
   ```
3. **HTTP Deprecation Headers**: Deprecated API endpoints MUST return standard HTTP deprecation headers:
   - `Deprecation: @1735689600` (Unix timestamp of deprecation)
   - `Sunset: Sat, 01 Jul 2027 00:00:00 GMT` (Date of complete endpoint termination)
   - `Link: </api/v2/villages>; rel="successor-version"`
4. **Database Column Multi-Phase Deprecation**: Database columns MUST NOT be dropped immediately. Follow the Expand/Contract (Parallel Run) migration pattern:
   - Phase 1: Add new column; write to both old and new columns.
   - Phase 2: Backfill historical data; read exclusively from new column.
   - Phase 3: Stop writing to old column; mark deprecated.
   - Phase 4: Drop old column in a subsequent release.

### 66.3 Best Practices
- Log telemetry metrics whenever a deprecated API endpoint or function is invoked to monitor active migration progress.
- Publish a formal Migration Guide in `docs/migrations/` whenever introducing major breaking changes or deprecations.
- Run automated AST codemods to migrate internal codebase consumers to new APIs automatically.

### 66.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An endpoint `/api/v1/legacy-search` returns the requested data but includes `Deprecation: true`, `Sunset: 2027-01-01`, and logs a telemetry counter `deprecated_endpoint_invoked`.
- *Conceptual Negative Pattern*: A developer deletes a database column `user_phone` in a Friday migration because "no one uses it anymore," immediately breaking background workers and reporting dashboards.

### 66.5 Common Mistakes
- Deleting an API parameter without providing a deprecation period, breaking deployed mobile clients.
- Marking code as `@deprecated` but never actually scheduling or executing its removal, accumulating dead technical debt.
- Dropping database columns in the same deployment where application code stops reading them, causing errors during rolling canary updates.

### 66.6 Review Checklist
- [ ] Does the deprecated element carry the `@deprecated` TSDoc tag with replacement guidance?
- [ ] Are HTTP `Deprecation` and `Sunset` headers configured for deprecated API routes?
- [ ] Does database schema evolution follow the Expand/Contract 4-phase deprecation pattern?
- [ ] Is telemetry configured to monitor active usage of the deprecated interface?

### 66.7 Quality Checklist
- [ ] Deprecation telemetry alerts when usage of a deprecated feature reaches zero, clearing it for safe deletion.
- [ ] Linter highlights deprecated function calls as compiler warnings across consuming applications.

### 66.8 Security Considerations
- Deprecated endpoints often receive less maintenance and may harbor unpatched vulnerabilities; sunset dates MUST be strictly enforced to decommission old code paths.
- Ensure deprecated endpoints continue to enforce full authentication and authorization checks until the moment of decommission.

### 66.9 Performance Considerations
- Decommissioning obsolete database columns and indexes reclaims disk storage and accelerates table scan operations.
- Pruning deprecated JavaScript functions reduces client-side bundle weight.

### 66.10 Future Scalability
- A predictable deprecation policy builds high institutional trust with external API partners, government agencies, and mobile app users who depend on API stability.

---

# SECTION 67: MASTER SECURITY CHECKLIST (PRE-DEPLOYMENT)

### 67.1 Purpose
The Master Security Checklist establishes an exhaustive, non-omissible pre-deployment security gate that every release candidate MUST pass before being promoted to Explore Bharat Safar staging or production environments.

### 67.2 Rules
1. **Mandatory 100% Checklist Sign-off**: Every item in this checklist MUST be verified by the Security Architect and DevSecOps Lead. Releases with any unfulfilled security checks are strictly blocked from deployment.
2. **Zero Known Vulnerabilities**: Zero Critical or High CVEs in dependencies, base container images, or application code.
3. **Automated Verification First**: Manual verification is permitted only for items that cannot be validated via automated CI pipelines.
4. **Master Verification Rubric Enforcement**: The 15 security verification points below MUST all report PASS status:

| # | Security Verification Item | Verification Mechanism | Status Target |
| :--- | :--- | :--- | :--- |
| **01** | Zero plaintext secrets or API keys in code or git history | Gitleaks CI Scan | PASS (0 findings) |
| **02** | All network inputs validated at boundaries with strict Zod schemas | Zod Validation Audit | 100% Endpoints |
| **03** | All database queries fully parameterized (zero string interpolation) | SAST AST Linter | PASS (0 raw queries)|
| **04** | Authentication tokens signed with RS256; short-lived ($\le 15\text{m}$) | Auth Test Suite | PASS |
| **05** | Tokens delivered via `HttpOnly`, `Secure`, `SameSite=Strict` cookies | Network Header Audit | PASS |
| **06** | Passwords hashed using Argon2id with verified cost parameters | Crypto Test Suite | PASS |
| **07** | Fine-grained RBAC/ABAC ownership checks enforced on all endpoints | Pen-Test Test Suite | PASS (Zero IDOR) |
| **08** | Multi-Factor Authentication (MFA) enforced on all administrative roles | Auth Guard Audit | 100% Admin Users |
| **09** | Strict Content Security Policy (CSP Level 3) with nonces configured | Helmet Header Audit | PASS |
| **10** | CORS restricted strictly to approved Explore Bharat Safar domains | CORS Middleware Check| PASS (No wildcard) |
| **11** | Rate limiting active on all authentication and public mutation routes | Redis Rate-Limit Test| PASS (429 Throttling)|
| **12** | Sensitive PII masked or omitted from all structured logs | PII Redaction Audit | PASS (0 PII in logs)|
| **13** | Sensitive database columns encrypted at rest with AES-256-GCM | Database Schema Audit| PASS |
| **14** | Payment webhooks cryptographically verified before processing | Fintech Test Suite | PASS (HMAC Verified)|
| **15** | OCI Container images scanned and signed with Cosign | Trivy + Cosign CI | PASS (Signed image) |

### 67.3 Best Practices
- Run automated security checks on every pull request, not just before major releases.
- Maintain an active Bug Bounty program with clear responsible disclosure guidelines.
- Conduct external third-party penetration tests semi-annually.

### 67.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An automated deployment pipeline executes `trivy image --severity HIGH,CRITICAL --exit-code 1`, which scans the built Docker container, detects zero vulnerabilities, verifies the Cosign signature against the public KMS key, and proceeds with rolling deployment.
- *Conceptual Negative Pattern*: A manual deployment script that pushes an unsigned, un-scanned container directly to production with an active root user and hardcoded AWS credentials in environment variables.

### 67.5 Common Mistakes
- Relying on manual developer promises rather than automated CI security proofs.
- Disabling security checks temporarily "to get the release out on time."
- Overlooking internal administrative APIs during security audits.

### 67.6 Review Checklist
- [ ] Have all 15 security verification items been validated and marked PASS?
- [ ] Has the Security Officer signed off on the release candidate?
- [ ] Are container images signed cryptographically?

### 67.7 Quality Checklist
- [ ] Automated security gate passes with zero warnings.
- [ ] Penetration test report is attached to the release manifest.

### 67.8 Security Considerations
- This checklist enforces Defense-in-Depth, ensuring that even if one security layer fails, subsequent layers prevent catastrophic compromise.

### 67.9 Performance Considerations
- Security checks are integrated into automated parallel CI pipelines, ensuring security rigor does not impede continuous delivery velocity.

### 67.10 Future Scalability
- Formally documented security gates simplify regulatory audits under India's DPDP Act, CERT-In cybersecurity guidelines, and international ISO 27001 certifications.

---

# SECTION 68: MASTER PERFORMANCE CHECKLIST (PRE-DEPLOYMENT)

### 68.1 Purpose
The Master Performance Checklist establishes an uncompromising performance gate, ensuring every release candidate satisfies Explore Bharat Safar's sub-second latency and Core Web Vitals SLA commitments before serving live user traffic.

### 68.2 Rules
1. **Zero SLA Violations**: Any release that breaches the defined latency or Core Web Vitals thresholds will be automatically rejected by the deployment pipeline.
2. **Automated Benchmark Verification**: Performance metrics MUST be validated against staging environments under simulated multi-user load.
3. **Master Performance Verification Rubric Enforcement**: The 12 performance verification points below MUST all satisfy target SLAs:

| # | Performance Verification Item | SLA / Target Budget | Verification Tool |
| :--- | :--- | :--- | :--- |
| **01** | Largest Contentful Paint (LCP) on 4G Mobile | $\le 2.0\text{ seconds}$ | Lighthouse CI |
| **02** | Interaction to Next Paint (INP) | $\le 100\text{ milliseconds}$ | Web Vitals Telemetry |
| **03** | Cumulative Layout Shift (CLS) | $\le 0.05$ | Lighthouse CI |
| **04** | Initial Critical Client JavaScript Bundle | $\le 120\text{ KB}$ (gzipped) | Next.js Bundle Analyzer|
| **05** | Read API Latency ($P_{95}$) | $\le 50\text{ milliseconds}$ | k6 Load Test |
| **06** | Complex Spatial GIS Query Latency ($P_{95}$) | $\le 150\text{ milliseconds}$ | PostGIS Query Profiler|
| **07** | Booking Checkout Command Latency ($P_{95}$) | $\le 250\text{ milliseconds}$ | k6 Load Test |
| **08** | Full Table Scans on Tables $> 1,000$ Rows | Exactly 0 Scans | `pg_stat_statements` |
| **09** | N+1 Relational Database Queries | Exactly 0 Occurrences | Query Counter Linter |
| **10** | Map WebGL Pan / Zoom Frame Rate | Sustained 60 FPS | Chrome Rendering DevTools|
| **11** | Edge CDN Cache Hit Ratio for Static Tiles | $\ge 95\%$ Hit Ratio | Cloudflare Analytics |
| **12** | Database Connection Pool Utilization | $< 70\%$ at Peak Load | PgBouncer Telemetry |

### 68.3 Best Practices
- Execute synthetic load tests that mirror real-world user distributions across India's regional network conditions.
- Profile memory allocations to identify and fix memory leaks before container deployment.
- Maintain automated alerts that trigger instant canary rollbacks if $P_{99}$ latency spikes by $> 20\%$.

### 68.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An automated staging k6 run simulates 2,500 virtual users executing simultaneous booking and map search requests. The test harness verifies that $P_{95}$ checkout response time remains at $182\text{ms}$ and database CPU utilization remains below $45\%$.
- *Conceptual Negative Pattern*: Deploying a release with an unindexed SQL query that executes a 5-second full-table scan on the 650,000-row village table, causing database connection exhaustion and 504 Gateway Timeouts under production traffic.

### 68.5 Common Mistakes
- Testing performance only on high-end developer MacBooks connected to gigabit fiber, neglecting budget mobile devices on rural 4G networks.
- Overlooking database lock contention during concurrent checkout benchmarks.
- Bundling duplicate or un-tree-shaken dependencies that inflate JavaScript payloads.

### 68.6 Review Checklist
- [ ] Have all 12 performance items met or exceeded their target budgets?
- [ ] Did k6 load testing confirm sub-250ms booking transaction latency under concurrency?
- [ ] Are all database queries verified to use indexes without full table scans?

### 68.7 Quality Checklist
- [ ] Lighthouse CI score $\ge 90$ on all public routes.
- [ ] Automated k6 load test results archived in release documentation.

### 68.8 Security Considerations
- High-performance, resource-efficient code provides inherent resilience against volumetric Denial of Service (DoS) attacks.

### 68.9 Performance Considerations
- Sub-second performance directly correlates with user engagement, reduced bounce rates, and higher expedition booking conversion.

### 68.10 Future Scalability
- Meeting these performance targets ensures the infrastructure can scale to serve tens of millions of concurrent explorers with minimal cloud infrastructure expenditure.

---

# SECTION 69: MASTER ACCESSIBILITY CHECKLIST (PRE-DEPLOYMENT)

### 69.1 Purpose
The Master Accessibility Checklist guarantees that Explore Bharat Safar complies fully with WCAG 2.1 Level AA and national accessibility guidelines, ensuring equal digital access for all explorers across Bharat.

### 69.2 Rules
1. **Zero Automated WCAG AA Violations**: The release MUST achieve zero violations during automated `@axe-core` accessibility audits across all rendered pages and dialogs.
2. **Complete Keyboard Traversal**: Every user flow MUST be traversable and operable using keyboard navigation alone.
3. **Master Accessibility Verification Rubric Enforcement**: The 12 accessibility verification points below MUST all satisfy WCAG 2.1 AA:

| # | Accessibility Verification Item | Standard Requirement | Verification Tool |
| :--- | :--- | :--- | :--- |
| **01** | Automated Axe-Core WCAG Violations | Exactly 0 Violations | `@axe-core/playwright` |
| **02** | Complete Keyboard Navigability | 100% Interactive Elements | Manual Keyboard Audit |
| **03** | Visible High-Contrast Focus Ring | `focus-visible:ring-2` active | Visual Inspection |
| **04** | Text Color Contrast Ratio (Normal Text) | Minimum $4.5:1$ Contrast | Color Contrast Analyzer|
| **05** | Text Color Contrast Ratio (Large Text) | Minimum $3:1$ Contrast | Color Contrast Analyzer|
| **06** | Semantic HTML Elements Used | Standard Elements (`<button>`) | DOM Validator |
| **07** | Informative Image Alt Text | Descriptive `alt` on all images| Screen Reader Audit |
| **08** | Decorative Images Marked Properly | Empty `alt=""` or `aria-hidden`| DOM Validator |
| **09** | Form Input Labels Explicitly Linked | `<label htmlFor="...">` | Screen Reader Audit |
| **10** | Dynamic Status Updates Announced | `aria-live="polite"` regions | VoiceOver / NVDA |
| **11** | Modal Focus Trapping & Escape Closure | Radix Dialog Standards | Keyboard Audit |
| **12** | Respect `prefers-reduced-motion` | All Motion Neutralized | OS Motion Simulation |

### 69.3 Best Practices
- Conduct regular testing with screen reader users using NVDA on Windows and VoiceOver on macOS/iOS.
- Ensure all video media includes synchronized closed captions (CC) and cultural transcripts.
- Ensure form validation errors clearly identify the invalid field and provide plain-language instructions for correction.

### 69.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An automated Playwright test injects `@axe-core/playwright` into the booking checkout page, scans the rendered DOM for contrast, labels, ARIA roles, and keyboard tab stops, asserting `expect(results.violations).toHaveLength(0)`.
- *Conceptual Negative Pattern*: A custom destination card that wraps an image and title in an unlabelled `<div>` with an `onClick` handler, lacking keyboard focus, screen reader announcements, and alt text.

### 69.5 Common Mistakes
- Relying entirely on automated tools, which catch only ~40% of real-world accessibility issues; manual keyboard testing is mandatory.
- Trapping keyboard focus inside custom dropdowns with no escape mechanism.
- Using placeholder text as the sole label for form fields.

### 69.6 Review Checklist
- [ ] Have all 12 accessibility checklist items been verified?
- [ ] Are automated `@axe-core` scans reporting 0 violations across all routes?
- [ ] Has full keyboard navigation been verified on the booking checkout flow?

### 69.7 Quality Checklist
- [ ] CI pipeline fails on any detected WCAG AA violation.
- [ ] Screen reader verification audit logged in the release record.

### 69.8 Security Considerations
- Clear accessibility error messaging ensures users with disabilities are immediately informed of security timeouts and authentication requirements without confusion.

### 69.9 Performance Considerations
- Accessible semantic HTML requires fewer DOM nodes and executes faster than complex custom div-based interactive hacks.

### 69.10 Future Scalability
- Compliance with WCAG 2.1 AA prepares Explore Bharat Safar for integration with accessible government kiosks and emerging AI-assisted accessibility tools.

---

# SECTION 70: MASTER RELEASE READINESS CHECKLIST (FINAL PRODUCTION GATEWAY)

### 70.1 Purpose
The Master Release Readiness Checklist constitutes the ultimate, definitive gatekeeper before any software artifact is deployed to Explore Bharat Safar's live production cloud infrastructure. It coordinates technical, operational, and organizational sign-offs to guarantee flawless, zero-downtime releases.

### 70.2 Rules
1. **Four-Pillar Sign-off Mandate**: A release candidate MUST receive formal, documented approval from four designated leads:
   - **Lead Architect / Staff Engineer**: Architectural integrity and clean code compliance.
   - **DevSecOps / SRE Lead**: Infrastructure health, container integrity, and deployment plan.
   - **Quality Assurance Lead**: Test matrix execution, E2E stability, and coverage targets.
   - **Security Officer**: Security checklist pass, vulnerability clearance, and compliance.
2. **Canary Deployment Rollout**: All production deployments MUST follow a canary rollout strategy ($10\% \rightarrow 25\% \rightarrow 50\% \rightarrow 100\%$) over a minimum 60-minute evaluation window.
3. **Automated Instant Rollback Trigger**: The deployment pipeline MUST automatically execute an immediate rollback if:
   - HTTP 5xx error rate exceeds $0.05\%$ of total traffic.
   - API latency $P_{95}$ exceeds $300\text{ms}$.
   - Container pod crash-loop frequency $> 0$.
4. **Master Release Verification Matrix Enforcement**: The 15 release criteria below MUST all report confirmed status:

| Phase | Verification Item | Responsible Lead | Mandatory Status |
| :--- | :--- | :--- | :--- |
| **Pre-Flight** | 1. All PRs merged via Squash & Merge to `main` | Tech Lead | CONFIRMED |
| **Pre-Flight** | 2. Git working tree clean; commit signed with GPG | Tech Lead | CONFIRMED |
| **Pre-Flight** | 3. All 10 Engineering Quality Gates Green in CI | DevSecOps Lead | PASS |
| **Security** | 4. Master Security Checklist (Section 67) signed | Security Officer | APPROVED |
| **Security** | 5. Trivy container scan reports 0 High/Crit CVEs | Security Officer | PASS |
| **Security** | 6. OCI container image signed with Cosign key | DevSecOps Lead | SIGNED |
| **Quality** | 7. Unit & Integration test coverage targets satisfied | QA Lead | PASS |
| **Quality** | 8. Playwright critical E2E journeys 100% green | QA Lead | PASS |
| **Quality** | 9. Master Accessibility Checklist (Section 69) signed | QA Lead | APPROVED |
| **Performance**| 10. Master Performance Checklist (Section 68) signed | Performance Eng | APPROVED |
| **Database** | 11. Database migrations verified forward and backward | Database Architect| TESTED |
| **Database** | 12. PostgreSQL backup snapshot completed | DBA / SRE | VERIFIED |
| **Operations** | 13. Telemetry dashboards & PagerDuty alerts active | SRE Lead | ACTIVE |
| **Operations** | 14. Documented rollback playbook verified | SRE Lead | READY |
| **Rollout** | 15. Canary deployment progressive rollout initiated | DevSecOps Lead | 10% TRAFFIC |

### 70.3 Best Practices
- Schedule production releases during standard business support windows; never release on Friday afternoons or immediately before major Indian national holiday weekends.
- Maintain an active war-room channel during canary traffic transitions for real-time telemetry observation.
- Conduct a post-release verification smoke test immediately following the 100% traffic shift.

### 70.4 Examples (Conceptual Only)
- *Conceptual Positive Pattern*: An automated deployment pipeline detects that all 15 items in the Release Readiness Matrix are verified, initiates canary deployment shifting 10% of user traffic via Traefik ingress, monitors Prometheus 5xx error rates and latency for 20 minutes, confirms metrics are green, and progressively shifts traffic to 100%.
- *Conceptual Negative Pattern*: A manual `ssh` session that applies a non-backward-compatible database migration directly to the production primary database during peak booking hours without a backup snapshot or rollback plan.

### 70.5 Common Mistakes
- Applying irreversible database migrations without a verified zero-downtime rollback strategy.
- Promoting a build where one test was manually bypassed or skipped.
- Deploying without notifying operations and customer support teams.

### 70.6 Review Checklist
- [ ] Have all 15 release readiness items been formally verified and signed?
- [ ] Are all four mandatory lead approvals documented in the release ticket?
- [ ] Is the automated rollback trigger active and verified?
- [ ] Is the database snapshot verified prior to migration execution?

### 70.7 Quality Checklist
- [ ] Change Advisory Board (CAB) release ticket is fully completed and signed.
- [ ] Post-deployment smoke test suite executes with 100% pass rate on production.

### 70.8 Security Considerations
- Ensures that production secrets and cryptographic keys are injected securely at runtime via HashiCorp Vault without exposure in deployment logs.
- Confirms immutable audit logging is actively recording all system operations from the moment of container startup.

### 70.9 Performance Considerations
- Canary progressive rollout ensures that performance regressions or memory leaks are caught while affecting only a tiny fraction of user traffic.
- Pre-warmed edge CDN caches prevent thundering herd spikes on origin databases when new pages are published.

### 70.10 Future Scalability
- Fully automated, standardized release readiness gateways empower Explore Bharat Safar to scale from bi-weekly release cycles to continuous, multi-deployment daily delivery with zero fear of production instability.

---

## Master Engineering Sign-Off & Constitutional Oath

This document represents the immutable engineering standard for the **Explore Bharat Safar** platform.

Every software engineer, technical lead, architect, AI agent, and contributor working on this codebase takes the following engineering oath:

$$\text{\bf "I pledge to uphold these standards without compromise. I will write clean, secure, accessible, and performant code.}$$
$$\text{\bf I will protect the integrity of Bharat's cultural heritage, respect user privacy, and build for the next generation."}$$

**Status**: APPROVED & AUTHORITATIVE  
**Effective Date**: 2026-09-28  
**Architecture Review Board (ARB) Sign-off**:
- *Chief Technology Officer (CTO)*
- *Principal Enterprise Software Architect*
- *Technical Director & Engineering Excellence Lead*
- *Chief Information Security Officer (CISO)*
- *Head of Quality Engineering & SRE*
