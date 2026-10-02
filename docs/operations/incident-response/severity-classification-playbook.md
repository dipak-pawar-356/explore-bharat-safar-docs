# Explore Bharat Safar — Incident Severity & Escalation Playbook
## Reference: SRE Incident Response Standards (P1–P4)

---

## 1. Incident Severity Definitions

| Severity | Impact Description | SLA Response | SLA Resolution | Escalation Target |
| :--- | :--- | :--- | :--- | :--- |
| **P1 — Critical** | Total platform outage, payment processing failure, data corruption, or verified security breach. | $< 5\text{ minutes}$ | $< 30\text{ minutes}$ | SRE Lead, CTO, VP Engineering, PagerDuty Callout |
| **P2 — Major** | Partial service degradation, search latency $> 500\text{ms}$, single-region slow down, error rate $> 1\%$. | $< 15\text{ minutes}$ | $< 2\text{ hours}$ | On-Call SRE, Domain Tech Lead, Slack `#ops-high` |
| **P3 — Moderate** | Minor feature defect, localized UI rendering bug, non-critical background worker delay. | $< 1\text{ hour}$ | $< 8\text{ hours}$ | Engineering Team, Jira Ticket |
| **P4 — Low** | Cosmetic issue, documentation typo, non-blocking telemetry irregularity. | $< 4\text{ hours}$ | Next Sprint | Backlog |

---

## 2. P1 Escalation Matrix & Incident Commander Workflow

1. **Incident Declaration**: Any engineer or automated alert (Prometheus P1) declaring a P1 creates a Slack war room: `#incident-[YYYYMMDD]-[short-desc]`.
2. **Assign Roles**:
   - **Incident Commander (IC)**: Leads triage, delegates investigations, maintains timeline.
   - **Operations Lead**: Executes infrastructure changes, rollback, or failover.
   - **Communications Lead**: Updates external status page (`status.explorebharatsafar.in`) every 15 minutes.
3. **Post-Mortem**: A blameless post-mortem must be held within 24 business hours, with root cause analysis (5 Whys) and corrective action items assigned in Jira.
