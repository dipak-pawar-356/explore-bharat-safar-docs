'use client';

// Explore Bharat Safar — Enterprise Notification Item Component
// Reference: EBS-DOC-19-NOTIF Section 4.2 & EBS-BLU-49-REPO Section 14

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CreditCard,
  Calendar,
  Award,
  ShieldAlert,
  Users,
  Compass,
  CheckCircle2,
  Trash2,
  Archive,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Mail,
  Smartphone,
} from 'lucide-react';
import type { INotification } from '@ebs/types';
import { NotificationCategory, NotificationPriority, NotificationChannel } from '@ebs/types';
import { useNotificationStore } from '@/store/notification.store';

interface NotificationItemProps {
  notification: INotification;
  compact?: boolean;
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case NotificationCategory.BOOKING:
      return <Calendar className="w-4 h-4 text-emerald-500" />;
    case NotificationCategory.PAYMENT:
    case NotificationCategory.REFUND:
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    case NotificationCategory.CERTIFICATE:
      return <Award className="w-4 h-4 text-amber-500" />;
    case NotificationCategory.SECURITY:
      return <ShieldAlert className="w-4 h-4 text-purple-500" />;
    case NotificationCategory.EMERGENCY:
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case NotificationCategory.VILLAGE:
      return <Compass className="w-4 h-4 text-teal-500" />;
    case NotificationCategory.SOCIAL:
    case NotificationCategory.COMMUNITY:
      return <Users className="w-4 h-4 text-indigo-500" />;
    default:
      return <Bell className="w-4 h-4 text-slate-500" />;
  }
}

function getPriorityBadge(priority: NotificationPriority) {
  switch (priority) {
    case NotificationPriority.CRITICAL:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 animate-pulse">
          CRITICAL
        </span>
      );
    case NotificationPriority.HIGH:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          HIGH
        </span>
      );
    case NotificationPriority.LOW:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          LOW
        </span>
      );
    default:
      return null;
  }
}

function formatTimeAgo(isoDate: string): string {
  try {
    const diffSeconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recently';
  }
}

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const { markAsRead, archiveNotification, deleteNotification } = useNotificationStore();

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveNotification(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={`group relative p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
        notification.isRead
          ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
          : 'bg-white dark:bg-slate-900 border-bharat-saffron-200 dark:border-bharat-saffron-900/50 shadow-sm'
      }`}
    >
      {/* Unread Indicator Dot */}
      {!notification.isRead && (
        <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-bharat-saffron-500" />
      )}

      <div className="flex items-start gap-3 pl-2">
        {/* Category Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {getCategoryIcon(notification.category)}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {notification.category}
              </span>
              {getPriorityBadge(notification.priority)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>

          <h4
            className={`text-sm tracking-tight mb-1 ${
              notification.isRead
                ? 'font-medium text-slate-700 dark:text-slate-300'
                : 'font-semibold text-slate-900 dark:text-white'
            }`}
          >
            {notification.title}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {notification.body}
          </p>

          {/* Action Link Button */}
          {notification.actionUrl && (
            <div className="mt-2.5">
              <Link
                href={notification.actionUrl}
                className="inline-flex items-center gap-1 text-xs font-medium text-bharat-saffron-600 hover:text-bharat-saffron-700 dark:text-bharat-saffron-400 hover:underline"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Delivery Channels Badge Row */}
          {!compact && notification.channels && notification.channels.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="text-[10px] uppercase tracking-wider">Sent via:</span>
              <div className="flex items-center gap-1.5">
                {notification.channels.includes(NotificationChannel.EMAIL) && (
                  <span title="Dispatched via Email" className="flex items-center gap-0.5">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                )}
                {notification.channels.includes(NotificationChannel.SMS) && (
                  <span title="Dispatched via SMS" className="flex items-center gap-0.5">
                    <Smartphone className="w-3 h-3" /> SMS
                  </span>
                )}
                {notification.channels.includes(NotificationChannel.WHATSAPP) && (
                  <span
                    title="Dispatched via WhatsApp"
                    className="flex items-center gap-0.5 text-emerald-600"
                  >
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={handleMarkRead}
              title="Mark as read"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleArchive}
            title="Archive notification"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete notification"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
