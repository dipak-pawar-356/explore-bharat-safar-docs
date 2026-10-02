// Explore Bharat Safar — Prometheus Metric Constants & Golden Signals
// Reference: EBS-TDR-51-TECHSTACK Section 37
export const MetricNames = {
    // Golden Signals
    HTTP_REQUESTS_TOTAL: 'ebs_http_requests_total',
    HTTP_REQUEST_DURATION_SECONDS: 'ebs_http_request_duration_seconds',
    SYSTEM_ERRORS_TOTAL: 'ebs_system_errors_total',
    ACTIVE_WEBSOCKET_CONNECTIONS: 'ebs_active_websocket_connections',
    // Domain Business Metrics
    ACTIVE_SLOT_LOCKS: 'ebs_booking_active_slot_locks',
    SLOT_LOCK_FAILURES_TOTAL: 'ebs_booking_slot_lock_failures_total',
    COMPLETED_CHECKOUTS_TOTAL: 'ebs_booking_completed_checkouts_total',
    MEDIA_TRANSCODE_SECONDS: 'ebs_worker_media_transcode_duration_seconds',
    CERTIFICATE_SYNTHESIS_SECONDS: 'ebs_worker_certificate_synthesis_seconds',
    QUEUE_PENDING_JOBS: 'ebs_worker_queue_pending_jobs',
};
