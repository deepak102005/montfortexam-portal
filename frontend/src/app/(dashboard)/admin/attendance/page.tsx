'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DataTable, Badge, Input } from '@/components/ui/Primitives';

interface AttendanceRecord {
  id: string;
  name: string;
  rollNumber?: string;
  stream?: string;
  grade?: string;
  present: boolean;
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: records, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['admin-attendance', date],
    queryFn: async () => {
      const res = await api.get(`/admin/attendance?date=${date}`);
      return res.data;
    },
  });

  const columns = [
    { key: 'name', header: 'Student Name', render: (r: AttendanceRecord) => <span className="font-medium">{r.name}</span> },
    { key: 'rollNumber', header: 'Roll Number', render: (r: AttendanceRecord) => r.rollNumber || '-' },
    { key: 'stream', header: 'Stream', render: (r: AttendanceRecord) => <Badge>{r.stream || '-'}</Badge> },
    { key: 'grade', header: 'Class', render: (r: AttendanceRecord) => <Badge variant="info">Class {r.grade || '-'}</Badge> },
    { key: 'status', header: 'Status', render: (r: AttendanceRecord) => (
      <Badge variant={r.present ? 'success' : 'default'}>
        {r.present ? 'Present' : 'Absent'}
      </Badge>
    ) },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Attendance</h1>
          <p className="text-gray-500 mt-1">View attendance marked automatically by test participation.</p>
        </div>
        <div className="w-48">
          <Input 
            type="date" 
            value={date} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <DataTable
          columns={columns}
          data={records || []}
          isLoading={isLoading}
          keyExtractor={(item: AttendanceRecord) => item.id}
          emptyMessage={`No students found for this date.`}
        />
      </div>
    </div>
  );
}
