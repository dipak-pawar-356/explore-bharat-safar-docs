// Explore Bharat Safar — BullMQ Queue Constants
// Reference: EBS-BLU-49-REPO Section 5.1

export const WorkerQueues = {
  MEDIA: 'media-processing',
  CERTIFICATES: 'certificate-generation',
  INVOICES: 'gst-invoices',
  INVENTORY: 'inventory-sweeper',
  NOTIFICATIONS: 'notifications-dispatch',
  COMPLIANCE: 'dpdp-compliance-purger',
} as const;

export type WorkerQueueType = (typeof WorkerQueues)[keyof typeof WorkerQueues];
