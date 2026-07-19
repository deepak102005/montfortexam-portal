'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Eye, List, LayoutGrid, RefreshCw, MoreVertical,
  FileText, Calendar, Check, Search, Trash2, ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface Test {
  id: string;
  title: string;
  subtitle: string;
  subject: string;
  stream: string;
  grade: string;
  createdBy: { name: string; role: string };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  duration: number;
  totalMarks: number;
  accessCode: string;
}

export default function AdminTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterType, setFilterType] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All Subjects');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTests() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend model to frontend expected model if needed
          const mapped = data.map((t: any) => ({
             ...t,
             subtitle: t.stream === 'BIPC' ? 'NEET Pattern' : 'JEE Pattern',
             subject: t.stream === 'BIPC' ? 'Biology' : 'Mathematics', // default placeholder
             createdBy: t.createdBy || { name: 'Admin', role: 'Teacher' }
          }));
          setTests(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch tests', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      // type is inferred from stream for now
      const tType = test.stream === 'BIPC' ? 'NEET' : 'JEE';
      if (filterType !== 'All' && tType !== filterType) return false;
      if (filterSubject !== 'All Subjects' && test.subject !== filterSubject) return false;
      if (filterClass !== 'All Classes' && test.grade !== filterClass) return false;
      
      const statusMap: any = { 'DRAFT': 'Draft', 'PUBLISHED': 'Published' };
      const friendlyStatus = statusMap[test.status] || 'Draft';
      if (filterStatus !== 'All Status' && friendlyStatus !== filterStatus) return false;
      
      return true;
    });
  }, [tests, filterType, filterSubject, filterClass, filterStatus]);

  const resetFilters = () => {
    setFilterType('All');
    setFilterSubject('All Subjects');
    setFilterClass('All Classes');
    setFilterStatus('All Status');
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return 'text-blue-600 bg-blue-50';
      case 'Physics': return 'text-green-600 bg-green-50';
      case 'Chemistry': return 'text-purple-600 bg-purple-50';
      case 'Biology': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">Draft</span>;
      case 'PUBLISHED':
        return <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">Published</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const getSubjectIconColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return 'bg-blue-100 text-blue-600';
      case 'Physics': return 'bg-green-100 text-green-600';
      case 'Chemistry': return 'bg-purple-100 text-purple-600';
      case 'Biology': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      // In real app, call DELETE /admin/tests/:id here
      setTests(prev => prev.filter(t => t.id !== id));
      setOpenMenuId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and publish tests created by teachers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/tests/create')}
            className="flex items-center gap-2 bg-[#0b1c3c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/10"
          >
            <Plus className="w-4 h-4" /> Create Test
          </button>
          <button
            onClick={() => router.push('/admin/grades')}
            className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            <Eye className="w-4 h-4 text-gray-400" /> Review &amp; Publish
          </button>
        </div>
      </div>

      {/* Main Grid: Filters on Left, Test List/Grid on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Filters Card */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>

          {/* Test Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Test Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Subjects">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Classes">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>

        {/* Right Column: Content Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Subheader Toolbar */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-700">All Tests ({filteredTests.length})</h2>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List className="w-3.5 h-3.5" /> List View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid View
              </button>
            </div>
          </div>

          {/* Tests Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mb-3 stroke-[1.5] text-gray-300" />
              <p className="text-sm">No tests found matching the selected filters.</p>
            </div>
          ) : viewMode === 'list' ? (
            /* ─────────────────────────────────────────────────────────
                SCREEN 1: LIST VIEW
            ───────────────────────────────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="px-6 py-4">Test Title</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Created By</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50/40 transition-colors group">
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', getSubjectIconColor(test.subject))}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{test.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{test.subtitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <span className={clsx('px-2.5 py-1 rounded-md text-xs font-semibold', getSubjectColor(test.subject))}>
                          {test.subject}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 font-medium text-gray-700">Class {test.grade}</td>

                      {/* Created By */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{test.createdBy.name}</p>
                        <p className="text-xs text-gray-400">{test.createdBy.role}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">{getStatusBadge(test.status)}</td>

                      {/* Actions Menu */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === test.id ? null : test.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === test.id && (
                          <div
                            className="absolute right-6 top-12 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 text-left"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <button
                              onClick={() => router.push(`/admin/tests/${test.id}/review`)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 text-gray-400" /> Review Test
                            </button>
                            <button
                              onClick={() => router.push(`/admin/tests/${test.id}/answer-key`)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Check className="w-4 h-4 text-gray-400" /> Set Answer Key
                            </button>
                            <button
                              onClick={() => router.push(`/admin/tests/${test.id}/publish`)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                            >
                              <ArrowRight className="w-4 h-4 text-emerald-500" /> Publish Settings
                            </button>
                            <div className="h-px bg-gray-100 my-1" />
                            <button
                              onClick={() => handleDelete(test.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────
                SCREEN 2: GRID VIEW
            ───────────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between h-[210px]">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', getSubjectIconColor(test.subject))}>
                        <FileText className="w-4 h-4" />
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-0.5">{test.title}</h3>
                    <span className={clsx('inline-block text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-0.5 rounded', getSubjectColor(test.subject))}>
                      {test.subject}
                    </span>
                    <p className="text-xs text-gray-400 mb-3">{test.subtitle} · Class {test.grade}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-gray-50 pt-3 text-xs text-gray-500 mt-auto">
                    <div>
                      <p className="font-semibold text-gray-700">{test.createdBy.name}</p>
                      <p className="text-[10px] text-gray-400">{test.createdBy.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/tests/${test.id}/review`)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Review
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => router.push(`/admin/tests/${test.id}/publish`)}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredTests.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 text-xs text-gray-500">
              <span>Showing 1 to {filteredTests.length} of {filteredTests.length} tests</span>
              <div className="flex items-center gap-1.5">
                <button disabled className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center opacity-40">‹</button>
                <button className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">1</button>
                <button disabled className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center opacity-40">›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
