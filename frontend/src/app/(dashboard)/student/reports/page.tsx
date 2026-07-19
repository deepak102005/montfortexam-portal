'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Badge, DataTable } from '@/components/ui/Primitives';
import { SUBJECT_COLORS } from '@/types';
import type { Subject } from '@/types';
import { BarChart3 } from 'lucide-react';

interface ReportItem {
  testId: string;
  title: string;
  subject: Subject;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  gradedAt: string;
}

export default function StudentReportsPage() {
  const { data: reports, isLoading } = useQuery<ReportItem[]>({
    queryKey: ['student-reports'],
    queryFn: async () => {
      const res = await api.get('/student/reports');
      return res.data;
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-500 mt-1">Weekly JEE Main mock test results</p>
      </div>

      <DataTable<ReportItem>
        data={reports || []}
        isLoading={isLoading}
        keyExtractor={(item) => item.testId}
        emptyMessage="No test reports available yet"
        columns={[
          {
            key: 'title',
            header: 'Test',
            render: (item) => (
              <Link
                href={`/student/reports/${item.testId}`}
                className="font-medium text-brand-700 hover:text-brand-900 hover:underline"
              >
                {item.title}
              </Link>
            ),
          },
          {
            key: 'subject',
            header: 'Subject',
            render: (item) => (
              <Badge
                className="text-white text-xs"
                variant="info"
              >
                {item.subject}
              </Badge>
            ),
          },
          {
            key: 'score',
            header: 'Score',
            render: (item) => (
              <span className="font-semibold">{item.score}/{item.totalMarks}</span>
            ),
          },
          {
            key: 'percentage',
            header: '%',
            render: (item) => (
              <span className={`font-bold ${item.percentage >= 60 ? 'text-green-600' : item.percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {item.percentage}%
              </span>
            ),
          },
          {
            key: 'date',
            header: 'Date',
            render: (item) => (
              <span className="text-gray-500">{new Date(item.submittedAt).toLocaleDateString()}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
