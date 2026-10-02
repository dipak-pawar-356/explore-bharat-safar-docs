import * as React from 'react';

export interface VillageCivicItem {
  label: string;
  value: string | number;
  isAvailable?: boolean;
}

export interface VillageCivicGridProps {
  items: VillageCivicItem[];
}

export function VillageCivicGrid({ items }: VillageCivicGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-bharat-indigo-950/50 border border-slate-200 dark:border-slate-800">
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {item.label}
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
