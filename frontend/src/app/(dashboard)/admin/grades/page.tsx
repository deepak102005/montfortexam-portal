'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, FileText, Search, ChevronRight,
  Sparkles, CheckCircle2, AlertTriangle, Medal
} from 'lucide-react';
import { clsx } from 'clsx';

interface StudentPerformance {
  sNo: number;
  rollNo: string;
  name: string;
  status: 'Completed' | 'Pending';
  attemptedOn: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  rank: number;
}

interface TestDetails {
  name: string;
  grade: string;
  stream: string;
  questions: number;
  totalMarks: number;
  date: string;
  duration: string;
}

const TESTS_METADATA: Record<string, TestDetails> = {
  'JEE Main Mock Test - Week 1': {
    name: 'JEE Main Mock Test - Week 1',
    grade: 'Class 12',
    stream: 'MPC',
    questions: 60,
    totalMarks: 300,
    date: '12 July 2026',
    duration: '180 Minutes',
  },
  'NEET Mock Test - Week 1': {
    name: 'NEET Mock Test - Week 1',
    grade: 'Class 12',
    stream: 'BIPC',
    questions: 180,
    totalMarks: 720,
    date: '10 July 2026',
    duration: '180 Minutes',
  },
};

const JEE_STUDENTS: StudentPerformance[] = [
  { sNo: 1, rollNo: '12001', name: 'Ananya Gupta', status: 'Completed', attemptedOn: '12 July 2026, 10:30 AM', score: 276, totalMarks: 300, percentage: 92.00, correct: 54, incorrect: 6, unattempted: 0, rank: 1 },
  { sNo: 2, rollNo: '12002', name: 'Karthik Rao', status: 'Completed', attemptedOn: '12 July 2026, 10:32 AM', score: 258, totalMarks: 300, percentage: 86.00, correct: 50, incorrect: 10, unattempted: 0, rank: 2 },
  { sNo: 3, rollNo: '12003', name: 'Rohan Verma', status: 'Completed', attemptedOn: '12 July 2026, 10:35 AM', score: 240, totalMarks: 300, percentage: 80.00, correct: 46, incorrect: 14, unattempted: 0, rank: 3 },
  { sNo: 4, rollNo: '12004', name: 'Neha Sharma', status: 'Completed', attemptedOn: '12 July 2026, 10:40 AM', score: 222, totalMarks: 300, percentage: 74.00, correct: 42, incorrect: 18, unattempted: 0, rank: 4 },
  { sNo: 5, rollNo: '12005', name: 'Aditya Singh', status: 'Completed', attemptedOn: '12 July 2026, 10:42 AM', score: 210, totalMarks: 300, percentage: 70.00, correct: 40, incorrect: 20, unattempted: 0, rank: 5 },
  { sNo: 6, rollNo: '12006', name: 'Meera Iyer', status: 'Completed', attemptedOn: '12 July 2026, 10:45 AM', score: 192, totalMarks: 300, percentage: 64.00, correct: 36, incorrect: 24, unattempted: 0, rank: 6 },
  { sNo: 7, rollNo: '12007', name: 'Vikram Patel', status: 'Completed', attemptedOn: '12 July 2026, 10:47 AM', score: 180, totalMarks: 300, percentage: 60.00, correct: 34, incorrect: 26, unattempted: 0, rank: 7 },
  { sNo: 8, rollNo: '12008', name: 'Pooja Nair', status: 'Completed', attemptedOn: '12 July 2026, 10:50 AM', score: 162, totalMarks: 300, percentage: 54.00, correct: 30, incorrect: 30, unattempted: 0, rank: 8 },
  { sNo: 9, rollNo: '12009', name: 'Sanjay Dutt', status: 'Completed', attemptedOn: '12 July 2026, 10:55 AM', score: 150, totalMarks: 300, percentage: 50.00, correct: 28, incorrect: 32, unattempted: 0, rank: 9 },
  { sNo: 10, rollNo: '12010', name: 'Kiran Bedi', status: 'Completed', attemptedOn: '12 July 2026, 11:00 AM', score: 132, totalMarks: 300, percentage: 44.00, correct: 25, incorrect: 35, unattempted: 0, rank: 10 },
  { sNo: 11, rollNo: '12011', name: 'Amitabh Sen', status: 'Completed', attemptedOn: '12 July 2026, 11:05 AM', score: 120, totalMarks: 300, percentage: 40.00, correct: 22, incorrect: 38, unattempted: 0, rank: 11 },
  { sNo: 12, rollNo: '12012', name: 'Rekha Roy', status: 'Completed', attemptedOn: '12 July 2026, 11:10 AM', score: 102, totalMarks: 300, percentage: 34.00, correct: 20, incorrect: 40, unattempted: 0, rank: 12 },
  { sNo: 13, rollNo: '12013', name: 'Salman Khan', status: 'Completed', attemptedOn: '12 July 2026, 11:12 AM', score: 90, totalMarks: 300, percentage: 30.00, correct: 18, incorrect: 42, unattempted: 0, rank: 13 },
  { sNo: 14, rollNo: '12014', name: 'Karishma K.', status: 'Completed', attemptedOn: '12 July 2026, 11:15 AM', score: 72, totalMarks: 300, percentage: 24.00, correct: 15, incorrect: 45, unattempted: 0, rank: 14 },
  { sNo: 15, rollNo: '12015', name: 'Varun Dhawan', status: 'Completed', attemptedOn: '12 July 2026, 11:18 AM', score: 60, totalMarks: 300, percentage: 20.00, correct: 12, incorrect: 48, unattempted: 0, rank: 15 },
];

