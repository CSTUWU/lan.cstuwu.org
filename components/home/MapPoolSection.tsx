'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CS2_MAP_POOL } from '@/lib/mockData';
import { MapPin, Target, Compass, Crosshair, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';

export default function MapPoolSection() {
  const [selectedMap, setSelectedMap] = useState(CS2_MAP_POOL[0]);

  return (
    <section id="maps" className="relative py-28 bg-[#080B10] overflow-hidden">
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-orange/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="orange" size="sm">ACTIVE DUTY MAP POOL</Badge>
              <span className="text-secondaryText text-xs font-mono">{"// 7 COMPETITIVE VENUES"}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-white tracking-tight leading-tight">
              THE BATTLEFIELD <span className="text-cyan">TERRAIN</span>
            </h2>
          </div>

          <div className="text-xs font-mono text-secondaryText max-w-md">
            <span className="text-orange font-bold">[OFFICIAL NOTICE]</span>: The pool represents the current Valve CS2 Active Duty maps. Final tournament veto selections will be confirmed by CST organizers during captain briefings.
          </div>
        </div>

        <div className="relative mb-12 bg-card border border-tactical-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
            <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-full">
              <Image
                src={selectedMap.image}
                alt={selectedMap.name}
                fill
                className="object-cover object-center filter brightness-90 contrast-105"
                sizes="(max-width: 1024px) 100vw, 700px"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-card/90 via-card/40 to-transparent" />
              
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-background/80 border border-cyan/40 text-cyan text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                  FOCUS TARGET // {selectedMap.name}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-card/95 backdrop-blur-md">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-secondaryText mb-2">
                  <span className="flex items-center gap-1.5 text-cyan">
                    <MapPin className="w-3.5 h-3.5" /> {selectedMap.location}
                  </span>
                  <span className="text-orange">{selectedMap.scenario}</span>
                </div>

                <h3 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider mb-3">
                  {selectedMap.name}
                </h3>

                <p className="text-xs sm:text-sm text-secondaryText font-mono leading-relaxed mb-6">
                  {selectedMap.description}
                </p>

                <div className="p-3 bg-surface border border-tactical-border/70 text-xs font-mono text-cyan">
                  <span className="text-secondaryText block text-[10px] uppercase mb-0.5">TACTICAL PROFILE</span>
                  {selectedMap.meta}
                </div>
              </div>

              <div className="pt-6 border-t border-tactical-border/70 flex items-center justify-between text-[11px] font-mono text-secondaryText mt-6">
                <span>RADAR STATUS: ACTIVE</span>
                <span className="text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> VETO READY
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CS2_MAP_POOL.map((m) => {
            const isSelected = selectedMap.name === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMap(m)}
                className={`relative p-3 text-left transition-all duration-300 clip-tactical border ${
                  isSelected
                    ? 'bg-surface border-cyan text-white shadow-[0_0_20px_rgba(0,213,255,0.25)]'
                    : 'bg-card/60 border-tactical-border text-secondaryText hover:border-tactical-borderLight hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono text-secondaryText/70 mb-1">
                  0{CS2_MAP_POOL.indexOf(m) + 1}
                </div>
                <div className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-white">
                  {m.name}
                </div>
                <div className="text-[10px] font-mono text-cyan/80 mt-1 truncate">
                  {m.location.split(' ')[0]}
                </div>
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

