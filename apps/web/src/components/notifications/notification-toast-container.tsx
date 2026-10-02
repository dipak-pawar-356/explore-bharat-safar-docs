'use client';

// Explore Bharat Safar — Floating Notification Toast Container
// Real-time toast alerts for critical/high priority notifications

import * as React from 'react';
import Link from 'next/link';
import { X, ExternalLink, Bell, AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import { NotificationPriority } from '@ebs/types';

export function NotificationToastContainer() {
  const { toasts, dismissToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300 ${
            toast.priority === NotificationPriority.CRITICAL
              ? 'bg-red-50/95 dark:bg-red-950/95 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.priority === NotificationPriority.CRITICAL ? (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <Bell className="w-4 h-4 text-bharat-saffron-600 dark:text-bharat-saffron-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight truncate">{toast.title}</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {toast.body}
            </p>
            {toast.actionUrl && (
              <Link
                href={toast.actionUrl}
                onClick={() => dismissToast(toast.id)}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-bharat-saffron-600 dark:text-bharat-saffron-400 hover:underline"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
