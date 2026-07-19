'use client';

import React from 'react';
import FloatingCard from '@/components/ui/FloatingCard';

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-500">Welcome to the super admin panel. Use the sidebar to manage system administrators.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FloatingCard className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" delay={0.1}>
          <h3 className="text-lg font-medium opacity-90">System Status</h3>
          <p className="text-3xl font-bold mt-2">All Systems Operational</p>
        </FloatingCard>
      </div>
    </div>
  );
}
