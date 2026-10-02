// Explore Bharat Safar — SMS Provider Port
// Conforms to TRAI DLT mandates
// Sprint 10: Enterprise Notification & Communication Platform

export interface SendSmsOptions {
  to: string; // Indian E.164 format (+91XXXXXXXXXX) or international
  message: string;
  dltTemplateId?: string; // Mandatory for Indian commercial & transactional SMS
  dltEntityId?: string;
  senderId?: string; // 6-character header e.g., 'EBSIND'
}

export interface SmsDispatchResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: string;
}

export interface ISmsProviderPort {
  sendSms(options: SendSmsOptions): Promise<SmsDispatchResult>;
}
