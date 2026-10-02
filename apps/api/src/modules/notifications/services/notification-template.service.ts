// Explore Bharat Safar — Notification Template Registry & Engine
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API
// Supports SemVer versioning, Variable Interpolation ({{var}}), and i18n (en / hi)
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';
import { NotificationCategory, NotificationChannel } from '@ebs/types';

export interface BuiltInTemplate {
  slug: string;
  version: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  title: Record<string, string>; // locale -> template
  body: Record<string, string>; // locale -> template
  variables: string[];
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  // 1. Booking Notifications
  {
    slug: 'booking-reserved',
    version: '1.0.0',
    category: NotificationCategory.BOOKING,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    title: {
      en: 'Slots Reserved: {{experienceTitle}}',
      hi: 'स्थान आरक्षित: {{experienceTitle}}',
    },
    body: {
      en: 'Your batch slots for {{experienceTitle}} are temporarily held (Booking ID: {{bookingNumber}}). Please complete advance payment within 15 minutes to lock your reservation.',
      hi: '{{experienceTitle}} के लिए आपके स्थान अस्थायी रूप से सुरक्षित हैं (बुकिंग संख्या: {{bookingNumber}})। कृपया 15 मिनट के भीतर अग्रिम भुगतान पूरा करें।',
    },
    variables: ['experienceTitle', 'bookingNumber'],
  },
  {
    slug: 'booking-confirmed',
    version: '1.0.0',
    category: NotificationCategory.BOOKING,
    channels: [
      NotificationChannel.IN_APP,
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.WHATSAPP,
    ],
    title: {
      en: 'Booking Confirmed! {{experienceTitle}} ({{bookingNumber}})',
      hi: 'बुकिंग की पुष्टि हुई! {{experienceTitle}} ({{bookingNumber}})',
    },
    body: {
      en: 'Congratulations {{participantName}}! Your expedition booking {{bookingNumber}} for {{experienceTitle}} is confirmed. Departure date: {{departureDate}}.',
      hi: 'बधाई हो {{participantName}}! {{experienceTitle}} के लिए आपकी बुकिंग {{bookingNumber}} की पुष्टि हो गई है। प्रस्थान तिथि: {{departureDate}}।',
    },
    variables: ['participantName', 'bookingNumber', 'experienceTitle', 'departureDate'],
  },
  {
    slug: 'booking-cancelled',
    version: '1.0.0',
    category: NotificationCategory.BOOKING,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    title: {
      en: 'Booking Cancellation: {{bookingNumber}}',
      hi: 'बुकिंग रद्द: {{bookingNumber}}',
    },
    body: {
      en: 'Your booking {{bookingNumber}} for {{experienceTitle}} has been cancelled. Refund processing has been initiated per cancellation policy.',
      hi: '{{experienceTitle}} के लिए आपकी बुकिंग {{bookingNumber}} रद्द कर दी गई है। रद्दीकरण नीति के अनुसार रिफंड प्रक्रिया शुरू कर दी गई है।',
    },
    variables: ['bookingNumber', 'experienceTitle'],
  },
  {
    slug: 'trip-countdown-48h',
    version: '1.0.0',
    category: NotificationCategory.BOOKING,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
    title: {
      en: '48 Hours to Departure: {{experienceTitle}}',
      hi: 'प्रस्थान में 48 घंटे शेष: {{experienceTitle}}',
    },
    body: {
      en: 'Namaste {{participantName}}! Your trek to {{experienceTitle}} starts in 48 hours. Base camp assembly: {{meetingPoint}} at {{assemblyTime}} IST. Packing list attached.',
      hi: 'नमस्ते {{participantName}}! {{experienceTitle}} के लिए आपकी यात्रा 48 घंटे में शुरू हो रही है। बैठक स्थल: {{meetingPoint}} {{assemblyTime}} IST पर।',
    },
    variables: ['participantName', 'experienceTitle', 'meetingPoint', 'assemblyTime'],
  },
  {
    slug: 'trip-countdown-24h',
    version: '1.0.0',
    category: NotificationCategory.BOOKING,
    channels: [NotificationChannel.IN_APP, NotificationChannel.SMS, NotificationChannel.WHATSAPP],
    title: {
      en: '24 Hours to Departure! Important Trek Guidelines',
      hi: 'प्रस्थान में 24 घंटे शेष! महत्वपूर्ण ट्रेक दिशानिर्देश',
    },
    body: {
      en: "Final reminder for {{experienceTitle}} tomorrow. Lead Guide: {{guideName}} ({{guidePhone}}). Safe travels into Bharat's heartland!",
      hi: 'कल {{experienceTitle}} के लिए अंतिम स्मरण। मुख्य गाइड: {{guideName}} ({{guidePhone}})। आपकी यात्रा मंगलमय हो!',
    },
    variables: ['experienceTitle', 'guideName', 'guidePhone'],
  },

