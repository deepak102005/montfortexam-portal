'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Upload, ArrowRight, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { Question, Test } from '@/types';

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: 'Upload Answer Key' },
  { n: 2, label: 'Review & Edit' },
  { n: 3, label: 'Confirm & Grade' },
];

export default function AdminGradeTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [step, setStep] = useState<Step>(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch test meta ─────────────────────────────────────── */
  const { data: test } = useQuery<Test>({
    queryKey: ['test-meta', testId],
    queryFn: async () => {
      const res = await api.get(`/admin/tests/${testId}`);
      return res.data;
    },
  });

  /* ── Fetch questions ─────────────────────────────────────── */
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['test-questions', testId],
    queryFn: async () => {
      const res = await api.get(`/admin/tests/${testId}/questions`);
      return res.data;
    },
  });

  /* ── Mutations ────────────────────────────────────────────── */
  const submitKeyMutation = useMutation({
    mutationFn: async () => {
      const answers = Object.entries(answerKey).map(([questionId, correctOption]) => ({
        questionId,
        correctOption,
      }));
      await api.post(`/admin/tests/${testId}/answer-key`, { answers });
    },
  });

  const autoGradeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/tests/${testId}/auto-grade`);
    },
    onSuccess: () => router.push('/admin/grades'),
  });

  const handleGrade = async () => {
    await submitKeyMutation.mutateAsync();
    await autoGradeMutation.mutateAsync();
  };

  const allAnswered = questions?.every((q) => answerKey[q.id] !== undefined);

  /* ── Step helpers ─────────────────────────────────────────── */
  const canAdvance = () => {
    if (step === 1) return !!pdfFile;
    if (step === 2) return !!allAnswered;
    return true;
  };

  const handleParseContinue = () => {
    // In a real flow you'd parse the PDF server-side.
    // For now we jump straight to the review step.
    setStep(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#0b1c3c] rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c3c]">Grade: {test?.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            PDF answer key upload → parse → review → auto-grade
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/grades')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Stepper ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        {STEPS.map((s, i) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    active && 'bg-[#0b1c3c] text-white',
                    done && 'bg-[#0b1c3c] text-white',
                    !active && !done && 'bg-[#e8e0cc] text-gray-500',
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <span
                  className={clsx(
                    'text-sm font-medium whitespace-nowrap',
                    active ? 'text-[#0b1c3c]' : 'text-gray-400',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-gray-200" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────
          STEP 1 — Upload Answer Key PDF
      ───────────────────────────────────────────────────────── */}
      {step === 1 && (
        <>
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-16',
              pdfFile
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-200 bg-[#f7f5f0] hover:border-gray-300',
            )}
          >
            <FileText
              className={clsx(
                'w-14 h-14',
                pdfFile ? 'text-emerald-500' : 'text-indigo-300',
              )}
            />
            {pdfFile ? (
              <>
                <p className="font-semibold text-emerald-700">{pdfFile.name}</p>
                <p className="text-sm text-emerald-500">File selected — ready to parse</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-700">Upload Answer Key PDF</p>
                <p className="text-sm text-gray-400">Official answer key document (typed or scanned)</p>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-2 bg-[#0b1c3c] text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#07132a] transition-all"
                >
                  <Upload className="w-4 h-4" /> Choose PDF
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Bottom action */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleParseContinue}
              disabled={!pdfFile}
              className={clsx(
                'flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all',
                pdfFile
                  ? 'bg-[#0b1c3c] text-white hover:bg-[#07132a] hover:scale-[1.02]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              Parse &amp; Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────
          STEP 2 — Review & Edit (select correct answers)
      ───────────────────────────────────────────────────────── */}
      {step === 2 && (
        <>
          {/* Progress pill */}
          <div className="flex items-center gap-3 mb-5 bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm text-sm text-gray-600">
            <span>Total: <strong>{questions?.length || 0}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Answered: <strong className="text-emerald-600">{Object.keys(answerKey).length}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Remaining: <strong className="text-rose-500">{(questions?.length || 0) - Object.keys(answerKey).length}</strong></span>
          </div>

          <div className="space-y-4">
            {questions?.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                      answerKey[q.id] !== undefined
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-3">{q.text}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(q.options as string[]).map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setAnswerKey({ ...answerKey, [q.id]: oIdx })}
                          className={clsx(
                            'px-3 py-2 rounded-lg text-sm text-left transition-all border-2',
                            answerKey[q.id] === oIdx
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                              : 'border-gray-100 hover:border-gray-200 text-gray-600',
                          )}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!allAnswered}
              className={clsx(
                'flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all',
                allAnswered
                  ? 'bg-[#0b1c3c] text-white hover:bg-[#07132a] hover:scale-[1.02]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────
          STEP 3 — Confirm & Grade
      ───────────────────────────────────────────────────────── */}
      {step === 3 && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[#0b1c3c] mb-2">Ready to Auto-Grade</h2>
            <p className="text-gray-500 mb-2">
              Answer key for <strong>{questions?.length}</strong> questions is set.
            </p>
            <p className="text-sm text-gray-400">
              This will grade all <strong>{test?._count?.submissions || 0}</strong> submissions instantly.
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleGrade}
              disabled={submitKeyMutation.isPending || autoGradeMutation.isPending}
              className="flex items-center gap-2 bg-[#0b1c3c] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#07132a] hover:scale-[1.02] transition-all disabled:opacity-60"
            >
              {submitKeyMutation.isPending || autoGradeMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Confirm &amp; Auto-Grade
            </button>
          </div>
        </>
      )}
    </div>
  );
}
