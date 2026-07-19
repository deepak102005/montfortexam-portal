'use client';

import React from 'react';

/**
 * FloatingOrbs — decorative background element for the anti-gravity motif.
 * Renders 4 low-opacity radial gradient blobs drifting slowly behind content.
 * Pure CSS animation — no JavaScript overhead.
 */
export default function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
      {/* Primary brand orb — top right */}
      <div
        className="animate-orb absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(62, 98, 168, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Physics violet orb — bottom left */}
      <div
        className="animate-orb-reverse absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Chemistry green orb — center right */}
      <div
        className="animate-orb absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.35) 0%, transparent 70%)',
          animationDelay: '5s',
          animationDuration: '30s',
        }}
      />

      {/* Maths blue orb — top left */}
      <div
        className="animate-orb-reverse absolute top-1/4 left-1/6 w-80 h-80 rounded-full opacity-12"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          animationDelay: '8s',
          animationDuration: '28s',
        }}
      />
    </div>
  );
}
