'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Save, Eye, Calendar, Clock, Lock, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

export default function PublishTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  // Publish configuration states
  const [grade, setGrade] = useState('Class 12');
  const [stream, setStream] = useState('MPC');
  const [dueDate, setDueDate] = useState('2024-05-25');
  const [dueTime, setDueTime] = useState('23:59');
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    const storedAccessCode = localStorage.getItem('last_created_access_code');
    if (storedAccessCode) {
      setAccessCode(storedAccessCode);
    }
  }, []);
  const [instructions, setInstructions] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    // Simulate publishing API request
    setTimeout(() => {
      setIsPublishing(false);
      alert('Test published successfully to students!');
      router.push('/admin/tests');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Nav */}
      <button
        onClick={() => router.push(`/admin/tests/${testId}/review`)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Review
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c3c]">Publish Test</h1>
        <p className="text-sm text-gray-400">Set availability and publish the test for students</p>
      </div>

      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Test Information Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 lg:col-span-1">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
            Test Information
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Test Name</p>
              <p className="font-bold text-[#0b1c3c] mt-0.5">JEE Main Mock Test - 1</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Stream</p>
              <p className="font-semibold text-gray-700 mt-0.5">MPC</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Class</p>
              <p className="font-semibold text-gray-700 mt-0.5">{grade}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Stream</p>
              <p className="font-semibold text-gray-700 mt-0.5">{stream}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Questions</p>
              <p className="font-semibold text-gray-700 mt-0.5">60</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Total Marks</p>
              <p className="font-semibold text-gray-700 mt-0.5">300</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" /> Due Date
              </p>
              <p className="font-semibold text-gray-700 mt-0.5">{dueDate} at {dueTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3 text-gray-400" /> Access Code
              </p>
              <p className="font-semibold font-mono tracking-wider text-indigo-600 mt-0.5">{accessCode.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Publish Settings Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Publish Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Class <span className="text-red-500">*</span></label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Stream <span className="text-red-500">*</span></label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MPC">MPC (Maths, Physics, Chemistry)</option>
                <option value="BIPC">BIPC (Biology, Physics, Chemistry)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> Due Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-gray-400" /> Access Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono tracking-wider"
                required
              />
              <p className="text-[10px] text-gray-400">Students need this code to access the test.</p>
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">Instructions (Optional)</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions for students"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer inside grid */}
        <div className="col-span-1 lg:col-span-3 flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push(`/admin/tests/${testId}/review`)}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/tests')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-emerald-700/10 disabled:opacity-65"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Test
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
