'use client';

// Explore Bharat Safar — Traveller Full Notification Center Page
// Reference: EBS-DOC-19-NOTIF & EBS-BLU-49-REPO Section 14

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Settings2,
  Search,
  Filter,
  Inbox,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  DeliveryStatus,
  type INotification,
} from '@ebs/types';
import { NotificationItem } from '@/components/notifications/notification-item';

const SAMPLE_NOTIFICATIONS: INotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-demo-01',
    type: 'BOOKING_CONFIRMED',
    category: NotificationCategory.BOOKING,
    priority: NotificationPriority.HIGH,
    title: 'Booking Confirmed: Zanskar Frozen River Chadar Trek',
    body: 'Your expedition spot has been secured for Batch #ZAN-2027-01. Please review mandatory fitness declarations and winter gear checklist.',
    actionUrl: '/my-certificates',
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
    deliveryStatus: DeliveryStatus.DELIVERED,
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-demo-01',
    type: 'CERTIFICATE_GENERATED',
    category: NotificationCategory.CERTIFICATE,
    priority: NotificationPriority.NORMAL,
    title: 'Digital Altitude Certificate Issued!',
    body: 'Congratulations on completing Harishchandragad Monsoon Escarpment Trek (1,422m). Your tamper-evident verifiable certificate is ready.',
    actionUrl: '/my-certificates',
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    deliveryStatus: DeliveryStatus.DELIVERED,
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'usr-demo-01',
    type: 'VILLAGE_HERITAGE_UPDATE',
    category: NotificationCategory.VILLAGE,
    priority: NotificationPriority.NORMAL,
    title: 'New Artisan Workshop in Hodka, Kutch',
    body: 'Master Rogan and Lippan artisans are hosting a live 2-day heritage residency this weekend. Special pass available for registered explorers.',
    actionUrl: '/villages/hodka-kutch',
    channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
    deliveryStatus: DeliveryStatus.DELIVERED,
    isRead: true,
    isArchived: false,
    readAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'usr-demo-01',
    type: 'SECURITY_ALERT',
    category: NotificationCategory.SECURITY,
    priority: NotificationPriority.CRITICAL,
    title: 'Security Notice: New Sign-in from Pune, MH',
    body: 'A new session was authenticated for your explorer account from Chrome on Windows (IP: 103.21.244.x). If this was not you, lock your credentials immediately.',
    actionUrl: '/profile/security',
    channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
    deliveryStatus: DeliveryStatus.DELIVERED,
    isRead: true,
    isArchived: false,
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

const CATEGORY_TABS: { label: string; value: NotificationCategory | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Bookings', value: NotificationCategory.BOOKING },
  { label: 'Certificates', value: NotificationCategory.CERTIFICATE },
  { label: 'Rural Villages', value: NotificationCategory.VILLAGE },
  { label: 'Security & Account', value: NotificationCategory.SECURITY },
];

export default function NotificationsPage() {
  const { notifications, setNotifications, unreadCount, markAllAsRead, setPreferencesModalOpen } =
    useNotificationStore();

  const [activeCategory, setActiveCategory] = React.useState<NotificationCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<'ALL' | NotificationPriority>('ALL');

  // Seed with sample notifications on initial mount if empty
  React.useEffect(() => {
    if (notifications.length === 0) {
      setNotifications(SAMPLE_NOTIFICATIONS, 2);
    }
  }, [notifications.length, setNotifications]);

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(item => {
      // Category filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.body.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, activeCategory, priorityFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-bharat-saffron-100 text-bharat-saffron-800 dark:bg-bharat-saffron-950/60 dark:text-bharat-saffron-300">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Stay informed with verified itinerary alerts, certificates, and community updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={() => setPreferencesModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Preferences</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search alerts, batches, or certificates..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Priority:</span>
              </span>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as 'ALL' | NotificationPriority)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
              >
                <option value="ALL">All Priorities</option>
                <option value={NotificationPriority.CRITICAL}>Critical Only</option>
                <option value={NotificationPriority.HIGH}>High Priority</option>
                <option value={NotificationPriority.NORMAL}>Normal</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === tab.value
                    ? 'bg-bharat-saffron-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No notifications found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || activeCategory !== 'ALL'
                  ? 'No notifications matched your active filter or search keywords.'
                  : 'You have no notifications yet. Important trip updates and community activities will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
