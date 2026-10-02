'use client';

// Explore Bharat Safar — Enterprise Admin Shell Layout
// Reference: EBS-DOC-13-ADMIN Section 1, 2, 3.1 (Dynamic Navigation Menu Builder)
// EBS-DOC-40-SEC-BLUEPRINT Section 4 (RBAC), Section 5 (Session Security)
// Responsive Admin UI — Accessibility Compliance — Role-Based Navigation

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@ebs/types';
import { groupNavItems, getNavItemsForRoles } from '@/lib/admin-nav';

interface AdminShellLayoutProps {
  children: React.ReactNode;
}

function UserRoleBadge({ role }: { role: UserRole }) {
  const colorMap: Record<string, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    [UserRole.SYSTEM_ADMIN]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    [UserRole.BOOKING_ADMIN]:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    [UserRole.FINANCE_ADMIN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    [UserRole.MODERATOR]:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    [UserRole.CONTENT_EDITOR]:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    [UserRole.VILLAGE_ADMIN]:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${colorMap[role] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
    >
      {role.replace(/_/g, ' ')}
    </span>
  );
}

export function AdminShellLayout({ children }: AdminShellLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set(['Overview']));
  const [globalSearch, setGlobalSearch] = React.useState('');

  const userRoles = React.useMemo(() => user?.roles ?? [], [user?.roles]);
  const navGroups = React.useMemo(
    () => groupNavItems(getNavItemsForRoles(userRoles as string[])),
    [userRoles],
  );

  // Auto-expand group containing active route
  React.useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some(item => pathname?.startsWith(item.href))) {
        setExpandedGroups(prev => new Set([...prev, group.label]));
      }
    }
  }, [pathname, navGroups]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const filteredGroups = React.useMemo(() => {
    if (!globalSearch.trim()) return navGroups;
    const q = globalSearch.toLowerCase();
    return navGroups
      .map(g => ({
        ...g,
        items: g.items.filter(item => item.label.toLowerCase().includes(q)),
      }))
      .filter(g => g.items.length > 0);
  }, [navGroups, globalSearch]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
        aria-label="Admin navigation sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          {sidebarOpen && (
            <Link
              href="/super-admin/dashboard"
              className="flex items-center gap-2 min-w-0"
              aria-label="Go to admin dashboard"
            >
              <span className="text-lg">🏛️</span>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">
                  EBS Admin
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-600 font-mono truncate">
                  Governance Console
                </div>
              </div>
            </Link>
          )}
          {!sidebarOpen && (
            <span className="text-lg mx-auto" aria-hidden="true">
              🏛️
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Global Search */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="relative">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                aria-hidden="true"
              >
                🔍
              </span>
              <input
                type="search"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Search modules…"
                className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                aria-label="Search admin modules"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5"
          aria-label="Admin modules navigation"
        >
          {filteredGroups.map(group => (
            <div key={group.label}>
              {sidebarOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  aria-expanded={expandedGroups.has(group.label)}
                >
                  <span>{group.label}</span>
                  <span className="text-[8px]">{expandedGroups.has(group.label) ? '▾' : '▸'}</span>
                </button>
              )}
              {(!sidebarOpen || expandedGroups.has(group.label)) && (
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <span
                          className="flex-shrink-0 text-base w-5 text-center"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        {sidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                        {sidebarOpen && item.isNew && (
                          <span className="flex-shrink-0 px-1 py-0.5 rounded text-[8px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase">
                            New
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Session Panel */}
        <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 p-3">
          {sidebarOpen ? (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 space-y-2">
              <div className="flex flex-wrap gap-1">
                {userRoles.slice(0, 2).map(role => (
                  <UserRoleBadge key={role} role={role as UserRole} />
                ))}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                {user?.email ?? 'Unauthenticated'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                  VillageScopeGuard Active
                </span>
                <span className="text-[9px] text-slate-400">15m idle</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-base" aria-label="User session active" title="Session active">
                🔒
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Breadcrumb hint based on pathname */}
            <nav
              aria-label="Breadcrumb"
              className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5"
            >
              <span>Admin</span>
              {pathname && (
                <>
                  <span aria-hidden="true">›</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium capitalize truncate max-w-[200px]">
                    {pathname.split('/').filter(Boolean).slice(1).join(' › ').replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification Bell */}
            <Link
              href="/super-admin/notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <span aria-hidden="true">🔔</span>
            </Link>
            {/* Admin Profile */}
            <Link
              href="/super-admin/settings/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Admin profile settings"
            >
              <span aria-hidden="true">👤</span>
              <span className="hidden sm:block truncate max-w-[120px]">
                {user?.fullName ?? user?.email ?? 'Admin'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" id="main-content" role="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-600 font-mono">
          <span>Explore Bharat Safar — Enterprise Governance Console</span>
          <span>EBS-DOC-13-ADMIN v1.0</span>
        </footer>
      </div>
    </div>
  );
}
