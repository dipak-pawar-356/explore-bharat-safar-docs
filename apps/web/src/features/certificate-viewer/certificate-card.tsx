// Explore Bharat Safar — Certificate Milestone Card Component
// Reference: EBS-DOC-20-CERT Section 3

'use client';

import React from 'react';
import type { CertificateEntity } from '@ebs/types';

interface CertificateCardProps {
  certificate: CertificateEntity;
  onView: (cert: CertificateEntity) => void;
  onDownload: (cert: CertificateEntity) => void;
}

export function CertificateCard({ certificate, onView, onDownload }: CertificateCardProps) {
  const isRevoked = certificate.status === 'REVOKED';
  const isReissued = certificate.status === 'REISSUED';

  const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className={`rounded-2xl border bg-white p-5.5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        isRevoked
          ? 'border-red-200 bg-red-50/20'
          : 'border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {certificate.certificateNumber}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isRevoked
                ? 'bg-red-100 text-red-700'
                : isReissued
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {certificate.status}
          </span>
        </div>

        {/* Expedition Title */}
        <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2">
          {certificate.experienceTitle}
        </h3>

        {/* Location & Elevation */}
        <div className="mt-2.5 space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span className="font-medium text-slate-700">{certificate.experienceLocation}</span>
          </div>
          {certificate.highestAltitudeMeters && (
            <div className="flex items-center gap-1.5">
              <span>🏔️</span>
              <span className="font-semibold text-saffron-700">
                {certificate.highestAltitudeMeters.toLocaleString('en-IN')} Meters AMSL
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>🗓️</span>
            <span>Concluded: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onView(certificate)}
          className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
        >
          👁️ Preview
        </button>

        <button
          onClick={() => onDownload(certificate)}
          disabled={isRevoked}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center ${
            isRevoked
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-saffron-600 to-amber-600 text-white hover:from-saffron-700 hover:to-amber-700 shadow-xs'
          }`}
        >
          📥 PDF
        </button>

        <a
          href={`/verify/${certificate.certificateNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          title="Verify Public Registry"
        >
          🔗
        </a>
      </div>
    </div>
  );
}
