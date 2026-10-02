# Explore Bharat Safar — Monitoring, Health & Observability Summary
## Reference: Prometheus Exposition Formats, EBS-DOC-51-TECHSTACK §8

---

## 1. Deep Subsystem Health Probes (`GET /health`)

The `MonitoringService` (`apps/api/src/modules/monitoring/monitoring.service.ts`) executes non-blocking health checks against all core dependencies:
1. **Primary Database (PostgreSQL)**: Runs `SELECT 1` ping and measures response latency.
2. **Spatial Extensions (PostGIS)**: Runs `SELECT PostGIS_Version()` to confirm geospatial index engine readiness.
3. **Cache Layer (Redis)**: Performs a `PING` command with latency verification; marks status `DEGRADED` if disconnected without crashing the API.
4. **Asynchronous Task Queue (BullMQ)**: Confirms message worker connectivity and queue responsiveness.
5. **Node.js Process Memory**: Evaluates `process.memoryUsage()` heap usage against system thresholds (`NORMAL`, `HIGH`, `CRITICAL`).

**Envelope Response Structure**:
```json
{
  "status": "OPERATIONAL",
  "version": "1.0.0",
  "uptimeSeconds": 1420,
  "subsystems": {
    "database": { "name": "postgresql", "status": "UP", "responseTimeMs": 4 },
    "postgis": { "name": "postgis", "status": "UP", "responseTimeMs": 6 },
    "redis": { "name": "redis", "status": "UP", "responseTimeMs": 1 },
    "workers": { "name": "bullmq", "status": "UP", "responseTimeMs": 2 },
    "memory": {
      "heapUsedMb": 64.2,
      "heapTotalMb": 98.4,
      "rssMb": 142.1,
      "status": "NORMAL"
    }
  }
}
```

---

## 2. Prometheus Exposition Metrics (`GET /metrics`)

Exposes real-time operational telemetry in standard Prometheus text format:
```
# HELP ebs_uptime_seconds Total process uptime in seconds
# TYPE ebs_uptime_seconds gauge
ebs_uptime_seconds 1420.45

# HELP ebs_system_memory_bytes Memory usage in bytes
# TYPE ebs_system_memory_bytes gauge
ebs_system_memory_bytes{type="heap_used"} 67318528
ebs_system_memory_bytes{type="heap_total"} 103178240
ebs_system_memory_bytes{type="rss"} 149028864

# HELP ebs_subsystem_up Subsystem operational status (1 = up, 0 = down)
# TYPE ebs_subsystem_up gauge
ebs_subsystem_up{subsystem="database"} 1
ebs_subsystem_up{subsystem="postgis"} 1
ebs_subsystem_up{subsystem="redis"} 1
ebs_subsystem_up{subsystem="workers"} 1

# HELP ebs_subsystem_latency_ms Subsystem probe latency in milliseconds
# TYPE ebs_subsystem_latency_ms gauge
ebs_subsystem_latency_ms{subsystem="database"} 4.12
ebs_subsystem_latency_ms{subsystem="postgis"} 6.05
ebs_subsystem_latency_ms{subsystem="redis"} 1.20
ebs_subsystem_latency_ms{subsystem="workers"} 2.45
```

---

## 3. Telemetry Overview & Admin Integration (`GET /monitoring/telemetry`)

Returns a summarized metric payload for the Super Admin system dashboard, including active WebSocket connections, cache hit ratios, queue lengths, and error rate percentages.
