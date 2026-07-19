'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Button, Badge } from '@/components/ui/Primitives';
import type { Test } from '@/types';
import {
  Clock, FileText, PlayCircle, CheckCircle, BookOpen,
  Lock, AlertTriangle, ChevronRight, CheckCircle2, X,
} from 'lucide-react';
import { clsx } from 'clsx';

/* ── JEE Instructions ─────────────────────────────────────────── */
const JEE_INSTRUCTIONS = [
  {
    title: 'General Instructions',
    items: [
      'The examination consists of 90 questions (Physics, Chemistry, Mathematics — 30 each).',
      'Total marks: 300. Each correct answer carries 4 marks.',
      'Each incorrect answer carries a penalty of −1 mark (negative marking).',
      'Unanswered questions carry 0 marks.',
      'Duration: 3 Hours. Do not close or refresh the browser during the exam.',
    ],
  },
  {
    title: 'Question Types',
    items: [
      'Single Correct Answer (SCA): Only one option is correct.',
      'Numerical Answer Type (NAT): Enter the exact numeric value (no options).',
    ],
  },
  {
    title: 'Navigation & Review',
    items: [
      'Use the Question Palette on the right to jump to any question directly.',
      'You can flag/bookmark questions to review later.',
      'You can change your answer any number of times before final submission.',
      'Submitting the exam is irreversible — confirm before clicking "Submit".',
    ],
  },
  {
    title: 'Technical Rules',
    items: [
      'Ensure a stable internet connection before starting the exam.',
      'Do not press Back/Refresh — this may lead to automatic submission.',
      'In case of a disconnection, log in again within 2 minutes to resume.',
      'Screen sharing or multi-tab usage is strictly prohibited.',
    ],
  },
];



export default function StudentTestsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['student-tests'],
    queryFn: async () => {
      const res = await api.get('/student/tests');
      return res.data;
    },
  });

  const openModal = () => {
    setShowModal(true);
    setCodeError('');
    setAccessCode('');
    setAgreed(false);
  };

  const handleStartTest = (testId: string) => {
    // We would have a modal here to enter access code for real tests too
    // For now, bypass straight to attempt
    router.push(`/student/tests/${testId}/attempt`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
      </div>
    );
  }

  const liveTests = tests?.filter((t) => !t.hasSubmitted) || [];
  const completedTests = tests?.filter((t) => t.hasSubmitted) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
        <p className="text-gray-500 mt-1">JEE Main mock tests and assessments</p>
      </div>


      {/* ── LIVE TESTS ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-green-500" />
          Available Tests
          {liveTests.length > 0 && <Badge variant="success">{liveTests.length}</Badge>}
        </h2>

        {liveTests.length === 0 ? (
          <FloatingCard>
            <p className="text-center text-gray-400 py-6">No tests available at the moment</p>
          </FloatingCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveTests.map((test, idx) => (
              <FloatingCard key={test.id} delay={idx * 0.6}>
                <div className="flex items-start justify-between mb-3">
                  <Badge className="text-white" variant="info">Class {test.grade}</Badge>
                  <Badge variant="success">Live</Badge>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{test.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.duration} min</span>
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {test._count?.questions || 0} Q</span>
                  <span>{test.totalMarks} marks</span>
                </div>
                {test.scheduledAt && (
                  <p className="text-xs text-gray-400 mb-4">
                    Scheduled: {new Date(test.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
                <Link href={`/student/tests/${test.id}/attempt`}>
                  <Button className="w-full">Start Test</Button>
                </Link>
              </FloatingCard>
            ))}
          </div>
        )}
      </section>

      {/* ── COMPLETED TESTS ──────────────────────────────────────── */}
      {completedTests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTests.map((test) => (
              <FloatingCard key={test.id} className="opacity-75">
                <div className="flex items-center justify-between mb-2">
                  <Badge>Class {test.grade}</Badge>
                  <Badge variant="default">
                    {test.submission?.score !== undefined ? `${test.submission.score}/${test.totalMarks}` : 'Submitted'}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-gray-700">{test.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted: {new Date(test.submission?.submittedAt || '').toLocaleDateString()}
                </p>
              </FloatingCard>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACCESS CODE + INSTRUCTIONS MODAL
      ─────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#0b1c3c]">JEE Main — Practice Mock Test</h2>
                <p className="text-sm text-gray-400 mt-0.5">Enter access code &amp; read instructions before starting</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 flex-shrink-0 ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Access Code field */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 text-indigo-500" /> Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setCodeError(''); }}
                  placeholder="Enter the access code provided by your teacher"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest font-mono uppercase"
                />
                {codeError && (
                  <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {codeError}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-100 pb-2">
                  Exam Instructions
                </h3>
                <div className="space-y-4">
                  {JEE_INSTRUCTIONS.map((section) => (
                    <div key={section.title}>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
                        {section.title}
                      </p>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer select-none bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={clsx(
                    'w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 mt-0.5 transition-colors cursor-pointer',
                    agreed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white',
                  )}
                >
                  {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm text-gray-700" onClick={() => setAgreed(!agreed)}>
                  I have read all the instructions carefully and agree to follow the exam rules. I understand that any malpractice will lead to disqualification.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center gap-2 bg-[#0b1c3c] text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#07132a] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                <PlayCircle className="w-4 h-4" /> Start Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
