// Explore Bharat Safar — Traveller Profile Settings Modal
// Reference: EBS-DOC-15-SOCIAL Section 2 & 8, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import { X, Shield, User, Globe, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { TravellerProfileEntity, UpdateProfileDto } from '@ebs/types';

export interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TravellerProfileEntity;
  onSave: (payload: UpdateProfileDto) => Promise<void>;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImageUrl || '');
  const [homeState, setHomeState] = useState(profile.homeState || '');
  const [homeCity, setHomeCity] = useState(profile.homeCity || '');
  const [languagesInput, setLanguagesInput] = useState((profile.spokenLanguages || []).join(', '));
  const [isProfilePublic, setIsProfilePublic] = useState(profile.isProfilePublic ?? true);
  const [isSoloDiscoveryEnabled, setIsSoloDiscoveryEnabled] = useState(
    profile.isSoloDiscoveryEnabled ?? false,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (displayName.trim().length < 2) {
      setErrorMsg('Display name must be at least 2 characters long.');
      return;
    }

    const spokenLanguages = languagesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload: UpdateProfileDto = {
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      homeState: homeState.trim() || undefined,
      homeCity: homeCity.trim() || undefined,
      spokenLanguages,
      isProfilePublic,
      isSoloDiscoveryEnabled,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-bharat-saffron-50 dark:bg-bharat-saffron-950/50 text-bharat-saffron-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="profile-settings-title"
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                Explorer Passport Settings
              </h2>
              <p className="text-xs text-slate-500">
                Update your public profile, travel identity, and DPDP privacy settings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Identity & Bio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={`@${profile.username}`}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bio & Expedition Philosophy
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 resize-none"
                placeholder="High altitude trekker, heritage enthusiast, and Western Ghats explorer..."
              />
              <span className="text-[11px] text-slate-400 float-right mt-1">
                {bio.length} / 500 characters
              </span>
            </div>
          </div>

          {/* Visual Assets Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Avatar & Cover Image
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cover Banner URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={e => setCoverImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>

          {/* Geographic Origins & Languages */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Geography & Languages
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Home State
                </label>
                <input
                  type="text"
                  value={homeState}
                  onChange={e => setHomeState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                  placeholder="e.g. Maharashtra, Uttarakhand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Home City / District
                </label>
                <input
                  type="text"
                  value={homeCity}
                  onChange={e => setHomeCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                  placeholder="e.g. Pune, Dehradun"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Spoken Languages (comma separated)
              </label>
              <input
                type="text"
                value={languagesInput}
                onChange={e => setLanguagesInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500"
                placeholder="Hindi, Marathi, English, Garhwali"
              />
            </div>
          </div>

          {/* Privacy & Safety Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> DPDP Privacy & Safety Controls
            </h3>

            {/* Public vs Private Profile */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-bharat-saffron-600" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Private Account
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  When enabled, only travellers you approve can view your journal entries, photos,
                  and itinerary history. PII is scrubbed in compliance with DPDP 2023.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={!isProfilePublic}
                  onChange={e => setIsProfilePublic(!e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bharat-saffron-600"></div>
              </label>
            </div>

            {/* Solo Discovery */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Solo Expedition Partner Discovery
                </span>
                <p className="text-xs text-slate-500">
                  Allow other verified explorers on the same high-altitude trails to discover your
                  profile for safety coordination.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isSoloDiscoveryEnabled}
                  onChange={e => setIsSoloDiscoveryEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white font-semibold text-xs transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
