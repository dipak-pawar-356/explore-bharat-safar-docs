// Explore Bharat Safar — Section 3: Legal Terms & Adventure Risk Waiver Modal
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';

export interface TermsWaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (termsVersion: string) => void;
  termsVersion?: string;
  className?: string;
}

export const CURRENT_TERMS_VERSION = 'EBS-ADVENTURE-WAIVER-V2026.1';

export const TermsWaiverModal: React.FC<TermsWaiverModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  termsVersion = CURRENT_TERMS_VERSION,
  className = '',
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isChecked) return;
    onAccept(termsVersion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="waiver-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="waiver-title" className="text-lg font-bold text-slate-900">
              Wilderness Risk Assumption & Liability Indemnity
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Document Ref: {termsVersion} • Statutory DPDP Compliance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Terms Text */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed font-sans divide-y divide-slate-100">
          <section className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              1. Inherent Wilderness & High-Altitude Risks
            </h3>
            <p>
              I understand and voluntarily acknowledge that mountain trekking, heritage expeditions,
              and wilderness journeys organized by Explore Bharat Safar entail inherent and
              unavoidable risks. These include, but are not limited to: Acute Mountain Sickness
              (AMS), High Altitude Pulmonary/Cerebral Edema (HAPE/HACE), rapid meteorological
              changes, rockfall, slippery terrain, sub-zero hypothermic temperatures, river
              crossings, wildlife encounters, and delayed medical evacuation due to remote
              topography.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              2. Medical Fitness & Accurate Declarations
            </h3>
            <p>
              I declare that all participants enrolled under this booking possess requisite physical
              fitness for the selected difficulty grade. I affirm that all declared medical
              information, chronic conditions, allergies, and emergency contact details are truthful
              and complete. I authorize certified IMF/NIM expedition leaders to administer first aid
              and, in critical medical emergencies, initiate air/ground evacuation at my sole
              financial responsibility.
            </p>
          </section>

          <section className="pt-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              3. Environmental Leave-No-Trace (LNT) & Cultural Sanctity
            </h3>
            <p>
              Explore Bharat Safar adheres strictly to Himalayan and rural environmental
              conservation charters. I agree to:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>
                Carry back all non-biodegradable waste (strict zero single-use plastic policy).
              </li>
              <li>
                Respect local village customs, sacred groves, tribal shrines, and temple protocols.
              </li>
              <li>
                Abide by the lead guide’s safety directives; non-compliance grants leaders absolute
                discretion to terminate participation.
              </li>
            </ul>
          </section>

          <section className="pt-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              4. Standard Tiered Cancellation & Refund Policy
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200 mt-2">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Cancellation Timeline</th>
                    <th className="p-2">Refund %</th>
                    <th className="p-2">Retention / Retained Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">30+ days prior to departure</td>
                    <td className="p-2 text-emerald-700 font-bold">90%</td>
                    <td className="p-2">10% administrative processing fee</td>
                  </tr>
                  <tr>
                    <td className="p-2">15 to 29 days prior</td>
                    <td className="p-2 text-blue-700 font-bold">50%</td>
                    <td className="p-2">50% expedition commitment retention</td>
                  </tr>
                  <tr>
                    <td className="p-2">7 to 14 days prior</td>
                    <td className="p-2 text-amber-700 font-bold">25%</td>
                    <td className="p-2">75% logistical commitment retention</td>
                  </tr>
                  <tr>
                    <td className="p-2">Under 7 days prior / No-Show</td>
                    <td className="p-2 text-rose-700 font-bold">0%</td>
                    <td className="p-2">100% non-refundable operational lock</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="pt-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              5. Digital Consent & DPDP Act 2023 Verification
            </h3>
            <p>
              By checking the box below and clicking Accept, I record an irrevocable digital
              signature. This consent, along with the device IP address, client timestamp, and
              booking identity, is cryptographically hashed and archived in compliance with India’s
              Digital Personal Data Protection (DPDP) Act 2023.
            </p>
          </section>
        </div>

        {/* Footer with Checkbox & Acceptance Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={e => setIsChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">
              I have thoroughly read, understood, and unconditionally agree to the Wilderness Risk
              Waiver, Medical Responsibilities, and Tiered Cancellation Policy on behalf of all
              participants.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isChecked}
              className="px-6 py-2 bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Acknowledge & Sign Waiver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
