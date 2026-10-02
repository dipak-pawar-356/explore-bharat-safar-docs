// Explore Bharat Safar — Client Notification State Store (Zustand)
// Reference: EBS-DOC-19-NOTIF & EBS-BLU-49-REPO Section 14

import { create } from 'zustand';
import type {
  INotification,
  INotificationPreferences,
  NotificationCategory,
  NotificationPriority,
} from '@ebs/types';

export interface NotificationToast {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  actionUrl?: string;
  timestamp: number;
}

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  isPreferencesModalOpen: boolean;
  activeFilter: NotificationCategory | 'ALL';
  preferences: INotificationPreferences | null;
  toasts: NotificationToast[];

  // Drawer / Modal Controls
  setDrawerOpen: (open: boolean) => void;
  setPreferencesModalOpen: (open: boolean) => void;
  setActiveFilter: (filter: NotificationCategory | 'ALL') => void;

  // Notification Operations
  setLoading: (loading: boolean) => void;
  setNotifications: (notifications: INotification[], unreadCount: number) => void;
  addNotification: (notification: INotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;

  // Preferences
  setPreferences: (preferences: INotificationPreferences) => void;

  // In-App Toast Banners
  showToast: (toast: Omit<NotificationToast, 'timestamp'>) => void;
  dismissToast: (toastId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isDrawerOpen: false,
  isPreferencesModalOpen: false,
  activeFilter: 'ALL',
  preferences: null,
  toasts: [],

  setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),
  setPreferencesModalOpen: (open: boolean) => set({ isPreferencesModalOpen: open }),
  setActiveFilter: (filter: NotificationCategory | 'ALL') => set({ activeFilter: filter }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setNotifications: (notifications, unreadCount) =>
    set({
      notifications,
      unreadCount,
      isLoading: false,
    }),

  addNotification: (notification: INotification) => {
    const state = get();
    const existingIndex = state.notifications.findIndex(n => n.id === notification.id);
    let updatedList: INotification[];

    if (existingIndex >= 0) {
      updatedList = [...state.notifications];
      updatedList[existingIndex] = notification;
    } else {
      updatedList = [notification, ...state.notifications];
    }

    const unreadDelta = notification.isRead ? 0 : 1;

    // Trigger toast for high/critical or any new notification
    const newToast: NotificationToast = {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      timestamp: Date.now(),
    };

    set({
      notifications: updatedList,
      unreadCount: state.unreadCount + unreadDelta,
      toasts: [newToast, ...state.toasts.slice(0, 4)],
    });
  },

  markAsRead: (notificationId: string) => {
    const state = get();
    let wasUnread = false;
    const updated = state.notifications.map(item => {
      if (item.id === notificationId && !item.isRead) {
        wasUnread = true;
        return { ...item, isRead: true, readAt: new Date().toISOString() };
      }
      return item;
    });

    set({
      notifications: updated,
      unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
    });
  },

  markAllAsRead: () => {
    const state = get();
    const updated = state.notifications.map(item => ({
      ...item,
      isRead: true,
      readAt: item.readAt || new Date().toISOString(),
    }));

    set({
      notifications: updated,
      unreadCount: 0,
    });
  },

  archiveNotification: (notificationId: string) => {
    const state = get();
    const target = state.notifications.find(n => n.id === notificationId);
    const wasUnread = target && !target.isRead;

    set({
      notifications: state.notifications.filter(n => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    });
  },

  deleteNotification: (notificationId: string) => {
    const state = get();
    const target = state.notifications.find(n => n.id === notificationId);
    const wasUnread = target && !target.isRead;

    set({
      notifications: state.notifications.filter(n => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    });
  },

  setPreferences: (preferences: INotificationPreferences) => {
    set({ preferences });
  },

  showToast: toast => {
    set(state => ({
      toasts: [{ ...toast, timestamp: Date.now() }, ...state.toasts.slice(0, 4)],
    }));
  },

  dismissToast: (toastId: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== toastId),
    }));
  },
}));
