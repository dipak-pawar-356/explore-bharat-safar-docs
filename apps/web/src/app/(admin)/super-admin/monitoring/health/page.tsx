'use client';

// Explore Bharat Safar — Health Dashboard
// Reference: EBS-DOC-23-DEVOPS, EBS-DOC-13-ADMIN
// Sprint 9: Items 58 (Health Dashboard), 52 (Queue Monitoring), 53 (Worker Monitoring),
//           54 (Redis Monitoring), 55 (PostgreSQL Monitoring), 56 (API Monitoring),
//           57 (Error Monitoring), 59 (Background Jobs Dashboard), 60 (Admin Profile)

import * as React from 'react';
import { SystemHealthPanel } from '@/features/admin-dashboard';
import type { SystemHealth } from '@ebs/types';
import { SystemHealthStatus, ServiceStatus } from '@ebs/types';
import Link from 'next/link';

const MOCK_HEALTH: SystemHealth = {
  status: SystemHealthStatus.OPERATIONAL,
  timestamp: new Date().toISOString(),
  uptime: 86400 * 14 + 3600 * 7,
  version: '1.9.0',
  services: [
    {
      name: 'PostgreSQL 16 Primary',
      status: ServiceStatus.UP,
      latencyMs: 2,
      lastChecked: new Date().toISOString(),
      details: 'AES-256 TDE · Connections: 84/200',
    },
    {
      name: 'Redis 7 Cluster (mTLS)',
      status: ServiceStatus.UP,
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
      details: 'Memory: 78% · Eviction: allkeys-lru',
    },
    {
      name: 'NestJS API Gateway',
      status: ServiceStatus.UP,
      latencyMs: 18,
      lastChecked: new Date().toISOString(),
      details: 'p99: 42ms · Requests/min: 8,420',
    },
    {
      name: 'GIS & Discovery Service',
      status: ServiceStatus.UP,
      latencyMs: 24,
      lastChecked: new Date().toISOString(),
      details: 'PostGIS queries: 4,840/min',
    },
    {
      name: 'Village Knowledge Service',
      status: ServiceStatus.UP,
      latencyMs: 12,
      lastChecked: new Date().toISOString(),
      details: 'Staging queue: 312 pending',
    },
    {
      name: 'Booking & Slot Lock Service',
      status: ServiceStatus.UP,
      latencyMs: 15,
      lastChecked: new Date().toISOString(),
      details: 'Active slot locks: 247',
    },
    {
      name: 'Payment & Invoicing Service',
      status: ServiceStatus.UP,
      latencyMs: 31,
      lastChecked: new Date().toISOString(),
      details: 'Razorpay webhook lag: 0ms',
    },
    {
      name: 'Certificate Synthesis Service',
      status: ServiceStatus.UP,
      latencyMs: 8,
      lastChecked: new Date().toISOString(),
      details: 'ECC-256 keys valid · Queue: 0',
    },
    {
      name: 'Social & Community Service',
      status: ServiceStatus.UP,
      latencyMs: 21,
      lastChecked: new Date().toISOString(),
      details: 'WebSocket connections: 12,840',
    },
    {
      name: 'BullMQ Worker Pool',
      status: ServiceStatus.UP,
      latencyMs: 4,
      lastChecked: new Date().toISOString(),
      details: 'Workers: 8/8 active · Jobs queued: 14',
    },
    {
      name: 'Cloudflare Edge (WAF)',
      status: ServiceStatus.UP,
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
      details: 'DDoS shield active · Bot score: 2.1%',
    },
    {
      name: 'S3 Object Storage',
      status: ServiceStatus.UP,
      latencyMs: 7,
      lastChecked: new Date().toISOString(),
      details: 'Used: 1.84TB · KMS encryption active',
    },
  ],
};

const MONITORING_LINKS = [
  {
    label: 'API Monitoring',
    href: '/super-admin/monitoring/api',
    icon: '🔌',
    desc: 'Endpoint latency, error rates, throughput',
  },
  {
    label: 'Error Monitoring',
    href: '/super-admin/monitoring/errors',
    icon: '🚨',
    desc: 'Exception tracking and stack traces',
  },
  {
    label: 'Queue Monitoring',
    href: '/super-admin/monitoring/queues',
    icon: '📬',
    desc: 'BullMQ queue depth and job status',
  },
  {
    label: 'Worker Monitoring',
    href: '/super-admin/monitoring/workers',
    icon: '⚙️',
    desc: 'Background worker health and throughput',
  },
  {
    label: 'Redis Monitoring',
    href: '/super-admin/monitoring/redis',
    icon: '🔴',
    desc: 'Memory, connections, eviction policy',
  },
  {
    label: 'PostgreSQL Monitoring',
    href: '/super-admin/monitoring/postgres',
    icon: '🐘',
    desc: 'Query performance, connections, locks',
  },
  {
    label: 'Cache Management',
    href: '/super-admin/monitoring/cache',
    icon: '⚡',
    desc: 'Cache hit rates and invalidation',
  },
  {
    label: 'Background Jobs',
    href: '/super-admin/monitoring/jobs',
    icon: '🔄',
    desc: 'Scheduled and async job execution',
  },
  {
    label: 'Scheduled Jobs',
    href: '/super-admin/monitoring/scheduled',
    icon: '⏰',
    desc: 'Cron job schedules and last runs',
  },
  {
    label: 'Webhook Monitoring',
    href: '/super-admin/monitoring/webhooks',
    icon: '🪝',
    desc: 'Payment gateway and external webhooks',
  },
];

export default function HealthDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Health Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time infrastructure telemetry · Service mesh health · Zero-trust perimeter status
        </p>
      </div>

      {/* System Health Panel */}
      <SystemHealthPanel
        health={MOCK_HEALTH}
        onRefresh={() => console.info('[ADMIN] Health refresh requested')}
      />

      {/* Infrastructure Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'API Requests/min', value: '8,420', trend: '↑', color: 'indigo' },
          { label: 'Avg. Response Time', value: '18ms', trend: '↓', color: 'emerald' },
          { label: 'Error Rate', value: '0.03%', trend: '↓', color: 'emerald' },
          { label: 'Active Connections', value: '12,840', trend: '↑', color: 'amber' },
          { label: 'CPU Usage', value: '34%', trend: '', color: 'slate' },
          { label: 'Memory Usage', value: '62%', trend: '', color: 'slate' },
          { label: 'Disk I/O', value: '124 MB/s', trend: '', color: 'slate' },
          { label: 'Network I/O', value: '840 MB/s', trend: '', color: 'slate' },
        ].map(m => (
          <div
            key={m.label}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {m.label}
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
              {m.value}
            </div>
            {m.trend && (
              <div
                className={`text-xs font-semibold mt-0.5 ${m.trend === '↑' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}
              >
                {m.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monitoring Links Grid */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3">
          Monitoring Consoles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MONITORING_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                {link.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  {link.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {link.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
