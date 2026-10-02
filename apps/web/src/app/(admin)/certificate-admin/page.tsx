// Explore Bharat Safar — Section 3: Admin Certificate Management & Automation
// Reference: EBS-DOC-20-CERT, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { CertificateEntity, CertificateStatus } from '@ebs/types';
import { CertificateModalViewer } from '@/features/certificate-viewer';

const INITIAL_CERTS: CertificateEntity[] = [
  {
    id: 'cert_admin_001',
    certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
    participantId: 'part_001',
    bookingId: 'bkg_001',
    batchId: 'batch_hari_2026_01',
    userId: 'usr_traveller_001',
    participantName: 'Amitabh Sharma',
    experienceTitle: 'Harishchandragad Monsoon Escarpment Trek',
    experienceLocation: 'Ahmednagar, Maharashtra',
    highestAltitudeMeters: 1422,
    completionDate: '2026-08-15',
    verificationHash: '7f8b91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    digitalSignature: 'mock_sig_123',
    qrVerificationUrl: 'https://explorebharatsafar.in/verify/EBS-CERT-2026-HARI-8F3A21',
    pdfVaultUri: 's3://ebs-certificates-vault/EBS-CERT-2026-HARI-8F3A21.pdf',
    status: 'ISSUED' as CertificateStatus,
    reissueCount: 0,
    issuedAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T10:00:00.000Z',
  },
  {
    id: 'cert_admin_002',
    certificateNumber: 'EBS-CERT-2026-KALS-B2C194',
    participantId: 'part_002',
    bookingId: 'bkg_002',
    batchId: 'batch_kals_2026_01',
    userId: 'usr_traveller_002',
    participantName: 'Pooja Deshmukh',
    experienceTitle: 'Kalsubai Peak Highest Summit Trek',
    experienceLocation: 'Igatpuri, Maharashtra',
    highestAltitudeMeters: 1646,
    completionDate: '2026-09-05',
    verificationHash: '8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d',
    digitalSignature: 'mock_sig_456',
    qrVerificationUrl: 'https://explorebharatsafar.in/verify/EBS-CERT-2026-KALS-B2C194',
    pdfVaultUri: 's3://ebs-certificates-vault/EBS-CERT-2026-KALS-B2C194.pdf',
    status: 'ISSUED' as CertificateStatus,
    reissueCount: 0,
    issuedAt: '2026-09-06T12:00:00.000Z',
    updatedAt: '2026-09-06T12:00:00.000Z',
  },
];

