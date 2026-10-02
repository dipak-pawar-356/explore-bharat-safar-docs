'use client';

import * as React from 'react';

export interface StoryProgressBarProps {
  totalSegments: number;
  activeIndex: number;
  durationMs?: number;
  onSegmentComplete?: () => void;
  className?: string;
}

export function StoryProgressBar(_props: StoryProgressBarProps) {
  return <div data-placeholder="StoryProgressBar" />;
}
