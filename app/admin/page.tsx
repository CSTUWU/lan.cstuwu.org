import React from 'react';
import AdminLoginView from '@/components/admin/AdminLoginView';

export const metadata = {
  title: 'Admin Command Portal | CST LAN Challenge 2026',
  description: 'Restricted tournament administration and control interface for CST LAN Challenge 2026.',
};

export default function AdminIndexPage() {
  return <AdminLoginView />;
}

