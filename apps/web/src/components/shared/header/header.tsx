'use client';

import * as React from 'react';
import Link from 'next/link';
import { Compass, Bell, Search, Command } from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import {
  NotificationCenterDrawer,
  NotificationPreferencesModal,
  NotificationToastContainer,
} from '@/components/notifications';
import { GlobalSearchDialog } from '@/components/search';

export function Header() {
  const { unreadCount, setDrawerOpen } = useNotificationStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-bharat-indigo-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-bharat-saffron-600 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-900 dark:text-white">Explore Bharat Safar</span>
          </Link>

          {/* Quick Global Search Trigger Button */}
          <button
            id="global-search-trigger"
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search destinations, villages, and treks"
            className="flex-1 max-w-md hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search places, villages, treks...</span>
            </span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              id="mobile-search-trigger"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open Search"
              className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell Trigger */}
            <button
              id="notification-bell-trigger"
              onClick={() => setDrawerOpen(true)}
              aria-label={`View Notifications (${unreadCount} unread)`}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-bharat-saffron-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-bharat-indigo-900">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Cmd+K Search Command Palette Dialog */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Slide-over Drawer */}
      <NotificationCenterDrawer />

      {/* Preferences Modal */}
      <NotificationPreferencesModal />

      {/* Real-time Toast Notifications Container */}
      <NotificationToastContainer />
    </>
  );
}
