import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/30 bg-[#050507]">
      <div>© 2026 Lakshya Innovation System</div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">Admin Console</a>
      </div>
    </footer>
  );
}
