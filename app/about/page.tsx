'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Trophy, Users, Cpu, Award, CheckCircle2, ChevronRight, Terminal, Globe, Crosshair } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function AboutPage() {
  const { isOpen } = useRegistrationStatus();
  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">OPERATION BRIEFING</span>
        </div>

        <div className="border-b border-gunmetal pb-12 mb-16">
          <Badge variant="olive" size="sm" className="mb-3">
            OFFICIAL TOURNAMENT COMPENDIUM
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-6xl uppercase text-tacticalWhite tracking-tight leading-tight mb-4">
            CST LAN CHALLENGE <span className="text-sand">2026</span>
          </h1>
          <p className="text-lg sm:text-xl font-display font-bold text-mutedKhaki uppercase tracking-widest max-w-3xl">
            CALL OF DUTY 4 MODERN WARFARE TACTICAL CHAMPIONSHIP
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-sand">
            <span className="px-3 py-1 bg-surface border border-gunmetal">
              ORGANIZED BY COMPUTER SCIENCE & TECHNOLOGY DEGREE PROGRAMME
            </span>
            <span className="px-3 py-1 bg-surface border border-gunmetal text-tacticalWhite">
              UVA WELLASSA UNIVERSITY OF SRI LANKA
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-card via-[#1A201A] to-card border-l-4 border-olive border-y border-r border-gunmetal p-8 mb-16 shadow-2xl">
          <div className="flex items-center gap-3 text-sand text-xs font-mono uppercase tracking-widest mb-2">
            <Shield className="w-4 h-4 text-olive" /> MANDATE & MISSION STATEMENT
          </div>
          <blockquote className="font-display text-xl sm:text-2xl text-tacticalWhite font-bold leading-relaxed">
            &ldquo;CST LAN Challenge 2026 is an elite military tactical Call of Duty 4 tournament bringing together university squads to test strategy, precision marksmanship, unit discipline, and technical execution under high-intensity LAN battlefield conditions.&rdquo;
          </blockquote>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6 text-mutedKhaki font-mono text-sm leading-relaxed">
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-olive" /> OPERATIONAL HERITAGE & ACADEMIC EXCELLENCE
            </h2>
            <p>
              The <strong className="text-tacticalWhite">Computer Science and Technology (CST) Degree Programme</strong> at Uva Wellassa University of Sri Lanka stands at the forefront of computer engineering, distributed systems, cyber defense, and tactical simulation technology.
            </p>
            <p>
              Esports serves as a premier testbed for strategic cognitive processing, tactical communication, high-velocity decision trees, and squad cohesion. CST faculty and students established the LAN Challenge to create the ultimate collegiate competitive arena.
            </p>
            <p>
              The CST LAN Challenge has grown into a benchmark championship, uniting university operatives nationwide in a disciplined battle of tactical coordination, fast reflexes, and competitive honor.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-sand block font-bold text-lg font-display">100% LAN</span>
                <span className="text-[11px] text-mutedKhaki">Zero-latency Auditorium Arena</span>
              </div>
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-olive block font-bold text-lg font-display">5v5 S&D</span>
                <span className="text-[11px] text-mutedKhaki">Standard Search & Destroy</span>
              </div>
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-sand block font-bold text-lg font-display">VERIFIED</span>
                <span className="text-[11px] text-mutedKhaki">Inter-University Roster Check</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-card border border-gunmetal p-8 backdrop-blur-md">
            <h3 className="font-display font-bold text-lg text-tacticalWhite uppercase tracking-wider mb-6 pb-3 border-b border-gunmetal flex items-center justify-between">
              <span>HEADQUARTERS DOSSIER</span>
              <span className="text-xs font-mono text-sand">UWU.LK</span>
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-mutedKhaki block text-[10px] uppercase">OFFICIAL INSTITUTION NAME</span>
                <span className="text-tacticalWhite font-bold text-sm">Uva Wellassa University of Sri Lanka</span>
              </div>
              <div>
                <span className="text-mutedKhaki block text-[10px] uppercase">COMMANDING DEGREE PROGRAMME</span>
                <span className="text-sand font-bold text-sm">Computer Science and Technology (CST)</span>
              </div>
              <div>
                <span className="text-mutedKhaki block text-[10px] uppercase">DEPARTMENT & FACULTY</span>
                <span className="text-tacticalWhite font-medium">Department of Computer Science and Informatics, Faculty of Applied Sciences</span>
              </div>
              <div>
                <span className="text-mutedKhaki block text-[10px] uppercase">FORWARD OPERATING BASE</span>
                <span className="text-tacticalWhite font-medium">Passara Road, Badulla, Uva Province, Sri Lanka</span>
              </div>
              <div className="pt-4 border-t border-gunmetal">
                <span className="text-olive font-bold block mb-1">MOTTO OF CST ESPORTS:</span>
                <span className="text-tacticalWhite italic">&ldquo;POWERED BY COMPETITION. UNITED BY TECHNOLOGY.&rdquo;</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface/50 border border-gunmetal p-8 lg:p-12 mb-20">
          <div className="max-w-3xl mb-10">
            <Badge variant="sand" size="sm" className="mb-2">TACTICAL DISCIPLINE</Badge>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-tacticalWhite tracking-wider mb-3">
              CALL OF DUTY 4: MODERN WARFARE PROTOCOLS
            </h2>
            <p className="text-xs sm:text-sm text-mutedKhaki font-mono leading-relaxed">
              Call of Duty 4 Modern Warfare delivers the definitive competitive FPS experience. Featuring rigorous tactical gunplay, pure Search & Destroy strategy, and tuned competitive balance, it demands peerless discipline and rapid tactical adaptation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card border border-gunmetal">
              <div className="text-olive mb-3 font-display font-black text-2xl">01</div>
              <h4 className="font-display font-bold text-base text-tacticalWhite uppercase mb-2">SEARCH & DESTROY PROTOCOLS</h4>
              <p className="text-xs text-mutedKhaki font-mono leading-relaxed">
                Objective bomb site control with single life per round. Precision grenade angles, smoke screening, and crossfire setups dictate theater supremacy.
              </p>
            </div>

            <div className="p-6 bg-card border border-gunmetal">
              <div className="text-sand mb-3 font-display font-black text-2xl">02</div>
              <h4 className="font-display font-bold text-base text-tacticalWhite uppercase mb-2">BALANCED LOADOUT MATRIX</h4>
              <p className="text-xs text-mutedKhaki font-mono leading-relaxed">
                Competitive class restrictions, weapon recoil mechanics, and instantaneous LAN tick fidelity ensure absolute mechanical integrity in every duel.
              </p>
            </div>

            <div className="p-6 bg-card border border-gunmetal">
              <div className="text-khaki mb-3 font-display font-black text-2xl">03</div>
              <h4 className="font-display font-bold text-base text-tacticalWhite uppercase mb-2">TACTICAL MR12 ENGAGEMENTS</h4>
              <p className="text-xs text-mutedKhaki font-mono leading-relaxed">
                High-tension 12-round halves maximize strategic pacing. Every opening pick, plant attempt, and site retake carries immediate tournament weight.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12 border-t border-gunmetal">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-tacticalWhite uppercase tracking-wider mb-4">
            READY TO LEAD YOUR SQUAD TO VICTORY?
          </h3>
          <p className="text-xs sm:text-sm text-mutedKhaki font-mono mb-8 max-w-xl mx-auto">
            Assemble your 5-man fireteam representing your university department. Registration is open exclusively for verified collegiate operatives.
          </p>
          <div className="flex justify-center gap-4">
            {isOpen && (
              <Button href="/register" variant="olive" size="lg">
                ENLIST YOUR SQUAD
              </Button>
            )}
            <Button href="/teams" variant="outline" size="lg">
              VIEW SQUADS
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
