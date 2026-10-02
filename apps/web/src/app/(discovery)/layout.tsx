import * as React from 'react';

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-bharat-indigo-900/70 backdrop-blur px-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-bold text-bharat-saffron-600">
          Section 1 &bull; Bharat Discovery Engine
        </span>
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
