// Explore Bharat Safar — Push Subscription DTO
// Sprint 10: Enterprise Notification & Communication Platform

export class PushSubscriptionDto {
  endpoint!: string;
  p256dh!: string;
  auth!: string;
  userAgent?: string;
}
