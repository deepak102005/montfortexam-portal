'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Badge } from '@/components/ui/Primitives';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import type { TestReport } from '@/types';

export default function TestReportPage() {
  const params = useParams();
  const testId = params.testId as string;

  const { data: report, isLoading } = useQuery<TestReport>({
    queryKey: ['test-report', testId],
    queryFn: async () => {
      const res = await api.get(`/student/reports/${testId}`);
      return res.data;
    },
  });

  if (isLoading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
      </div>
    );
  }

  const percentage = report.totalMarks > 0
    ? Math.round((report.score / report.totalMarks) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary */}
      <FloatingCard delay={0} className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{report.testTitle}</h1>
        <Badge variant="info">{report.subject}</Badge>

        <div className="flex items-center justify-center gap-8 mt-6">
          <div>
            <p className="text-3xl font-bold text-brand-800">{report.score}</p>
            <p className="text-sm text-gray-500">out of {report.totalMarks}</p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div>
            <p className={clsx('text-3xl font-bold', percentage >= 60 ? 'text-green-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600')}>
              {percentage}%
            </p>
            <p className="text-sm text-gray-500">percentage</p>
          </div>
          <div className="h-12 w-px bg-gray-200" />
          <div>
            <p className="text-3xl font-bold text-violet-600">#{report.rank}</p>
            <p className="text-sm text-gray-500">of {report.totalStudents}</p>
          </div>
        </div>
      </FloatingCard>

      {/* Question Breakdown */}
      <h2 className="text-lg font-semibold text-gray-900">Question Breakdown</h2>
      <div className="space-y-3">
        {report.questions.map((q, idx) => (
          <div
            key={idx}
            className={clsx(
              'bg-white rounded-xl p-4 border transition-colors',
              q.isCorrect ? 'border-green-200' : q.selectedOption === null ? 'border-gray-200' : 'border-red-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {q.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : q.selectedOption === null ? (
                  <Minus className="w-5 h-5 text-gray-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Q{q.questionNumber}. {q.text}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.options as string[]).map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={clsx(
                        'text-xs px-3 py-2 rounded-lg',
                        oIdx === q.correctOption && 'bg-green-100 text-green-800 font-medium',
                        oIdx === q.selectedOption && oIdx !== q.correctOption && 'bg-red-100 text-red-800',
                        oIdx !== q.correctOption && oIdx !== q.selectedOption && 'bg-gray-50 text-gray-600'
                      )}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {q.marksObtained}/{q.marks} marks
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
