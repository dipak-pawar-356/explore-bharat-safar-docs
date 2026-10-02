# Explore Bharat Safar — Security Compliance Report
## Sprint 4: Gramodaya & Rural Bharat Knowledge System

- **Document Identifier**: EBS-REP-SPRINT-04-SEC
- **Classification**: Enterprise Cybersecurity & Statutory Data Protection Audit
- **Status**: PASSED
- **Evaluator**: Chief Information Security Officer (CISO) & Data Protection Officer (DPO)
- **Reference**: EBS-DOC-40-SEC (Enterprise Security Blueprint Sections 4, 5, 36 & 51)

---

## 1. Multi-Tenant Tenancy Isolation Audit (VillageScopeGuard)

### 1.1 Threat Model
- Broken Object Level Authorization (BOLA/IDOR).
- Lateral cross-tenant tampering: A compromised or rogue Village Admin for Village A attempting to modify or deface records for Village B.
- Vertical privilege escalation: Village Admin attempting to invoke platform-wide moderation actions.

### 1.2 Security Controls Implemented & Verified
1. **Centralized Tenancy Guard (`VillageScopeGuard`)**:
   - Inspects `request.user.assignedVillageId` against target route parameter or body property.
   - For users possessing role `VILLAGE_ADMIN`:
     - If `user.assignedVillageId !== targetVillageId`: Immediately throws `ForbiddenException(errorCode: 'EBS_TENANCY_VIOLATION')` (HTTP 403 Forbidden).
     - If `user.assignedVillageId` is null/empty: Immediately throws `ForbiddenException`.
     - Validates payload consistency: If `request.body?.villageId` is present, it MUST match `targetVillageId` to prevent cross-tenant injection.
   - Role enforcement: Requests without `SUPER_ADMIN`, `MODERATOR`, or `VILLAGE_ADMIN` are immediately denied (`ForbiddenException(errorCode: 'EBS_PERM_DENIED')`).
   - Exemptions: `SUPER_ADMIN` and `MODERATOR` possess district/state-level multi-village review rights.
2. **Automated Unit & E2E Verification**:
   - `guards.spec.ts`: Tests positive tenancy (Village A admin accessing Village A), negative tenancy (Village A admin attempting Village B), unassigned admin access, non-admin role rejection, and body payload tampering prevention.
   - `villages.e2e.spec.ts` Stage 5: Rigorously verifies that `user-va-1` targeting `vil-meghalaya-mawlynnong-999` throws `ForbiddenException`.
   - Result: **PASSED (Zero Tenancy Leakage)**.

---

## 2. Digital Personal Data Protection Act (DPDP Act 2023) Compliance

### 2.1 Threat Model
- Inadvertent or malicious public exposure of private villager information (Aadhaar numbers, Voter IDs, PAN cards, private personal mobile numbers, home addresses, bank accounts).
- Targeted phishing or harassment of rural women artisans or community hosts through deeply nested payload structures.

### 2.2 Security Controls Implemented & Verified
1. **Deeply Recursive Sanitization Pipeline (`sanitizeVillageDataForPublicDisplay`)**:
   - Applied in `VillagesService.submitUpdate()` before saving into the staging database.
   - Recursively traverses all nested objects and arrays of objects, purging keys matching:
     - `aadhaar`
     - `voterId` / `voter_id` / `voterid`
     - `panNumber` / `pan_number` / `pannumber`
     - `personalMobile` / `personal_mobile` / `personalmobile` / `privateMobile` / `private_mobile` / `privatemobile`
     - `residentialAddress` / `residential_address` / `residentialaddress` / `privateAddress` / `private_address`
     - `bankAccount` / `bank_account` / `bankaccount` / `creditCard` / `credit_card` / `debitCard` / `accountNumber`
     - `passportNumber` / `passport_number` / `passport`
2. **Contact Masking**:
   - All artisan and homestay phone coordinates exposed on public endpoints and web UI are strictly masked (e.g. `+91-20-XXXX-5521 (Platform Masked)`).
   - Official public transparency is restricted strictly to Gram Panchayat statutory office landlines and verified civic health centre desks.
3. **Automated Unit & E2E Verification**:
   - `validators.spec.ts`: Formally tests stripping of shallow, deeply nested, and array-based dirty PII payloads.
   - `villages.e2e.spec.ts` Stage 6: Asserts that staged records have `sarpanchAadhaar` and `personalMobile` completely purged.
   - Result: **PASSED (100% DPDP Act Compliant)**.

---

## 3. Two-Tier Moderation & Audit Logging Integrity

### 3.1 Security Controls Implemented & Verified
1. **Zero Direct Production Writes**:
   - Production `villages` table cannot be mutated by `VILLAGE_ADMIN`.
   - Mutations must pass through `village_updates_staging`.
2. **Mandatory Commentary Requirement**:
   - Approvals or rejections require comments with at least 5 characters; empty or trivial comments trigger `BadRequestException`.
3. **Tamper-Evident Audit Logging**:
   - `VILLAGE_UPDATE_SUBMITTED`, `VILLAGE_UPDATE_APPROVED`, `VILLAGE_UPDATE_REJECTED`, and `VILLAGE_REVIEW_SUBMITTED` events emit structured audit log events with actor ID, entity ID, old values, and new values.
   - Result: **PASSED**.
