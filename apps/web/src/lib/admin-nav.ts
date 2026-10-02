// Explore Bharat Safar — Admin Navigation Definition
// Reference: EBS-DOC-13-ADMIN Section 2, 3.1 (Dynamic Navigation Menu Builder)
// Navigation items are driven by role checks (UI-only gating).

import { UserRole } from '@ebs/types';

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  group: string;
  requiredRoles?: UserRole[];
  isNew?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  // ─── Global Overview ──────────────────────────────────────────────────
  {
    id: 'super-admin-dashboard',
    label: 'Global Dashboard',
    href: '/super-admin/dashboard',
    icon: '🌐',
    group: 'Overview',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
    group: 'Overview',
    requiredRoles: [
      UserRole.BOOKING_ADMIN,
      UserRole.FINANCE_ADMIN,
      UserRole.MODERATOR,
      UserRole.CONTENT_EDITOR,
    ],
  },
  {
    id: 'village-admin-dashboard',
    label: 'Village Dashboard',
    href: '/village-admin',
    icon: '🏘️',
    group: 'Overview',
    requiredRoles: [UserRole.VILLAGE_ADMIN],
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  {
    id: 'booking-analytics',
    label: 'Booking Analytics',
    href: '/super-admin/analytics/bookings',
    icon: '🎒',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN],
  },
  {
    id: 'revenue-analytics',
    label: 'Revenue Analytics',
    href: '/super-admin/analytics/revenue',
    icon: '💰',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN],
  },
  {
    id: 'traveller-analytics',
    label: 'Traveller Analytics',
    href: '/super-admin/analytics/travellers',
    icon: '👤',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'village-analytics',
    label: 'Village Analytics',
    href: '/super-admin/analytics/villages',
    icon: '🏘️',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'discovery-analytics',
    label: 'Discovery Analytics',
    href: '/super-admin/analytics/discovery',
    icon: '📍',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'social-analytics',
    label: 'Social Analytics',
    href: '/super-admin/analytics/social',
    icon: '💬',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'certificate-analytics',
    label: 'Certificate Analytics',
    href: '/super-admin/analytics/certificates',
    icon: '🏅',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN],
  },
  {
    id: 'payment-analytics',
    label: 'Payment Analytics',
    href: '/super-admin/analytics/payments',
    icon: '💳',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN],
  },
  {
    id: 'gis-analytics',
    label: 'GIS Analytics',
    href: '/super-admin/analytics/gis',
    icon: '🗺️',
    group: 'Analytics',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },

  // ─── User & Access Control ────────────────────────────────────────────
  {
    id: 'user-management',
    label: 'User Management',
    href: '/super-admin/users',
    icon: '👥',
    group: 'User & Access',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'role-management',
    label: 'Role Management',
    href: '/super-admin/roles',
    icon: '🛡️',
    group: 'User & Access',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'permission-management',
    label: 'Permission Management',
    href: '/super-admin/permissions',
    icon: '🔑',
    group: 'User & Access',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'session-management',
    label: 'Session Management',
    href: '/super-admin/security/sessions',
    icon: '⚙️',
    group: 'User & Access',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'device-management',
    label: 'Device Management',
    href: '/super-admin/security/devices',
    icon: '📱',
    group: 'User & Access',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },

  // ─── Audit & Security ─────────────────────────────────────────────────
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    href: '/super-admin/audit-logs',
    icon: '📋',
    group: 'Audit & Security',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'login-activity',
    label: 'Login Activity',
    href: '/super-admin/security/login-activity',
    icon: '🔐',
    group: 'Audit & Security',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'security-console',
    label: 'Security Console',
    href: '/super-admin/security',
    icon: '🔒',
    group: 'Audit & Security',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'api-key-management',
    label: 'API Key Management',
    href: '/super-admin/security/api-keys',
    icon: '🗝️',
    group: 'Audit & Security',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },

  // ─── Booking & Payments ───────────────────────────────────────────────
  {
    id: 'booking-management',
    label: 'Booking Management',
    href: '/booking-admin/batches',
    icon: '📅',
    group: 'Booking & Payments',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN],
  },
  {
    id: 'payment-monitoring',
    label: 'Payment Monitoring',
    href: '/payment-admin/transactions',
    icon: '💳',
    group: 'Booking & Payments',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN],
  },
  {
    id: 'payment-controls',
    label: 'Payment Controls',
    href: '/payment-admin/controls',
    icon: '⚙️',
    group: 'Booking & Payments',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN],
  },
  {
    id: 'certificate-management',
    label: 'Certificate Management',
    href: '/certificate-admin/certificates',
    icon: '🏅',
    group: 'Booking & Payments',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.BOOKING_ADMIN],
  },

  // ─── Content Management ───────────────────────────────────────────────
  {
    id: 'traveller-management',
    label: 'Traveller Management',
    href: '/super-admin/travellers',
    icon: '🧳',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'village-management',
    label: 'Village Management',
    href: '/super-admin/villages',
    icon: '🏘️',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'place-management',
    label: 'Place Management',
    href: '/super-admin/places',
    icon: '📍',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'category-management',
    label: 'Category Management',
    href: '/super-admin/categories',
    icon: '🏷️',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'banner-management',
    label: 'Banner Management',
    href: '/super-admin/banners',
    icon: '🖼️',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'media-library',
    label: 'Media Library',
    href: '/super-admin/media',
    icon: '📁',
    group: 'Content',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR, UserRole.SYSTEM_ADMIN],
  },

  // ─── CMS ──────────────────────────────────────────────────────────────
  {
    id: 'cms-pages',
    label: 'CMS Pages',
    href: '/super-admin/cms/pages',
    icon: '📄',
    group: 'CMS',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'faq-management',
    label: 'FAQ Management',
    href: '/super-admin/cms/faqs',
    icon: '❓',
    group: 'CMS',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'terms-conditions',
    label: 'Terms & Conditions',
    href: '/super-admin/cms/terms',
    icon: '📜',
    group: 'CMS',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'privacy-policy',
    label: 'Privacy Policy',
    href: '/super-admin/cms/privacy',
    icon: '🔏',
    group: 'CMS',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'contact-info',
    label: 'Contact Information',
    href: '/super-admin/cms/contact',
    icon: '📬',
    group: 'CMS',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },

  // ─── Moderation ───────────────────────────────────────────────────────
  {
    id: 'review-moderation',
    label: 'Review Moderation',
    href: '/super-admin/moderation/reviews',
    icon: '⭐',
    group: 'Moderation',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'community-moderation',
    label: 'Community Moderation',
    href: '/super-admin/moderation/community',
    icon: '🤝',
    group: 'Moderation',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'story-moderation',
    label: 'Story Moderation',
    href: '/super-admin/moderation/stories',
    icon: '📖',
    group: 'Moderation',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'report-handling',
    label: 'Report Handling',
    href: '/super-admin/moderation/reports',
    icon: '🚩',
    group: 'Moderation',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },
  {
    id: 'abuse-detection',
    label: 'Abuse Detection',
    href: '/super-admin/moderation/abuse',
    icon: '🛡️',
    group: 'Moderation',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.MODERATOR],
  },

  // ─── Notifications ────────────────────────────────────────────────────
  {
    id: 'notification-center',
    label: 'Notification Center',
    href: '/super-admin/notifications',
    icon: '🔔',
    group: 'Notifications',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'notification-templates',
    label: 'Notification Templates',
    href: '/super-admin/notifications/templates',
    icon: '📝',
    group: 'Notifications',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    href: '/super-admin/notifications/email',
    icon: '📧',
    group: 'Notifications',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },

  // ─── System ───────────────────────────────────────────────────────────
  {
    id: 'system-config',
    label: 'System Configuration',
    href: '/super-admin/system/config',
    icon: '⚙️',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'feature-flags',
    label: 'Feature Flags',
    href: '/super-admin/system/feature-flags',
    icon: '🚩',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'localization',
    label: 'Localization',
    href: '/super-admin/system/localization',
    icon: '🌍',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.CONTENT_EDITOR],
  },
  {
    id: 'maintenance-mode',
    label: 'Maintenance Mode',
    href: '/super-admin/system/maintenance',
    icon: '🔧',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'backup-management',
    label: 'Backup Management',
    href: '/super-admin/system/backups',
    icon: '💾',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    id: 'restore-console',
    label: 'Restore Console',
    href: '/super-admin/system/restore',
    icon: '⏮️',
    group: 'System',
    requiredRoles: [UserRole.SUPER_ADMIN],
  },

  // ─── Monitoring ───────────────────────────────────────────────────────
  {
    id: 'health-dashboard',
    label: 'Health Dashboard',
    href: '/super-admin/monitoring/health',
    icon: '💚',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'api-monitoring',
    label: 'API Monitoring',
    href: '/super-admin/monitoring/api',
    icon: '🔌',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'error-monitoring',
    label: 'Error Monitoring',
    href: '/super-admin/monitoring/errors',
    icon: '🚨',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'queue-monitoring',
    label: 'Queue Monitoring',
    href: '/super-admin/monitoring/queues',
    icon: '📬',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'worker-monitoring',
    label: 'Worker Monitoring',
    href: '/super-admin/monitoring/workers',
    icon: '⚙️',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'redis-monitoring',
    label: 'Redis Monitoring',
    href: '/super-admin/monitoring/redis',
    icon: '🔴',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'postgres-monitoring',
    label: 'PostgreSQL Monitoring',
    href: '/super-admin/monitoring/postgres',
    icon: '🐘',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'cache-management',
    label: 'Cache Management',
    href: '/super-admin/monitoring/cache',
    icon: '⚡',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'background-jobs',
    label: 'Background Jobs',
    href: '/super-admin/monitoring/jobs',
    icon: '🔄',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'scheduled-jobs',
    label: 'Scheduled Jobs',
    href: '/super-admin/monitoring/scheduled',
    icon: '⏰',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
  {
    id: 'webhook-monitoring',
    label: 'Webhook Monitoring',
    href: '/super-admin/monitoring/webhooks',
    icon: '🪝',
    group: 'Monitoring',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },

  // ─── Reports ──────────────────────────────────────────────────────────
  {
    id: 'report-generator',
    label: 'Report Generator',
    href: '/super-admin/reports',
    icon: '📊',
    group: 'Reports',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_ADMIN],
  },

  // ─── Admin Settings ───────────────────────────────────────────────────
  {
    id: 'admin-profile',
    label: 'Admin Profile',
    href: '/super-admin/settings/profile',
    icon: '👤',
    group: 'Settings',
  },
  {
    id: 'theme-settings',
    label: 'Theme Settings',
    href: '/super-admin/settings/theme',
    icon: '🎨',
    group: 'Settings',
  },
  {
    id: 'global-search',
    label: 'Global Search',
    href: '/super-admin/search',
    icon: '🔍',
    group: 'Settings',
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN],
  },
];

export const NAV_GROUP_ORDER = [
  'Overview',
  'Analytics',
  'User & Access',
  'Audit & Security',
  'Booking & Payments',
  'Content',
  'CMS',
  'Moderation',
  'Notifications',
  'System',
  'Monitoring',
  'Reports',
  'Settings',
];

/**
 * Returns nav items visible to the given user roles.
 * UI-only gating — server enforces RolesGuard on all data mutations.
 */
export function getNavItemsForRoles(userRoles: string[]): AdminNavItem[] {
  const roles = userRoles as UserRole[];
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);

  return ADMIN_NAV_ITEMS.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    if (isSuperAdmin) return true;
    return item.requiredRoles.some(r => roles.includes(r));
  });
}

/**
 * Groups nav items by their group label, respecting NAV_GROUP_ORDER.
 */
export function groupNavItems(items: AdminNavItem[]): AdminNavGroup[] {
  const grouped: Record<string, AdminNavItem[]> = {};
  for (const item of items) {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  }
  return NAV_GROUP_ORDER.filter(g => grouped[g] && grouped[g].length > 0).map(g => ({
    label: g,
    items: grouped[g],
  }));
}
