'use client';

// Explore Bharat Safar — Section 3: Participant Roster & Medical Telemetry Form
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, DPDP Act 2023 Compliance

import * as React from 'react';
import { type ParticipantDto, FoodPreference, TrekExperienceLevel } from '@ebs/types';

export interface ParticipantRosterFormProps {
  participants: ParticipantDto[];
  onChange: (participants: ParticipantDto[]) => void;
  maxParticipants?: number;
}

export function ParticipantRosterForm({
  participants,
  onChange,
  maxParticipants = 10,
}: ParticipantRosterFormProps) {
  const handleUpdate = <K extends keyof ParticipantDto>(
    index: number,
    field: K,
    value: ParticipantDto[K],
  ) => {
    const target = participants[index];
    if (!target) return;
    const updated = [...participants];
    updated[index] = {
      ...target,
      [field]: value,
    };
    onChange(updated);
  };

  const handleAdd = () => {
    if (participants.length >= maxParticipants) return;
    onChange([
      ...participants,
      {
        fullName: '',
        age: 25,
        gender: 'MALE',
        emergencyContactName: '',
        emergencyContactPhone: '',
        foodPreference: FoodPreference.VEG,
        experienceLevel: TrekExperienceLevel.BEGINNER,
        medicalDeclarations: '',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    if (participants.length <= 1) return;
    onChange(participants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span>👥</span> Expedition Participant Roster
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal identity documents and emergency telemetry ({participants.length} /{' '}
            {maxParticipants} participants)
          </p>
        </div>

        {participants.length < maxParticipants && (
          <button
            type="button"
            onClick={handleAdd}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Add Explorer
          </button>
        )}
      </div>

      <div className="space-y-4">
        {participants.map((p, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-bharat-terracotta-600 dark:text-bharat-terracotta-400">
                Explorer #{idx + 1} {idx === 0 && '(Lead Booker)'}
              </span>

              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-xs text-red-500 hover:text-red-700 font-bold transition"
                >
                  Remove &times;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Full Name (Matching Govt ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={p.fullName}
                  onChange={e => handleUpdate(idx, 'fullName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  min={5}
                  max={99}
                  required
                  value={p.age}
                  onChange={e => handleUpdate(idx, 'age', parseInt(e.target.value, 10) || 0)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Gender *
                </label>
                <select
                  value={p.gender}
                  onChange={e => handleUpdate(idx, 'gender', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Emergency Contact Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geeta Sharma"
                  value={p.emergencyContactName}
                  onChange={e => handleUpdate(idx, 'emergencyContactName', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+919822123456"
                  value={p.emergencyContactPhone}
                  onChange={e => handleUpdate(idx, 'emergencyContactPhone', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                />
              </div>

              {/* Food Preference */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Food Preference
                </label>
                <select
                  value={p.foodPreference || FoodPreference.VEG}
                  onChange={e =>
                    handleUpdate(idx, 'foodPreference', e.target.value as FoodPreference)
                  }
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
                >
                  <option value={FoodPreference.VEG}>Vegetarian (Standard)</option>
                  <option value={FoodPreference.NON_VEG}>Non-Vegetarian</option>
                  <option value={FoodPreference.JAIN}>Jain (No Root Veg)</option>
                </select>
              </div>
            </div>

            {/* Medical Declarations & DPDP Encrypted Safe Box */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
                  <span>🛡️ Medical Declarations & Allergies</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                    (AES-256-GCM Encrypted)
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">Optional but recommended</span>
              </div>
              <textarea
                rows={2}
                placeholder="Disclose asthma, hypertension, penicillin/food allergies, vertigo, or medication carried on trail..."
                value={p.medicalDeclarations || ''}
                onChange={e => handleUpdate(idx, 'medicalDeclarations', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
              />
              <p className="text-[10px] text-slate-400">
                🔒 Under the Digital Personal Data Protection Act 2023, medical telemetry is
                collected exclusively for emergency search & rescue on trail and encrypted at rest.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
