'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Plus, AlertCircle } from 'lucide-react';

interface Question {
  questionNumber: number;
  text: string;
  options: string[];
  correctOption: number;
  marks: number;
  negativeMarks: number;
  imageUrl?: string | null;
}

export default function ManualQuestionBuilder() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionNum, setCurrentQuestionNum] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalQuestionsToBuild, setTotalQuestionsToBuild] = useState(1);

  // Form state for current question
  const [text, setText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [marks, setMarks] = useState<number>(4);
  const [negativeMarks, setNegativeMarks] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Load question data when switching questions
  useEffect(() => {
    const existingQ = questions.find(q => q.questionNumber === currentQuestionNum);
    if (existingQ) {
      setText(existingQ.text);
      setOptions([...existingQ.options]);
      setCorrectOption(existingQ.correctOption);
      setMarks(existingQ.marks);
      setNegativeMarks(existingQ.negativeMarks);
      setImageUrl(existingQ.imageUrl || null);
    } else {
      setText('');
      setOptions(['', '', '', '']);
      setCorrectOption(0);
      setMarks(4);
      setNegativeMarks(1);
      setImageUrl(null);
    }
  }, [currentQuestionNum, questions]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    }
  };

  const handleSaveCurrentQuestion = () => {
    if (!text.trim() || options.some(opt => !opt.trim())) {
      alert('Please fill out the question text and all options.');
      return;
    }

    const newQuestion: Question = {
      questionNumber: currentQuestionNum,
      text,
      options,
      correctOption,
      marks,
      negativeMarks,
      imageUrl
    };

    setQuestions(prev => {
      const filtered = prev.filter(q => q.questionNumber !== currentQuestionNum);
      return [...filtered, newQuestion].sort((a, b) => a.questionNumber - b.questionNumber);
    });

    if (currentQuestionNum < totalQuestionsToBuild) {
      setCurrentQuestionNum(prev => prev + 1);
    }
  };

  const handleSubmitAll = async () => {
    if (questions.length === 0) {
      alert('Please add at least one question before saving.');
      return;
    }

    // Check for missing questions in sequence up to the highest numbered question added
    const highestQ = Math.max(...questions.map(q => q.questionNumber));
    if (questions.length < highestQ) {
      const confirmSubmit = confirm(`You have only completed ${questions.length} out of ${highestQ} questions. Are you sure you want to finish?`);
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests/${testId}/manual-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to save questions');
      }

      // Success, route to publish page
      router.push(`/admin/tests/${testId}/publish`);
    } catch (err) {
      console.error(err);
      alert('Error saving questions: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0b1c3c]">Manual Question Builder</h1>
            <p className="text-sm text-gray-400">Add questions to your test one by one.</p>
          </div>
        </div>
        <button
          onClick={handleSubmitAll}
          disabled={isSubmitting || questions.length === 0}
          className="flex items-center gap-2 bg-[#0b1c3c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Finish & Publish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Question Editor */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Question {currentQuestionNum}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500">Marks:</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500">Negative:</label>
                  <input
                    type="number"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Question Text <span className="text-red-500">*</span></label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your question here..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">Question Image (Optional)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm"
                  />
                  {imageUrl && (
                    <img 
                      src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`} 
                      alt="Question image" 
                      className="h-20 object-contain rounded-md border border-gray-200" 
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500">Options (Select the correct one) <span className="text-red-500">*</span></label>
                {options.map((opt, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${correctOption === idx ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOption === idx}
                      onChange={() => setCorrectOption(idx)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-500 w-6">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button
                onClick={handleSaveCurrentQuestion}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Question {currentQuestionNum} & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Question Navigation Grid */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Question Navigator</h3>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" /> Saved</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200" /> Empty</div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestionsToBuild }).map((_, i) => {
                const qNum = i + 1;
                const isSaved = questions.some(q => q.questionNumber === qNum);
                const isCurrent = currentQuestionNum === qNum;

                return (
                  <button
                    key={qNum}
                    onClick={() => setCurrentQuestionNum(qNum)}
                    className={`
                      w-full aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                      ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      ${isSaved ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                    {qNum}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setTotalQuestionsToBuild(prev => prev + 1);
                  setCurrentQuestionNum(totalQuestionsToBuild + 1);
                }}
                className="w-full aspect-square flex items-center justify-center rounded-lg text-xs font-semibold border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 transition-all"
                title="Add Question"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-gray-900">{questions.length}</span> out of {totalQuestionsToBuild} questions created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
