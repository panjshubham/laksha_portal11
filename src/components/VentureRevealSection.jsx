import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function VentureRevealSection({ project, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    // We animate the card fading in as it scrolls into view
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 100 },
      {
        opacity: 1, 
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1
        }
      }
    );
  }, []);

  return (
    <section className="reveal-section min-h-screen flex flex-col md:flex-row items-center justify-center p-8 md:p-16 gap-12 relative z-10 pointer-events-none">
      <div 
        ref={cardRef} 
        className={`pointer-events-auto w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group hover:border-cyan-500/50 transition-colors duration-500 relative overflow-hidden ${index % 2 === 0 ? 'md:-translate-x-32' : 'md:translate-x-32'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <h4 className="text-sm font-bold tracking-[0.2em] text-cyan-300 uppercase mb-2">Stage {index + 1}</h4>
        <h3 className="text-3xl font-bold uppercase tracking-tighter mb-4 text-white">{project.name}</h3>
        <p className="text-[#B8D4E3] font-light leading-relaxed">{project.desc}</p>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-gray-400 group-hover:text-cyan-200 transition-colors">Explore Details</span>
          <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all text-xl font-light">→</span>
        </div>
      </div>
    </section>
  );
}
