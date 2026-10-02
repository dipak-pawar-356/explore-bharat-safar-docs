# ADR 001: Adoption of Unified Turborepo Monorepo Architecture

- **Status**: Approved
- **Deciders**: Chief Technology Officer, Principal Solutions Architect, Full-Stack Leads
- **Date**: 2026-09-28
- **Context**: Explore Bharat Safar integrates 4 core pillars (Discovery GIS, Rural Knowledge, Booking Engine, Social Network) across Next.js frontend, NestJS backend, BullMQ workers, and shared libraries.
- **Decision**: Adopt a single unified monorepo managed via `pnpm` workspaces and orchestrated by `Turborepo`.
- **Consequences**:
  - Atomic multi-package commits and synchronized type contracts.
  - Computational caching and parallel task pipelines.
  - Strict dependency boundaries enforced by custom ESLint boundary rules.
