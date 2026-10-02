// Explore Bharat Safar — Section 3: Expedition Participant Manifest & Basecamp Operations
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_BATCHES, MOCK_BOOKINGS } from '@/lib/booking-data';

export default function AdminManifestsPage() {
  const allBatches = Object.values(MOCK_BATCHES).flat();
  const [selectedBatchId, setSelectedBatchId] = useState<string>(allBatches[0]?.id || '');
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({
    'ptp-1': true,
    'ptp-2': false,
  });

  const selectedBatch = allBatches.find(b => b.id === selectedBatchId);
  const relevantBookings = MOCK_BOOKINGS.filter(b => b.batchId === selectedBatchId);
  const allParticipants = relevantBookings.flatMap(b =>
    b.participants.map(p => ({
      ...p,
      orderNumber: b.orderNumber,
      orderStatus: b.status,
    })),
  );

  const toggleAttendance = (participantId: string) => {
    setVerifiedMap(prev => ({
      ...prev,
      [participantId]: !prev[participantId],
    }));
  };

  const verifiedCount = allParticipants.filter(p => verifiedMap[p.id]).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 block mb-1">
            Mountain Guide & Basecamp Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Expedition Participant Manifest
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct morning roll-calls, verify biometric/photo identity at trailheads, and monitor
            dietary & medical requirements.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/booking-admin/batches"
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition"
          >
            &larr; Batch Inventory
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Print Trailhead Manifest
          </button>
        </div>
      </div>

      {/* Batch Selection Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Select Batch Manifest:
          </label>
          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-saffron-500"
          >
            {allBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} ({b.batchStartDate} to {b.batchEndDate} &bull; {b.status})
              </option>
            ))}
          </select>
        </div>

        {selectedBatch && (
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Reporting
              </span>
              <span className="font-semibold text-slate-800">{selectedBatch.reportingTime}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Lead Guide
              </span>
              <span className="font-semibold text-slate-800">
                {selectedBatch.leadGuideName || 'Unassigned'}
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">
                Attendance
              </span>
              <span className="font-bold text-emerald-800">
                {verifiedCount} / {allParticipants.length} Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Manifest Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">
            Enrolled Travellers ({allParticipants.length})
          </span>
          <span className="text-slate-500">
            DPDP Act 2023: Medical telemetry protected under AES-256-GCM sovereign encryption.
          </span>
        </div>

        {allParticipants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No registered travellers enrolled in this departure batch yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Roll Check</th>
                  <th className="p-3.5">Participant</th>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Emergency Contact</th>
                  <th className="p-3.5">Food Choice</th>
                  <th className="p-3.5">Trek Grade</th>
                  <th className="p-3.5">Medical Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allParticipants.map(participant => {
                  const isCheckedIn = !!verifiedMap[participant.id];

                  return (
                    <tr
                      key={participant.id}
                      className={`hover:bg-slate-50/60 transition ${
                        isCheckedIn ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCheckedIn}
                            onChange={() => toggleAttendance(participant.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isCheckedIn ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {isCheckedIn ? 'Checked-In' : 'Pending'}
                          </span>
                        </label>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{participant.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {participant.age} yrs &bull; {participant.gender}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono font-medium text-slate-700">
                        #{participant.orderNumber}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          {participant.emergencyContactName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {participant.emergencyContactPhone}
                        </div>
                      </td>

                      <td className="p-3.5 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {participant.foodPreference}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                          {participant.experienceLevel}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <span>🔒</span>
                          <span>DPDP Encrypted</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
