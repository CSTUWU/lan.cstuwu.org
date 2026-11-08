'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Shield, Target, Cpu, Crosshair, Award, Zap, Radio, Terminal } from 'lucide-react';
import Badge from '../ui/Badge';

export default function CommanderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'vector' | 'reaper'>('vector');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate cards on scroll reveal
      gsap.from('.commander-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      });

      // Animate tactical stat bars
      gsap.from('.stat-bar-fill', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        },
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="commanders"
      ref={containerRef}
      className="relative py-28 bg-[#090D14] border-t border-b border-tactical-border overflow-hidden"
    >
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-cyan" />
            <Badge variant="cyan" size="sm">TACTICAL OPERATORS // CLASSIFIED</Badge>
            <span className="w-8 h-[2px] bg-orange" />
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight uppercase text-white mb-4">
            CHOOSE YOUR <span className="text-cyan">FACTION</span> & <span className="text-orange">COMMAND</span>
          </h2>
          <p className="text-sm sm:text-base text-secondaryText font-mono leading-relaxed">
            Every round in Counter-Strike 2 is decided by decisive leadership, flawless communication, and calculated execution. Meet the two battlefield commanders of CST LAN Challenge 2026.
          </p>

          <div className="flex md:hidden justify-center gap-3 mt-6">
            <button
              onClick={() => setActiveTab('vector')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase clip-tactical border ${
                activeTab === 'vector'
                  ? 'bg-cyan text-background border-cyan shadow-[0_0_15px_rgba(0,213,255,0.4)]'
                  : 'bg-surface text-secondaryText border-tactical-border'
              }`}
            >
              VECTOR [CT]
            </button>
            <button
              onClick={() => setActiveTab('reaper')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase clip-tactical border ${
                activeTab === 'reaper'
                  ? 'bg-orange text-background border-orange shadow-[0_0_15px_rgba(255,116,56,0.4)]'
                  : 'bg-surface text-secondaryText border-tactical-border'
              }`}
            >
              REAPER [T]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          <div
            className={`commander-card relative bg-[#0C131B] border border-cyan/40 p-6 lg:p-8 backdrop-blur-md rounded-none transition-all duration-500 hover:border-cyan hover:shadow-[0_0_40px_rgba(0,213,255,0.25)] ${
              activeTab === 'vector' ? 'block' : 'hidden md:block'
            }`}
          >
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan" />

            <div className="flex items-center justify-between border-b border-cyan/20 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-cyan" />
                <span className="font-mono text-xs font-bold text-cyan uppercase tracking-widest">
                  COUNTER-TERRORIST COMMAND
                </span>
              </div>
              <span className="font-mono text-[10px] text-cyan/70 px-2 py-0.5 bg-cyan/10 border border-cyan/30">
                CALLSIGN: V3CT0R
              </span>
            </div>

            <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] overflow-hidden mb-6 border border-cyan/30 bg-surface">
              <Image
                src="/images/commanders/vector.jpeg"
                alt="Commander Vector - CT Team Commander"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700 filter brightness-95"
                sizes="(max-width: 768px) 100vw, 550px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C131B] via-transparent to-transparent opacity-90" />
              
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-cyan/40 p-2.5 text-[10px] font-mono text-secondaryText space-y-1">
                <div className="text-cyan font-bold">TACTICAL HUD V4.8</div>
                <div>OPTICS: QUANTUM HUD</div>
                <div>MAP AWARENESS: 99.4%</div>
                <div>DEFUSAL CADENCE: 4.8s</div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[11px] font-mono text-cyan uppercase tracking-widest">
                  SECTOR DEFENSE ARCHITECT
                </div>
                <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider">
                  COMMANDER VECTOR
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed mb-6 font-mono">
              Vector anchors the Counter-Terrorist defensive matrix with calm precision. Utilizing real-time drone reconnaissance, sub-tick synchronized utility lineups, and holographic site fortifications, Vector transforms every bomb site into an impenetrable tactical stronghold.
            </p>

            <div className="space-y-3 font-mono text-xs border-t border-tactical-border pt-4">
              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>SITE RETAKE EFFICIENCY</span>
                  <span className="text-cyan font-bold">96%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-cyan shadow-[0_0_8px_#00D5FF]" style={{ width: '96%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>UTILITY DEPLOYMENT ACCURACY</span>
                  <span className="text-cyan font-bold">94%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-cyan shadow-[0_0_8px_#00D5FF]" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>CROSSHAIR PLACEMENT & FIRST BULLET ACCURACY</span>
                  <span className="text-cyan font-bold">92%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-cyan shadow-[0_0_8px_#00D5FF]" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-tactical-border flex items-center justify-between text-[11px] font-mono text-secondaryText">
              <span className="text-white font-semibold">PREFERRED ARSENAL:</span>
              <span className="text-cyan">M4A1-S • USP-S • INCENDIARY • DEFUSAL KIT</span>
            </div>
          </div>


          <div
            className={`commander-card relative bg-[#130E0D] border border-orange/40 p-6 lg:p-8 backdrop-blur-md rounded-none transition-all duration-500 hover:border-orange hover:shadow-[0_0_40px_rgba(255,116,56,0.25)] ${
              activeTab === 'reaper' ? 'block' : 'hidden md:block'
            }`}
          >
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-orange" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-orange" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-orange" />

            <div className="flex items-center justify-between border-b border-orange/20 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-orange" />
                <span className="font-mono text-xs font-bold text-orange uppercase tracking-widest">
                  TERRORIST ASSAULT DIVISION
                </span>
              </div>
              <span className="font-mono text-[10px] text-orange/70 px-2 py-0.5 bg-orange/10 border border-orange/30">
                CALLSIGN: R34PER
              </span>
            </div>

            <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] overflow-hidden mb-6 border border-orange/30 bg-surface">
              <Image
                src="/images/commanders/reaper.jpeg"
                alt="Commander Reaper - T Team Commander"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700 filter brightness-95"
                sizes="(max-width: 768px) 100vw, 550px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130E0D] via-transparent to-transparent opacity-90" />
              
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-orange/40 p-2.5 text-[10px] font-mono text-secondaryText space-y-1">
                <div className="text-orange font-bold">TACTICAL HUD V4.8</div>
                <div>AGGRESSION INDEX: MAX</div>
                <div>ENTRY FRAG RATE: 98.7%</div>
                <div>BOMB PLANT SUCCESS: 95.2%</div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[11px] font-mono text-orange uppercase tracking-widest">
                  FRONTLINE ASSAULT SPECIALIST
                </div>
                <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider">
                  COMMANDER REAPER
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed mb-6 font-mono">
              Reaper commands the frontline with explosive aggression and unyielding trigger discipline. A veteran of brutal urban close-quarters warfare, Reaper is renowned for cracking defensive chokepoints, executing synchronized smoke walls, and delivering cold-blooded clutch victories.
            </p>

            <div className="space-y-3 font-mono text-xs border-t border-tactical-border pt-4">
              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>ENTRY DUEL WIN PERCENTAGE</span>
                  <span className="text-orange font-bold">97%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-orange shadow-[0_0_8px_#FF7438]" style={{ width: '97%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>CHOKEPOINT BREAKTHROUGH</span>
                  <span className="text-orange font-bold">95%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-orange shadow-[0_0_8px_#FF7438]" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-secondaryText mb-1">
                  <span>CLUTCH ROUND CONVERSION (1vX)</span>
                  <span className="text-orange font-bold">91%</span>
                </div>
                <div className="w-full h-1.5 bg-surface border border-tactical-border overflow-hidden">
                  <div className="stat-bar-fill h-full bg-orange shadow-[0_0_8px_#FF7438]" style={{ width: '91%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-tactical-border flex items-center justify-between text-[11px] font-mono text-secondaryText">
              <span className="text-white font-semibold">PREFERRED ARSENAL:</span>
              <span className="text-orange">AK-47 • GLOCK-18 • MOLOTOV • C4 CHARGE</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

