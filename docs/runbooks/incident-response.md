# Production Incident Response & Disaster Recovery Manual

- **Document Identifier**: EBS-RUN-01-INCIDENT
- **Target Audience**: SREs, On-Call Engineers, Incident Commanders

## 1. Severity Classifications
- **Sev-1 (Critical)**: Platform-wide outage, database primary down, payment transaction failure, security breach. SLA: Respond in $< 15$ mins.
- **Sev-2 (Major)**: Partial degradation, background queue backlog $> 10,000$ jobs, GIS tile render latency $> 2\text{s}$. SLA: Respond in $< 30$ mins.
- **Sev-3 (Minor)**: Non-blocking feature failure. SLA: Respond within 2 business hours.

## 2. On-Call Escalation Matrix
1. Primary On-Call SRE (PagerDuty)
2. Squad Tech Lead (Affected Domain)
3. Incident Commander (Director of Engineering)
