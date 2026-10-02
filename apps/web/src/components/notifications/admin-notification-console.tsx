'use client';

// Explore Bharat Safar — Enterprise Admin Notification & Communication Console
// Reference: EBS-DOC-19-NOTIF Section 5 & EBS-DOC-13-ADMIN
// Multi-channel broadcast composer, telemetry dashboard, DLQ inspector & re-drive console

import * as React from 'react';
import {
  Send,
  Radio,
  AlertOctagon,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Mail,
  Smartphone,
  MessageSquare,
  Bell,
  Globe,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import {
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  UserRole,
} from '@ebs/types';

interface DeadLetterItem {
  id: string;
  jobId: string;
  queueName: string;
  category: string;
  failureReason: string;
  retryCount: number;
  lastAttemptAt: string;
}

const MOCK_DLQ_ITEMS: DeadLetterItem[] = [
  {
    id: 'dlq-101',
    jobId: 'bull-job-9841',
    queueName: 'notifications-dispatch',
    category: 'BOOKING',
    failureReason: 'ProviderTimeout: AWS SES 504 Gateway Timeout on bulk batch #904',
    retryCount: 3,
    lastAttemptAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'dlq-102',
    jobId: 'bull-job-9842',
    queueName: 'notifications-dispatch',
    category: 'PAYMENT',
    failureReason: 'DltTemplateMismatch: Gupshup SMS rejected template variable interpolation',
    retryCount: 3,
    lastAttemptAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export function AdminNotificationConsole() {
  const [activeTab, setActiveTab] = React.useState<'broadcast' | 'dlq' | 'telemetry'>('broadcast');

  // Broadcast Form State
  const [broadcastTarget, setBroadcastTarget] = React.useState('ALL_USERS');
  const [category, setCategory] = React.useState<NotificationCategory>(
    NotificationCategory.ANNOUNCEMENT,
  );
  const [priority, setPriority] = React.useState<NotificationPriority>(NotificationPriority.NORMAL);
  const [selectedChannels, setSelectedChannels] = React.useState<NotificationChannel[]>([
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
  ]);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [actionUrl, setActionUrl] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = React.useState<string | null>(null);

  // DLQ State
  const [dlqItems, setDlqItems] = React.useState<DeadLetterItem[]>(MOCK_DLQ_ITEMS);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  const toggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel],
    );
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || selectedChannels.length === 0) return;

    setIsSending(true);
    setSendSuccessMessage(null);

    // Simulate multi-channel broadcast submission
    await new Promise(r => setTimeout(r, 900));

    setIsSending(false);
    setSendSuccessMessage(
      `Broadcast successfully queued for dispatch across ${selectedChannels.length} channel(s)!`,
    );
    setTitle('');
    setBody('');
    setActionUrl('');

    setTimeout(() => setSendSuccessMessage(null), 5000);
  };

  const handleRetryDlq = async (dlqId: string) => {
    setRetryingId(dlqId);
    await new Promise(r => setTimeout(r, 700));
    setDlqItems(prev => prev.filter(i => i.id !== dlqId));
    setRetryingId(null);
  };

  const handlePurgeDlq = (dlqId: string) => {
    setDlqItems(prev => prev.filter(i => i.id !== dlqId));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Dispatched (24h)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">128,490</div>
            <div className="text-[11px] text-emerald-600 font-semibold">+14.2% vs yesterday</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Delivery Rate</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">99.78%</div>
            <div className="text-[11px] text-slate-500">Industry SLA: &gt;99.5%</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Average Latency</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">142ms</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Priority P0: &lt;50ms</div>
          </div>
        </div>

        {/* Metric 4: DLQ Quarantined */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Quarantined (DLQ)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {dlqItems.length}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold">Requires attention</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'broadcast'
              ? 'bg-bharat-saffron-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Multi-Channel Broadcast Composer</span>
        </button>

        <button
          onClick={() => setActiveTab('dlq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors relative ${
            activeTab === 'dlq'
              ? 'bg-bharat-saffron-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dead Letter Queue (DLQ)</span>
          {dlqItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold ml-1">
              {dlqItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'telemetry'
              ? 'bg-bharat-saffron-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Provider Health & Telemetry</span>
        </button>
      </div>

      {/* TAB 1: Broadcast Composer */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Compose Enterprise Broadcast
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Simultaneously dispatch announcements across App Feed, DLT SMS, Meta WhatsApp, and SES
              Email
            </p>

            {sendSuccessMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Target Audience & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={broadcastTarget}
                    onChange={e => setBroadcastTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                  >
                    <option value="ALL_USERS">All Active Platform Users</option>
                    <option value="TRAVELLERS">All Travellers / Explorers</option>
                    <option value="VILLAGE_HOSTS">Rural Village Hosts & Artisans</option>
                    <option value="ADMINS">All Administrators & Moderators</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Notification Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as NotificationCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                  >
                    <option value={NotificationCategory.ANNOUNCEMENT}>Platform Announcement</option>
                    <option value={NotificationCategory.EMERGENCY}>Critical Emergency Alert</option>
                    <option value={NotificationCategory.SYSTEM}>System Maintenance</option>
                    <option value={NotificationCategory.VILLAGE}>Village Heritage Update</option>
                  </select>
                </div>
              </div>

              {/* Priority & Channel Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority Lane
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                  >
                    <option value={NotificationPriority.NORMAL}>P2: Normal Priority Lane</option>
                    <option value={NotificationPriority.HIGH}>P1: High Priority Lane</option>
                    <option value={NotificationPriority.CRITICAL}>
                      P0: Critical Instant Bypass
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dispatch Channels ({selectedChannels.length} selected)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { ch: NotificationChannel.IN_APP, icon: Bell, label: 'Feed' },
                      { ch: NotificationChannel.EMAIL, icon: Mail, label: 'Email' },
                      { ch: NotificationChannel.SMS, icon: Smartphone, label: 'SMS' },
                      { ch: NotificationChannel.WHATSAPP, icon: MessageSquare, label: 'WhatsApp' },
                    ].map(item => (
                      <button
                        type="button"
                        key={item.ch}
                        onClick={() => toggleChannel(item.ch)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                          selectedChannels.includes(item.ch)
                            ? 'bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40 border-bharat-saffron-500 text-bharat-saffron-700 dark:text-bharat-saffron-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Monsoon Advisory: Zanskar Pass Route Updates"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Body Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notification Message Body
                </label>
                <textarea
                  required
                  rows={4}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Provide comprehensive instructions or advisories for travelers and hosts..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Action URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deep Link Action URL (Optional)
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={e => setActionUrl(e.target.value)}
                  placeholder="e.g. /expeditions/zanskar-trail-2026 or /bulletins/weather-alert"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending || selectedChannels.length === 0}
                  className="w-full sm:w-auto px-6 py-2.5 bg-bharat-saffron-600 hover:bg-bharat-saffron-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Distributing to Queues...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Broadcast Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile / In-App Preview (1 col) */}
          <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Live Notification Preview
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-bharat-saffron-500" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Now</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {title || 'Your Notification Title Will Appear Here'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3">
                  {body ||
                    'Notification message preview will update in real time as you compose the broadcast body.'}
                </div>
                {actionUrl && (
                  <div className="pt-1 text-[11px] font-semibold text-bharat-saffron-600">
                    Tap to view details &rarr;
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 dark:text-amber-300">
                Broadcasts will strictly honor traveler communication preferences and quiet hours
                except for P0 Critical Alerts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Dead Letter Queue (DLQ) Inspector */}
      {activeTab === 'dlq' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dead Letter Queue (DLQ) Quarantine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Failed jobs that exceeded max retry attempts (3 retries). Inspect root cause and
                re-drive to active workers.
              </p>
            </div>
            <button
              onClick={() => setDlqItems([])}
              disabled={dlqItems.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 disabled:opacity-40 transition-colors"
            >
              Purge All Quarantined
            </button>
          </div>

          {dlqItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Dead Letter Queue is Clear
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All background notification worker jobs are processing smoothly with zero
                quarantined tasks.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-3">Job ID</th>
                    <th className="py-3 px-3">Queue</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Failure Reason</th>
                    <th className="py-3 px-3">Attempts</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {dlqItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.jobId}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.queueName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td
                        className="py-3 px-3 text-red-600 dark:text-red-400 font-mono text-[11px] max-w-xs truncate"
                        title={item.failureReason}
                      >
                        {item.failureReason}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {item.retryCount} / 3
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRetryDlq(item.id)}
                            disabled={retryingId === item.id}
                            className="px-2.5 py-1 rounded-lg bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${retryingId === item.id ? 'animate-spin' : ''}`}
                            />
                            <span>Re-drive</span>
                          </button>
                          <button
                            onClick={() => handlePurgeDlq(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Provider Health & Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'AWS Simple Email Service (SES)',
              status: 'HEALTHY',
              latency: '112ms',
              throughput: '45 msgs/sec',
              circuit: 'CLOSED',
              icon: Mail,
            },
            {
              name: 'Gupshup SMS Gateway (DLT India)',
              status: 'HEALTHY',
              latency: '184ms',
              throughput: '30 msgs/sec',
              circuit: 'CLOSED',
              icon: Smartphone,
            },
            {
              name: 'Meta WhatsApp Cloud API',
              status: 'HEALTHY',
              latency: '145ms',
              throughput: '20 msgs/sec',
              circuit: 'CLOSED',
              icon: MessageSquare,
            },
            {
              name: 'Web Push / Firebase Cloud Messaging',
              status: 'HEALTHY',
              latency: '88ms',
              throughput: '80 msgs/sec',
              circuit: 'CLOSED',
              icon: Bell,
            },
          ].map(p => (
            <div
              key={p.name}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <p.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {p.status}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Circuit: {p.circuit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px]">Avg Latency:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.latency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Throughput:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.throughput}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
