'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, Play, Calendar, Clock, Lock, BookOpen, FileText } from 'lucide-react';

interface Question {
  id: string;
  questionNumber: number;
  text: string;
  options: string[];
  marks: number;
  diagram?: React.ReactNode;
}

interface Section {
  title: string;
  info: string;
  questions: Question[];
}

export default function ReviewTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [testInfo, setTestInfo] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadedPaperName, setUploadedPaperName] = useState<string | null>(null);
  const [uploadedAnswerKeyName, setUploadedAnswerKeyName] = useState<string | null>(null);

  useEffect(() => {
    // Read the uploaded paper info from localStorage
    const paperName = localStorage.getItem('last_uploaded_paper_name');
    const answerKeyName = localStorage.getItem('last_uploaded_answer_key');
    
    if (paperName) setUploadedPaperName(paperName);
    if (answerKeyName) setUploadedAnswerKeyName(answerKeyName);

    async function fetchData() {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [testRes, qRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testId}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testId}/questions`, { headers })
        ]);

        if (testRes.ok) {
           const testData = await testRes.json();
           setTestInfo(testData);
        }
        
        if (qRes.ok) {
           const qData = await qRes.json();
           setQuestions(qData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [testId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading test data...</div>;
  }

  if (!testInfo) {
    return <div className="p-8 text-center text-red-500">Error loading test.</div>;
  }

  // Group questions into sections
  const sections: Section[] = [];
  
  if (questions.length === 180 || testInfo.stream === 'BIPC') {
    sections.push({
      title: 'Section A: Physics',
      info: '45 Questions',
      questions: questions.slice(0, 45)
    });
    sections.push({
      title: 'Section B: Chemistry',
      info: '45 Questions',
      questions: questions.slice(45, 90)
    });
    sections.push({
      title: 'Section C: Botany',
      info: '45 Questions',
      questions: questions.slice(90, 135)
    });
    sections.push({
      title: 'Section D: Zoology',
      info: '45 Questions',
      questions: questions.slice(135, 180)
    });
  } else {
    sections.push({
      title: 'Section A: Physics',
      info: '30 Questions',
      questions: questions.slice(0, 30)
    });
    sections.push({
      title: 'Section B: Chemistry',
      info: '30 Questions',
      questions: questions.slice(30, 60)
    });
    sections.push({
      title: 'Section C: Mathematics',
      info: '30 Questions',
      questions: questions.slice(60, 90)
    });
  }

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // In a real app we'd have a PUT /admin/tests/:testId/publish route.
      // But for now just going back to tests page.
      router.push('/admin/tests');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <button
        onClick={() => router.push('/admin/tests')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c3c]">Review Test</h1>
        <p className="text-sm text-gray-400">Review questions and test configuration before publishing</p>
      </div>

      {/* Alerts */}
      {uploadedPaperName && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Document Uploaded Successfully</h4>
            <p className="text-xs text-indigo-700 mt-0.5">
              Parsed <strong>{uploadedPaperName}</strong>. Questions and diagrams have been imported exactly as formatted in the document.
            </p>
          </div>
        </div>
      )}

      {uploadedAnswerKeyName && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Answer Key Uploaded Successfully</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Parsed <strong>{uploadedAnswerKeyName}</strong>. Auto-valuation is enabled for this exam.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Test Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 lg:col-span-1">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2">
            Test Information
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Test Name</p>
              <p className="font-bold text-[#0b1c3c] mt-0.5">{testInfo.title}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Class</p>
              <p className="font-semibold text-gray-700 mt-0.5">{testInfo.grade}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Stream</p>
              <p className="font-semibold text-gray-700 mt-0.5">{testInfo.stream}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" /> Duration
              </p>
              <p className="font-semibold text-gray-700 mt-0.5">{testInfo.duration} Minutes</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Max Marks</p>
              <p className="font-semibold text-gray-700 mt-0.5">{testInfo.totalMarks}</p>
            </div>
            {testInfo.accessCode && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" /> Access Code
                </p>
                <p className="font-semibold font-mono tracking-wider text-indigo-600 mt-0.5">
                  {testInfo.accessCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Question Paper Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2">
          {/* Subheader */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Question Paper
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <span>Total Questions: <strong>{questions.length}</strong></span>
              <span>Total Marks: <strong>{testInfo.totalMarks}</strong></span>
            </div>
          </div>

          {/* Section details */}
          <div className="p-6 space-y-8">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2 bg-slate-50/60 p-2 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-800">{section.title}</h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {section.info}
                  </span>
                </div>

                <div className="space-y-6 pl-2">
                  {section.questions.map((q) => (
                    <div key={q.id} className="p-3 border border-gray-50 hover:bg-gray-50/30 rounded-xl transition-colors space-y-3">
                      {/* Question Text Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                            Q{q.questionNumber}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-semibold leading-relaxed pt-0.5">{q.text}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">
                          {q.marks || 4} {q.marks === 1 ? 'Mark' : 'Marks'}
                        </span>
                      </div>

                      {/* Options Grid (A, B, C, D) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="text-xs text-gray-600 bg-white border border-gray-200/80 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50/50 transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="font-medium">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {questions.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">No questions found. Upload a paper in the Create step.</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={() => router.push('/admin/tests')}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/tests')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 bg-[#0b1c3c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4" /> Publish Test
          </button>
        </div>
      </div>
    </div>
  );
}
