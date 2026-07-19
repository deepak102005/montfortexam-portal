'use client';

import React, { useState } from 'react';
import { ArrowDownCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function TestInterface() {
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Generating fake data for question palette
  const questions = Array.from({ length: 90 }, (_, i) => ({
    id: i + 1,
    status: i === 0 ? 'answered-marked' : i === 1 ? 'not-answered' : i === 89 ? 'not-visited' : 'not-visited'
  }));

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-sm overflow-hidden">
      {/* Top Header */}
      <header className="flex justify-between items-center p-2 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder - Custom NTA Logo approximation */}
          <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-green-600 overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-orange-500"></div>
            </div>
            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a237e] tracking-tight leading-none uppercase">NATIONAL TESTING AGENCY</h1>
            <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 inline-block italic mt-1 shadow-sm">
              Excellence in Assessment
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex flex-col items-end">
             <div className="flex"><span className="w-24 text-right">Candidate Name</span><span className="mx-1">:</span><span className="text-orange-500 font-semibold">[Your Name]</span></div>
             <div className="flex"><span className="w-24 text-right">Subject Name</span><span className="mx-1">:</span><span className="text-orange-500 font-semibold">[Test Practice]</span></div>
             <div className="flex items-center mt-0.5"><span className="w-24 text-right">Remaining Time</span><span className="mx-1">:</span><span className="bg-[#3498db] text-white px-3 py-0.5 rounded-full ml-1 font-bold text-sm tracking-widest shadow-inner">02:59:39</span></div>
          </div>
          <div className="w-16 h-16 border border-gray-300 flex items-center justify-center text-gray-500 bg-gray-50 shrink-0 shadow-sm">
            <User size={32} />
          </div>
        </div>
      </header>

      {/* Sub Header / Orange Bar */}
      <div className="bg-[#f39c12] text-white flex items-center justify-between px-4 py-1.5 shrink-0">
        <div className="flex items-center">
          <span className="font-bold mr-6 text-lg uppercase tracking-wide">JEE MAIN</span>
          <div className="flex space-x-0.5">
            <button className="bg-[#2980b9] hover:bg-[#1f6391] text-white px-5 py-1.5 text-sm font-bold uppercase transition-colors">PHYSICS</button>
            <button className="bg-[#2980b9] hover:bg-[#1f6391] text-white px-5 py-1.5 text-sm font-bold uppercase transition-colors">CHEMISTRY</button>
            <button className="bg-[#2980b9] hover:bg-[#1f6391] text-white px-5 py-1.5 text-sm font-bold uppercase transition-colors">MATHEMATICS</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center text-white font-semibold">
             <span className="uppercase text-xs mr-2">Download Paper In:</span>
             <button className="bg-[#2980b9] hover:bg-[#1f6391] text-white px-3 py-1 rounded shadow-sm flex items-center gap-1.5 font-bold text-xs transition-colors border border-blue-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
               DOWNLOAD
             </button>
          </div>
          <div className="flex items-center">
            <span className="text-white font-semibold mr-2">Paper Language:</span>
            <select className="px-2 py-1 border border-gray-300 text-black text-sm bg-white shadow-sm outline-none rounded-sm">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Side (Question Area) */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Question Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
            <h2 className="font-bold text-lg text-black">Question 1:</h2>
            <button className="text-blue-600 hover:text-blue-800 transition-colors bg-white rounded-full">
              <ArrowDownCircle size={26} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Question Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 text-base text-gray-800">
            <div className="max-w-3xl">
              <p className="mb-6 leading-relaxed text-[15px] font-medium">
                The characteristic distance at which quantum gravitational effects are significant, the Planck length, can be determined from a suitable combination of the fundamental physical constants G, ℏ and c. Which of the following correctly gives the Planck length?
              </p>
              
              <div className="space-y-5 mt-8 pl-2">
                <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2 transition-colors">
                  <input type="radio" name="q1" id="opt1" className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="opt1" className="cursor-pointer text-[15px]">(1) <span className="ml-4 font-serif">G h² c³</span></label>
                </div>
                <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2 transition-colors">
                  <input type="radio" name="q1" id="opt2" className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="opt2" className="cursor-pointer text-[15px]">(2) <span className="ml-4 font-serif">G² h c</span></label>
                </div>
                <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2 transition-colors">
                  <input type="radio" name="q1" id="opt3" className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="opt3" className="cursor-pointer text-[15px]">(3) <span className="ml-4 font-serif">G² h² c</span></label>
                </div>
                <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2 transition-colors">
                  <input type="radio" name="q1" id="opt4" className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="opt4" className="cursor-pointer text-[15px]">(4) <span className="ml-4 font-serif">(G ℏ / c³)<sup>1/2</sup></span></label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 border-t border-gray-300 flex justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <button className="bg-[#27ae60] hover:bg-[#219653] text-white font-bold py-1.5 px-5 rounded shadow-sm transition-colors text-xs border border-[#219653]">
                SAVE & NEXT
              </button>
              <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white font-bold py-1.5 px-5 rounded shadow-sm transition-colors text-xs border border-[#e67e22]">
                SAVE & MARK FOR REVIEW
              </button>
              <button className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 font-bold py-1.5 px-5 rounded shadow-sm transition-colors text-xs">
                CLEAR RESPONSE
              </button>
              <button className="bg-[#2980b9] hover:bg-[#1f6391] text-white font-bold py-1.5 px-5 rounded shadow-sm transition-colors text-xs border border-[#1f6391]">
                MARK FOR REVIEW & NEXT
              </button>
            </div>
          </div>
          
          {/* Navigation Footer */}
          <div className="px-4 py-3 bg-[#f5f5f5] border-t border-gray-300 flex justify-between items-center text-sm">
            <div className="flex gap-2">
              <button className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 font-bold py-1.5 px-5 shadow-sm transition-colors text-xs">
                {'<< BACK'}
              </button>
              <button className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 font-bold py-1.5 px-5 shadow-sm transition-colors text-xs">
                {'NEXT >>'}
              </button>
            </div>
            <button className="bg-[#27ae60] hover:bg-[#219653] text-white font-bold py-2 px-8 shadow-sm transition-colors text-sm border border-[#219653]">
              SUBMIT
            </button>
          </div>
        </div>

        {/* Collapser Button */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white p-1 rounded-l cursor-pointer z-10 transition-all border border-black shadow-md flex items-center justify-center h-12 w-5"
          style={{ right: rightPanelOpen ? '340px' : '0' }}
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
        >
          {rightPanelOpen ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
        </div>

        {/* Right Side (Status & Navigation) */}
        {rightPanelOpen && (
          <div className="w-[340px] bg-[#e1f0fa] flex flex-col shrink-0 border-l border-gray-300">
            {/* Status Legend */}
            <div className="bg-white">
              <div className="p-3 grid grid-cols-2 gap-y-3 gap-x-1 text-[11px] font-medium border-b border-gray-300 text-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-7 bg-gray-100 border border-gray-400 text-center leading-7 text-black font-semibold shadow-sm">89</div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-7 bg-[#e74c3c] text-white flex items-center justify-center font-semibold shadow-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)'}}>
                    1
                  </div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-7 bg-[#27ae60] text-white flex items-center justify-center font-semibold shadow-sm" style={{ clipPath: 'polygon(50% 0%, 100% 30%, 100% 100%, 0 100%, 0 30%)'}}>
                    0
                  </div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 bg-[#8e44ad] text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
                    0
                  </div>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-start gap-1.5 col-span-2 mt-1">
                  <div className="w-8 h-8 bg-[#8e44ad] text-white rounded-full flex items-center justify-center font-semibold relative shrink-0 shadow-sm">
                    0
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#27ae60] rounded-full border border-white translate-x-[1px] translate-y-[1px]"></div>
                  </div>
                  <span className="leading-tight pt-1">Answered & Marked for Review (will be considered for evaluation)</span>
                </div>
              </div>
            </div>

            {/* Question Palette Header */}
            <div className="bg-[#2980b9] text-white font-bold px-3 py-1.5 text-sm uppercase">
              PHYSICS
            </div>

            {/* Question Palette Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-5 gap-y-3 gap-x-2">
                {questions.map((q) => {
                  let badgeStyles = {};
                  let badgeClass = "flex items-center justify-center text-[13px] font-bold cursor-pointer hover:opacity-90 transition-opacity ";
                  let wrapperClass = "flex justify-center items-center h-[40px] w-[46px] relative";
                  
                  if (q.status === 'not-visited') {
                    badgeClass += "w-[40px] h-[32px] bg-white border border-gray-400 text-gray-800 shadow-sm";
                  } else if (q.status === 'not-answered') {
                    badgeClass += "w-[40px] h-[34px] bg-[#e74c3c] text-white shadow-sm pt-0.5";
                    badgeStyles = { clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)'};
                  } else if (q.status === 'answered') {
                    badgeClass += "w-[40px] h-[34px] bg-[#27ae60] text-white shadow-sm pb-0.5";
                    badgeStyles = { clipPath: 'polygon(50% 0%, 100% 25%, 100% 100%, 0 100%, 0 25%)'};
                  } else if (q.status === 'marked' || q.status === 'answered-marked') {
                    badgeClass += "w-[38px] h-[38px] bg-[#8e44ad] text-white rounded-full shadow-sm";
                  }

                  return (
                    <div key={q.id} className={wrapperClass}>
                      <div className={badgeClass} style={badgeStyles}>
                        {String(q.id).padStart(2, '0')}
                      </div>
                      {q.status === 'answered-marked' && (
                        <div className="absolute bottom-[1px] right-[4px] w-[12px] h-[12px] bg-[#27ae60] rounded-full border-2 border-white z-10"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Simple styling for the scrollbar to make it look nicer if desired */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3); 
        }
      `}} />
    </div>
  );
}
