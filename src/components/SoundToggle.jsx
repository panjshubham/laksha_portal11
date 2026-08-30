import React, { useState } from 'react';

export default function SoundToggle() {
  const [muted, setMuted] = useState(true);

  return (
    <button 
      onClick={() => setMuted(!muted)}
      className="fixed bottom-8 left-8 z-50 mix-blend-difference flex items-center gap-2 font-bold text-[10px] tracking-widest uppercase text-white/50 hover:text-white transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationPlayState: muted ? 'paused' : 'running' }}></span>
      {muted ? '[ Audio: OFF ]' : '[ Audio: ON ]'}
    </button>
  );
}
