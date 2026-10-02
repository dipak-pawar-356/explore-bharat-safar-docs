'use client';

// Explore Bharat Safar — Enterprise Notification Center Slide-over Drawer
// Reference: EBS-DOC-19-NOTIF Section 4.2 & EBS-BLU-49-REPO Section 14

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  CheckCheck,
  Settings2,
  Search,
  SlidersHorizontal,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import { NotificationCategory } from '@ebs/types';
import { NotificationItem } from './notification-item';

const FILTER_OPTIONS: { label: string; value: NotificationCategory | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Bookings', value: NotificationCategory.BOOKING },
  { label: 'Payments', value: NotificationCategory.PAYMENT },
  { label: 'Certificates', value: NotificationCategory.CERTIFICATE },
  { label: 'Social', value: NotificationCategory.SOCIAL },
  { label: 'System', value: NotificationCategory.SYSTEM },
];

export function NotificationCenterDrawer() {
  const {
    isDrawerOpen,
    setDrawerOpen,
    setPreferencesModalOpen,
    notifications,
    unreadCount,
    activeFilter,
    setActiveFilter,
    markAllAsRead,
  } = useNotificationStore();

  const [searchQuery, setSearchQuery] = React.useState('');

  // Lock body scroll when drawer open
  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Filter and search notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(item => {
      // Category Filter
      if (activeFilter !== 'ALL' && item.category !== activeFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesBody = item.body.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesTitle || matchesBody || matchesCategory;
      }
      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-800 dark:text-slate-100" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bharat-saffron-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-bharat-saffron-100 text-bharat-saffron-800 dark:bg-bharat-saffron-950/60 dark:text-bharat-saffron-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setPreferencesModalOpen(true)}
                title="Notification Settings"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                title="Close drawer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search alerts and updates..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
              />
            </div>

            {/* Filter Chips Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeFilter === opt.value
                      ? 'bg-bharat-saffron-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No notifications
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">
                    {searchQuery
                      ? 'No matching notifications found for your search.'
                      : 'You are all caught up! New alerts and updates will appear here.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setDrawerOpen(false);
                setPreferencesModalOpen(true);
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Notification Preferences</span>
            </button>

            <Link
              href="/notifications"
              onClick={() => setDrawerOpen(false)}
              className="text-xs font-semibold text-bharat-saffron-600 hover:text-bharat-saffron-700 dark:text-bharat-saffron-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
