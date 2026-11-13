'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Cpu, Users, Award, Target, Terminal, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function AboutSection() {
  const { isOpen } = useRegistrationStatus();
  const highlights = [
    {
      icon: <Cpu className="w-6 h-6 text-sand" />,
      title: 'ZERO-LATENCY LAN WARFARE',
      desc: 'Zero-compromise dedicated high-speed LAN command center setup with tactical sound isolation and high refresh rate displays.',
      border: 'hover:border-sand',
    },
    {
      icon: <Shield className="w-6 h-6 text-olive-light" />,
      title: 'CST DEGREE EXCELLENCE',
      desc: 'Organized by the Computer Science and Technology Degree Programme of Uva Wellassa University of Sri Lanka.',
      border: 'hover:border-olive-light',
    },
    {
      icon: <Award className="w-6 h-6 text-sand" />,
      title: 'PRESTIGE & RECOGNITION',
      desc: 'Trophies, custom operator MVP plaques, university bragging rights, and official CST Esports Hall of Fame induction.',
      border: 'hover:border-sand',
    },
  ];

  return (
    <section id="about" className="relative py-28 bg-military-black border-t border-b border-gunmetal overflow-hidden scroll-mt-20">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-olive/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sand/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 pb-8 border-b border-gunmetal">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="cyan" size="sm">INTELLIGENCE BRIEFING</Badge>
              <span className="text-mutedText text-xs font-mono">{"// OPERATION CST-2026"}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-tacticalWhite tracking-tight leading-tight">
              BORN IN CODE. <br />
              <span className="text-sand">
                FORGED ON THE LAN BATTLEFIELD.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-mono text-sand hover:text-tacticalWhite uppercase tracking-wider group transition-colors"
            >
              <span>READ EXPANDED BRIEFING</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6 text-mutedText leading-relaxed text-sm sm:text-base font-sans">
            <div className="p-4 bg-surface/60 border-l-2 border-olive font-mono text-xs text-tacticalWhite">
              <span className="text-sand font-bold">OFFICIAL MISSION STATEMENT:</span>
              <p className="mt-1 text-mutedText">
                CST LAN Challenge 2026 is a premier competitive military tactical gaming tournament bringing together talented university operatives to compete, demonstrate strategic dominance, and represent their teams with honor.
              </p>
            </div>

            <p>
              Hosted and organized by the <strong className="text-tacticalWhite">Computer Science and Technology Degree Programme</strong>,<br /><strong className="text-sand">Uva Wellassa University of Sri Lanka</strong>, this landmark tournament unites the island’s sharpest strategic minds and most deadly FPS sharpshooters.
            </p>

            <p>
              Following the success of previous LAN challenges, the 2026 edition delivers an authentic military operations atmosphere inspired by <strong className="text-tacticalWhite">Call of Duty 4 Modern Warfare</strong>. Featuring physical LAN synchronization, tactical map vetoes, and custom stage acoustics, every confrontation will be experienced at tactical tournament standards.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {isOpen && (
                <Button href="/register" variant="cyan" size="md">
                  ENLIST SQUAD
                </Button>
              )}
              <Button href="/about" variant="ghost" size="md">
                TOURNAMENT INTEL
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative bg-card/90 border border-gunmetal p-6 backdrop-blur-md">
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sand" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-olive" />

              <div className="flex items-center justify-between border-b border-gunmetal pb-3 mb-4 text-xs font-mono">
                <span className="text-tacticalWhite font-bold flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-sand" /> TOURNAMENT TELEMETRY
                </span>
                <span className="text-sand text-[10px] uppercase">UWU.CST // ACTIVE</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-gunmetal/50">
                  <span className="text-mutedText">DISCIPLINE:</span>
                  <span className="text-tacticalWhite font-semibold">Call of Duty 4 MW (PC)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gunmetal/50">
                  <span className="text-mutedText">ORGANIZING ENTITY:</span>
                  <span className="text-sand font-semibold">CST Degree Programme, UWU</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gunmetal/50">
                  <span className="text-mutedText">HOST INSTITUTION:</span>
                  <span className="text-tacticalWhite font-semibold">Uva Wellassa University</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gunmetal/50">
                  <span className="text-mutedText">GAME TYPE:</span>
                  <span className="text-olive-light font-semibold">Search &amp; Destroy</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gunmetal/50">
                  <span className="text-mutedText">SERVER ARCHITECTURE:</span>
                  <span className="text-tacticalWhite font-semibold">Dedicated Military LAN Server</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-mutedText">ELIGIBILITY:</span>
                  <span className="text-emerald-400 font-semibold">Enrolled University Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`bg-surface/50 border border-gunmetal p-6 transition-all duration-300 ${item.border} hover:bg-card/70 group ${idx === 2 ? 'sm:col-span-2 sm:justify-self-center sm:w-1/2 lg:col-span-1 lg:justify-self-stretch lg:w-auto' : ''}`}
            >
              <div className="mb-4 p-3 bg-card inline-block border border-gunmetal group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-base text-tacticalWhite tracking-wider uppercase mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-mutedText font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
