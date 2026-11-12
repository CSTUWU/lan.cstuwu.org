'use client';

import React from 'react';
import { Shield, Users, Layers, Sliders, CheckCircle2, AlertTriangle, Crosshair, Award } from 'lucide-react';
import Badge from '../ui/Badge';

export default function TournamentFormat() {
  const formatSteps = [
    {
      num: '01',
      title: 'ROSTER ENLISTMENT',
      subtitle: '5 Active Squad Operatives',
      desc: 'Each squad consists of exactly 5 active operatives representing Uva Wellassa University faculties (Applied Sciences, Management, Technological Studies, Animal Science & Export Agriculture, Medicine).',
      tag: 'PHASE 1',
      color: 'border-olive/50 text-sand',
    },
    {
      num: '02',
      title: 'THEATER VETO & BAN PHASE',
      subtitle: 'Official Tactical Map Veto',
      desc: 'Captains conduct coin-toss ban/pick sequences from the Active Duty Combat Theater. Higher-seeded teams choose between first ban or side selection for the opening map.',
      tag: 'PRE-MISSION',
      color: 'border-gunmetal text-tacticalWhite',
    },
    {
      num: '03',
      title: 'SEARCH & DESTROY PML220 RULES',
      subtitle: 'Max Rounds 12 per Half',
      desc: 'First team to 13 rounds claims victory. In the event of a 12-12 deadlock, sudden death overtime decides the winner in intense tactical rounds.',
      tag: 'ENGAGEMENT PROTOCOL',
      color: 'border-sand/40 text-sand',
    },
    {
      num: '04',
      title: 'LAN FINALS & PLAYOFFS',
      subtitle: 'Auditorium Championship Stage',
      desc: 'Top qualifying squads battle on the main LAN stage at Uva Wellassa University. Admin referee-supervised, zero-latency physical command setup with live auditorium projection.',
      tag: 'CHAMPIONSHIP',
      color: 'border-olive-light/50 text-tacticalWhite',
    },
  ];

  return (
    <section id="format" className="relative py-28 bg-military-black border-t border-b border-gunmetal overflow-hidden">
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-olive/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" size="sm" className="mb-3">
            COMPETITION PROTOCOLS // 2026
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-tacticalWhite tracking-tight mb-4">
            TOURNAMENT <span className="text-sand">FORMAT</span> &amp; <span className="text-olive-light">STRUCTURE</span>
          </h2>
          <p className="text-sm sm:text-base text-mutedText font-mono leading-relaxed">
            Standardized competitive tournament regulation format with manual tactical administration, dedicated military referees, and strict student verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {formatSteps.map((step) => (
            <div
              key={step.num}
              className={`relative bg-card/80 border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${step.color} group`}
            >
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-current opacity-40" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-4xl text-tacticalWhite/30 group-hover:text-tacticalWhite/70 transition-colors">
                  {step.num}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-surface border border-gunmetal text-mutedText">
                  {step.tag}
                </span>
              </div>

              <h3 className="font-display font-black text-lg text-tacticalWhite uppercase tracking-wider mb-1">
                {step.title}
              </h3>
              <div className="text-xs font-mono text-sand mb-3">
                {step.subtitle}
              </div>

              <p className="text-xs text-mutedText font-mono leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface/70 border border-gunmetal p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gunmetal pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sand uppercase mb-1">
                <Crosshair className="w-4 h-4" /> OFFICIAL MATCH SETTINGS // PROMODLIVE 2.20 EU
              </div>
              <h4 className="font-display font-black text-xl text-tacticalWhite uppercase">
                promod_mode lan_knockout_mr12
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-olive/20 border border-olive/40 text-sand text-xs font-mono uppercase">
                MOD: PROMODLIVE 2.20 EU
              </span>
              <span className="px-3 py-1 bg-surface border border-gunmetal text-mutedText text-xs font-mono uppercase">
                SPECTATOR: 1 DESIGNATED PER SQUAD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center font-mono mb-6">
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">SCORE LIMIT</span>
              <span className="text-sm font-bold text-tacticalWhite">FIRST TO 13 (MR12)</span>
            </div>
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">ROUND TIME</span>
              <span className="text-sm font-bold text-sand">1.45 MINS</span>
            </div>
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">BOMB TIMERS</span>
              <span className="text-xs font-bold text-olive-light">45s / 5s PL / 7s DEF</span>
            </div>
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">ROUND LIMIT</span>
              <span className="text-xs sm:text-sm font-bold text-tacticalWhite">Half-Time Side switching</span>
            </div>
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">CLASS LIMITS</span>
              <span className="text-[11px] sm:text-xs font-bold text-sand leading-tight">1 SNIPER • 1 DEMO • 2 SPEC OPS</span>
            </div>
            <div className="p-3 bg-card border border-gunmetal">
              <span className="block text-[10px] text-mutedText uppercase mb-1">OVERTIME</span>
              <span className="text-sm font-bold text-emerald-400">MR3 SUDDEN DEATH</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-mutedText">
            <div className="p-3 bg-card/60 border-l-2 border-rose-500/80 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-tacticalWhite font-bold block mb-0.5">BANNED WEAPONS &amp; ATTACHMENTS</span>
                P90, Scorpion, M21, Dragunov, Barrett .50cal, and LMGs are strictly banned. All weapon attachments are prohibited.
              </div>
            </div>

            <div className="p-3 bg-card/60 border-l-2 border-sand flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sand shrink-0 mt-0.5" />
              <div>
                <span className="text-tacticalWhite font-bold block mb-0.5">MAP &amp; SIDE SELECTION</span>
                Better seed selects map, lower seed selects side.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

