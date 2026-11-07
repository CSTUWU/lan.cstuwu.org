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
      icon: <Cpu className="w-6 h-6 text-orange" />,
      title: 'CS2 SUB-TICK PRECISION',
      desc: 'Zero-compromise high tick-rate LAN environment powered by Valve’s Source 2 engine and dynamic smoke physics.',
      border: 'hover:border-orange/50',
    },
    {
      icon: <Shield className="w-6 h-6 text-cyan" />,
      title: 'CST DEGREE EXCELLENCE',
      desc: 'Organized by the Computer Science and Technology Degree Programme of Uva Wellassa University of Sri Lanka.',
      border: 'hover:border-cyan/50',
    },
    {
      icon: <Award className="w-6 h-6 text-orange" />,
      title: 'PRESTIGE & RECOGNITION',
      desc: 'Trophies, custom operator MVP plaques, university bragging rights, and official CST Esports Hall of Fame induction.',
      border: 'hover:border-orange/50',
    },
  ];

  return (
    <section id="about" className="relative py-28 bg-[#080B10] overflow-hidden">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 pb-8 border-b border-tactical-border">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="cyan" size="sm">INTELLIGENCE BRIEFING</Badge>
              <span className="text-secondaryText text-xs font-mono">{"// OPERATION CST-2026"}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight leading-tight">
              BORN IN CODE. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-orange">
                FORGED ON THE LAN BATTLEFIELD.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-4 lg:text-right">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-mono text-cyan hover:text-white uppercase tracking-wider group transition-colors"
            >
              <span>READ EXPANDED BRIEFING</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6 text-secondaryText leading-relaxed text-sm sm:text-base font-sans">
            <div className="p-4 bg-surface/60 border-l-2 border-cyan font-mono text-xs text-white">
              <span className="text-cyan font-bold">OFFICIAL MISSION STATEMENT:</span>
              <p className="mt-1 text-secondaryText">
                CST LAN Challenge 2026 is a competitive Counter-Strike 2 gaming tournament bringing together talented university players to compete, demonstrate their skills, and represent their teams with honor.
              </p>
            </div>

            <p>
              Hosted and organized by the <strong className="text-white">Computer Science and Technology Degree Programme</strong>,<br /><strong className="text-cyan">Uva Wellassa University of Sri Lanka</strong>, this landmark tournament unites the island’s sharpest strategic minds and most deadly FPS sharpshooters.
            </p>

            <p>
              Following the success of previous LAN challenges, the 2026 edition shifts to Valve&apos;s flagship tactical shooter—<strong className="text-white">Counter-Strike 2</strong>. Featuring complete volumetric smoke tactical gameplay, sub-tick server synchronization, and custom stage acoustics, every retake, clutch, and eco-round will be experienced at international major esports standards.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {isOpen && (
                <Button href="/register" variant="cyan" size="md">
                  REGISTER ROSTER
                </Button>
              )}
              <Button href="/about" variant="ghost" size="md">
                TOURNAMENT INTEL
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative bg-card/90 border border-tactical-border p-6 backdrop-blur-md">
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan" />

              <div className="flex items-center justify-between border-b border-tactical-border pb-3 mb-4 text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan" /> TOURNAMENT TELEMETRY
                </span>
                <span className="text-cyan text-[10px] uppercase">UWU.CST // ACTIVE</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-tactical-border/50">
                  <span className="text-secondaryText">DISCIPLINE:</span>
                  <span className="text-white font-semibold">Counter-Strike 2 (PC)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-tactical-border/50">
                  <span className="text-secondaryText">ORGANIZING ENTITY:</span>
                  <span className="text-cyan font-semibold">CST Degree Programme, UWU</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-tactical-border/50">
                  <span className="text-secondaryText">HOST INSTITUTION:</span>
                  <span className="text-white font-semibold">Uva Wellassa University</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-tactical-border/50">
                  <span className="text-secondaryText">MATCH FORMAT:</span>
                  <span className="text-orange font-semibold">5v5 MR12 Competitive</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-tactical-border/50">
                  <span className="text-secondaryText">SERVER ARCHITECTURE:</span>
                  <span className="text-white font-semibold">Sub-Tick Dedicated LAN Server</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-secondaryText">ELIGIBILITY:</span>
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
              className={`bg-surface/50 border border-tactical-border p-6 transition-all duration-300 ${item.border} hover:bg-card/70 group ${idx === 2 ? 'sm:col-span-2 sm:justify-self-center sm:w-1/2 lg:col-span-1 lg:justify-self-stretch lg:w-auto' : ''}`}
            >
              <div className="mb-4 p-3 bg-card inline-block border border-tactical-border/80 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-base text-white tracking-wider uppercase mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-secondaryText font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
