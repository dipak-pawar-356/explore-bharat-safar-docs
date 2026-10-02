'use client';

// Explore Bharat Safar — Notification Preferences Modal
// Reference: EBS-DOC-19-NOTIF Section 6, EBS-DOC-40-SEC-BLUEPRINT (DPDP Act 2023)

import * as React from 'react';
import {
  X,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Shield,
  Moon,
  Info,
  Check,
  Lock,
} from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import type { INotificationPreferences } from '@ebs/types';

export function NotificationPreferencesModal() {
  const { isPreferencesModalOpen, setPreferencesModalOpen, preferences, setPreferences } =
    useNotificationStore();

  const [localPrefs, setLocalPrefs] = React.useState<INotificationPreferences>({
    userId: 'current-user',
    channels: {
      inApp: true,
      email: true,
      sms: true,
      whatsapp: true,
      webPush: false,
    },
    categories: {
      transactional: true,
      security: true,
      booking: true,
      payment: true,
      village: true,
      social: true,
      community: true,
      marketing: false,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      timezone: 'Asia/Kolkata',
    },
    updatedAt: new Date().toISOString(),
  });

  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  if (!isPreferencesModalOpen) return null;

  const handleToggleChannel = (channel: keyof typeof localPrefs.channels) => {
    setLocalPrefs(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleToggleCategory = (category: keyof typeof localPrefs.categories) => {
    // DPDP / System Rule: Transactional & Security cannot be opted out of
    if (category === 'transactional' || category === 'security') {
      return;
    }
    setLocalPrefs(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category],
      },
    }));
  };

  const handleSave = () => {
    const updated = {
      ...localPrefs,
      updatedAt: new Date().toISOString(),
    };
    setPreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setPreferencesModalOpen(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setPreferencesModalOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize how and when you receive communications from Explore Bharat Safar
              </p>
            </div>
            <button
              onClick={() => setPreferencesModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* DPDP Compliance Notice */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <span className="font-semibold">DPDP Act 2023 Notice:</span> Your communication
                consent is managed strictly according to your selected preferences. Critical
                security and verified booking receipts remain mandatory to ensure account integrity.
              </div>
            </div>

            {/* Channels Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Communication Channels
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* In-App */}
                <div
                  onClick={() => handleToggleChannel('inApp')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        In-App Feed
                      </div>
                      <div className="text-[11px] text-slate-500">Real-time alerts</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.channels.inApp}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* Email */}
                <div
                  onClick={() => handleToggleChannel('email')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Email
                      </div>
                      <div className="text-[11px] text-slate-500">Official itineraries</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.channels.email}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* SMS */}
                <div
                  onClick={() => handleToggleChannel('sms')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        SMS (DLT)
                      </div>
                      <div className="text-[11px] text-slate-500">Urgent trip updates</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.channels.sms}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* WhatsApp */}
                <div
                  onClick={() => handleToggleChannel('whatsapp')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        WhatsApp
                      </div>
                      <div className="text-[11px] text-slate-500">Passes & directions</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.channels.whatsapp}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Notification Categories
              </h4>
              <div className="space-y-2">
                {/* Transactional (Mandatory) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Transactional & Security</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase">
                          Mandatory
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        OTP logins, password resets, payment confirmations
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="h-4 w-4 rounded text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Bookings */}
                <div
                  onClick={() => handleToggleCategory('booking')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Expedition & Booking Status
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Batch schedules, packing guides, and host confirmations
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.categories.booking}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* Village Broadcasts */}
                <div
                  onClick={() => handleToggleCategory('village')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Rural Village & Artisan Updates
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Festival announcements, artisan workshops, weather notices
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.categories.village}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* Social & Community */}
                <div
                  onClick={() => handleToggleCategory('social')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Social Interactions & Communities
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Followers, comments, photo tags, and expedition group posts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.categories.social}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>

                {/* Marketing */}
                <div
                  onClick={() => handleToggleCategory('marketing')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Seasonal Discovery & Offers
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Early-bird trek batches, curated rural craft promotions
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.categories.marketing}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Quiet Hours (Do Not Disturb)
                  </h4>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.quietHours.enabled}
                  onChange={e =>
                    setLocalPrefs(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, enabled: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                />
              </div>

              {localPrefs.quietHours.enabled && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={localPrefs.quietHours.startTime}
                        onChange={e =>
                          setLocalPrefs(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, startTime: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={localPrefs.quietHours.endTime}
                        onChange={e =>
                          setLocalPrefs(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, endTime: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Info className="w-3.5 h-3.5" />
                    <span>
                      Timezone: {localPrefs.quietHours.timezone} (IST). Critical alerts bypass quiet
                      hours.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              onClick={() => setPreferencesModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-bharat-saffron-600 hover:bg-bharat-saffron-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
