import * as React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'saffron' | 'evergreen' | 'terracotta' | 'outline' | 'slate';
}

export function Badge({ className, variant = 'saffron', ...props }: BadgeProps) {
  const variants = {
    saffron: 'bg-bharat-saffron-100 text-bharat-saffron-800 border-bharat-saffron-300',
    evergreen: 'bg-bharat-evergreen-50 text-bharat-evergreen-800 border-bharat-evergreen-300',
    terracotta: 'bg-bharat-terracotta-50 text-bharat-terracotta-800 border-bharat-terracotta-300',
    outline: 'border border-slate-300 text-slate-700 dark:text-slate-300',
    slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
