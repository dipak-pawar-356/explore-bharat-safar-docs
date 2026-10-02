// Explore Bharat Safar — Update Notification Preferences DTO
// Sprint 10: Enterprise Notification & Communication Platform

export class UpdateNotificationPreferencesDto {
  channels?: {
    inApp?: boolean;
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    webPush?: boolean;
  };
  categories?: {
    booking?: boolean;
    payment?: boolean;
    village?: boolean;
    social?: boolean;
    community?: boolean;
    marketing?: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
  };
}
