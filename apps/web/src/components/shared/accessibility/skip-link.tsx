'use client';

// Explore Bharat Safar — Accessible Skip to Main Content Link
// WCAG 2.2 AA Success Criterion 2.4.1 (Bypass Blocks)

import * as React from 'react';

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-bharat-saffron-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white transition-all"
    >
      {label}
    </a>
  );
}
