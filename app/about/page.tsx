'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Trophy, Users, Cpu, Award, CheckCircle2, ChevronRight, Terminal, Globe, Crosshair } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
      {/* Background grids */}
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">ABOUT THE TOURNAMENT</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-tactical-border pb-12 mb-16">
          <Badge variant="cyan" size="sm" className="mb-3">
            OFFICIAL TOURNAMENT COMPENDIUM
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-6xl uppercase text-white tracking-tight leading-tight mb-4">
            CST LAN CHALLENGE <span className="text-cyan">2026</span>
          </h1>
          <p className="text-lg sm:text-xl font-display font-bold text-secondaryText uppercase tracking-widest max-w-3xl">
            COUNTER-STRIKE 2 INTER-UNIVERSITY CHAMPIONSHIP
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-cyan">
            <span className="px-3 py-1 bg-surface border border-cyan/30">
              ORGANIZED BY COMPUTER SCIENCE & TECHNOLOGY DEGREE PROGRAMME
            </span>
            <span className="px-3 py-1 bg-surface border border-tactical-border text-white">
              UVA WELLASSA UNIVERSITY OF SRI LANKA
            </span>
          </div>
        </div>

        {/* Mission Statement Box */}
        <div className="bg-gradient-to-r from-card via-[#0F1722] to-card border-l-4 border-cyan border-y border-r border-tactical-border p-8 mb-16 shadow-2xl">
          <div className="flex items-center gap-3 text-cyan text-xs font-mono uppercase tracking-widest mb-2">
            <Shield className="w-4 h-4" /> OFFICIAL DECREE & PURPOSE
          </div>
          <blockquote className="font-display text-xl sm:text-2xl text-white font-bold leading-relaxed">
            &ldquo;CST LAN Challenge 2026 is a competitive Counter-Strike 2 gaming tournament bringing together talented university players to compete, demonstrate their skills, and represent their teams with pride, tactical discipline, and technological excellence.&rdquo;
          </blockquote>
        </div>

        {/* Section 1: University Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6 text-secondaryText font-mono text-sm leading-relaxed">
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-cyan" /> UNIVERSITY HERITAGE & ACADEMIC EXCELLENCE
            </h2>
            <p>
              The <strong className="text-white">Computer Science and Technology (CST) Degree Programme</strong> at Uva Wellassa University of Sri Lanka stands at the forefront of computer engineering, distributed computing, cyber systems, and interactive media in the country.
            </p>
            <p>
              Recognizing competitive esports as an extraordinary crucible of strategic cognitive processing, split-second algorithmic decision-making, and high-pressure team synergy, the CST faculty and student community founded the annual LAN Challenge series.
            </p>
            <p>
              The LAN Challenge has matured into an island-wide beacon of university gaming culture, fostering cross-institutional camaraderie and setting the benchmark for professional collegiate esports production in Sri Lanka.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-surface border border-tactical-border">
                <span className="text-cyan block font-bold text-lg font-display">100% LAN</span>
                <span className="text-[11px] text-secondaryText">Zero-latency Auditorium Arena</span>
              </div>
              <div className="p-3 bg-surface border border-tactical-border">
                <span className="text-orange block font-bold text-lg font-display">5v5 CS2</span>
                <span className="text-[11px] text-secondaryText">Standard Valve Regulations</span>
              </div>
              <div className="p-3 bg-surface border border-tactical-border">
                <span className="text-emerald-400 block font-bold text-lg font-display">VERIFIED</span>
                <span className="text-[11px] text-secondaryText">Inter-University Roster Check</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-card border border-tactical-border p-8 backdrop-blur-md">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider mb-6 pb-3 border-b border-tactical-border flex items-center justify-between">
              <span>INSTITUTION PROFILE</span>
              <span className="text-xs font-mono text-cyan">UWU.LK</span>
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-secondaryText block text-[10px] uppercase">OFFICIAL INSTITUTION NAME</span>
                <span className="text-white font-bold text-sm">Uva Wellassa University of Sri Lanka</span>
              </div>
              <div>
                <span className="text-secondaryText block text-[10px] uppercase">ORGANIZING DEGREE PROGRAMME</span>
                <span className="text-cyan font-bold text-sm">Computer Science and Technology (CST)</span>
              </div>
              <div>
                <span className="text-secondaryText block text-[10px] uppercase">DEPARTMENT & FACULTY</span>
                <span className="text-white font-medium">Department of Computer Science and Informatics, Faculty of Applied Sciences</span>
              </div>
              <div>
                <span className="text-secondaryText block text-[10px] uppercase">HEADQUARTERS</span>
                <span className="text-white font-medium">Passara Road, Badulla, Uva Province, Sri Lanka</span>
              </div>
              <div className="pt-4 border-t border-tactical-border">
                <span className="text-orange font-bold block mb-1">MOTTO OF CST ESPORTS:</span>
                <span className="text-white italic">&ldquo;POWERED BY COMPETITION. UNITED BY TECHNOLOGY.&rdquo;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Why Counter-Strike 2 */}
        <div className="bg-surface/50 border border-tactical-border p-8 lg:p-12 mb-20">
          <div className="max-w-3xl mb-10">
            <Badge variant="orange" size="sm" className="mb-2">DISCIPLINE SHIFT</Badge>
            <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-wider mb-3">
              THE NEXT GENERATION: WHY COUNTER-STRIKE 2?
            </h2>
            <p className="text-xs sm:text-sm text-secondaryText font-mono leading-relaxed">
              Counter-Strike 2 represents the pinnacle of modern competitive FPS mechanics. Powered by Valve&apos;s Source 2 engine, the game redefines competitive collegiate esports through revolutionary physics and network architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card border border-tactical-border">
              <div className="text-cyan mb-3 font-display font-black text-2xl">01</div>
              <h4 className="font-display font-bold text-base text-white uppercase mb-2">VOLUMETRIC SMOKE TACTICS</h4>
              <p className="text-xs text-secondaryText font-mono leading-relaxed">
                Smokes are now dynamic 3D objects that react to lighting, gunfire, and HE grenade explosions—opening entirely new tactical executes and retake opportunities.
              </p>
            </div>

            <div className="p-6 bg-card border border-tactical-border">
              <div className="text-orange mb-3 font-display font-black text-2xl">02</div>
              <h4 className="font-display font-bold text-base text-white uppercase mb-2">SUB-TICK ARCHITECTURE</h4>
              <p className="text-xs text-secondaryText font-mono leading-relaxed">
                Sub-tick precision calculates the exact millisecond a player shoots, jumps, or moves, delivering absolute registration fidelity in every LAN gunfight.
              </p>
            </div>

            <div className="p-6 bg-card border border-tactical-border">
              <div className="text-emerald-400 mb-3 font-display font-black text-2xl">03</div>
              <h4 className="font-display font-bold text-base text-white uppercase mb-2">MR12 INTENSITY</h4>
              <p className="text-xs text-secondaryText font-mono leading-relaxed">
                The 12-round halves maximize tension. Every pistol round, anti-eco conversion, and buy strategy has direct championship consequences.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 border-t border-tactical-border">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mb-4">
            READY TO WRITE YOUR UNIVERSITY&apos;S LEGEND?
          </h3>
          <p className="text-xs sm:text-sm text-secondaryText font-mono mb-8 max-w-xl mx-auto">
            Assemble your five-man roster and designate your substitute. Registration is free for all verified university students.
          </p>
          <div className="flex justify-center gap-4">
            <Button href="/register" variant="cyan" size="lg">
              REGISTER YOUR TEAM
            </Button>
            <Button href="/teams" variant="outline" size="lg">
              VIEW SQUADS
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

