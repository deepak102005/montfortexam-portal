'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionItem {
  number: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

interface Section {
  title: string;
  info: string;
  questions: QuestionItem[];
}

const generateQuestions = (startId: number, count: number, subject: string): QuestionItem[] => {
  return Array.from({ length: count }).map((_, idx) => {
    const qNum = startId + idx;
    return {
      number: qNum,
      text: `Sample question ${qNum} for ${subject}. This is a dynamically generated question simulating the full paper layout. What is the correct answer according to the uploaded key?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: Math.floor(Math.random() * 4),
      marks: 4,
    };
  });
};

const SECTIONS: Section[] = [
  {
    title: 'Section A: Mathematics',
    info: '30 Questions | 120 Marks',
    questions: generateQuestions(1, 30, 'Mathematics'),
  },
  {
    title: 'Section B: Physics',
    info: '30 Questions | 120 Marks',
    questions: generateQuestions(31, 30, 'Physics'),
  },
  {
    title: 'Section C: Chemistry',
    info: '30 Questions | 120 Marks',
    questions: generateQuestions(61, 30, 'Chemistry'),
  },
];

export default function CompleteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const totalQuestions = 90;
  const totalMarks = 360;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Title */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c3c]">Complete Paper Review</h1>
          <p className="text-sm text-gray-400">Review all 90 questions along with their verified correct answers</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          Auto-Valuation Ready
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 bg-gray-50/50 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Full Question Paper & Answer Key
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <span>Total Questions: <strong>{totalQuestions}</strong></span>
            <span>Total Marks: <strong>{totalMarks}</strong></span>
          </div>
        </div>

        {/* Paper Content */}
        <div className="p-6 space-y-10">
          {SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6">
              {/* Section Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 bg-slate-50/60 p-3 rounded-xl">
                <h3 className="text-sm font-bold text-gray-800">{section.title}</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {section.info}
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {section.questions.map((q) => (
                  <div key={q.number} className="p-4 border border-gray-100 hover:border-gray-200 rounded-2xl transition-colors space-y-4 shadow-sm bg-white">
                    {/* Question Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
                          Q{q.number}
                        </span>
                        <div className="flex-1 pt-1">
                          <p className="text-sm text-gray-800 font-semibold leading-relaxed">{q.text}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md flex-shrink-0">
                        {q.marks} Marks
                      </span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctOptionIndex;
                        return (
                          <div
                            key={oIdx}
                            className={clsx(
                              "text-sm px-4 py-3 rounded-xl flex items-center justify-between transition-colors border",
                              isCorrect
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold shadow-sm"
                                : "bg-white border-gray-200 text-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={clsx(
                                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold",
                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                                )}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Answer Explanation / Reference Banner */}
                    <div className="ml-11 mt-2 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Correct Answer is <strong>Option {String.fromCharCode(65 + q.correctOptionIndex)}</strong> based on the uploaded answer key.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
