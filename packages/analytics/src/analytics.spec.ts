// Explore Bharat Safar — Telemetry & Metrics Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnalyticsEvents, MetricNames } from './index';

describe('Privacy-Preserving Telemetry & Metric Constants', () => {
  it('should define core domain events across all 4 pillars', () => {
    assert.equal(AnalyticsEvents.MAP_VIEWPORT_CHANGED, 'discovery:map_viewport_changed');
    assert.equal(AnalyticsEvents.VILLAGE_ACCESSED, 'village:accessed');
    assert.equal(AnalyticsEvents.SLOT_LOCK_ACQUIRED, 'booking:slot_lock_acquired');
    assert.equal(AnalyticsEvents.POST_VIEWED, 'social:post_viewed');
  });

  it('should define Prometheus metrics for the 4 golden signals', () => {
    assert.equal(MetricNames.HTTP_REQUESTS_TOTAL, 'ebs_http_requests_total');
    assert.equal(MetricNames.HTTP_REQUEST_DURATION_SECONDS, 'ebs_http_request_duration_seconds');
    assert.equal(MetricNames.SYSTEM_ERRORS_TOTAL, 'ebs_system_errors_total');
    assert.equal(MetricNames.ACTIVE_WEBSOCKET_CONNECTIONS, 'ebs_active_websocket_connections');
  });
});
