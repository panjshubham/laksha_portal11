import React from 'react';

export default function ConceptSection() {
  return (
    <section className="min-h-screen flex items-center justify-center p-8 md:p-16 relative">
      <div className="max-w-3xl text-center">
        <h3 className="text-sm tracking-[0.3em] uppercase text-cyan-300 mb-6 font-bold">The Metaphor</h3>
        <p className="text-2xl md:text-4xl font-light leading-relaxed text-[#E8F0F5]">
          Like an iceberg, <strong className="font-bold text-white">true value lies beneath the surface.</strong> 
          <br /><br />
          We take the raw hype of ideation and <span className="italic text-cyan-200">re-freeze</span> it into tangible, monolithic systems. One single shard hides countless ventures, waiting to be revealed as you descend into the depths.
        </p>
      </div>
    </section>
  );
}