  // 2. Payments & Refunds
  {
    slug: 'payment-deposit-confirmed',
    version: '1.0.0',
    category: NotificationCategory.PAYMENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
    title: {
      en: 'Payment Received: ₹{{amountPaid}} for {{bookingNumber}}',
      hi: 'भुगतान प्राप्त हुआ: ₹{{amountPaid}} ({{bookingNumber}})',
    },
    body: {
      en: 'Advance deposit of ₹{{amountPaid}} successfully received via {{paymentMethod}}. Remaining balance of ₹{{balanceDue}} is due before trip departure.',
      hi: '{{paymentMethod}} द्वारा ₹{{amountPaid}} का अग्रिम भुगतान प्राप्त हुआ। यात्रा प्रस्थान से पहले शेष राशि ₹{{balanceDue}} देय है।',
    },
    variables: ['amountPaid', 'bookingNumber', 'paymentMethod', 'balanceDue'],
  },
  {
    slug: 'payment-balance-due',
    version: '1.0.0',
    category: NotificationCategory.PAYMENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    title: {
      en: 'Balance Payment Due: ₹{{balanceDue}} ({{bookingNumber}})',
      hi: 'शेष भुगतान देय: ₹{{balanceDue}} ({{bookingNumber}})',
    },
    body: {
      en: 'Friendly reminder: Outstanding balance of ₹{{balanceDue}} for {{experienceTitle}} is due by {{dueDate}}.',
      hi: 'स्मरण: {{experienceTitle}} के लिए ₹{{balanceDue}} की बकाया राशि {{dueDate}} तक देय है।',
    },
    variables: ['balanceDue', 'bookingNumber', 'experienceTitle', 'dueDate'],
  },
  {
    slug: 'refund-processed',
    version: '1.0.0',
    category: NotificationCategory.REFUND,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    title: {
      en: 'Refund Credited: ₹{{refundAmount}} ({{refundReference}})',
      hi: 'रिफंड स्वीकृत: ₹{{refundAmount}} ({{refundReference}})',
    },
    body: {
      en: 'Refund of ₹{{refundAmount}} has been processed to your original payment method. Reference ARN: {{arnNumber}}.',
      hi: '₹{{refundAmount}} का रिफंड आपके मूल भुगतान खाते में प्रेषित कर दिया गया है। संदर्भ ARN: {{arnNumber}}।',
    },
    variables: ['refundAmount', 'refundReference', 'arnNumber'],
  },

  // 3. Certificates
  {
    slug: 'certificate-issued',
    version: '1.0.0',
    category: NotificationCategory.CERTIFICATE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
    title: {
      en: 'Expedition Certificate Ready: {{experienceTitle}}',
      hi: 'अभियान प्रमाणपत्र तैयार: {{experienceTitle}}',
    },
    body: {
      en: 'Congratulations {{participantName}}! Your official tamper-evident digital certificate ({{certificateNumber}}) for {{experienceTitle}} is now ready to download and share.',
      hi: 'बधाई हो {{participantName}}! {{experienceTitle}} के लिए आपका आधिकारिक डिजिटल प्रमाणपत्र ({{certificateNumber}}) अब डाउनलोड और साझा करने के लिए तैयार है।',
    },
    variables: ['participantName', 'experienceTitle', 'certificateNumber'],
  },

