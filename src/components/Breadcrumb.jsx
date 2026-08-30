import React from 'react';

export default function Breadcrumb({ activeSection, total }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 pointer-events-none mix-blend-difference hidden md:flex">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          className={`w-1.5 rounded-full transition-all duration-500 ${activeSection === i ? 'h-8 bg-cyan-400' : 'h-2 bg-white/30'}`}
        />
      ))}
    </div>
  );
}
