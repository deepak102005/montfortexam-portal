'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button, Modal } from '@/components/ui/Primitives';
import GlassPanel from '@/components/ui/GlassPanel';
import { Clock, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react';
import { clsx } from 'clsx';
import type { Question, Test } from '@/types';

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: test, isLoading } = useQuery<Test & { questions: Question[] }>({
    queryKey: ['test-attempt', testId],
    queryFn: async () => {
      const res = await api.get(`/student/tests/${testId}/attempt`);
      return res.data;
    },
  });

  // Timer
  useEffect(() => {
    if (test) {
      setTimeLeft(test.duration * 60); // Convert minutes to seconds
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft <= 0 && test) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === optionIndex ? null : optionIndex,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formattedAnswers = test?.questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] ?? null,
      })) || [];

      await api.post(`/student/tests/${testId}/submit`, {
        answers: formattedAnswers,
      });

      router.push('/student/tests');
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  }, [answers, test, testId, router, isSubmitting]);

  if (isLoading || !test) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
      </div>
    );
  }

  const questions = test.questions || [];
  const question = questions[currentQuestion];
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Timer Bar */}
      <GlassPanel className="mb-6 p-4 flex items-center justify-between !rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{test.title}</h1>
          <p className="text-sm text-gray-500">Class {test.grade} • {test.totalMarks} marks</p>
        </div>
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold',
          timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-800'
        )}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-900">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{question?.marks} marks</span>
                <button
                  onClick={() => toggleFlag(question?.id)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    flagged.has(question?.id)
                      ? 'bg-amber-100 text-amber-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  )}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <p className="text-gray-800 text-base leading-relaxed">{question?.text}</p>
              {question?.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="mt-4 max-w-full rounded-xl border border-gray-200"
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(question?.options as string[])?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(question.id, idx)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200',
                    answers[question.id] === idx
                      ? 'border-brand-500 bg-brand-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <span
                    className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                      answers[question.id] === idx
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm text-gray-800">{option}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={() => setShowSubmitModal(true)}>
                  <Send className="w-4 h-4" /> Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <GlassPanel className="p-4 !rounded-2xl sticky top-[80px]">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={clsx(
                    'w-full aspect-square rounded-lg text-xs font-bold transition-all',
                    currentQuestion === idx && 'ring-2 ring-brand-500 ring-offset-1',
                    answers[q.id] !== null && answers[q.id] !== undefined
                      ? 'bg-green-500 text-white'
                      : flagged.has(q.id)
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-100" />
                <span>Flagged ({flagged.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Test
            </Button>
          </GlassPanel>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Test?"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
          </p>
          {questions.length - answeredCount > 0 && (
            <p className="text-amber-600 text-sm">
              ⚠️ {questions.length - answeredCount} questions are unanswered.
            </p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>
              Continue Test
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Confirm Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
