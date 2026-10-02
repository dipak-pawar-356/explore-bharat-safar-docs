// Explore Bharat Safar — Public Certificate Verification Page
// Reference: EBS-DOC-20-CERT Section 4

import React from 'react';
import Link from 'next/link';
import { CertificatePublicVerify } from '@/features/certificate-viewer';

interface PageProps {
  params: Promise<{ certificateNumber: string }>;
  searchParams: Promise<{ hash?: string }>;
}

export default async function PublicVerifyPage({ params, searchParams }: PageProps) {
  const { certificateNumber } = await params;
  const { hash } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-saffron-700 hover:text-saffron-800 font-bold text-sm"
          >
            ← Explore Bharat Safar Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sovereign Credential Verification Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Real-time cryptographic verification of expedition merit certificates issued by Explore
            Bharat Safar.
          </p>
        </div>

        {/* Verification Engine Component */}
        <CertificatePublicVerify initialCertificateNumber={certificateNumber} initialHash={hash} />
      </div>
    </div>
  );
}
