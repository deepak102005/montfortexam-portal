'use client';

import React from 'react';
import { clsx } from 'clsx';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'header' | 'nav' | 'aside' | 'section';
  dark?: boolean;
}

export default function GlassPanel({
  children,
  className,
  as: Tag = 'div',
  dark = false,
}: GlassPanelProps) {
  return (
    <Tag
      className={clsx(
        'rounded-2xl',
        dark
          ? 'bg-slate-900/70 backdrop-blur-md border border-white/10'
          : 'bg-white/70 backdrop-blur-md border border-white/20',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
        className
      )}
    >
      {children}
    </Tag>
  );
}
