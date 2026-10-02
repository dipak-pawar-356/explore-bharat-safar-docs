import * as React from 'react';

export default function StateLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto px-4 py-8 w-full">{children}</div>;
}
