'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { ProgressBar } from '@/components/ui/Primitives';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '@/types';
import type { SubjectProgress, Subject } from '@/types';
import { ArrowRight } from 'lucide-react';

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useQuery<SubjectProgress[]>({
    queryKey: ['student-subjects'],
    queryFn: async () => {
      const res = await api.get('/student/subjects');
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-500 mt-1">Track your progress across subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects?.map((subj, idx) => {
          const colors = SUBJECT_COLORS[subj.subject as Subject];
          const icon = SUBJECT_ICONS[subj.subject as Subject];

          return (
            <FloatingCard key={subj.subject} delay={idx * 0.8} className="relative overflow-hidden">
              {/* Color accent strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: colors.color }}
              />

              <div className="flex items-start justify-between mb-4 pt-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: colors.light }}
                >
                  {icon}
                </div>
                <span className="text-xs font-medium text-gray-400">
                  {subj.testsAttempted} tests
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1 capitalize">
                {subj.subject.toLowerCase()}
              </h3>

              <div className="mb-4">
                <ProgressBar value={subj.progress} color={colors.color} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {subj.totalScore}/{subj.totalMaxMarks} marks
                </span>
                <Link
                  href={`/student/resources?subject=${subj.subject}`}
                  className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: colors.color }}
                >
                  Resources <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </FloatingCard>
          );
        })}
      </div>
    </div>
  );
}
