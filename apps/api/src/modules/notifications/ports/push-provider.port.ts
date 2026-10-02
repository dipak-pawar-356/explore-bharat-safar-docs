// Explore Bharat Safar — Push Notification Provider Port (VAPID Web Push & Mobile Ready)
// Sprint 10: Enterprise Notification & Communication Platform

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    url?: string;
    notificationId?: string;
    category?: string;
    [key: string]: unknown;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushDispatchResult {
  success: boolean;
  statusCode?: number;
  provider: string;
  error?: string;
  timestamp: string;
}

export interface IPushProviderPort {
  sendPush(
    subscription: { endpoint: string; keys: PushSubscriptionKeys },
    payload: PushNotificationPayload,
  ): Promise<PushDispatchResult>;
}