const NEET_STUDENTS: StudentPerformance[] = [
  { sNo: 1, rollNo: '13001', name: 'Aarushi Sen', status: 'Completed', attemptedOn: '10 July 2026, 09:30 AM', score: 680, totalMarks: 720, percentage: 94.44, correct: 170, incorrect: 10, unattempted: 0, rank: 1 },
  { sNo: 2, rollNo: '13002', name: 'Manish Kumar', status: 'Completed', attemptedOn: '10 July 2026, 09:35 AM', score: 640, totalMarks: 720, percentage: 88.89, correct: 160, incorrect: 20, unattempted: 0, rank: 2 },
  { sNo: 3, rollNo: '13003', name: 'Tanvi Shah', status: 'Completed', attemptedOn: '10 July 2026, 09:40 AM', score: 600, totalMarks: 720, percentage: 83.33, correct: 150, incorrect: 30, unattempted: 0, rank: 3 },
  { sNo: 4, rollNo: '13004', name: 'Rohan Mehra', status: 'Completed', attemptedOn: '10 July 2026, 09:45 AM', score: 550, totalMarks: 720, percentage: 76.38, correct: 140, incorrect: 35, unattempted: 5, rank: 4 },
];

export default function AdminGradesPage() {
  const router = useRouter();

  // Filter dropdown states
  const [selectedClass, setSelectedClass] = useState('Class 12');
  const [selectedStream, setSelectedStream] = useState('MPC');
  const [selectedTest, setSelectedTest] = useState('JEE Main Mock Test - Week 1');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dynamically resolve metadata and student scores based on selected filter values
  const currentMetadata = TESTS_METADATA[selectedTest] || TESTS_METADATA['JEE Main Mock Test - Week 1'];
  
  const currentStudentsData = useMemo(() => {
    if (selectedStream === 'BIPC' || selectedTest.includes('NEET')) {
      return NEET_STUDENTS;
    }
    return JEE_STUDENTS;
  }, [selectedStream, selectedTest]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    return currentStudentsData.filter(student => {
      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesRoll = student.rollNo.includes(query);
        if (!matchesName && !matchesRoll) return false;
      }
      // Status filter
      if (selectedStatus !== 'All' && student.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [currentStudentsData, searchQuery, selectedStatus]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleTestChange = (testName: string) => {
    setSelectedTest(testName);
    const meta = TESTS_METADATA[testName];
    if (meta) {
      setSelectedClass(meta.grade);
      setSelectedStream(meta.stream);
    }
    setCurrentPage(1);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs font-bold text-amber-700 mx-auto shadow-sm">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 mx-auto shadow-sm">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs font-bold text-orange-700 mx-auto shadow-sm">
            3
          </div>
        );
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Top Navigation Back breadcrumb */}
      <button
        onClick={() => router.push('/admin/tests')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
      </button>

      {/* Header and Download Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Grades</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Excel download started...')}
            className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Excel
          </button>
          <button
            onClick={() => alert('PDF download started...')}
            className="flex items-center gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* ─── METADATA SUMMARY PANEL ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Test Name</p>
            <h3 className="text-lg font-bold text-[#0b1c3c] mt-0.5">{currentMetadata.name}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-sm flex-1 max-w-4xl">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.grade}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stream</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.stream}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Questions</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.questions}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Marks</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.totalMarks}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Test Date</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.date}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
            <p className="font-semibold text-gray-700 mt-1">{currentMetadata.duration}</p>
          </div>
        </div>
      </div>

      {/* ─── FILTERS BAR ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Class */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
          >
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>
        </div>

        {/* Stream */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => {
              setSelectedStream(e.target.value);
              const testKey = e.target.value === 'MPC' ? 'JEE Main Mock Test - Week 1' : 'NEET Mock Test - Week 1';
              setSelectedTest(testKey);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
          >
            <option value="MPC">MPC</option>
            <option value="BIPC">BIPC</option>
          </select>
        </div>

        {/* Test Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Test</label>
          <select
            value={selectedTest}
            onChange={(e) => handleTestChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
          >
            <option value="JEE Main Mock Test - Week 1">JEE Main Mock Test - Week 1</option>
            <option value="NEET Mock Test - Week 1">NEET Mock Test - Week 1</option>
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700"
          >
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Search */}
        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Search student...</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search student..."
              className="w-full border border-gray-200 rounded-xl pl-3 pr-9 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* ─── STUDENT PERFORMANCE TABLE ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/20">
          <h2 className="text-sm font-bold text-gray-800">Student Performance ({filteredStudents.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="px-6 py-4">S.No.</th>
                <th className="px-6 py-4">Roll No.</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Attempted On</th>
                <th className="px-6 py-4 text-center">Score (Marks)</th>
                <th className="px-6 py-4 text-center">Percentage (%)</th>
                <th className="px-6 py-4 text-center bg-green-50/30 text-green-600">Correct Answers</th>
                <th className="px-6 py-4 text-center bg-rose-50/30 text-rose-600">Incorrect Answers</th>
                <th className="px-6 py-4 text-center bg-slate-50 text-slate-500">Unattempted</th>
                <th className="px-6 py-4 text-center">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No student scores found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.sNo} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-bold">{student.sNo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{student.rollNo}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase',
                        student.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      )}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{student.attemptedOn}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#0b1c3c]">
                      {student.score} / {student.totalMarks}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">
                      {student.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center bg-green-50/10 font-bold text-green-600">
                      {student.correct}
                    </td>
                    <td className="px-6 py-4 text-center bg-rose-50/10 font-bold text-rose-600">
                      {student.incorrect}
                    </td>
                    <td className="px-6 py-4 text-center bg-slate-50/50 text-slate-500">
                      {student.unattempted}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getRankBadge(student.rank)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 text-xs text-gray-500">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all',
                    p === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
