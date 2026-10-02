export declare const MetricNames: {
    readonly HTTP_REQUESTS_TOTAL: "ebs_http_requests_total";
    readonly HTTP_REQUEST_DURATION_SECONDS: "ebs_http_request_duration_seconds";
    readonly SYSTEM_ERRORS_TOTAL: "ebs_system_errors_total";
    readonly ACTIVE_WEBSOCKET_CONNECTIONS: "ebs_active_websocket_connections";
    readonly ACTIVE_SLOT_LOCKS: "ebs_booking_active_slot_locks";
    readonly SLOT_LOCK_FAILURES_TOTAL: "ebs_booking_slot_lock_failures_total";
    readonly COMPLETED_CHECKOUTS_TOTAL: "ebs_booking_completed_checkouts_total";
    readonly MEDIA_TRANSCODE_SECONDS: "ebs_worker_media_transcode_duration_seconds";
    readonly CERTIFICATE_SYNTHESIS_SECONDS: "ebs_worker_certificate_synthesis_seconds";
    readonly QUEUE_PENDING_JOBS: "ebs_worker_queue_pending_jobs";
};
export type MetricNameType = (typeof MetricNames)[keyof typeof MetricNames];
//# sourceMappingURL=metrics.d.ts.map