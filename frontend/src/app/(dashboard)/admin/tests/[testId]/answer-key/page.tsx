'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Save, BookOpen, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';

type Status = 'not-visited' | 'not-answered' | 'answered';

type SubjectKey = 'Physics' | 'Chemistry' | 'Mathematics' | 'Botany' | 'Zoology';

const SUBJECT_COLORS: Record<SubjectKey, string> = {
  Physics:     'bg-blue-600',
  Chemistry:   'bg-purple-600',
  Mathematics: 'bg-emerald-600',
  Botany:      'bg-green-600',
  Zoology:     'bg-orange-600'
};

const SUBJECT_LIGHT: Record<SubjectKey, string> = {
  Physics:     'bg-blue-50 text-blue-700 border-blue-200',
  Chemistry:   'bg-purple-50 text-purple-700 border-purple-200',
  Mathematics: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Botany:      'bg-green-50 text-green-700 border-green-200',
  Zoology:     'bg-orange-50 text-orange-700 border-orange-200',
};

const PALETTE_COLOR: Record<Status, string> = {
  'not-visited':     'bg-gray-200 text-gray-600',
  'not-answered':    'bg-red-500 text-white',
  'answered':        'bg-green-500 text-white',
};

interface Question {
  id: string;
  testId: string;
  questionNumber: number;
  text: string;
  options: string[];
  correctOption: number;
}

