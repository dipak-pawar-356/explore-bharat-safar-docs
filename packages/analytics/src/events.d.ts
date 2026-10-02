export declare const AnalyticsEvents: {
    readonly MAP_VIEWPORT_CHANGED: "discovery:map_viewport_changed";
    readonly STATE_EXPLORED: "discovery:state_explored";
    readonly DISTRICT_FILTERED: "discovery:district_filtered";
    readonly PLACE_VIEWED: "discovery:place_viewed";
    readonly LANDMARK_3D_RENDERED: "discovery:landmark_3d_rendered";
    readonly VILLAGE_ACCESSED: "village:accessed";
    readonly PANCHAYAT_DIRECTORY_VIEWED: "village:panchayat_viewed";
    readonly CONTRIBUTION_SUBMITTED: "village:contribution_submitted";
    readonly EXPERIENCE_SEARCHED: "booking:experience_searched";
    readonly SLOT_LOCK_ATTEMPTED: "booking:slot_lock_attempted";
    readonly SLOT_LOCK_ACQUIRED: "booking:slot_lock_acquired";
    readonly SLOT_LOCK_EXPIRED: "booking:slot_lock_expired";
    readonly CHECKOUT_INITIATED: "booking:checkout_initiated";
    readonly CHECKOUT_COMPLETED: "booking:checkout_completed";
    readonly POST_VIEWED: "social:post_viewed";
    readonly STORY_OPENED: "social:story_opened";
    readonly GUILD_JOINED: "social:guild_joined";
};
export type AnalyticsEventType = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
export interface BaseTelemetryPayload {
    eventName: AnalyticsEventType;
    timestamp: string;
    sessionId: string;
    clientPlatform: 'web' | 'mobile-pwa';
    locale: string;
    properties?: Record<string, string | number | boolean>;
}
//# sourceMappingURL=events.d.ts.map