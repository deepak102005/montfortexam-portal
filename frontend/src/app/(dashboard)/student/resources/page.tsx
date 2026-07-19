'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Badge, Button, Select } from '@/components/ui/Primitives';
import type { Resource, Subject } from '@/types';
import { BookOpen, FileQuestion, FileCheck, Download, ExternalLink } from 'lucide-react';

const RESOURCE_ICONS = {
  BOOK: <BookOpen className="w-5 h-5" />,
  QUESTION_BANK: <FileQuestion className="w-5 h-5" />,
  ANSWER_SCRIPT: <FileCheck className="w-5 h-5" />,
};

const RESOURCE_LABELS = {
  BOOK: 'Reference Books',
  QUESTION_BANK: 'Question Banks',
  ANSWER_SCRIPT: 'Answer Scripts',
};

export default function StudentResourcesPage() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  const [subjectFilter, setSubjectFilter] = useState(initialSubject);
  const [typeFilter, setTypeFilter] = useState('');

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['resources', subjectFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subjectFilter) params.append('subject', subjectFilter);
      if (typeFilter) params.append('type', typeFilter);
      const res = await api.get(`/resources?${params.toString()}`);
      return res.data;
    },
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">Reference materials, question banks, and answer scripts</p>
      </div>

      {/* Filters */}
      <div className="flex justify-end gap-4 flex-wrap w-full">
        <Select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={[
            { value: '', label: 'All Subjects' },
            { value: 'MATHS', label: 'Mathematics' },
            { value: 'PHYSICS', label: 'Physics' },
            { value: 'CHEMISTRY', label: 'Chemistry' },
            { value: 'BIOLOGY', label: 'Biology' },
          ]}
          className="w-44"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'BOOK', label: 'Reference Books' },
            { value: 'QUESTION_BANK', label: 'Question Banks' },
            { value: 'ANSWER_SCRIPT', label: 'Answer Scripts' },
          ]}
          className="w-48"
        />
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-200 border-t-brand-800 rounded-full" />
        </div>
      ) : !resources || resources.length === 0 ? (
        <FloatingCard>
          <p className="text-center text-gray-400 py-8">No resources found</p>
        </FloatingCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, idx) => (
            <FloatingCard key={resource.id} delay={idx * 0.2}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-600">
                  {RESOURCE_ICONS[resource.type]}
                </span>
                <Badge variant="default">{RESOURCE_LABELS[resource.type]}</Badge>
              </div>

              <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
              {resource.description && (
                <p className="text-xs text-gray-500 mb-3">{resource.description}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="info">{resource.subject}</Badge>
                <Badge>{resource.stream}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
                </span>
                <a
                  href={resource.fileUrl.startsWith('http') ? resource.fileUrl : `${apiUrl}${resource.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </FloatingCard>
          ))}
        </div>
      )}
    </div>
  );
}
