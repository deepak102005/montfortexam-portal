'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import FloatingCard from '@/components/ui/FloatingCard';
import { Badge } from '@/components/ui/Primitives';
import {
  BarChart3, Calendar, MessageSquare, Clock, Star,
  BookOpen, PlayCircle, Lock, CheckCircle2, AlertTriangle,
  ChevronRight, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { clsx } from 'clsx';
import type { StudentDashboard } from '@/types';

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

/* ─────────────────────────────────────────────────────────────── */

export default function StudentHomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const { data, isLoading } = useQuery<StudentDashboard>({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/student/dashboard');
      return res.data;
    },
  });

  /* ── Demo test access code check ──────────────────────────── */
  const handleStartDemo = () => {
    const DEMO_CODE = 'JEEDEMO2024';
    if (accessCode.trim().toUpperCase() !== DEMO_CODE) {
      setCodeError(`Incorrect access code. Use: ${DEMO_CODE}`);
      return;
    }
    if (!agreed) {
      setCodeError('Please read and accept the instructions before starting.');
      return;
    }
    setShowModal(false);
    // Navigate to the demo test (uses a hardcoded demo route)
    router.push('/student/tests/demo/attempt');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
      </div>
    );
  }

  const chartData = data?.performanceTrend?.map((t) => ({
    name: t.title.length > 15 ? t.title.slice(0, 15) + '...' : t.title,
    score: t.score || 0,
    total: t.totalMarks,
    percentage: t.totalMarks > 0 ? Math.round(((t.score || 0) / t.totalMarks) * 100) : 0,
  })).reverse() || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {data?.student?.name || user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {data?.student?.stream} Stream • Roll: {data?.student?.rollNumber}
        </p>
      </div>

      {/* ── DEMO TEST CARD ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 p-6 shadow-sm">
        {/* Corner badge */}
        <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          DEMO
        </span>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-indigo-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0b1c3c] mb-0.5">
              JEE Main — Practice Mock Test
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              90 Questions &nbsp;·&nbsp; Physics + Chemistry + Maths &nbsp;·&nbsp; 3 Hours &nbsp;·&nbsp; 300 Marks
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">MPC</span>
              <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full">JEE MAIN</span>
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">−1 Negative Marking</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">Access Code Required</span>
            </div>

            <button
              onClick={() => { setShowModal(true); setCodeError(''); setAccessCode(''); setAgreed(false); }}
              className="inline-flex items-center gap-2 bg-[#0b1c3c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#07132a] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <PlayCircle className="w-4 h-4" /> Start Test
            </button>
          </div>
        </div>
      </div>
      {/* ── END DEMO TEST CARD ──────────────────────────────────── */}

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <FloatingCard delay={0} className="col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Performance Trend</h2>
            <Badge variant="info">Last 5 Tests</Badge>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="percentage" fill="#3e62a8" radius={[6, 6, 0, 0]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No test results yet. Take your first test to see performance trends.</p>
            </div>
          )}
        </FloatingCard>

        {/* Upcoming Exams */}
        <FloatingCard delay={0.8}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-gray-900">Upcoming Exams</h2>
          </div>
          <div className="space-y-3">
            {data?.upcomingExams && data.upcomingExams.length > 0 ? (
              data.upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                    <p className="text-xs text-gray-500">Class {exam.grade} • {exam.duration} min</p>
                  </div>
                  <Badge variant="warning">
                    {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString() : 'TBD'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No upcoming exams</p>
            )}
          </div>
        </FloatingCard>

        {/* Messages */}
        <FloatingCard delay={1.6}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="space-y-3">
            {data?.messages && data.messages.length > 0 ? (
              data.messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-xl ${!msg.read ? 'bg-blue-50/60' : 'bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">{msg.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{msg.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No messages</p>
            )}
          </div>
        </FloatingCard>

        {/* Next Exam Countdown */}
        <FloatingCard delay={2.4}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Exam Reminder</h2>
          </div>
          {data?.nextExam ? (
            <div className="text-center py-4">
              <p className="text-lg font-bold text-gray-900">{data.nextExam.title}</p>
              <p className="text-sm text-gray-500 mt-1">Class {data.nextExam.grade}</p>
              <div className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-amber-50 rounded-xl">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {data.nextExam.scheduledAt
                    ? new Date(data.nextExam.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })
                    : 'Date TBD'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming exams</p>
          )}
        </FloatingCard>

        {/* Teacher Remarks */}
        <FloatingCard delay={3.2}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold text-gray-900">Teacher Remarks</h2>
          </div>
          <div className="space-y-3">
            {data?.remarks && data.remarks.length > 0 ? (
              data.remarks.map((r) => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-900">{r.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    — {r.teacher?.name} {r.test ? `on ${r.test.title}` : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No remarks yet</p>
            )}
          </div>
        </FloatingCard>
      </div>

      {/* ─────────────────────────────────────────────────────────
          ACCESS CODE + INSTRUCTIONS MODAL
      ───────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal header */}
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

              {/* Access Code */}
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

              {/* Agreement checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={clsx(
                    'w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 mt-0.5 transition-colors',
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
                onClick={handleStartDemo}
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
