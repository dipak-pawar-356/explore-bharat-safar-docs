'use client';

import * as React from 'react';
import { Drawer } from '@ebs/ui';

export interface DrawerWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function DrawerWrapper({ isOpen, onClose, title, children }: DrawerWrapperProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </Drawer>
  );
}
