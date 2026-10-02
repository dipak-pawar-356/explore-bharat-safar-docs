// Explore Bharat Safar — Section 3: Admin Batch & Live Slot Management
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_BATCHES, MOCK_EXPERIENCES } from '@/lib/booking-data';
import type { BatchStatus, BatchEntity } from '@ebs/types';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<BatchEntity[]>(() => {
    return Object.values(MOCK_BATCHES).flat();
  });

  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('ALL');

  const filteredBatches =
    selectedExperienceId === 'ALL'
      ? batches
      : batches.filter(b => b.experienceId === selectedExperienceId);

  const handleStatusChange = (batchId: string, newStatus: BatchStatus) => {
    setBatches(prev => prev.map(b => (b.id === batchId ? { ...b, status: newStatus } : b)));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 block mb-1">
            Expedition Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Batch & Slot Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule departure dates, monitor live slot availability, manage waitlists, and assign
            lead mountain guides.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/booking-admin/manifests"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Expedition Manifests &rarr;
          </Link>
        </div>
      </div>

      {/* Filter by Experience */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700">Filter by Expedition:</label>
        <select
          value={selectedExperienceId}
          onChange={e => setSelectedExperienceId(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 font-medium"
        >
          <option value="ALL">All Expeditions</option>
          {MOCK_EXPERIENCES.map(exp => (
            <option key={exp.id} value={exp.id}>
              {exp.title}
            </option>
          ))}
        </select>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Batch ID</th>
                <th className="p-3.5">Departure Dates</th>
                <th className="p-3.5">Capacity & Slots</th>
                <th className="p-3.5">Tariff (INR)</th>
                <th className="p-3.5">Lead Guide</th>
                <th className="p-3.5">Batch Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBatches.map(batch => {
                const experience = MOCK_EXPERIENCES.find(e => e.id === batch.experienceId);
                const occupancyPct = Math.round(
                  ((batch.totalCapacity - batch.availableSlots) / batch.totalCapacity) * 100,
                );

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 font-mono font-semibold text-slate-800">
                      <div>{batch.id}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {experience?.title}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {batch.batchStartDate} &rarr; {batch.batchEndDate}
                      </div>
                      <div className="text-[10px] text-slate-500">{batch.reportingTime}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {batch.availableSlots} / {batch.totalCapacity} Available
                        </span>
                      </div>
                      <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancyPct >= 100
                              ? 'bg-rose-500'
                              : occupancyPct >= 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{batch.batchPriceInr.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-slate-700">{batch.leadGuideName || 'Unassigned'}</td>

                    <td className="p-3.5">
                      <select
                        value={batch.status}
                        onChange={e => handleStatusChange(batch.id, e.target.value as BatchStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none ${
                          batch.status === 'OPEN'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : batch.status === 'FILLING_FAST'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : batch.status === 'SOLD_OUT'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="FILLING_FAST">FILLING_FAST</option>
                        <option value="SOLD_OUT">SOLD_OUT</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <Link
                        href={`/booking-admin/manifests?batchId=${batch.id}`}
                        className="text-xs font-bold text-saffron-600 hover:text-saffron-800 underline"
                      >
                        Manifest
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
