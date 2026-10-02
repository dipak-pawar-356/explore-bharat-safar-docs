// Explore Bharat Safar — Section 3: Traveller Certificate Dashboard
// Reference: EBS-DOC-20-CERT Section 1 & 3

'use client';

import React, { useState } from 'react';
import { CertificateStatus, type CertificateEntity } from '@ebs/types';
import { CertificateCard, CertificateModalViewer } from '@/features/certificate-viewer';

const MOCK_TRAVELLER_CERTS: CertificateEntity[] = [
  {
    id: 'cert_hari_001',
    certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
    participantId: 'part_001',
    bookingId: 'bkg_001',
    batchId: 'batch_001',
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
    status: CertificateStatus.ISSUED,
    reissueCount: 0,
    issuedAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T10:00:00.000Z',
  },
  {
    id: 'cert_kals_002',
    certificateNumber: 'EBS-CERT-2026-KALS-B2C194',
    participantId: 'part_002',
    bookingId: 'bkg_002',
    batchId: 'batch_002',
    userId: 'usr_traveller_001',
    participantName: 'Amitabh Sharma',
    experienceTitle: 'Kalsubai Peak Highest Summit Trek',
    experienceLocation: 'Igatpuri, Maharashtra',
    highestAltitudeMeters: 1646,
    completionDate: '2026-09-05',
    verificationHash: '8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d',
    digitalSignature: 'mock_sig_456',
    qrVerificationUrl: 'https://explorebharatsafar.in/verify/EBS-CERT-2026-KALS-B2C194',
    pdfVaultUri: 's3://ebs-certificates-vault/EBS-CERT-2026-KALS-B2C194.pdf',
    status: CertificateStatus.ISSUED,
    reissueCount: 0,
    issuedAt: '2026-09-06T12:00:00.000Z',
    updatedAt: '2026-09-06T12:00:00.000Z',
  },
];

export default function MyCertificatesPage() {
  const [certificates] = useState<CertificateEntity[]>(MOCK_TRAVELLER_CERTS);
  const [activeModalCert, setActiveModalCert] = useState<CertificateEntity | null>(null);

  const handleDownloadPdf = (cert: CertificateEntity) => {
    // In browser, trigger API download
    const link = document.createElement('a');
    link.href = `/api/v1/certificates/${cert.id}/download`;
    link.download = `EBS-Certificate-${cert.participantName.replace(/\s+/g, '-')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highestAltitude = Math.max(...certificates.map(c => c.highestAltitudeMeters || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-saffron-600 via-amber-600 to-terracotta-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs">
              📜 Verified Explorer Milestones
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              My Expedition Certificates
            </h1>
            <p className="text-sm text-amber-100 max-w-xl">
              Authentic, tamper-evident digital certificates awarded for successfully conquering
              sovereign expeditions across Bharat.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
              <span className="text-2xl sm:text-3xl font-black block">{certificates.length}</span>
              <span className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
                Treks Completed
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
              <span className="text-2xl sm:text-3xl font-black block">
                {highestAltitude.toLocaleString('en-IN')}m
              </span>
              <span className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold">
                Max Summit
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Awarded Credentials ({certificates.length})
            </h2>
            <span className="text-xs text-slate-500">
              PDF/A-1b Archival Compliant &amp; QR Verifiable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onView={c => setActiveModalCert(c)}
                onDownload={c => handleDownloadPdf(c)}
              />
            ))}
          </div>
        </div>

        {/* Modal Viewer */}
        <CertificateModalViewer
          certificate={activeModalCert}
          isOpen={!!activeModalCert}
          onClose={() => setActiveModalCert(null)}
          onDownloadPdf={handleDownloadPdf}
        />
      </div>
    </div>
  );
}
