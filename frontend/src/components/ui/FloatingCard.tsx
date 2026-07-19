'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;        // Stagger delay in seconds (0, 0.8, 1.6, 2.4...)
  hoverLift?: boolean;   // Enable hover lift effect (default true)
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

const entranceVariants = (delay: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay,
    },
  },
});

const componentsCache = {
  div: motion.create('div'),
  article: motion.create('article'),
  section: motion.create('section'),
};

export default function FloatingCard({
  children,
  className,
  delay = 0,
  hoverLift = true,
  onClick,
  as = 'div',
}: FloatingCardProps) {
  const Component = componentsCache[as];

  return (
    <Component
      variants={entranceVariants(delay)}
      initial="hidden"
      animate="visible"
      whileHover={
        hoverLift
          ? {
              y: -4,
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={clsx(
        'rounded-2xl bg-white p-6',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]',
        'border border-gray-100/60',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  );
}
