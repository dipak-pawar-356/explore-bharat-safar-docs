'use client';

// Explore Bharat Safar — Section 2: Gram Panchayat Governance Portal
// Reference: EBS-BLU-42-VKS Section 5, EBS-DOC-02-SPEC Section 4
import * as React from 'react';
import Link from 'next/link';

export default function PanchayatDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/villages"
            className="text-xs font-semibold text-bharat-evergreen-700 dark:text-bharat-evergreen-400 hover:underline"
          >
            &larr; National Village Directory
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-mono font-bold text-slate-500">
            Panchayat ID: {params.id}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-bharat-evergreen-700 bg-bharat-evergreen-50 dark:bg-bharat-evergreen-950 px-2.5 py-0.5 rounded-full">
              Statutory Civic Governance Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              Gram Panchayat Administrative Directory
            </h1>
          </div>
          <span className="text-3xl">🏛️</span>
        </div>
      </div>

      {/* Panchayat Leadership & Official Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Elected & Administrative Officers
            </h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              Verified Office
            </span>
          </div>

          <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Sarpanch (President):</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Rajendra Anandrao Patil
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Gram Sevak (Secretary):</span>
              <span className="font-bold text-slate-900 dark:text-white">Sunil V. More</span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Administrative Office:</span>
              <span className="text-slate-800 dark:text-slate-200 text-right">
                Gram Panchayat Bhavan, Main Bazaar Road
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Official Landline (DPDP Compliant):</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                02144-223101
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500">Office Working Hours:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                09:30 AM – 05:30 PM (Mon to Sat)
              </span>
            </div>
          </div>
        </div>

        {/* Statutory Civic Services */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Statutory Public Services & Schemes
          </h3>
          <p className="text-xs text-slate-500">
            Services accessible directly at the Panchayat citizen service facilitation kiosk (Aaple
            Sarkar / CSC):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              'Birth & Death Certificate Issuance',
              'Property Assessment & Tax Receipts',
              'Drinking Water Network Tap Connections',
              'Trade & Rural Micro-Enterprise NOC',
              'MGNREGA Job Card Registration',
              'Agricultural Subsidy Verification',
              'Gram Sabha Meeting Resolutions',
              'Disaster Relief Facilitation Desk',
            ].map((svc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2"
              >
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                  {svc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Constituent Village Records */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Constituent Revenue Villages under this Panchayat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Velhe (Main Revenue Village)', lgd: '556789', pop: '3,840' },
            { name: 'Kudale Wadi', lgd: '556790', pop: '820' },
            { name: 'Pasure', lgd: '556791', pop: '640' },
          ].map((v, idx) => (
            <Link
              key={idx}
              href={`/villages/${v.lgd}`}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-bharat-evergreen-600 transition space-y-1 block"
            >
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                LGD: {v.lgd}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{v.name}</h4>
              <p className="text-xs text-slate-500">Population: {v.pop}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
