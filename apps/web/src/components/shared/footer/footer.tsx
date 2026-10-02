import * as React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
      <p>&copy; {new Date().getFullYear()} Explore Bharat Safar &bull; Survey of India Compliant</p>
    </footer>
  );
}
