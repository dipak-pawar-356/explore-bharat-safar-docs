// Explore Bharat Safar — Section 3: Add-ons & Equipment Rental Selector
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

'use client';

import React from 'react';
import type { AddonEntity } from '@ebs/types';

export interface AddonsSelectorProps {
  addons: AddonEntity[];
  selectedAddonIds: string[];
  onToggleAddon: (addonId: string) => void;
  currencySymbol?: string;
  className?: string;
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  EQUIPMENT: 'bg-blue-50 text-blue-700 border-blue-200',
  TRANSPORT: 'bg-amber-50 text-amber-700 border-amber-200',
  MEAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPGRADE: 'bg-purple-50 text-purple-700 border-purple-200',
  INSURANCE: 'bg-teal-50 text-teal-700 border-teal-200',
};

export const AddonsSelector: React.FC<AddonsSelectorProps> = ({
  addons,
  selectedAddonIds,
  onToggleAddon,
  currencySymbol = '₹',
  className = '',
}) => {
  if (!addons || addons.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 ${className}`}
      >
        No optional add-ons or gear rentals required for this expedition. All core equipment is
        included in base package.
      </div>
    );
  }

  const selectedCount = selectedAddonIds.length;
  const selectedCostTotal = addons
    .filter(a => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.priceInr, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Equipment Rental & Expedition Add-ons
          </h3>
          <p className="text-xs text-slate-500">
            Select verified technical mountaineering gear, porter assistance, or custom meal plans.
          </p>
        </div>
        {selectedCount > 0 && (
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500">{selectedCount} selected: </span>
            <span className="text-sm font-bold text-emerald-700">
              +{currencySymbol}
              {selectedCostTotal.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addons.map(addon => {
          const isSelected = selectedAddonIds.includes(addon.id);
          const badgeStyle =
            TYPE_BADGE_STYLES[addon.addonType] || 'bg-slate-50 text-slate-700 border-slate-200';

          return (
            <div
              key={addon.id}
              onClick={() => onToggleAddon(addon.id)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-saffron-600 bg-saffron-50/30 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggleAddon(addon.id);
                }
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle}`}
                  >
                    {addon.addonType}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {currencySymbol}
                      {addon.priceInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">per participant</span>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-900 text-sm">{addon.name}</h4>
                {addon.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{addon.description}</p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {isSelected ? 'Click to remove' : 'Click to add'}
                </span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-saffron-600 border-saffron-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
