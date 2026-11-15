'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Crown,
  Crosshair,
  Sparkles,
  Zap,
  Target,
  Flame,
  Shield,
  Gift,
  Banknote,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function PrizePoolSection() {
  const { isOpen } = useRegistrationStatus();

  const prizeTiers = [
    {
      position: '1ST PLACE',
      title: 'GRAND CHAMPION',
      rewardType: 'PURE CASH PRIZE',
      trophy: 'GOLD CHAMPIONSHIP TROPHY',
      accentColor: 'text-sand',
      borderColor: 'border-sand/80 hover:border-sand',
      glowColor: 'shadow-[0_8px_35px_rgba(194,178,138,0.22)]',
      bgColor: 'bg-card/95',
      badgeText: 'CST 2026 GRAND WINNER',
      badgeBg: 'bg-sand text-black border-sand font-black',
      rewardBadge: 'bg-sand/15 text-sand border-sand/40',
      icon: <Crown className="w-11 h-11 text-sand animate-pulse" />,
      prize: 'LKR 30,000',
      subPrize: 'DIRECT CASH PRIZE',
      perks: [
        'LKR 30,000 Direct Cash Prize to Championship Team',
        'Official CST Gold Medals for all 5 Active Operatives',
        'Uva Wellassa University COD4 Champion Title & Recognition',
        'Permanent Enlistment into the Official CST Hall of Fame',
      ],
      isChampion: true,
      orderClass: 'order-1',
    },
    {
      position: '2ND PLACE',
      title: '1ST RUNNER-UP',
      rewardType: 'GIFT VOUCHERS',
      trophy: 'SILVER RUNNER-UP TROPHY',
      accentColor: 'text-slate-200',
      borderColor: 'border-gunmetal hover:border-slate-400',
      glowColor: 'shadow-[0_8px_30px_rgba(148,163,184,0.12)]',
      bgColor: 'bg-card/90',
      badgeText: 'CST 2026 1ST RUNNER-UP',
      badgeBg: 'bg-surface text-slate-300 border-gunmetal font-bold',
      rewardBadge: 'bg-slate-400/10 text-slate-300 border-slate-500/30',
      icon: <Medal className="w-11 h-11 text-slate-300" />,
      prize: 'LKR 25,000',
      subPrize: 'PARTNER GIFT VOUCHERS',
      perks: [
        'LKR 25,000 Worth Official Partner Gift Vouchers',
        'Official CST Silver Medals for all 5 Active Operatives',
        'Runner-Up Tournament Honors & University Commendation',
        'Permanent Enlistment in CST Tournament Records',
      ],
      isChampion: false,
      orderClass: 'order-2',
    },
  ];

  return (
    <section
      id="prizepool"
      className="relative py-24 sm:py-32 bg-military-black border-t border-b border-gunmetal overflow-hidden scroll-mt-20 select-none"
    >
      <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -left-36 w-[550px] h-[550px] bg-olive/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 -right-36 w-[550px] h-[550px] bg-sand/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-darkGreen/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-sand" />
            <Badge variant="orange" size="sm">COLLEGIATE ESPORTS GLORY // AWARDS</Badge>
            <span className="w-8 h-[2px] bg-olive" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tight uppercase text-tacticalWhite mb-4">
            TOURNAMENT <span className="text-sand">PRIZE POOL</span> &amp; <span className="text-olive-light">HONORS</span>
          </h2>

          <p className="text-sm sm:text-base text-mutedText font-mono leading-relaxed max-w-2xl mx-auto">
            Battle for collegiate immortality. Compete for the official championship trophies, national university prestige, cash prizes, and sponsor rewards.
          </p>
        </div>

        {/* Overhead Tactical Telemetry Bar */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-12 bg-card/80 border border-gunmetal p-3 sm:p-4 clip-tactical shadow-lg backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
            <div className="bg-surface/90 border border-gunmetal p-2.5 sm:p-3">
              <span className="text-[9px] sm:text-[10px] text-mutedText uppercase tracking-widest block font-bold">
                COMBINED PRIZE VALUE
              </span>
              <div className="font-display font-black text-lg sm:text-2xl text-tacticalWhite mt-0.5">
                LKR 55,000
              </div>
              <span className="text-[8px] sm:text-[9px] text-olive-light uppercase tracking-wider block mt-0.5">
                TOTAL TOURNAMENT POOL
              </span>
            </div>

            <div className="bg-surface/90 border border-sand/40 p-2.5 sm:p-3">
              <span className="text-[9px] sm:text-[10px] text-sand uppercase tracking-widest block font-bold flex items-center justify-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-sand" />
                1ST PLACE CASH
              </span>
              <div className="font-display font-black text-lg sm:text-2xl text-sand mt-0.5">
                LKR 30,000
              </div>
              <span className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider block mt-0.5">
                DIRECT CASH TRANSFER
              </span>
            </div>

            <div className="bg-surface/90 border border-gunmetal p-2.5 sm:p-3">
              <span className="text-[9px] sm:text-[10px] text-slate-300 uppercase tracking-widest block font-bold flex items-center justify-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-slate-300" />
                2ND PLACE VOUCHERS
              </span>
              <div className="font-display font-black text-lg sm:text-2xl text-slate-200 mt-0.5">
                LKR 25,000
              </div>
              <span className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider block mt-0.5">
                PARTNER GIFT VOUCHERS
              </span>
            </div>
          </div>
        </div>

        {/* 2-Tier Prize Cards (Balanced & Centered Grid) */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch mb-16">
          {prizeTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${tier.bgColor} ${tier.borderColor} ${tier.glowColor} ${tier.orderClass}`}
            >
              {/* Top Banner Flag */}
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 font-mono text-[10px] uppercase tracking-widest clip-tactical shadow-lg flex items-center justify-center whitespace-nowrap z-20 ${tier.isChampion ? 'bg-sand text-black font-black shadow-[0_2px_12px_rgba(194,178,138,0.4)]' : 'bg-surface text-slate-300 border border-gunmetal font-bold'}`}>
                <span className={tier.isChampion ? 'text-black font-black' : 'text-slate-300'}>
                  {tier.badgeText}
                </span>
              </div>

              {/* Tactical Corners */}
              <span className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${tier.accentColor}`} />
              <span className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${tier.accentColor}`} />
              <span className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${tier.accentColor}`} />
              <span className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${tier.accentColor}`} />

              <div>
                {/* Header: Position & Icon */}
                <div className="flex items-center justify-between border-b border-gunmetal pb-4 mb-6 pt-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-mutedText uppercase tracking-widest block font-bold">
                        {tier.position}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase font-bold ${tier.rewardBadge}`}>
                        {tier.rewardType}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-tacticalWhite tracking-wider uppercase mt-1">
                      {tier.title}
                    </h3>
                  </div>

                  <div className="p-3 bg-surface/80 border border-gunmetal shrink-0">
                    {tier.icon}
                  </div>
                </div>

                {/* Prize Amount Showcase */}
                <div className={`mb-6 p-5 border text-center ${tier.isChampion ? 'bg-surface/80 border-sand/40' : 'bg-surface/50 border-gunmetal'}`}>
                  <span className="text-[10px] font-mono text-mutedText uppercase tracking-wider block mb-1">
                    COMMITTED REWARD ALLOCATION
                  </span>
                  <div className={`font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight ${tier.accentColor}`}>
                    {tier.prize}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[10px] font-mono font-bold text-tacticalWhite uppercase tracking-widest px-2 py-0.5 bg-military-black/80 border border-gunmetal">
                      {tier.subPrize}
                    </span>
                    <span className="text-[10px] font-mono text-mutedText">
                      + {tier.trophy}
                    </span>
                  </div>
                </div>

                {/* Award Perks List */}
                <div className="space-y-3 text-xs font-mono mb-8">
                  <div className="text-[10px] text-mutedText uppercase tracking-widest font-bold mb-2 pb-1 border-b border-gunmetal/60 flex items-center justify-between">
                    <span>COMPLETE AWARD PACKAGE:</span>
                    <span className="text-[9px] text-olive-light">5 OPERATIVES</span>
                  </div>
                  {tier.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-tacticalWhite/90">
                      <CheckCircle2 className={`shrink-0 mt-0.5 w-4 h-4 ${tier.isChampion ? 'text-sand' : 'text-slate-400'}`} />
                      <span className="leading-snug">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              {isOpen && (
                <div className="pt-2">
                  <Button
                    href="/register"
                    variant="outline"
                    size="md"
                    className={`w-full font-bold uppercase text-xs tracking-wider transition-all duration-300 ${
                      tier.isChampion
                        ? 'bg-surface/90 border-sand/70 text-sand hover:bg-sand/15 hover:border-sand hover:text-tacticalWhite shadow-[0_2px_14px_rgba(0,0,0,0.8)]'
                        : 'bg-surface/60 border-gunmetal text-slate-300 hover:bg-surface hover:border-slate-300 hover:text-tacticalWhite'
                    }`}
                  >
                    ENLIST TO COMPETE FOR {tier.position}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
