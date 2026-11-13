'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Crosshair,
  Sparkles,
  Zap,
  Target,
  Flame,
  Shield,
  ChevronRight,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function PrizePoolSection() {
  const { isOpen } = useRegistrationStatus();
  const prizeTiers = [
    {
      position: '2ND PLACE',
      title: '1ST RUNNER-UP',
      trophy: 'SILVER TROPHY',
      accentColor: 'text-sand',
      borderColor: 'border-gunmetal hover:border-olive-light',
      glowColor: 'shadow-[0_4px_24px_rgba(24,30,24,0.6)]',
      bgColor: 'bg-card/90',
      tagBadge: 'bg-surface text-sand border-gunmetal',
      icon: <Medal className="w-10 h-10 text-sand" />,
      prize: 'LKR 15,000',
      perks: [
        'Official CST 2026 Silver Championship Trophy',
        'CST Silver Medals for 5 Active Operatives',
        'Certificate of Tactical Esports Excellence',
        
      ],
      orderClass: 'order-2 lg:order-1',
    },
    {
      position: '1ST PLACE',
      title: 'GRAND CHAMPION',
      trophy: 'GOLDEN VICTORY CUP',
      accentColor: 'text-sand',
      borderColor: 'border-sand/70 hover:border-sand',
      glowColor: 'shadow-[0_4px_30px_rgba(194,178,138,0.2)]',
      bgColor: 'bg-card/95',
      tagBadge: 'bg-sand text-military-black border-sand font-bold',
      icon: <Crown className="w-12 h-12 text-sand animate-bounce" />,
      prize: 'LKR 25,000',
      perks: [
        'Official CST LAN Challenge 2026 Grand Trophy',
        'Official CST Gold Medals for 5 Operatives',
        'Uva Wellassa University COD4 Champion Title',
        'Permanent Enlistment in CST Hall of Fame',
       
      ],
      orderClass: 'order-1 lg:order-2 lg:-translate-y-4',
      isChampion: true,
    },
    {
      position: '3RD PLACE',
      title: '2ND RUNNER-UP',
      trophy: 'BRONZE TROPHY',
      accentColor: 'text-khaki',
      borderColor: 'border-gunmetal hover:border-khaki',
      glowColor: 'shadow-[0_4px_24px_rgba(24,30,24,0.6)]',
      bgColor: 'bg-card/90',
      tagBadge: 'bg-surface text-khaki border-gunmetal',
      icon: <Award className="w-10 h-10 text-khaki" />,
      prize: 'LKR 10,000',
      perks: [
        'Official CST 2026 Bronze Championship Trophy',
        'CST Bronze Medals for 5 Active Operatives',
        'Certificate of Tactical Esports Excellence',
        
      ],
      orderClass: 'order-3',
    },
  ];

  const individualAwards = [
    {
      title: 'TOURNAMENT MVP',
      icon: <Trophy className="w-4 h-4 text-sand" />,
      desc: 'Highest overall tactical rating & impact differential across all playoff brackets.',
      badge: 'GOLD COMMENDATION',
    },
    {
      title: 'BEST SNIPER (RECON SPECIALIST)',
      icon: <Crosshair className="w-4 h-4 text-sand" />,
      desc: 'Most dominant opening duel success rate and sniper territory suppression.',
      badge: 'OLIVE COMMENDATION',
    },
    {
      title: 'TOP ENTRY POINTMAN',
      icon: <Flame className="w-4 h-4 text-sand" />,
      desc: 'Highest percentage of first kills opening up objective conversions.',
      badge: 'SAND COMMENDATION',
    },
    {
      title: 'TACTICAL CLUTCH OPERATOR',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      desc: 'Most 1vX high-stakes clutch rounds secured with bomb defusal or post-plant.',
      badge: 'MERIT COMMENDATION',
    },
  ];

  return (
    <section
      id="prizepool"
      className="relative py-24 sm:py-32 bg-military-black border-t border-b border-gunmetal overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -left-36 w-[550px] h-[550px] bg-olive/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 -right-36 w-[550px] h-[550px] bg-sand/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-darkGreen/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-sand" />
            <Badge variant="orange" size="sm">COLLEGIATE ESPORTS GLORY // AWARDS</Badge>
            <span className="w-8 h-[2px] bg-olive" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase text-tacticalWhite mb-4">
            TOURNAMENT <span className="text-sand">PRIZE POOL</span> &amp; <span className="text-olive-light">HONORS</span>
          </h2>

          <p className="text-sm sm:text-base text-mutedText font-mono leading-relaxed max-w-2xl mx-auto">
            Battle for collegiate immortality. Compete for the official championship trophies, national university prestige, and cash awards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center mb-16">
          {prizeTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${tier.bgColor} ${tier.borderColor} ${tier.glowColor} ${tier.orderClass}`}
            >
              {tier.isChampion && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-sand text-black font-mono text-[10px] font-black uppercase tracking-widest clip-tactical shadow-lg flex items-center justify-center">
                  <span className="text-black font-black">CST 2026 GRAND WINNER</span>
                </div>
              )}

              <span className={`absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 ${tier.accentColor}`} />
              <span className={`absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 ${tier.accentColor}`} />
              <span className={`absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 ${tier.accentColor}`} />
              <span className={`absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 ${tier.accentColor}`} />

              <div className="flex items-center justify-between border-b border-gunmetal pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono text-mutedText uppercase tracking-widest block font-bold">
                    {tier.position}
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-tacticalWhite tracking-wider uppercase mt-0.5">
                    {tier.title}
                  </h3>
                </div>

                <div className="p-3 bg-surface/80 border border-gunmetal shrink-0">
                  {tier.icon}
                </div>
              </div>

              <div className="mb-6 p-4 bg-surface/50 border border-gunmetal text-center">
                <span className="text-[10px] font-mono text-mutedText uppercase tracking-wider block mb-0.5">
                  COMMITTED REWARD POOL
                </span>
                <div className={`font-display font-black text-3xl sm:text-4xl tracking-tight ${tier.accentColor}`}>
                  {tier.prize}
                </div>
                <span className="text-[10px] font-mono text-mutedText/80 block mt-1">
                  + {tier.trophy}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono mb-8">
                <div className="text-[10px] text-mutedText uppercase tracking-widest font-bold mb-2">
                  AWARD PACKAGE:
                </div>
                {tier.perks.map((perk, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5 text-tacticalWhite/90">
                    <span className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${tier.isChampion ? 'bg-sand' : tier.accentColor.replace('text-', 'bg-')}`} />
                    <span className="leading-snug">{perk}</span>
                  </div>
                ))}
              </div>

              {isOpen && (
                <Button
                  href="/register"
                  variant={tier.isChampion ? 'cyan' : 'outline'}
                  size="md"
                  className={`w-full font-bold uppercase text-xs tracking-wider ${
                    tier.isChampion ? 'shadow-[0_2px_12px_rgba(37,44,36,0.8)]' : ''
                  }`}
                >
                  ENLIST FOR {tier.position}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/*
        <div className="bg-card/80 border border-gunmetal p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gunmetal pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-sand" />
                <h4 className="font-display font-black text-lg text-tacticalWhite uppercase tracking-wider">
                  INDIVIDUAL OPERATIVE ACCOLADES &amp; MERIT
                </h4>
              </div>
              <p className="text-xs font-mono text-mutedText mt-0.5">
                Special commendations awarded to standalone student operatives based on verified tournament server telemetry.
              </p>
            </div>

            <span className="text-[10px] font-mono text-sand px-2.5 py-1 bg-surface border border-olive/40 self-start sm:self-auto font-bold uppercase">
              MODERN WARFARE METRICS
            </span>
          </div> 

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {individualAwards.map((award, i) => (
              <div
                key={i}
                className="p-4 bg-surface/60 border border-gunmetal hover:border-olive transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-sand px-1.5 py-0.5 bg-surface border border-gunmetal uppercase font-bold">
                    {award.badge}
                  </span>
                  {award.icon}
                </div>

                <div className="font-display font-bold text-sm text-tacticalWhite uppercase mb-1">
                  {award.title}
                </div>

                <p className="text-[11px] text-mutedText leading-relaxed">
                  {award.desc}
                </p>
              </div>
            ))}
          </div>
        </div> 
        */}

      </div>
    </section>
  );
}

