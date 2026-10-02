// Explore Bharat Safar — Section 4: Statutory GST Tax Receipt & Invoice Component
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-10-DATA, EBS-BLU-48-BIZ

'use client';

import React from 'react';
import type { InvoiceEntity } from '@ebs/types';

interface PaymentReceiptViewProps {
  invoice: InvoiceEntity;
  experienceTitle?: string;
  orderNumber: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export function PaymentReceiptView({
  invoice,
  experienceTitle = 'Expedition Trek & Rural Exploration',
  orderNumber,
  paymentMethod = 'UPI / Online Gateway',
  transactionReference,
}: PaymentReceiptViewProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-8 print:border-none print:shadow-none">
      {/* Official Tax Invoice Header */}
      <div className="bg-slate-900 px-8 py-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇮🇳</span>
            <span className="font-black text-xl tracking-tight text-saffron-400">
              Explore Bharat Safar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            GSTIN: 07AAAAE1234F1Z5 • Govt of India Registered
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Official Tax Invoice
          </span>
          <div className="text-sm font-mono font-bold mt-1 text-slate-200">
            {invoice.invoiceNumber}
          </div>
        </div>
      </div>

      {/* Invoice Meta Grid */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Invoice Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(invoice.issuedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Booking Reference</span>
            <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">SAC Classification</span>
            <span className="font-mono font-bold text-saffron-700">{invoice.sacCode}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Payment Channel</span>
            <span className="font-semibold text-slate-800">{paymentMethod}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-500 font-medium block">Billed To (Traveller)</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {invoice.customerName}
            </span>
            {invoice.customerEmail && (
              <span className="text-slate-600 block mt-0.5">{invoice.customerEmail}</span>
            )}
          </div>
          {transactionReference && (
            <div className="text-right">
              <span className="text-slate-500 font-medium block">Gateway Tx ID</span>
              <span className="font-mono text-[11px] text-slate-700 font-semibold block mt-0.5">
                {transactionReference}
              </span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Service Description</th>
                <th className="p-3.5 text-center">SAC Code</th>
                <th className="p-3.5 text-right">Taxable Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3.5">
                  <div className="font-bold text-slate-900">{experienceTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Adventure Trekking & Rural Expedition Logistics
                  </div>
                </td>
                <td className="p-3.5 text-center font-mono text-slate-600">{invoice.sacCode}</td>
                <td className="p-3.5 text-right font-semibold">
                  ₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax & Grand Total Breakdown */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount (Excl. Tax):</span>
            <span className="font-semibold text-slate-800">
              ₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Central GST (CGST @ 2.5%):</span>
            <span className="font-semibold text-slate-800">
              ₹{invoice.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>State GST (SGST @ 2.5%):</span>
            <span className="font-semibold text-slate-800">
              ₹{invoice.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Grand Total (Incl. 5% GST):</span>
            <span className="text-base text-saffron-700">
              ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold text-emerald-700">
            <span>Advance Deposit Collected (Paid):</span>
            <span>
              ₹{invoice.advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Remaining Balance Due (At Basecamp):</span>
            <span className="font-semibold text-slate-800">
              ₹{invoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Statutory Compliance Footer */}
        <div className="text-[11px] text-slate-400 text-center space-y-1">
          <p>
            This is a computer-generated tax invoice issued under Section 31 of the CGST Act, 2017.
          </p>
          <p>SAC 998555 covers Tour Operator Services. No signature required.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>🖨️</span>
            <span>Print Tax Invoice</span>
          </button>
          <a
            href={invoice.pdfVaultUri || '#'}
            download
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>📄</span>
            <span>Download Invoice PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
