'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, ArrowLeft, Check, HelpCircle } from 'lucide-react';

interface PaperFile {
  name: string;
  size: string;
  file: File;
}

export default function CreateTestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [papers, setPapers] = useState<PaperFile[]>([]);
  const [creationMethod, setCreationMethod] = useState<'PDF_UPLOAD' | 'MANUAL_ENTRY'>('PDF_UPLOAD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPaperClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const newPaper = {
        name: file.name,
        size: `${fileSizeMB} MB`,
        file: file
      };
      setPapers(prev => [...prev, newPaper]);
      // Save the name in localStorage to trigger parsed mock questions on the Review page
      localStorage.setItem('last_uploaded_paper_name', file.name);
      localStorage.setItem('last_uploaded_paper_type', testType || 'JEE');
    }
  };

  const handleRemovePaper = (index: number) => {
    setPapers(prev => prev.filter((_, i) => i !== index));
    localStorage.removeItem('last_uploaded_paper_name');
    localStorage.removeItem('last_uploaded_paper_type');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testType || !grade || !stream || !accessCode) {
      alert('Please fill out all required fields.');
      return;
    }

    localStorage.setItem('last_created_access_code', accessCode);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: testName,
          type: testType,
          grade,
          stream,
          duration,
          totalMarks: maxMarks,
          accessCode,
          description
        })
      });

      if (!createRes.ok) {
         const errBody = await createRes.json().catch(() => ({}));
         throw new Error('Failed to create test: ' + JSON.stringify(errBody));
      }

      const testData = await createRes.json();
      
      if (papers.length > 0) {
        const formData = new FormData();
        formData.append('file', papers[0].file);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testData.id}/upload-paper`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadRes.ok) {
           throw new Error('Failed to upload paper');
        }
      }

      setIsSubmitting(false);
      
      if (creationMethod === 'MANUAL_ENTRY') {
        router.push(`/admin/tests/${testData.id}/manual`);
      } else {
        router.push(`/admin/tests/${testData.id}/answer-key`);
      }
    } catch (err) {
      console.error(err);
      alert('Error creating test: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c3c]">Create Test</h1>
          <p className="text-sm text-gray-400">Create a new test and configure its settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── TEST DETAILS ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Test Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-gray-500">Test Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-gray-500">Test Type <span className="text-red-500">*</span></label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Test Type</option>
                <option value="JEE">JEE Main</option>
                <option value="NEET">NEET</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter test description"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ─── TEST CONFIGURATION ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Class <span className="text-red-500">*</span></label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class (11 or 12)</option>
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
                <option value="">Select Stream (MPC or BIPC)</option>
                <option value="MPC">MPC (Maths, Physics, Chemistry)</option>
                <option value="BIPC">BIPC (Biology, Physics, Chemistry)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Due Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Duration <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration in minutes"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">Max Marks <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="Maximum marks"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-3">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                Access Code <span className="text-red-500">*</span>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
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
          </div>
        </div>

        {/* ─── CREATION METHOD ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Questions Creation Method</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCreationMethod('PDF_UPLOAD')}
              className={`flex-1 py-3 px-4 rounded-xl border ${creationMethod === 'PDF_UPLOAD' ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Upload PDF Paper
            </button>
            <button
              type="button"
              onClick={() => setCreationMethod('MANUAL_ENTRY')}
              className={`flex-1 py-3 px-4 rounded-xl border ${creationMethod === 'MANUAL_ENTRY' ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Manual Question Entry
            </button>
          </div>
        </div>

        {/* ─── TEST PAPERS (Only for PDF Upload) ───────────────────── */}
        {creationMethod === 'PDF_UPLOAD' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Test Papers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add existing question paper(s) to this test</p>
            </div>
            <button
              type="button"
              onClick={handleAddPaperClick}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Paper
            </button>
          </div>

          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <FileText className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
              <p className="text-xs text-gray-400">No question papers added yet. Tap "+ Add Paper" to select a PDF or DOC/DOCX file.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {papers.map((paper, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{paper.name}</p>
                      <p className="text-[10px] text-gray-400">{paper.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePaper(idx)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Removed Answer Key upload section as per request */}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/tests')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#0b1c3c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-65"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {creationMethod === 'MANUAL_ENTRY' ? 'Next: Add Questions' : 'Next: Set Answer Key'}
          </button>
        </div>
      </form>
    </div>
  );
}
