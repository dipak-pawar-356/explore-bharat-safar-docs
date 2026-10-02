// Explore Bharat Safar — Privacy-Preserving Telemetry Events
// Complies with DPDP Act 2023 (Zero PII, Anonymized User Context)

export const AnalyticsEvents = {
  // Discovery Pillar
  MAP_VIEWPORT_CHANGED: 'discovery:map_viewport_changed',
  STATE_EXPLORED: 'discovery:state_explored',
  DISTRICT_FILTERED: 'discovery:district_filtered',
  PLACE_VIEWED: 'discovery:place_viewed',
  LANDMARK_3D_RENDERED: 'discovery:landmark_3d_rendered',

  // Rural Knowledge Pillar
  VILLAGE_ACCESSED: 'village:accessed',
  PANCHAYAT_DIRECTORY_VIEWED: 'village:panchayat_viewed',
  CONTRIBUTION_SUBMITTED: 'village:contribution_submitted',

  // Booking Pillar
  EXPERIENCE_SEARCHED: 'booking:experience_searched',
  SLOT_LOCK_ATTEMPTED: 'booking:slot_lock_attempted',
  SLOT_LOCK_ACQUIRED: 'booking:slot_lock_acquired',
  SLOT_LOCK_EXPIRED: 'booking:slot_lock_expired',
  CHECKOUT_INITIATED: 'booking:checkout_initiated',
  CHECKOUT_COMPLETED: 'booking:checkout_completed',

  // Social Network Pillar
  POST_VIEWED: 'social:post_viewed',
  STORY_OPENED: 'social:story_opened',
  GUILD_JOINED: 'social:guild_joined',
} as const;

export type AnalyticsEventType = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export interface BaseTelemetryPayload {
  eventName: AnalyticsEventType;
  timestamp: string;
  sessionId: string;
  clientPlatform: 'web' | 'mobile-pwa';
  locale: string;
  properties?: Record<string, string | number | boolean>;
}
