import * as React from 'react';
import { cn } from './utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: 'right' | 'left' | 'bottom';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className,
  side = 'right',
}: DrawerProps) {
  if (!isOpen) return null;

  const sideStyles = {
    right: 'right-0 top-0 bottom-0 w-full max-w-md border-l animate-in slide-in-from-right',
    left: 'left-0 top-0 bottom-0 w-full max-w-md border-r animate-in slide-in-from-left',
    bottom:
      'bottom-0 left-0 right-0 max-h-[85vh] border-t rounded-t-3xl animate-in slide-in-from-bottom',
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div
        className={cn(
          'pointer-events-auto fixed bg-white/95 dark:bg-bharat-indigo-900/95 backdrop-blur-md shadow-2xl p-6 overflow-y-auto border-slate-200 dark:border-slate-800 transition-transform duration-300',
          sideStyles[side],
          className,
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          {title && <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
