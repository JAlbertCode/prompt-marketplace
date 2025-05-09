'use client';

import React from 'react';
import CreditDashboard from '@/components/admin/CreditDashboard';

export default function AdminCreditsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Credit Dashboard</h1>
      <CreditDashboard />
    </div>
  );
}
