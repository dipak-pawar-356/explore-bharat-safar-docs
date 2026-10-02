'use client';

// Explore Bharat Safar — Screen Reader Live Region Announcer
// WCAG 2.2 AA Success Criterion 4.1.3 (Status Messages)

import * as React from 'react';

const LiveAnnouncerContext = React.createContext<{
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}>({
  announce: () => {},
});

export function LiveAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = React.useState('');
  const [assertiveMessage, setAssertiveMessage] = React.useState('');

  const announce = React.useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      if (politeness === 'assertive') {
        setAssertiveMessage('');
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage('');
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    [],
  );

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Invisible screen reader live regions */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export function useAnnouncer() {
  return React.useContext(LiveAnnouncerContext);
}

export const useLiveAnnouncer = useAnnouncer;
