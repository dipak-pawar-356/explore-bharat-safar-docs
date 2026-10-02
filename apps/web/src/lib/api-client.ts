// Explore Bharat Safar — Frontend API Client
// Standardized client-side fetcher interfacing with API envelope contracts

import type { ApiSuccessEnvelope } from '@ebs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `HTTP error ${response.status}`);
  }

  const envelope: ApiSuccessEnvelope<T> = await response.json();
  return envelope.data;
}
