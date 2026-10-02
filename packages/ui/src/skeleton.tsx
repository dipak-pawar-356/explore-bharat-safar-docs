import * as React from 'react';
import { cn } from './utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  shimmer = true,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-48 w-full rounded-2xl',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-slate-200 dark:bg-slate-800',
        shimmer && 'animate-pulse',
        variantStyles[variant],
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

export function SearchResultSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading search results"
      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" width="40%" height={14} />
          <Skeleton variant="text" width="25%" height={10} />
        </div>
      </div>
      <Skeleton variant="text" width="90%" height={12} />
      <Skeleton variant="text" width="70%" height={12} />
    </div>
  );
}
