'use client';

import * as React from 'react';
import { Button } from '@ebs/ui';

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle Theme">
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  );
}
