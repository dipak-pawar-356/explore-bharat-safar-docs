// Explore Bharat Safar — WhatsApp Business Provider Port
// Sprint 10: Enterprise Notification & Communication Platform

export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
  text?: string;
  documentUrl?: string;
  documentFilename?: string;
}

export interface SendWhatsAppOptions {
  to: string; // E.164 phone number
  templateName: string;
  languageCode?: string; // e.g. 'en', 'hi'
  parameters?: WhatsAppTemplateParameter[];
  mediaUrl?: string;
  mediaFilename?: string;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: string;
}

export interface IWhatsAppProviderPort {
  sendWhatsApp(options: SendWhatsAppOptions): Promise<WhatsAppDispatchResult>;
}
