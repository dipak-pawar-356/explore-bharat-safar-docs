// Explore Bharat Safar — Certificate Interactive Modal Viewer
// Reference: EBS-DOC-20-CERT Section 3

'use client';

import React from 'react';
import type { CertificateEntity } from '@ebs/types';

interface CertificateModalViewerProps {
  certificate: CertificateEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: (cert: CertificateEntity) => void;
}

export function CertificateModalViewer({
  certificate,
  isOpen,
  onClose,
  onDownloadPdf,
}: CertificateModalViewerProps) {
  if (!isOpen || !certificate) return null;

  const formattedDate = new Date(certificate.completionDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isRevoked = certificate.status === 'REVOKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">
                Official Expedition Certificate
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf(certificate)}
              disabled={isRevoked}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                isRevoked
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-saffron-600 hover:bg-saffron-700 text-white'
              }`}
            >
              <span>📥</span>
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              aria-label="Close Viewer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Canvas Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-100/60">
          {/* Certificate Vector Canvas Simulation */}
          <div className="relative w-full max-w-3xl aspect-[1.414/1] bg-[#FCFBF7] rounded-xl shadow-lg border-[3px] border-[#CA8A04] p-4 sm:p-8 flex flex-col justify-between select-none">
            {/* Guilloche Lace Layer */}
            <div className="absolute inset-2 border border-dashed border-[#D97706]/70 pointer-events-none rounded-lg" />
            <div className="absolute inset-3 border border-[#78350F]/40 pointer-events-none rounded-md" />

            {/* Revocation Watermark if Revoked */}
            {isRevoked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-25deg]">
                <span className="text-red-600/20 text-6xl sm:text-8xl font-black uppercase tracking-widest border-8 border-red-600/20 px-8 py-3 rounded-2xl">
                  REVOKED
                </span>
              </div>
            )}

            {/* Header */}
            <div className="text-center pt-2 sm:pt-4">
              <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-[#78350F] uppercase">
                Explore Bharat Safar
              </p>
              <p className="text-[7px] sm:text-[9px] font-semibold tracking-wider text-[#D97706] uppercase mt-0.5">
                Sovereign Expedition &amp; Rural Heritage Council of Bharat
              </p>
              <h1 className="text-lg sm:text-2xl font-black text-[#92400E] font-serif tracking-wider mt-2 sm:mt-3">
                CERTIFICATE OF ACCOMPLISHMENT
              </h1>
              <p className="text-[9px] sm:text-xs italic text-slate-500 mt-0.5">
                This is proudly presented and attested to
              </p>
            </div>

            {/* Recipient Details */}
            <div className="text-center my-2 sm:my-4">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {certificate.participantName}
              </h2>
              <div className="w-32 sm:w-48 h-0.5 bg-gradient-to-r from-transparent via-[#D97706] to-transparent mx-auto mt-1 sm:mt-2" />
              <p className="text-[9px] sm:text-xs text-slate-600 max-w-lg mx-auto mt-2">
                for demonstrating exemplary endurance, sovereign environmental guardianship, and
                successfully conquering
              </p>
              <h3 className="text-sm sm:text-xl font-black text-[#B45309] font-serif mt-1">
                {certificate.experienceTitle}
              </h3>
              <p className="text-[9px] sm:text-xs font-bold text-slate-700 mt-0.5">
                {certificate.experienceLocation}
                {certificate.highestAltitudeMeters && (
                  <span className="text-saffron-700">
                    {' '}
                    • Summit Elevation: {certificate.highestAltitudeMeters.toLocaleString('en-IN')}m
                    AMSL
                  </span>
                )}
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500 mt-1">
                Expedition Concluded on: {formattedDate}
              </p>
            </div>

            {/* Footer: Dynamic QR, Security Hash, Signatures */}
            <div className="pt-2 sm:pt-4 border-t border-slate-200 flex items-end justify-between text-[8px] sm:text-[10px]">
              {/* Dynamic QR & Hash */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white border border-[#D97706]/40 p-1 rounded-lg flex items-center justify-center shadow-2xs">
                  {/* QR SVG representation */}
                  <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-white text-[9px] font-bold">
                    QR SEAL
                  </div>
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="font-bold text-slate-900">ID: {certificate.certificateNumber}</p>
                  <p className="text-slate-500">Cryptographic Digest (HMAC-SHA256):</p>
                  <p className="font-mono text-[7px] sm:text-[8px] text-slate-600">
                    {certificate.verificationHash.substring(0, 24)}...
                  </p>
                  <a
                    href={`/verify/${certificate.certificateNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-saffron-700 font-semibold hover:underline"
                  >
                    Verify on sovereign public registry →
                  </a>
                </div>
              </div>

              {/* Authorizing Signatures */}
              <div className="flex items-center gap-4 sm:gap-8 text-center">
                <div>
                  <div className="w-20 sm:w-28 border-b border-slate-400 pb-0.5 font-serif italic text-slate-700 text-[9px] sm:text-xs">
                    Arunendra Rawat
                  </div>
                  <p className="font-bold text-slate-800 mt-0.5">Expedition Marshal</p>
                  <p className="text-[7px] text-slate-400">Chief Guide, EBS</p>
                </div>

                <div>
                  <div className="w-20 sm:w-28 border-b border-slate-400 pb-0.5 font-serif italic text-slate-700 text-[9px] sm:text-xs">
                    Dr. V. Joshi
                  </div>
                  <p className="font-bold text-slate-800 mt-0.5">Dr. Vikramaditya Joshi</p>
                  <p className="text-[7px] text-slate-400">Governing Director, EBS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
