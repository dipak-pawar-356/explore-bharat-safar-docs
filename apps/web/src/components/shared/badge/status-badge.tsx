import * as React from 'react';
import { Badge, type BadgeProps } from '@ebs/ui';

export interface StatusBadgeProps {
  status: 'active' | 'pending' | 'verified' | 'cancelled' | 'locked';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    active: 'evergreen',
    verified: 'evergreen',
    pending: 'saffron',
    locked: 'terracotta',
    cancelled: 'outline',
  };

  return <Badge variant={variantMap[status] || undefined}>{label || status.toUpperCase()}</Badge>;
}