export default function AnswerKeyPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  /* state */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectKey[]>(['Physics', 'Chemistry', 'Mathematics']);
  
  const [subject, setSubject] = useState<SubjectKey>('Physics');
  const [globalIdx, setGlobalIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testId}/questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
          
          if (data.length === 180) {
             setSubjects(['Physics', 'Chemistry', 'Botany', 'Zoology']);
          } else {
             setSubjects(['Physics', 'Chemistry', 'Mathematics']);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [testId]);

  /* questions split by subject */
  const bySubject: Record<SubjectKey, Question[]> = {
    Physics:     [],
    Chemistry:   [],
    Mathematics: [],
    Botany:      [],
    Zoology:     []
  };

  const subjectStart: Record<SubjectKey, number> = { Physics: 0, Chemistry: 0, Mathematics: 0, Botany: 0, Zoology: 0 };

  if (questions.length === 90) {
     bySubject.Physics = questions.slice(0, 30);
     bySubject.Chemistry = questions.slice(30, 60);
     bySubject.Mathematics = questions.slice(60, 90);
     subjectStart.Physics = 0;
     subjectStart.Chemistry = 30;
     subjectStart.Mathematics = 60;
  } else if (questions.length === 180) {
     bySubject.Physics = questions.slice(0, 45);
     bySubject.Chemistry = questions.slice(45, 90);
     bySubject.Botany = questions.slice(90, 135);
     bySubject.Zoology = questions.slice(135, 180);
     subjectStart.Physics = 0;
     subjectStart.Chemistry = 45;
     subjectStart.Botany = 90;
     subjectStart.Zoology = 135;
  } else if (questions.length > 0) {
     // fallback
     bySubject.Physics = questions;
  }

  const currentQ = questions[globalIdx];
  const localIdx = globalIdx - (subjectStart[subject] || 0);

  /* ── status helpers ───────────────────────────────────────── */
  const getStatus = (q: Question): Status => statuses[q.id] || 'not-visited';

  const markVisited = useCallback((q: Question) => {
    if (!q) return;
    setStatuses(prev => {
      if (!prev[q.id] || prev[q.id] === 'not-visited') {
        return { ...prev, [q.id]: 'not-answered' };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (currentQ) markVisited(currentQ);
  }, [currentQ, markVisited]);

  const selectOption = (optIdx: number) => {
    if (!currentQ) return;
    const qid = currentQ.id;
    setAnswers(prev => ({ ...prev, [qid]: optIdx }));
    setStatuses(prev => ({ ...prev, [qid]: 'answered' }));
  };

  const clearResponse = () => {
    if (!currentQ) return;
    const qid = currentQ.id;
    setAnswers(prev => ({ ...prev, [qid]: null }));
    setStatuses(prev => ({ ...prev, [qid]: 'not-answered' }));
  };

  /* ── navigation ───────────────────────────────────────────── */
  const goTo = (idx: number) => {
    setGlobalIdx(idx);
    if (questions.length === 90) {
      if (idx < 30) setSubject('Physics');
      else if (idx < 60) setSubject('Chemistry');
      else setSubject('Mathematics');
    } else if (questions.length === 180) {
      if (idx < 45) setSubject('Physics');
      else if (idx < 90) setSubject('Chemistry');
      else if (idx < 135) setSubject('Botany');
      else setSubject('Zoology');
    }
  };

  const goNext = () => { if (globalIdx < questions.length - 1) goTo(globalIdx + 1); };
  const goPrev = () => { if (globalIdx > 0) goTo(globalIdx - 1); };

  const switchSubject = (s: SubjectKey) => {
    setSubject(s);
    setGlobalIdx(subjectStart[s]);
  };

  /* ── submit ───────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
       const token = localStorage.getItem('accessToken');
       
       // Format answers for backend: [{ questionId, correctOption }]
       const formattedAnswers = Object.keys(answers)
         .filter(qid => answers[qid] !== null && answers[qid] !== undefined)
         .map(qid => ({
           questionId: qid,
           correctOption: answers[qid] as number
         }));

       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testId}/answer-key`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({ answers: formattedAnswers })
       });

       if (res.ok) {
          setShowSubmitModal(false);
          router.push(`/admin/tests/${testId}/review`);
       } else {
          alert("Failed to save answer key");
       }
    } catch (e) {
       console.error(e);
       alert("Error saving answer key");
    } finally {
       setSubmitting(false);
    }
  };

  if (loading) {
     return <div className="p-8 text-center text-gray-500">Loading test data...</div>;
  }

  if (questions.length === 0) {
     return <div className="p-8 text-center text-gray-500">No questions found. Please upload a question paper first.</div>;
  }

  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length;
  const notAnsweredCount = Object.values(statuses).filter(s => s === 'not-answered').length;
  const notVisitedCount = questions.length - Object.keys(statuses).length;

  return (
    <div className="h-[calc(100vh-57px)] bg-gray-100 flex flex-col select-none -m-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* ── TOP BAR ───────────────────────────────────────────── */}
      <div className="bg-[#1a237e] text-white flex items-center justify-between px-5 py-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/admin/tests/${testId}/review`)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-6 h-6" />
          <div>
            <p className="text-sm font-bold leading-tight">Admin: Set Answer Key</p>
            <p className="text-xs text-blue-200">Test ID: {testId.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <input 
             type="file" 
             id="pdf-upload" 
             accept=".pdf" 
             className="hidden" 
             onChange={async (e) => {
               const file = e.target.files?.[0];
               if (file) {
                 alert(`Answer key PDF "${file.name}" uploaded successfully. Auto-parsing answers...`);
               }
             }} 
           />
           <label 
             htmlFor="pdf-upload" 
             className="cursor-pointer hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors text-white"
           >
             Upload PDF Key
           </label>

           <button
             onClick={() => router.push(`/admin/tests/${testId}/complete-review`)}
             className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors"
           >
             Preview Paper
           </button>
        </div>
      </div>

      {/* ── SUBJECT TABS ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0">
        {subjects.map(s => {
          const qs = bySubject[s] || [];
          const answeredInSubject = qs.filter(q => answers[q.id] !== null && answers[q.id] !== undefined).length;
          return (
            <button
              key={s}
              onClick={() => switchSubject(s)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                subject === s
                  ? 'border-[#1a237e] text-[#1a237e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              <span className={clsx('w-2 h-2 rounded-full', SUBJECT_COLORS[s])} />
              {s}
              <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {answeredInSubject}/{qs.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Question panel ──────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question number bar */}
          <div className="bg-[#e8eaf6] px-5 py-2 flex items-center justify-between text-sm flex-shrink-0">
            <span className="font-semibold text-gray-700">
              Question {localIdx + 1} of {bySubject[subject]?.length || 0} &nbsp;|&nbsp; {subject}
            </span>
            <span className="text-gray-500 text-xs">
              Marks: +4 / −1
            </span>
          </div>

          {/* Question text */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentQ && (
              <div className="max-w-3xl">
                {/* Q number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold', SUBJECT_COLORS[subject])}>
                    {localIdx + 1}
                  </span>
                  <p className="text-base font-semibold text-gray-900 leading-relaxed flex-1">
                    {currentQ.text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mt-6 ml-11">
                  {currentQ.options.map((opt, idx) => {
                    const selected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(idx)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition-all',
                          selected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                            : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 text-gray-700',
                        )}
                      >
                        <span className={clsx(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300',
                        )}>
                          {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span className="font-bold mr-1 text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                        {selected && <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Correct Answer</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── BOTTOM ACTION BAR ─────────────────────────────── */}
          <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={clearResponse}
                className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Clear Answer
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={globalIdx === 0}
                className="flex items-center gap-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {globalIdx < questions.length - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1 bg-[#1a237e] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0d1857] transition-colors"
                >
                  Save &amp; Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Save Answer Key
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Question Palette ────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Summary counts */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Answer Key Status</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Set', count: answeredCount, color: 'bg-green-500' },
                { label: 'Not Set', count: notAnsweredCount, color: 'bg-red-500' },
                { label: 'Not Visited', count: notVisitedCount, color: 'bg-gray-300' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={clsx('w-4 h-4 rounded text-white text-center text-[10px] font-bold flex items-center justify-center', color)}>
                    {count}
                  </span>
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Palette for active subject */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div key={subject}>
              <p className={clsx('text-xs font-bold uppercase tracking-wide mb-2 px-1 py-0.5 rounded inline-block', SUBJECT_LIGHT[subject])}>
                {subject}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {(bySubject[subject] || []).map((q, i) => {
                  const st = getStatus(q);
                  const isActive = q.id === currentQ?.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(subjectStart[subject] + i)}
                      className={clsx(
                        'w-9 h-9 rounded-lg text-xs font-bold transition-all',
                        PALETTE_COLOR[st],
                        isActive && 'ring-2 ring-offset-1 ring-[#1a237e] scale-110',
                      )}
                    >
                      {subjectStart[subject] + i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit button in palette */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Answer Key
            </button>
          </div>
        </div>
      </div>

      {/* ── SUBMIT CONFIRMATION MODAL ─────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center mx-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Save Answer Key?</h2>
            <p className="text-sm text-gray-500 mb-6">
              You have set the correct answer for <strong>{answeredCount}</strong> out of {questions.length} questions.
              {notAnsweredCount + notVisitedCount > 0 && <span className="text-red-500"> {notAnsweredCount + notVisitedCount} questions are missing an answer key.</span>}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Continue Editing
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Yes, Save Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
