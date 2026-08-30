import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero3D from './components/Hero3D.jsx';
import ConceptSection from './components/ConceptSection.jsx';
import VentureRevealSection from './components/VentureRevealSection.jsx';
import Footer from './components/Footer.jsx';
import SoundToggle from './components/SoundToggle.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { id: 'd0', name: 'D0 Validation', desc: 'Impact evaluation & strategic alignment check.' },
  { id: 'd1', name: 'D1 Score Matrix', desc: 'Detailed benefit assessment & implementation effort.' },
  { id: 'd2', name: 'D2 Signoff', desc: 'Final gate approval & resource allocation.' },
  { id: 'd3', name: 'D3 Implementation', desc: 'Milestone tracking & real-time delivery metrics.' },
  { id: 'd4', name: 'D4 Completed', desc: 'Post-implementation review & final value sign-off.' }
];

export default function App() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(-1);

  useEffect(() => {
    // ScrollTrigger to rotate the 3D igloo based on scroll
    // The igloo is inside Hero3D, but ScrollTrigger can animate anything.
    // However, since it's an R3F canvas, GSAP can't easily animate the React state directly without context/refs passing.
    // For simplicity, we'll listen to scroll events and pass it to a global store or just use normal DOM GSAP if we exported a DOM element.
    // A better approach: We just let ScrollTrigger animate dummy DOM elements and update state, OR we pin the 3D canvas and animate the `igloo-scene-group` using a custom hook. 
    
    // Animate sections
    const sections = gsap.utils.toArray('.reveal-section');
    sections.forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(i),
        onEnterBack: () => setActiveSection(i),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0A0B0D] text-[#E8F0F5] min-h-screen font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Fixed UI Elements */}
      <SoundToggle />
      <Breadcrumb activeSection={activeSection} total={projects.length} />

      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Hero3D />
      </div>

      {/* Scrollable Content Layers */}
      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="h-screen flex flex-col justify-between p-8 md:p-16">
          <div className="flex justify-between items-start">
            <h1 className="font-bold text-2xl tracking-widest uppercase">LAKSHYA</h1>
            <p className="text-sm tracking-widest uppercase text-[#B8D4E3]">System Access 2026</p>
          </div>
          <div className="text-center md:text-left self-center md:self-auto mt-auto mb-32">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-300">
              Innovation<br/>Workflow Portal
            </h2>
            <p className="max-w-md text-[#B8D4E3] mb-8 font-light tracking-wide">
              Re-freezing hype into real, delivered products. 
            </p>
            <button className="relative overflow-hidden group border border-[#B8D4E3]/30 px-8 py-3 rounded-full uppercase tracking-widest text-sm hover:border-[#B8D4E3] transition-colors bg-[#0A0B0D]/50 backdrop-blur-md">
              <span className="relative z-10">Enter Ecosystem</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            </button>
          </div>
        </section>

        {/* Concept Section */}
        <ConceptSection />

        {/* Venture Reveal Sections */}
        {projects.map((proj, i) => (
          <VentureRevealSection key={proj.id} project={proj} index={i} />
        ))}

        {/* Footer CTA */}
        <section className="min-h-screen flex items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-[#050507]">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold uppercase tracking-tighter mb-6">Ready to Realize Value?</h2>
            <p className="text-[#B8D4E3] mb-8">Join the pipeline and help shape the next generation of our ecosystem.</p>
            <button className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              Submit Idea
            </button>
          </div>
        </section>
        
        <Footer />
      </main>
    </div>
  );
}
