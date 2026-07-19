'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Button, Input, Select, Badge, Modal, DataTable } from '@/components/ui/Primitives';
import { UserPlus, Search, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { UserWithProfile, Stream } from '@/types';

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [streamFilter, setStreamFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', rollNumber: '', phone: '', stream: 'MPC' as Stream,
    grade: '11', guardianContact: '', username: '', password: '',
  });
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<{ row: number; error: string }[]>([]);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: students, isLoading } = useQuery<UserWithProfile[]>({
    queryKey: ['admin-students', streamFilter, gradeFilter, activeFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (streamFilter) params.append('stream', streamFilter);
      if (gradeFilter) params.append('grade', gradeFilter);
      if (activeFilter) params.append('isActive', activeFilter);
      if (search) params.append('search', search);
      const res = await api.get(`/admin/students?${params.toString()}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        await api.put(`/admin/students/${editingId}`, form);
      } else {
        await api.post('/admin/students', form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', email: '', rollNumber: '', phone: '', stream: 'MPC', grade: '11', guardianContact: '', username: '', password: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/admin/students/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => { await api.patch(`/admin/students/${id}/toggle-active`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-students'] }),
  });

  const handleEdit = (student: UserWithProfile) => {
    setForm({
      name: student.name,
      email: student.email,
      rollNumber: student.studentProfile?.rollNumber || '',
      phone: student.studentProfile?.phone || '',
      stream: student.studentProfile?.stream || 'MPC',
      grade: student.studentProfile?.grade || '11',
      guardianContact: student.studentProfile?.guardianContact || '',
      username: student.username,
      password: '', // Leave empty unless changing
    });
    setEditingId(student.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Excel handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkErrors([]);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as any[];
      setBulkPreview(rows.slice(0, 10)); // Preview first 10
    };
    reader.readAsBinaryString(file);
  };

  const uploadBulk = async () => {
    if (!bulkFile) return;
    const formData = new FormData();
    formData.append('file', bulkFile);
    try {
      const res = await api.post('/admin/students/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResult(res.data);
      setBulkErrors(res.data.errors || []);
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    } catch (err: any) {
      setBulkErrors(err.response?.data?.errors || [{ row: 0, error: err.response?.data?.error || 'Upload failed' }]);
    }
  };

  const downloadTemplate = () => {
    const wsData = [
      { name: 'John Doe', email: 'john@example.com', rollNumber: 'MPC001', stream: 'MPC', grade: '11', phone: '9876543210', guardianContact: '9876543211', username: 'johndoe', password: 'temp123' }
    ];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_upload_template.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage student accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulk(true)}>
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={() => {
            setEditingId(null);
            setForm({ name: '', email: '', rollNumber: '', phone: '', stream: 'MPC', grade: '11', guardianContact: '', username: '', password: '' });
            setShowModal(true);
          }}>
            <UserPlus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center w-full">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
        </div>
        <div className="flex gap-4 flex-wrap">
          <Select value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)} options={[{ value: '', label: 'All Streams' }, { value: 'MPC', label: 'MPC' }, { value: 'BIPC', label: 'BIPC' }]} className="w-36" />
          <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} options={[{ value: '', label: 'All Classes' }, { value: '11', label: 'Class 11' }, { value: '12', label: 'Class 12' }]} className="w-36" />
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} options={[{ value: '', label: 'All Status' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} className="w-36" />
        </div>
      </div>

      <DataTable<UserWithProfile>
        data={students || []}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        columns={[
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium text-gray-900">{s.name}</span> },
          { key: 'rollNumber', header: 'Roll No.', render: (s) => <span className="text-gray-600">{s.studentProfile?.rollNumber}</span> },
          { key: 'email', header: 'Email', render: (s) => <span className="text-gray-500 text-xs">{s.email}</span> },
          { key: 'stream', header: 'Stream', render: (s) => <Badge variant="info">{s.studentProfile?.stream}</Badge> },
          { key: 'grade', header: 'Class', render: (s) => <span>{s.studentProfile?.grade || '—'}</span> },
          { key: 'status', header: 'Status / Actions', render: (s) => (
            <div className="flex items-center gap-3">
              <button onClick={() => toggleActive.mutate(s.id)}>
                <Badge variant={s.isActive ? 'success' : 'danger'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
              </button>
              <button onClick={() => handleEdit(s)} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                Edit
              </button>
              <button onClick={() => handleDelete(s.id)} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Delete
              </button>
            </div>
          )},
        ]}
      />

      {/* Add/Edit Student Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Student" : "Add Student"} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Stream" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value as Stream })} options={[{ value: 'MPC', label: 'MPC' }, { value: 'BIPC', label: 'BIPC' }]} />
          <Select label="Class" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} options={[{ value: '11', label: '11' }, { value: '12', label: '12' }]} />
          <Input label="Guardian Contact" value={form.guardianContact} onChange={(e) => setForm({ ...form, guardianContact: e.target.value })} />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label={editingId ? "Password (leave blank to keep current)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="col-span-2" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>{editingId ? "Save Changes" : "Create Student"}</Button>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal isOpen={showBulk} onClose={() => { setShowBulk(false); setBulkPreview([]); setBulkErrors([]); setBulkResult(null); }} title="Bulk Import Students" size="xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Upload an Excel (.xlsx) file with student data</p>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Download Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="text-sm text-gray-500">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              {bulkFile ? <span className="text-brand-600 font-medium">{bulkFile.name}</span> : 'Click to select Excel file'}
            </button>
          </div>

          {/* Preview */}
          {bulkPreview.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (first 10 rows)</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50">{Object.keys(bulkPreview[0]).map((k) => <th key={k} className="px-3 py-2 text-left font-medium text-gray-500">{k}</th>)}</tr></thead>
                  <tbody>{bulkPreview.map((row, i) => <tr key={i} className="border-t border-gray-50">{Object.values(row).map((v, j) => <td key={j} className="px-3 py-2">{String(v)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors */}
          {bulkErrors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Errors ({bulkErrors.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {bulkErrors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">Row {e.row}: {e.error}</p>
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {bulkResult && (
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">{bulkResult.message}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowBulk(false)}>Cancel</Button>
            <Button onClick={uploadBulk} disabled={!bulkFile}>Import Students</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