export default function AdminCertificatePage() {
  const [certs, setCerts] = useState<CertificateEntity[]>(INITIAL_CERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [activePreviewCert, setActivePreviewCert] = useState<CertificateEntity | null>(null);
  const [revokingCert, setRevokingCert] = useState<CertificateEntity | null>(null);
  const [reissuingCert, setReissuingCert] = useState<CertificateEntity | null>(null);

  // Form Inputs
  const [revokeReason, setRevokeReason] = useState('');
  const [reissueReason, setReissueReason] = useState('');
  const [correctedName, setCorrectedName] = useState('');
  const [batchFinalizeInput, setBatchFinalizeInput] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredCerts = certs.filter(c => {
    const matchesSearch =
      !searchQuery ||
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.experienceTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBatchFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFinalizeInput.trim()) return;

    setActionMessage(
      `Expedition batch ${batchFinalizeInput} finalized! 12 certificates auto-minted.`,
    );
    setBatchFinalizeInput('');
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleConfirmRevoke = () => {
    if (!revokingCert || !revokeReason.trim()) return;

    setCerts(prev =>
      prev.map(c =>
        c.id === revokingCert.id
          ? {
              ...c,
              status: 'REVOKED' as CertificateStatus,
              revokedAt: new Date().toISOString(),
              revokedReason: revokeReason,
            }
          : c,
      ),
    );

    setActionMessage(`Certificate ${revokingCert.certificateNumber} revoked.`);
    setRevokingCert(null);
    setRevokeReason('');
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleConfirmReissue = () => {
    if (!reissuingCert || !reissueReason.trim()) return;

    setCerts(prev =>
      prev.map(c =>
        c.id === reissuingCert.id
          ? {
              ...c,
              participantName: correctedName.trim() || c.participantName,
              status: 'REISSUED' as CertificateStatus,
              reissueCount: c.reissueCount + 1,
            }
          : c,
      ),
    );

    setActionMessage(`Certificate ${reissuingCert.certificateNumber} reissued.`);
    setReissuingCert(null);
    setReissueReason('');
    setCorrectedName('');
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/booking-admin/batches" className="hover:text-saffron-600">
                Booking Admin
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Certificates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Certificate Automation &amp; Lifecycle Management
            </h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/payment-admin/transactions"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
            >
              💰 Financial Ledger
            </Link>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>✅ {actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-600 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Batch Finalization Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Batch Finalization &amp; Bulk Credential Minting
              </h2>
              <p className="text-xs text-slate-500">
                Trigger automated eligibility evaluations and mint PDF/A vector credentials for all
                verified participants.
              </p>
            </div>
          </div>

          <form onSubmit={handleBatchFinalize} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={batchFinalizeInput}
              onChange={e => setBatchFinalizeInput(e.target.value)}
              placeholder="Batch Code or UUID (e.g. HARISH-MONSOON-01)"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-saffron-500 font-mono"
            />
            <button
              type="submit"
              disabled={!batchFinalizeInput.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-saffron-600 to-amber-600 text-white font-bold text-xs rounded-xl hover:from-saffron-700 hover:to-amber-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Finalize Batch &amp; Mint
            </button>
          </form>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search certificate #, participant name, or trek..."
            className="w-full sm:w-96 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-saffron-500"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-saffron-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ISSUED">Issued</option>
              <option value="REISSUED">Reissued</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        </div>

        {/* Certificate Roster Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Certificate ID</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Expedition</th>
                  <th className="py-3.5 px-4">Concluded</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching certificates found.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {cert.certificateNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cert.participantName}
                        {cert.reissueCount > 0 && (
                          <span className="ml-1 text-[10px] text-blue-600 font-normal">
                            (v{cert.reissueCount + 1})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {cert.experienceTitle}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(cert.completionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            cert.status === 'REVOKED'
                              ? 'bg-red-100 text-red-700'
                              : cert.status === 'REISSUED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setActivePreviewCert(cert)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => {
                            setReissuingCert(cert);
                            setCorrectedName(cert.participantName);
                          }}
                          disabled={cert.status === 'REVOKED'}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Reissue
                        </button>
                        <button
                          onClick={() => setRevokingCert(cert)}
                          disabled={cert.status === 'REVOKED'}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revocation Modal */}
        {revokingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
              <h3 className="font-bold text-base text-red-900">
                Revoke Certificate: {revokingCert.certificateNumber}
              </h3>
              <p className="text-xs text-slate-600">
                Revocation will immediately invalidate the cryptographic verification seal on the
                public registry. A mandatory audit explanation is required.
              </p>
              <textarea
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="Reason for revocation (min 10 characters)..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setRevokingCert(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  disabled={revokeReason.trim().length < 10}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  Confirm Revocation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reissue Modal */}
        {reissuingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
              <h3 className="font-bold text-base text-blue-900">
                Reissue Certificate: {reissuingCert.certificateNumber}
              </h3>
              <p className="text-xs text-slate-600">
                Reissuing will recalculate the HMAC-SHA256 digest and RS256 signature with the
                updated name, archiving the previous version in the audit log.
              </p>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Corrected Legal Name:
                </label>
                <input
                  type="text"
                  value={correctedName}
                  onChange={e => setCorrectedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Reason for Reissue:
                </label>
                <textarea
                  value={reissueReason}
                  onChange={e => setReissueReason(e.target.value)}
                  placeholder="Reason for reissue (e.g. spelling correction per passport)..."
                  rows={2}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setReissuingCert(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReissue}
                  disabled={reissueReason.trim().length < 10}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  Confirm Reissue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Viewer */}
        <CertificateModalViewer
          certificate={activePreviewCert}
          isOpen={!!activePreviewCert}
          onClose={() => setActivePreviewCert(null)}
          onDownloadPdf={cert => {
            const link = document.createElement('a');
            link.href = `/api/v1/certificates/${cert.id}/download`;
            link.download = `EBS-Certificate-${cert.participantName.replace(/\s+/g, '-')}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      </div>
    </div>
  );
}
