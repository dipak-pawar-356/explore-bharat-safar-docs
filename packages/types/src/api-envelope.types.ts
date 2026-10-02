// Explore Bharat Safar — Standardized API Envelope Contracts
// Reference: EBS-DOC-09-API & EBS-BLU-49-REPO Section 11

import type { PaginationMeta } from './common.types';

export interface ApiSuccessEnvelope<T = unknown> {
  success: true;
  statusCode: number;
  data: T;
  meta: {
    timestamp: string;
    correlationId: string;
    path?: string;
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  error: {
    errorCode: string; // Standardized error identifier, e.g. EBS_AUTH_001
    message: string;
    details?: unknown[];
  };
  meta: {
    timestamp: string;
    correlationId: string;
    path: string;
  };
}
