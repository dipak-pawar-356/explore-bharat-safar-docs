import * as React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-bharat-indigo-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-bharat-indigo-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
        {children}
      </div>
    </div>
  );
}