  // 4. Authentication & Security
  {
    slug: 'auth-login-new-device',
    version: '1.0.0',
    category: NotificationCategory.SECURITY,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: 'Security Alert: New Sign-in from {{deviceName}}',
      hi: 'सुरक्षा सूचना: {{deviceName}} से नया साइन-इन',
    },
    body: {
      en: 'We detected a new sign-in to your Explore Bharat Safar account on {{timestamp}} from IP {{ipAddress}} ({{location}}). If this was not you, change your password immediately.',
      hi: 'हमने {{timestamp}} पर आपके खाते में नए साइन-इन का पता लगाया (IP: {{ipAddress}}, स्थान: {{location}})। यदि यह आप नहीं थे, तो तुरंत पासवर्ड बदलें।',
    },
    variables: ['deviceName', 'timestamp', 'ipAddress', 'location'],
  },
  {
    slug: 'auth-password-reset',
    version: '1.0.0',
    category: NotificationCategory.SECURITY,
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
    title: {
      en: 'Password Reset Request: Explore Bharat Safar',
      hi: 'पासवर्ड रीसेट अनुरोध: एक्सप्लोर भारत सफर',
    },
    body: {
      en: 'We received a request to reset your password. Use secure code {{resetCode}} or click link: {{resetLink}}. Code expires in 15 minutes. Never share this with anyone.',
      hi: 'हमें आपका पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ। सुरक्षा कोड {{resetCode}} दर्ज करें या लिंक पर जाएं: {{resetLink}}। कोड 15 मिनट में समाप्त हो जाएगा।',
    },
    variables: ['resetCode', 'resetLink'],
  },
  {
    slug: 'auth-email-verified',
    version: '1.0.0',
    category: NotificationCategory.SECURITY,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: 'Email Verified Successfully',
      hi: 'ईमेल सफलतापूर्वक सत्यापित हुआ',
    },
    body: {
      en: 'Your email address {{email}} is now verified on Explore Bharat Safar.',
      hi: 'आपका ईमेल पता {{email}} अब एक्सप्लोर भारत सफर पर सत्यापित हो गया है।',
    },
    variables: ['email'],
  },

  // 5. Village Knowledge & Governance
  {
    slug: 'village-update-submitted',
    version: '1.0.0',
    category: NotificationCategory.VILLAGE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: 'Village Dossier Update Submitted: {{villageName}}',
      hi: 'ग्राम विवरण अद्यतन प्रस्तुत: {{villageName}}',
    },
    body: {
      en: 'Your update ticket ({{ticketId}}) for village {{villageName}} (LGD: {{lgdCode}}) has been submitted to the moderation queue for sovereign verification.',
      hi: 'गांव {{villageName}} (LGD: {{lgdCode}}) के लिए आपका अद्यतन टिकट ({{ticketId}}) सत्यापन हेतु प्रस्तुत किया गया है।',
    },
    variables: ['villageName', 'lgdCode', 'ticketId'],
  },
  {
    slug: 'village-update-approved',
    version: '1.0.0',
    category: NotificationCategory.VILLAGE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: 'Village Update Approved! {{villageName}}',
      hi: 'ग्राम अद्यतन स्वीकृत! {{villageName}}',
    },
    body: {
      en: 'Great news! Your submitted update for {{villageName}} has been approved by moderators and published to the National Rural Bharat Knowledge System.',
      hi: 'शुभ समाचार! {{villageName}} के लिए आपका अद्यतन स्वीकृत हो गया है और राष्ट्रीय ग्रामीण ज्ञान प्रणाली में प्रकाशित कर दिया गया है।',
    },
    variables: ['villageName'],
  },
  {
    slug: 'village-update-rejected',
    version: '1.0.0',
    category: NotificationCategory.VILLAGE,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: 'Village Update Requires Revision: {{villageName}}',
      hi: 'ग्राम अद्यतन में संशोधन आवश्यक: {{villageName}}',
    },
    body: {
      en: 'Your update ticket for {{villageName}} could not be approved. Moderator notes: "{{moderatorNotes}}". Please update and resubmit.',
      hi: '{{villageName}} के लिए आपका अद्यतन स्वीकृत नहीं हो सका। मॉडरेटर टिप्पणी: "{{moderatorNotes}}"। कृपया संशोधित करें।',
    },
    variables: ['villageName', 'moderatorNotes'],
  },

  // 6. Social & Community
  {
    slug: 'social-new-follower',
    version: '1.0.0',
    category: NotificationCategory.SOCIAL,
    channels: [NotificationChannel.IN_APP],
    title: {
      en: '{{followerName}} started following you',
      hi: '{{followerName}} ने आपको फॉलो करना शुरू किया',
    },
    body: {
      en: 'Explorer @{{followerUsername}} is now following your expeditions and travel journals.',
      hi: 'यात्री @{{followerUsername}} अब आपकी यात्राओं को फॉलो कर रहे हैं।',
    },
    variables: ['followerName', 'followerUsername'],
  },
  {
    slug: 'social-post-commented',
    version: '1.0.0',
    category: NotificationCategory.SOCIAL,
    channels: [NotificationChannel.IN_APP],
    title: {
      en: '{{authorName}} commented on your journal',
      hi: '{{authorName}} ने आपकी यात्रा पर टिप्पणी की',
    },
    body: {
      en: '"{{commentSnippet}}" on your expedition journal "{{postTitle}}".',
      hi: 'आपकी यात्रा "{{postTitle}}" पर टिप्पणी: "{{commentSnippet}}"।',
    },
    variables: ['authorName', 'commentSnippet', 'postTitle'],
  },
  {
    slug: 'social-mention',
    version: '1.0.0',
    category: NotificationCategory.SOCIAL,
    channels: [NotificationChannel.IN_APP],
    title: {
      en: '{{authorName}} mentioned you',
      hi: '{{authorName}} ने आपका उल्लेख किया',
    },
    body: {
      en: '@{{authorUsername}} mentioned you in a discussion: "{{snippet}}".',
      hi: '@{{authorUsername}} ने एक चर्चा में आपका उल्लेख किया: "{{snippet}}"।',
    },
    variables: ['authorName', 'authorUsername', 'snippet'],
  },

  // 7. Operations & Emergency Alerts
  {
    slug: 'system-announcement',
    version: '1.0.0',
    category: NotificationCategory.ANNOUNCEMENT,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    title: {
      en: '{{announcementTitle}}',
      hi: '{{announcementTitle}}',
    },
    body: {
      en: '{{announcementBody}}',
      hi: '{{announcementBody}}',
    },
    variables: ['announcementTitle', 'announcementBody'],
  },
  {
    slug: 'system-emergency-alert',
    version: '1.0.0',
    category: NotificationCategory.EMERGENCY,
    channels: [
      NotificationChannel.IN_APP,
      NotificationChannel.SMS,
      NotificationChannel.WEB_PUSH,
      NotificationChannel.WHATSAPP,
    ],
    title: {
      en: 'EMERGENCY ADVISORY: {{regionName}}',
      hi: 'आपातकालीन चेतावनी: {{regionName}}',
    },
    body: {
      en: 'URGENT: Extreme weather / trail advisory for {{regionName}}. Details: {{alertMessage}}. Emergency Helpline: 112 / {{helplinePhone}}.',
      hi: 'अति आवश्यक: {{regionName}} क्षेत्र के लिए मौसम/मार्ग चेतावनी। विवरण: {{alertMessage}}। हेल्पलाइन: 112 / {{helplinePhone}}।',
    },
    variables: ['regionName', 'alertMessage', 'helplinePhone'],
  },
];

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);
  private readonly templates = new Map<string, BuiltInTemplate>();

  constructor() {
    for (const t of BUILT_IN_TEMPLATES) {
      this.templates.set(t.slug, t);
    }
  }

  public getTemplate(slug: string): BuiltInTemplate | undefined {
    return this.templates.get(slug);
  }

  public getAllTemplates(): BuiltInTemplate[] {
    return Array.from(this.templates.values());
  }

  public render(
    slug: string,
    variables: Record<string, string | number> = {},
    locale = 'en',
  ): { title: string; body: string } | null {
    const template = this.templates.get(slug);
    if (!template) {
      this.logger.warn(`Template with slug "${slug}" not found in template registry.`);
      return null;
    }

    const titleTemplate = template.title[locale] || template.title['en'] || '';
    const bodyTemplate = template.body[locale] || template.body['en'] || '';

    const title = this.interpolate(titleTemplate, variables);
    const body = this.interpolate(bodyTemplate, variables);

    return { title, body };
  }

  public interpolate(templateStr: string, variables: Record<string, string | number>): string {
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, key) => {
      if (key in variables) {
        const val = variables[key];
        return String(val);
      }
      return match; // Leave unchanged if variable not supplied
    });
  }
}
