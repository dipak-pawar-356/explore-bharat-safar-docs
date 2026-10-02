import * as React from 'react';
import { AdminShellLayout } from '@/components/admin/admin-shell-layout';

// Explore Bharat Safar — Admin Route Group Layout
// Reference: EBS-DOC-13-ADMIN Section 1-2
// This layout wraps ALL admin routes: super-admin, booking-admin, payment-admin,
// certificate-admin, and village-admin under a single enterprise shell.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellLayout>{children}</AdminShellLayout>;
}
