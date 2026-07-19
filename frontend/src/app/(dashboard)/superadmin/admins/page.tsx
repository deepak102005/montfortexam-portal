'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { Button, Input, DataTable } from '@/components/ui/Primitives';
import { PlusCircle, Loader2 } from 'lucide-react';
import { User } from '@/types';

export default function ManageAdminsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const { data: admins, isLoading } = useQuery<User[]>({
    queryKey: ['superadmin', 'admins'],
    queryFn: async () => {
      const res = await api.get('/superadmin/admins');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/superadmin/admins', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'admins'] });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', username: '', password: '' });
      alert('Admin created successfully');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to create admin');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns: any = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'username', header: 'Username' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (val: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Admins</h1>
          <p className="text-gray-500">Create and oversee system administrators</p>
        </header>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Create Admin
        </Button>
      </div>

      <FloatingCard className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <DataTable columns={columns} data={admins || []} keyExtractor={(admin) => admin.id} />
        )}
      </FloatingCard>

      {/* Basic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  required 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="e.g. john@college.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input 
                  required 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  placeholder="e.g. johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input 
                  required 
                  type="password"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="Enter a secure password"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
