// Explore Bharat Safar — Email Provider Port
// Sprint 10: Enterprise Notification & Communication Platform

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: Record<string, string>;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: string;
}

export interface IEmailProviderPort {
  sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult>;
}
