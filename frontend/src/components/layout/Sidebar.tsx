'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth';
import {
  Home,
  BookOpen,
  FileText,
  BarChart3,
  FolderOpen,
  Users,
  GraduationCap,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: { label: string; href: string }[];
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: 'Home', href: '/student', icon: <Home className="w-5 h-5" /> },
    { label: 'Subjects', href: '/student/subjects', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Tests', href: '/student/tests', icon: <FileText className="w-5 h-5" /> },
    { label: 'Reports', href: '/student/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Resources', href: '/student/resources', icon: <FolderOpen className="w-5 h-5" /> },
  ],
  ADMIN: [
    { label: 'Home', href: '/admin', icon: <Home className="w-5 h-5" /> },
    { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Attendance', href: '/admin/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Grades', href: '/admin/grades', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Resources', href: '/admin/resources', icon: <FolderOpen className="w-5 h-5" /> },
    {
      label: 'Tests',
      href: '/admin/tests',
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { label: 'All Tests', href: '/admin/tests' },
        { label: 'Create Test', href: '/admin/tests/create' },
        { label: 'Answer Key', href: '/admin/tests/sample-test-1/answer-key' },
        { label: 'Review & Publish', href: '/admin/tests/sample-test-1/review' },
      ],
    },
  ],
  SUPER_ADMIN: [
    { label: 'Home', href: '/superadmin', icon: <Home className="w-5 h-5" /> },
    { label: 'Admins', href: '/superadmin/admins', icon: <Users className="w-5 h-5" /> },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({ Tests: true });

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || [];

  const isActive = (href: string) => {
    if (href === `/${user.role.toLowerCase()}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        'h-[calc(100vh-57px)] sticky top-[57px]',
        'bg-white/60 backdrop-blur-md border-r border-gray-100/80',
        'transition-all duration-300 ease-out',
        'flex flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const hasSubItems = !!item.subItems;
          const isOpen = openDropdowns[item.label];
          const active = isActive(item.href) || (hasSubItems && item.subItems?.some(sub => pathname === sub.href));

          return (
            <div key={item.label} className="space-y-1">
              {hasSubItems ? (
                <button
                  onClick={() => setOpenDropdowns(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200',
                    'group relative text-left',
                    active
                      ? 'bg-brand-50 text-brand-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-3">
                    <span className={clsx(active ? 'text-brand-700' : 'text-gray-400 group-hover:text-gray-600')}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    'group relative',
                    active
                      ? 'bg-brand-50 text-brand-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-r-full" />
                  )}

                  <span className={clsx(active ? 'text-brand-700' : 'text-gray-400 group-hover:text-gray-600')}>
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="text-sm whitespace-nowrap">{item.label}</span>
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}

              {/* Sub-items rendering */}
              {hasSubItems && isOpen && !collapsed && (
                <div className="pl-9 space-y-1">
                  {item.subItems.map((sub) => {
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={clsx(
                          'block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                          subActive
                            ? 'bg-brand-100 text-brand-900 font-semibold'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                        )}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Stream badge */}
      {!collapsed && user.stream && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              user.stream === 'MPC' ? 'bg-blue-500' : 'bg-teal-500'
            )} />
            <span className="text-xs font-medium text-gray-600">
              {user.stream} Stream
            </span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
