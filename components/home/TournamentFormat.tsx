'use client';

import React from 'react';
import { Shield, Users, Layers, Sliders, CheckCircle2, AlertTriangle, Crosshair, Award } from 'lucide-react';
import Badge from '../ui/Badge';

export default function TournamentFormat() {
  const formatSteps = [
    {
      num: '01',
      title: 'ROSTER REGISTRATION',
      subtitle: '5 Starters + 1 Optional Sub',
      desc: 'Each university squad consists of exactly 5 active players and 1 designated optional substitute. All players must be verified undergraduate or postgraduate university students.',
      tag: 'PHASE 1',
      color: 'border-cyan/40 text-cyan',
    },
    {
      num: '02',
      title: 'MAP VETO & BAN PHASE',
      subtitle: 'Standard CS2 Competitive Veto',
      desc: 'Captains conduct coin-toss ban/pick sequences from the Active Duty Map Pool. Higher-seeded teams choose between first ban or side selection for the opening map.',
      tag: 'PRE-MATCH',
      color: 'border-tactical-border text-white',
    },
    {
      num: '03',
      title: 'MR12 TOURNAMENT RULES',
      subtitle: 'Max Rounds 12 per Half',
      desc: 'First team to 13 rounds claims victory. In the event of a 12-12 deadlock, MR3 Overtime with $10,000 starting cash decides the winner in intense sudden death rounds.',
      tag: 'MATCH PROTOCOL',
      color: 'border-orange/40 text-orange',
    },
    {
      num: '04',
      title: 'LAN FINALS & PLAYOFFS',
      subtitle: 'Auditorium Championship Stage',
      desc: 'Top qualifying teams battle on the main LAN stage at Uva Wellassa University. Admin referee-supervised, zero-latency physical LAN setup with live auditorium projection.',
      tag: 'CHAMPIONSHIP',
      color: 'border-emerald-500/40 text-emerald-400',
    },
  ];

  return (
    <section id="format" className="relative py-28 bg-[#090D14] border-t border-b border-tactical-border overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" size="sm" className="mb-3">
            COMPETITION PROTOCOLS // 2026
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight mb-4">
            TOURNAMENT <span className="text-cyan">FORMAT</span> & <span className="text-orange">STRUCTURE</span>
          </h2>
          <p className="text-sm sm:text-base text-secondaryText font-mono leading-relaxed">
            Standardized competitive Counter-Strike 2 regulation format with manual tournament administration, dedicated tournament referees, and strict anti-cheat verification.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {formatSteps.map((step) => (
            <div
              key={step.num}
              className={`relative bg-card/80 border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${step.color} group`}
            >
              {/* Corner tick */}
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-current opacity-40" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-4xl text-white/30 group-hover:text-white/70 transition-colors">
                  {step.num}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-surface border border-tactical-border text-secondaryText">
                  {step.tag}
                </span>
              </div>

              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider mb-1">
                {step.title}
              </h3>
              <div className="text-xs font-mono text-cyan mb-3">
                {step.subtitle}
              </div>

              <p className="text-xs text-secondaryText font-mono leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Spec Panel */}
        <div className="bg-surface/70 border border-tactical-border p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-tactical-border/70 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan uppercase mb-1">
                <Crosshair className="w-4 h-4" /> OFFICIAL MATCH SETTINGS (CS2 MR12)
              </div>
              <h4 className="font-display font-black text-xl text-white uppercase">
                ADMINISTERED UNDER CST ESPORTS GOVERNANCE
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono uppercase">
                SERVER TICKRATE: SUB-TICK
              </span>
              <span className="px-3 py-1 bg-orange/10 border border-orange/30 text-orange text-xs font-mono uppercase">
                COACHING: PERMITTED IN TIMEOUTS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center font-mono">
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">TEAM ROSTER</span>
              <span className="text-sm font-bold text-white">5 + 1 SUB</span>
            </div>
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">ROUND TIME</span>
              <span className="text-sm font-bold text-cyan">1m 55s</span>
            </div>
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">C4 TIMER</span>
              <span className="text-sm font-bold text-orange">40s</span>
            </div>
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">START CASH</span>
              <span className="text-sm font-bold text-white">$800</span>
            </div>
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">TACTICAL TIMEOUTS</span>
              <span className="text-sm font-bold text-cyan">4 x 30s</span>
            </div>
            <div className="p-3 bg-card border border-tactical-border/50">
              <span className="block text-[10px] text-secondaryText uppercase mb-1">OVERTIME CASH</span>
              <span className="text-sm font-bold text-emerald-400">$10,000</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs font-mono text-secondaryText/90 bg-card/60 p-3 border-l-2 border-orange">
            <AlertTriangle className="w-4 h-4 text-orange shrink-0" />
            <span>Tournament administration is executed manually by designated CST referees. Exact dates and confirmed prize pool figures will be officially ratified by organizers.</span>
          </div>
        </div>

      </div>
    </section>
  );
}

