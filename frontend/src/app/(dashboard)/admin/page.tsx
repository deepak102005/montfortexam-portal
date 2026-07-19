'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Button, Badge } from '@/components/ui/Primitives';
import { Users, GraduationCap, FileText, PlusCircle, UserPlus, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AdminDashboardStats } from '@/types';

export default function AdminHomePage() {
  const { data, isLoading } = useQuery<AdminDashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
      </div>
    );
  }

  const studentPieData = [
    { name: 'MPC', value: data?.students.mpc || 0, color: '#3b82f6' },
    { name: 'BIPC', value: data?.students.bipc || 0, color: '#14b8a6' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard 🏫</h1>
          <p className="text-gray-500 mt-1">College management overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/teachers"><Button variant="secondary" size="sm"><UserPlus className="w-4 h-4" /> Add Teacher</Button></Link>
          <Link href="/admin/students"><Button variant="secondary" size="sm"><UserPlus className="w-4 h-4" /> Add Student</Button></Link>
          <Link href="/admin/resources"><Button variant="secondary" size="sm"><Upload className="w-4 h-4" /> Upload</Button></Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FloatingCard delay={0}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.teachers.total || 0}</p>
              <p className="text-sm text-gray-500">Teachers</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="info">MPC: {data?.teachers.mpc || 0}</Badge>
            <Badge variant="success">BIPC: {data?.teachers.bipc || 0}</Badge>
          </div>
        </FloatingCard>

        <FloatingCard delay={0.8}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.students.total || 0}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="info">MPC: {data?.students.mpc || 0}</Badge>
            <Badge variant="success">BIPC: {data?.students.bipc || 0}</Badge>
          </div>
        </FloatingCard>

        <FloatingCard delay={1.6}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.students.active || 0}</p>
              <p className="text-sm text-gray-500">Active Students</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {(data?.students.total || 0) - (data?.students.active || 0)} inactive
          </p>
        </FloatingCard>

        <FloatingCard delay={2.4}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data?.totalTests || 0}</p>
              <p className="text-sm text-gray-500">Total Tests</p>
            </div>
          </div>
        </FloatingCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream Distribution */}
        <FloatingCard delay={3.2}>
          <h2 className="font-semibold text-gray-900 mb-4">Student Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={studentPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {studentPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {studentPieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-sm text-gray-600">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </FloatingCard>

        {/* Recent Activity */}
        <FloatingCard delay={4}>
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {data?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {activity.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.role}</p>
                </div>
                <Badge variant={activity.isActive ? 'success' : 'danger'} size="sm">
                  {activity.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </FloatingCard>
      </div>
    </div>
  );
}
