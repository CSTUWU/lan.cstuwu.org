'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Trophy,
  Users,
  Cpu,
  Award,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Crosshair,
  AlertTriangle,
  Flame,
  Bomb,
  Clock,
  Eye,
  Sliders,
  FileCode,
  Keyboard,
  UserCheck,
  Pause,
  MapPin,
  Lock,
  GraduationCap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function AboutPage() {
  const { isOpen } = useRegistrationStatus();
  const [activeRuleTab, setActiveRuleTab] = useState<'settings' | 'weapons' | 'maps' | 'overtime' | 'integrity' | 'binds'>('settings');

  const ruleTabs = [
    { id: 'settings', label: 'GAME MODE SETTINGS', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'weapons', label: 'WEAPONS & CLASSES', icon: <Crosshair className="w-3.5 h-3.5" /> },
    { id: 'maps', label: 'MAP POOL & VETO', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'overtime', label: 'TIE-BREAKER (MR3)', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'integrity', label: 'EXPLOITS & FAIR PLAY', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'binds', label: 'BINDS, IGNS & PAUSES', icon: <Keyboard className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">OPERATION BRIEFING &amp; OFFICIAL RULES</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-gunmetal pb-12 mb-16">
          <Badge variant="olive" size="sm" className="mb-3">
            OFFICIAL TOURNAMENT COMPENDIUM // 2026
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-6xl uppercase text-tacticalWhite tracking-tight leading-tight mb-4">
            CST LAN CHALLENGE <span className="text-sand">2026</span>
          </h1>
          <p className="text-lg sm:text-xl font-display font-bold text-mutedKhaki uppercase tracking-widest max-w-3xl">
            CALL OF DUTY 4 MODERN WARFARE TACTICAL CHAMPIONSHIP (PROMODLIVE 2.20 EU)
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-sand">
            <span className="px-3 py-1 bg-surface border border-gunmetal">
              ORGANIZED BY COMPUTER SCIENCE &amp; TECHNOLOGY DEGREE PROGRAMME
            </span>
            <span className="px-3 py-1 bg-surface border border-gunmetal text-tacticalWhite">
              UVA WELLASSA UNIVERSITY OF SRI LANKA
            </span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-card via-[#1A201A] to-card border-l-4 border-olive border-y border-r border-gunmetal p-6 sm:p-8 mb-16 shadow-2xl">
          <div className="flex items-center gap-3 text-sand text-xs font-mono uppercase tracking-widest mb-2 font-bold">
            <Shield className="w-4 h-4 text-olive" /> MANDATE &amp; MISSION STATEMENT
          </div>
          <blockquote className="font-display text-lg sm:text-2xl text-tacticalWhite font-bold leading-relaxed">
            &ldquo;CST LAN Challenge 2026 is an elite military tactical Call of Duty 4 tournament bringing together university squads to test strategy, precision marksmanship, unit discipline, and technical execution under high-intensity LAN battlefield conditions.&rdquo;
          </blockquote>
        </div>

        {/* Operational Heritage & University Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
          <div className="lg:col-span-7 space-y-5 text-mutedKhaki font-mono text-sm leading-relaxed">
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-olive" /> OPERATIONAL HERITAGE &amp; ACADEMIC EXCELLENCE
            </h2>
            <p>
              The <strong className="text-tacticalWhite">Computer Science and Technology (CST) Degree Programme</strong> at Uva Wellassa University of Sri Lanka stands at the forefront of computer engineering, distributed networks, cyber defense, and tactical simulation technology.
            </p>
            <p>
              Competitive esports serves as a testbed for strategic cognitive processing, tactical communication, high-velocity decision trees, and squad cohesion. CST faculty and students established the LAN Challenge to create the ultimate collegiate competitive arena.
            </p>
            <p>
              Operating under strict standardized <strong className="text-sand">Promodlive2.20 EU</strong> rules, the tournament guarantees pure mechanical skill, fair competition, and peerless esports integrity.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-sand block font-bold text-lg font-display">100% LAN</span>
                <span className="text-[11px] text-mutedKhaki">Zero-latency Auditorium Command</span>
              </div>
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-olive block font-bold text-lg font-display">S&amp;D</span>
                <span className="text-[11px] text-mutedKhaki">Search and Destroy PML220</span>
              </div>
              <div className="p-3 bg-surface border border-gunmetal">
                <span className="text-sand block font-bold text-lg font-display">VERIFIED</span>
                <span className="text-[11px] text-mutedKhaki">Strict Undergraduate Roster Check</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-card border border-gunmetal p-6 sm:p-8 backdrop-blur-md">
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
                <span className="text-mutedKhaki block text-[10px] uppercase">DEPARTMENT &amp; FACULTY</span>
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

        {/* ============================================================== */}
        {/* OFFICIAL TOURNAMENT RULEBOOK (USER SPECIFIED COMPLETE RULES) */}
        {/* ============================================================== */}
        <section id="rules" className="mb-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-sand" />
              <Badge variant="orange" size="sm">OFFICIAL RULEBOOK // CST-LAN-2026</Badge>
              <span className="w-8 h-[2px] bg-olive" />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-tacticalWhite tracking-tight">
              GENERAL GAME &amp; <span className="text-sand">MATCH REGULATIONS</span>
            </h2>
            <p className="text-xs sm:text-sm font-mono text-mutedKhaki mt-2 max-w-3xl">
              All matches are sanctioned under <strong className="text-sand">Promodlive2.20 EU</strong> (<code className="text-olive-light">promod_mode lan_knockout_mr12</code>). Every competitor must adhere to the official rules below.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-gunmetal scrollbar-thin">
            {ruleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRuleTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-mono font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border ${activeRuleTab === tab.id
                    ? 'bg-sand text-black border-sand shadow-[0_2px_10px_rgba(194,178,138,0.4)]'
                    : 'bg-surface text-mutedKhaki border-gunmetal hover:border-olive hover:text-tacticalWhite'
                  }`}
              >
                {tab.icon}
                <span className={activeRuleTab === tab.id ? 'text-black font-black' : ''}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Game Mode Settings */}
          {activeRuleTab === 'settings' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gunmetal pb-4">
                <div>
                  <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                    GAME MODE SETTINGS // PROMODLIVE 2.20 EU
                  </h3>
                  <p className="text-xs font-mono text-sand mt-0.5">
                    promod_mode lan_knockout_mr12
                  </p>
                </div>
                <span className="px-3 py-1 bg-olive/20 text-sand border border-olive/40 font-mono text-xs font-bold w-max">
                  SEARCH &amp; DESTROY
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-mono text-center">
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">SCORE LIMIT</span>
                  <span className="text-base font-bold text-sand">FIRST TO 13</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">Map Winner Defined</span>
                </div>
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">ROUND LIMIT</span>
                  <span className="text-base font-bold text-tacticalWhite">24 ROUNDS</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">Half-time swap at 12</span>
                </div>
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">ROUND TIME</span>
                  <span className="text-base font-bold text-sand">1.45 MINS</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">1 Minute 45 Seconds</span>
                </div>
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">BOMB TIMER</span>
                  <span className="text-base font-bold text-olive-light">45 SECONDS</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">Detonation Window</span>
                </div>
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">PLANT TIME</span>
                  <span className="text-base font-bold text-tacticalWhite">5 SECONDS</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">Arming Sequence</span>
                </div>
                <div className="p-3 bg-surface border border-gunmetal">
                  <span className="text-[10px] text-mutedKhaki uppercase block mb-1">DEFUSE TIME</span>
                  <span className="text-base font-bold text-emerald-400">7 SECONDS</span>
                  <span className="text-[9px] text-mutedKhaki block mt-0.5">Defusal Kit Time</span>
                </div>
              </div>

              <div className="p-4 bg-surface/70 border-l-4 border-sand text-xs font-mono text-mutedKhaki leading-relaxed space-y-2">
                <p>
                  <strong className="text-tacticalWhite font-bold uppercase">Match Winner Determination:</strong> The team to reach 13 rounds first wins the match.
                </p>
                <p>
                  <strong className="text-tacticalWhite font-bold uppercase">Side Switching:</strong> Teams play 12 rounds on their starting side (Attack or Defense), then switch sides at the half-time mark.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Weapons, Attachments & Classes */}
          {activeRuleTab === 'weapons' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="border-b border-gunmetal pb-4">
                <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                  RESTRICTED LOADOUTS &amp; SQUAD CLASS LIMITS
                </h3>
                <p className="text-xs font-mono text-mutedKhaki mt-0.5">
                  Strict class caps and weapon bans ensure pure competitive balance.
                </p>
              </div>

              {/* Class Caps */}
              <div>
                <h4 className="text-xs font-mono text-sand font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> ALLOWED CLASS LIMITS (MAXIMUM PER 5-PLAYER ROSTER)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                  <div className="p-4 bg-surface border border-gunmetal">
                    <span className="text-2xl font-display font-black text-sand block">1</span>
                    <span className="text-xs font-bold text-tacticalWhite uppercase block">SNIPER</span>
                    <span className="text-[10px] text-mutedKhaki block mt-0.5">Maximum One (1) per team</span>
                  </div>
                  <div className="p-4 bg-surface border border-gunmetal">
                    <span className="text-2xl font-display font-black text-olive-light block">1</span>
                    <span className="text-xs font-bold text-tacticalWhite uppercase block">DEMOLITION</span>
                    <span className="text-[10px] text-mutedKhaki block mt-0.5">Maximum One (1) per team</span>
                  </div>
                  <div className="p-4 bg-surface border border-gunmetal">
                    <span className="text-2xl font-display font-black text-sand block">2</span>
                    <span className="text-xs font-bold text-tacticalWhite uppercase block">SPEC OPS</span>
                    <span className="text-[10px] text-mutedKhaki block mt-0.5">Maximum Two (2) per team</span>
                  </div>
                  <div className="p-4 bg-surface border border-gunmetal">
                    <span className="text-2xl font-display font-black text-tacticalWhite block">5</span>
                    <span className="text-xs font-bold text-tacticalWhite uppercase block">ASSAULT</span>
                    <span className="text-[10px] text-mutedKhaki block mt-0.5">Maximum Five (5) per team</span>
                  </div>
                </div>
              </div>

              {/* Banned Weapons */}
              <div className="p-4 bg-surface/80 border border-rose-900/60 rounded">
                <h4 className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> BANNED WEAPONS, ATTACHMENTS &amp; GRENADES
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs text-center my-3">
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">P90</span>
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">Scorpion</span>
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">M21</span>
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">Dragunov</span>
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">Barrett .50cal</span>
                  <span className="p-2 bg-rose-950/40 border border-rose-800/50 text-rose-300 font-bold">All LMGs</span>
                </div>
                <p className="text-xs font-mono text-rose-300/80 mt-2">
                  <strong className="text-rose-400 font-bold uppercase">ATTACHMENT BAN:</strong> All weapon attachments (Red Dot Sight, Silencer, ACOG, Grenade Launcher) are 100% strictly banned. Iron sights and stock Promod configurations only.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Map Pool & Veto Protocol */}
          {activeRuleTab === 'maps' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="border-b border-gunmetal pb-4">
                <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                  OFFICIAL MAP POOL &amp; SIDE SELECTION PROTOCOL
                </h3>
                <p className="text-xs font-mono text-mutedKhaki mt-0.5">
                  5 sanctioned competitive Call of Duty 4 Promod theaters.
                </p>
              </div>

              {/* 5 Official Maps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
                {[
                  { name: 'Backlot', callsign: 'mp_backlot', desc: 'Construction & Alleys', img: '/mp_backlot.jpeg' },
                  { name: 'Crash', callsign: 'mp_crash', desc: 'Downed Sea Knight', img: '/mp_crash.jpeg' },
                  { name: 'Crossfire', callsign: 'mp_crossfire', desc: 'Sniper Street Crossing', img: '/mp_crossfire.jpeg' },
                  { name: 'Citystreets', callsign: 'mp_citystreet (District)', desc: 'Market Square & Streets', img: '/mp_citystreet.jpeg' },
                  { name: 'Strike', callsign: 'mp_strike', desc: 'Hotel & Town Center', img: '/mp_strike.jpeg' },
                ].map((mapItem) => (
                  <div key={mapItem.callsign} className="bg-surface border border-gunmetal overflow-hidden group hover:border-sand transition-colors">
                    <div className="relative aspect-video w-full overflow-hidden border-b border-gunmetal">
                      <Image
                        src={mapItem.img}
                        alt={mapItem.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-sand bg-military-black/80 px-1 py-0.5 border border-gunmetal/60">
                        {mapItem.callsign.split(' ')[0]}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-xs font-bold text-sand block uppercase">{mapItem.name}</span>
                      <span className="text-[10px] text-mutedKhaki block">{mapItem.callsign}</span>
                      <span className="text-[9px] text-olive-light block mt-1">{mapItem.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map & Side Selection Rules */}
              <div className="p-4 bg-surface/70 border-l-4 border-sand text-xs font-mono text-mutedKhaki space-y-3 leading-relaxed">
                <div>
                  <h4 className="text-tacticalWhite font-bold uppercase mb-1">
                    KNOCK-OUT MATCHES:
                  </h4>
                  <p>
                    The organizing team will toss a coin. The coin-toss winner can choose either the <strong className="text-sand">map</strong> or the <strong className="text-sand">side</strong>.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
                    <li>If the winner chooses the map, the opposing team chooses the starting side (Attack or Defense).</li>
                    <li>If the winner wants to choose the starting side, they choose their side after the opposing team leader picks the map.</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-gunmetal/60">
                  <h4 className="text-tacticalWhite font-bold uppercase mb-1">
                    SEMI-FINALS &amp; FINAL MATCH:
                  </h4>
                  <p>
                    For the semi-finals and the grand final match, the <strong className="text-olive-light">winner of the previous round</strong> earns the right to choose the map or side under the same priority system.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Tie-Breaker & Overtime (MR3) */}
          {activeRuleTab === 'overtime' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="border-b border-gunmetal pb-4">
                <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                  TIE-BREAKER OVERTIME PROTOCOL // MR3
                </h3>
                <p className="text-xs font-mono text-mutedKhaki mt-0.5">
                  Overtime regulations in the event of a 12-12 deadlock.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 bg-surface border border-gunmetal">
                  <span className="text-sand font-bold block mb-1 uppercase text-sm">MR3 REGULATION</span>
                  <p className="text-mutedKhaki leading-relaxed">
                    Overtime is played with Max Rounds 3 (MR3). Teams play 3 rounds per half, needing 4 rounds to win the overtime period.
                  </p>
                </div>
                <div className="p-4 bg-surface border border-gunmetal">
                  <span className="text-olive-light font-bold block mb-1 uppercase text-sm">SIDE POSITIONING</span>
                  <p className="text-mutedKhaki leading-relaxed">
                    At the start of overtime, squads stay on the exact side on which they finished the previous half.
                  </p>
                </div>
                <div className="p-4 bg-surface border border-gunmetal">
                  <span className="text-tacticalWhite font-bold block mb-1 uppercase text-sm">CONTINUOUS SUDDEN DEATH</span>
                  <p className="text-mutedKhaki leading-relaxed">
                    Sides swap at overtime half-time (after 3 rounds). If still tied after 6 rounds, teams continue playing successive MR3 overtimes until a winner is determined.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Exploits, Integrity & Third-Party Software */}
          {activeRuleTab === 'integrity' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="border-b border-gunmetal pb-4">
                <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                  ABUSES, EXPLOITS, THIRD-PARTY SOFTWARE &amp; FILE INTEGRITY
                </h3>
                <p className="text-xs font-mono text-mutedKhaki mt-0.5">
                  Zero tolerance for unapproved modifications, exploits, or external software.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs text-mutedKhaki leading-relaxed">
                <div className="p-4 bg-surface border-l-4 border-rose-500">
                  <h4 className="text-tacticalWhite font-bold uppercase text-sm mb-1">
                    ABUSES &amp; EXPLOITATION:
                  </h4>
                  <p>
                    Map exploits are errors or oversights in map design that provide an unfair advantage. Such exploits include, but are not limited to: leaning through, passing through, and seeing through walls, doors, and windows, and the use of clipped or defective map passages to access areas outside the normal playing area.
                  </p>
                  <p className="mt-2 text-rose-300">
                    <strong className="text-rose-400 font-bold uppercase">PENALTIES:</strong> The organizing team reserves the right to decide what is deemed an exploit. Any dispute must be supported with evidence. Players or squads proven to use illegal map exploits or boosting will be subject to loss of match points and expulsion from the tournament.
                  </p>
                </div>

                <div className="p-4 bg-surface border-l-4 border-amber-500">
                  <h4 className="text-tacticalWhite font-bold uppercase text-sm mb-1">
                    MODIFYING GAME FILES:
                  </h4>
                  <p>
                    All programs or files, either changed game files or new files, that change the game or add to its functionality, or which interact with the game in any way, are strictly forbidden. Modified versions of the game’s resource files are always forbidden, regardless of what they do.
                  </p>
                  <p className="mt-1 text-amber-300 font-bold">
                    Use of any forbidden program or file leads to an immediate forfeit loss and tournament ban.
                  </p>
                </div>

                <div className="p-4 bg-surface border-l-4 border-sand">
                  <h4 className="text-tacticalWhite font-bold uppercase text-sm mb-1">
                    THIRD-PARTY SOFTWARE &amp; VOICE COMMUNICATIONS:
                  </h4>
                  <p>
                    The use of any third-party addons, hooks, programs, or wrappers that interact with or alter the game, its appearance, or behavior for the purposes of gaining an unfair advantage is prohibited.
                  </p>
                  <p className="mt-1 text-tacticalWhite">
                    <strong className="text-sand font-bold">PERMITTED EXCEPTION:</strong> Third-party voice communication software such as Teamspeak or Discord are strictly allowed for squad comms.
                  </p>
                </div>

                <div className="p-4 bg-surface border-l-4 border-sand">
                  <h4 className="text-tacticalWhite font-bold uppercase text-sm mb-1 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sand" />
                    ELIGIBILITY &amp; SAME-DEGREE ENLISTMENT MANDATE:
                  </h4>
                  <p>
                    All squad competitors must be currently registered undergraduate students of Uva Wellassa University of Sri Lanka.
                  </p>
                  <p className="mt-1 text-tacticalWhite">
                    <strong className="text-sand font-bold">SAME DEGREE REQUIREMENT:</strong> Every operative on a 5-player squad must belong to the <strong>same Degree Programme</strong>. Each competitor&apos;s degree is identified and verified directly through their official university enrolment number (e.g. <span className="text-sand font-bold">UWU/CST/22/001</span> indicates Computer Science and Technology). Mixed-degree rosters are strictly prohibited.
                  </p>
                </div>

                <div className="p-4 bg-surface border-l-4 border-olive">
                  <h4 className="text-tacticalWhite font-bold uppercase text-sm mb-1">
                    SERVER SPECTATORS:
                  </h4>
                  <p>
                    Each team is permitted to bring <strong className="text-sand font-bold">one (1) designated spectator</strong> into the match server to ensure fair play and referee verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Binds, In-Game Names & Pauses */}
          {activeRuleTab === 'binds' && (
            <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="border-b border-gunmetal pb-4">
                <h3 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wide">
                  KEY BINDINGS, IN-GAME ALIASES &amp; TACTICAL PAUSES
                </h3>
                <p className="text-xs font-mono text-mutedKhaki mt-0.5">
                  Guidelines on permitted scripts, prohibited key bindings, and in-game communication.
                </p>
              </div>

              {/* Illegal vs Permitted Binds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-rose-950/30 border border-rose-800/60">
                  <h4 className="text-rose-400 font-bold uppercase mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> ILLEGAL BINDINGS (STRICTLY PROHIBITED)
                  </h4>
                  <ul className="space-y-1.5 text-mutedKhaki list-disc pl-4">
                    <li>Any binding of three (3) or more keys.</li>
                    <li>Binds that alter the map model (e.g. no fog, no foliage).</li>
                    <li>Any binds pointed to programs outside the CoD4 directory (except voice comms).</li>
                    <li>Scripts giving unfair advantage or part of any <code className="text-rose-300">exec</code> or <code className="text-rose-300">vstr</code> bind (excluding demo players).</li>
                    <li>Any script containing <code className="text-rose-300">lookdown</code> or <code className="text-rose-300">wait</code>.</li>
                    <li><code className="text-rose-300">attack</code> combined with any other command.</li>
                    <li><code className="text-rose-300">frag</code> combined with other commands/binds.</li>
                    <li><code className="text-rose-300">weapnext</code> combined with any other command.</li>
                    <li>Binding <code className="text-rose-300">attack</code> to MOUSE WHEEL UP or DOWN is prohibited.</li>
                  </ul>
                </div>

                <div className="p-4 bg-surface border border-olive/60">
                  <h4 className="text-sand font-bold uppercase mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sand" /> PERMITTED BINDINGS
                  </h4>
                  <ul className="space-y-1.5 text-mutedKhaki list-disc pl-4">
                    <li>Changes to assigned stock single-key gameplay binds.</li>
                    <li>Binding of not more than two motion keys (e.g. <code className="text-sand">bind a +leanright;+moveright</code>).</li>
                    <li>Namebinds and Demo-recording scripts.</li>
                    <li>Weapon/Menu/Select Scripts (includes all grenades).</li>
                    <li>Volume binds and sound toggle binds.</li>
                  </ul>
                  <p className="text-[11px] text-mutedKhaki mt-3 pt-2 border-t border-gunmetal">
                    If you have an unlisted binding you are unsure about, submit it to the CST organizing committee prior to match day for clarification.
                  </p>
                </div>
              </div>

              {/* In-Game Names & Match Pauses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-surface border border-gunmetal">
                  <h4 className="text-tacticalWhite font-bold uppercase mb-1 flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4 text-sand" /> IN-GAME NAMES (IGNS)
                  </h4>
                  <p className="text-mutedKhaki leading-relaxed">
                    Each team member must have their primary registered nickname (or something very similar) as their in-game name during all matches to be easily identifiable for referees, broadcasters, and viewers.
                  </p>
                  <p className="text-mutedKhaki mt-1">
                    Clan tags or sponsor names are permitted. Profanity is strictly forbidden.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-gunmetal">
                  <h4 className="text-tacticalWhite font-bold uppercase mb-1 flex items-center gap-2 text-sm">
                    <Pause className="w-4 h-4 text-sand" /> MATCH PAUSES
                  </h4>
                  <p className="text-mutedKhaki leading-relaxed">
                    Each team has the right to pause the game for a coherent reason by announcing it clearly in in-game chat.
                  </p>
                  <p className="text-sand mt-1 font-bold">
                    The match must NOT be resumed after a pause until the CST organizing referee specifies to do so.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CTA Footer */}
        <div className="text-center py-12 border-t border-gunmetal">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-tacticalWhite uppercase tracking-wider mb-4">
            READY TO LEAD YOUR SQUAD TO VICTORY?
          </h3>
          <p className="text-xs sm:text-sm text-mutedKhaki font-mono mb-8 max-w-xl mx-auto">
            Assemble your 5-man fireteam representing your university department. Registration is open exclusively for verified collegiate operatives.
          </p>
          <div className="flex justify-center gap-4">
            {isOpen && (
              <Button href="/register" variant="cyan" size="lg">
                ENLIST YOUR SQUAD
              </Button>
            )}
            <Button href="/teams" variant="outline" size="lg">
              VIEW ROSTERS
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
