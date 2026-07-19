'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Button, Input, Select, Badge, Modal } from '@/components/ui/Primitives';
import type { Resource } from '@/types';
import { Upload, BookOpen, FileQuestion, FileCheck, Download, Trash2 } from 'lucide-react';

const RESOURCE_LABELS: Record<string, string> = {
  BOOK: 'Reference Books',
  QUESTION_BANK: 'Question Banks',
  ANSWER_SCRIPT: 'Answer Scripts',
};

export default function AdminResourcesPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', subject: '', stream: '', type: 'BOOK' });
  const [file, setFile] = useState<File | null>(null);

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['resources', typeFilter, subjectFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      const res = await api.get(`/resources?${params.toString()}`);
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setShowUpload(false);
      setFile(null);
      setForm({ title: '', description: '', subject: '', stream: '', type: 'BOOK' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/resources/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 mt-1">Manage reference books, question banks, and answer scripts</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4" /> Upload Resource
        </Button>
      </div>

      <div className="flex justify-end gap-4 flex-wrap w-full">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: '', label: 'All Types' }, { value: 'BOOK', label: 'Reference Books' }, { value: 'QUESTION_BANK', label: 'Question Banks' }, { value: 'ANSWER_SCRIPT', label: 'Answer Scripts' }]} className="w-48" />
        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} options={[{ value: '', label: 'All Subjects' }, { value: 'MATHS', label: 'Mathematics' }, { value: 'PHYSICS', label: 'Physics' }, { value: 'CHEMISTRY', label: 'Chemistry' }, { value: 'BIOLOGY', label: 'Biology' }]} className="w-44" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources?.map((r, idx) => (
            <FloatingCard key={r.id} delay={idx * 0.3}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="default">{RESOURCE_LABELS[r.type] || r.type}</Badge>
                <button onClick={() => deleteMutation.mutate(r.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{r.title}</h3>
              {r.description && <p className="text-xs text-gray-500 mb-2">{r.description}</p>}
              <div className="flex gap-2 mb-3">
                <Badge variant="info">{r.subject}</Badge>
                <Badge>{r.stream}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  by {r.uploadedBy?.name} • {r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                </span>
                <a
                  href={r.fileUrl.startsWith('http') ? r.fileUrl : `${apiUrl}${r.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </FloatingCard>
          ))}
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Resource" size="md">
        <div className="space-y-4">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: 'BOOK', label: 'Reference Book' }, { value: 'QUESTION_BANK', label: 'Question Bank' }, { value: 'ANSWER_SCRIPT', label: 'Answer Script' }]} />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} options={[{ value: '', label: 'Select' }, { value: 'MATHS', label: 'Mathematics' }, { value: 'PHYSICS', label: 'Physics' }, { value: 'CHEMISTRY', label: 'Chemistry' }, { value: 'BIOLOGY', label: 'Biology' }]} />
          <Select label="Stream" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} options={[{ value: '', label: 'Select' }, { value: 'MPC', label: 'MPC' }, { value: 'BIPC', label: 'BIPC' }]} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">File</label>
            <input type="file" accept=".pdf,.jpg,.png,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={() => uploadMutation.mutate()} isLoading={uploadMutation.isPending} disabled={!file || !form.title || !form.subject || !form.stream}>Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
