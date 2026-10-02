// Explore Bharat Safar — Section 3 & 4: Booking Checkout & Payment Engine Integration
// Reference: EBS-DOC-14-BOOKING, EBS-DOC-21-PAYMENT, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingDraftStore } from '@/store/booking-draft-store';
import { SlotLockCountdown } from '@/components/client/slot-lock-countdown';
import { PaymentGatewayModal, PaymentReceiptView } from '@/features/payment';
import { BookingStatus, type InvoiceEntity, type PaymentVerificationResult } from '@ebs/types';

export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { activeOrder, lockExpiresAt, setActiveOrder } = useBookingDraftStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [verifiedInvoice, setVerifiedInvoice] = useState<InvoiceEntity | null>(null);

  const orderNumber = activeOrder?.orderNumber || `EBS-2026-${params.orderId.slice(-4)}`;
  const pricing = activeOrder?.pricing || {
    basePriceTotal: 2850,
    addOnsTotal: 0,
    discountTotal: 0,
    subtotal: 2850,
    taxesGst: 143,
    convenienceFee: 0,
    totalBookingAmount: 2993,
    adminUpfrontPercentage: 30,
    mandatoryAdvanceDeposit: 898,
    outstandingBalanceDue: 2095,
  };

  const handleExpiry = () => {
    setIsExpired(true);
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = (result: PaymentVerificationResult) => {
    setIsModalOpen(false);

    if (activeOrder) {
      setActiveOrder({
        ...activeOrder,
        status: BookingStatus.CONFIRMED,
        advanceAmountPaid: result.amountPaid,
        balanceAmountDue: result.amountPaid ? pricing.totalBookingAmount - result.amountPaid : 0,
      });
    }

    // Set statutory tax invoice view
    const subtotal = Math.round((result.amountPaid / 1.05) * 100) / 100;
    const totalGst = Math.round((result.amountPaid - subtotal) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;

    setVerifiedInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: result.invoiceNumber,
      bookingId: activeOrder?.id || params.orderId,
      customerName: activeOrder?.userName || 'Valued Traveller',
      customerEmail: activeOrder?.userEmail,
      sacCode: '998555',
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: 0,
      grandTotal: result.amountPaid,
      advancePaid: result.amountPaid,
      balanceDue: pricing.outstandingBalanceDue,
      pdfVaultUri: `/invoices/${result.invoiceNumber}.pdf`,
      issuedAt: new Date().toISOString(),
    });
  };

  if (isExpired) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
          ⏱️
        </div>
        <h2 className="text-2xl font-black text-slate-900">Reservation Lock Expired</h2>
        <p className="text-sm text-slate-600">
          The 15-minute temporary slot reservation has expired. Your held slots have been
          automatically returned to the inventory pool for other travellers.
        </p>
        <Link
          href="/experiences"
          className="inline-flex px-6 py-2.5 rounded-xl bg-saffron-600 text-white font-bold text-sm shadow-md"
        >
          Browse Experiences & Retry
        </Link>
      </div>
    );
  }

  // If payment succeeded, render the official statutory GST Tax Invoice Receipt
  if (verifiedInvoice) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-black text-emerald-900">Payment Successfully Authorized</h2>
          <p className="text-xs text-emerald-700">
            Booking order #{orderNumber} is confirmed. Your official statutory GST Tax Invoice has
            been generated and archived.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/confirmation/${orderNumber}`)}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-sm hover:bg-emerald-800 transition-colors"
            >
              Go to Expedition Dashboard &rarr;
            </button>
          </div>
        </div>

        <PaymentReceiptView
          invoice={verifiedInvoice}
          orderNumber={orderNumber}
          experienceTitle={activeOrder?.experienceTitle}
          paymentMethod="UPI / Encrypted Bharat Gateway"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* 15-minute lock countdown */}
      {lockExpiresAt && <SlotLockCountdown expiresAt={lockExpiresAt} onExpire={handleExpiry} />}

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">
              Expedition Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Order #{orderNumber}
            </h1>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Awaiting Advance Deposit
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Summary & Participants */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">Expedition Details</h2>
            <div className="space-y-1">
              <div className="font-semibold text-slate-800">
                {activeOrder?.experienceTitle || 'Brahmatal Winter Expedition'}
              </div>
              <div className="text-xs text-slate-500">
                Batch ID: {activeOrder?.batchId || 'batch-std-2026'}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Participants ({activeOrder?.participants?.length || 1})
              </h3>
              <div className="space-y-2">
                {activeOrder?.participants && activeOrder.participants.length > 0 ? (
                  activeOrder.participants.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="text-xs bg-slate-50 p-2.5 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-800">{p.fullName}</span>
                      <span className="text-slate-500">
                        {p.age} yrs • {p.gender}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Primary Traveller</span>
                    <span className="text-slate-500">Slot Reserved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Payment Trigger */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Payment Schedule
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Booking Fare:</span>
                <span className="font-bold text-slate-900">
                  ₹{pricing.totalBookingAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-100 pt-2 text-sm">
                <span>Payable Now ({pricing.adminUpfrontPercentage}%):</span>
                <span>₹{pricing.mandatoryAdvanceDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Balance at Basecamp:</span>
                <span>₹{pricing.outstandingBalanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>
                Pay Advance ₹{pricing.mandatoryAdvanceDeposit.toLocaleString('en-IN')} &rarr;
              </span>
            </button>

            <div className="text-[10px] text-center text-slate-400 pt-1">
              Encrypted 256-Bit SSL Checkout • DPDP Act 2023 Protected
            </div>
          </div>
        </div>
      </div>

      {/* Universal Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderNumber={orderNumber}
        bookingId={activeOrder?.id || params.orderId}
        totalBookingAmount={pricing.totalBookingAmount}
        mandatoryAdvanceDeposit={pricing.mandatoryAdvanceDeposit}
        outstandingBalanceDue={pricing.outstandingBalanceDue}
        adminUpfrontPercentage={pricing.adminUpfrontPercentage}
        customerName={activeOrder?.userName}
        customerEmail={activeOrder?.userEmail}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
