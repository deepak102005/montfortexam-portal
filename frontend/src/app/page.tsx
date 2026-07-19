'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, BookOpen, GraduationCap, Trophy, Pencil } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        const roleRoutes: Record<string, string> = {
          STUDENT: '/student',
          ADMIN: '/admin',
        };
        router.replace(roleRoutes[parsed.role] || '/login');
      } catch {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ddeeff]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0b1c3c] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex relative overflow-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #b8d9f5 0%, #d6eafc 100%)' }}
    >
      {/* ── LEFT: Painting ── */}
      <div className="relative w-1/2 min-h-screen flex-shrink-0">
        {/* The painting fills the left half; it bleeds into the right via the wave */}
        <Image
          src="/hero.png"
          alt="Monfortians History"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Right-side wave cut — white blob that sweeps from the right edge */}
        <div className="absolute inset-y-0 right-0 w-32 pointer-events-none" style={{ zIndex: 2 }}>
          <svg
            viewBox="0 0 100 900"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M100,0 C60,150 60,350 100,450 C60,550 60,750 100,900 L100,900 L100,0 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* ── RIGHT: White Panel ── */}
      <div className="relative flex-1 min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center overflow-hidden">

        {/* Faint background icons */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] text-[#0b1c3c]">
          <GraduationCap className="absolute top-12 right-16 w-16 h-16 rotate-12" />
          <Trophy className="absolute top-1/3 right-8 w-12 h-12 -rotate-6" />
          <BookOpen className="absolute bottom-1/3 right-20 w-14 h-14 rotate-6" />
          <Pencil className="absolute bottom-20 right-12 w-12 h-12 -rotate-12" />
          {/* dot grids */}
          <div className="absolute top-20 left-8 grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-current rounded-full" />)}
          </div>
          <div className="absolute bottom-24 right-8 grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => <div key={`r${i}`} className="w-1.5 h-1.5 bg-current rounded-full" />)}
          </div>
        </div>

        {/* Logo circle */}
        <div className="mb-6 relative z-10">
          <div className="bg-white rounded-full shadow-[0_6px_30px_rgba(0,0,0,0.10)] flex items-center justify-center h-24 w-24">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-serif font-bold text-[#0b1c3c] mb-3 tracking-tight relative z-10">
          Monfortians
        </h1>

        {/* Diamond Divider */}
        <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
          <div className="h-px bg-gray-300 w-20" />
          <div className="w-2 h-2 rotate-45 bg-[#3b5998]" />
          <div className="h-px bg-gray-300 w-20" />
        </div>

        {/* Subtitle */}
        <p className="text-[#4a5568] text-lg font-medium mb-10 relative z-10">
          Competitive Examination Platform
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/login')}
          className="relative z-10 bg-[#0b1c3c] text-white px-10 py-4 rounded-xl text-lg font-semibold flex items-center gap-4 hover:bg-[#07132a] transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[#0b1c3c]/25"
        >
          <ArrowRight className="w-5 h-5" />
          Get started
        </button>

        {/* Bottom waves inside the right panel */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0">
          <svg viewBox="0 0 600 120" className="w-full h-auto text-[#ddeeff]" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,60 C150,120 450,0 600,60 L600,120 L0,120 Z" />
          </svg>
          <svg viewBox="0 0 600 120" className="w-full h-auto absolute bottom-0 text-[#c4ddf7] opacity-60" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,80 C100,20 500,110 600,50 L600,120 L0,120 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
