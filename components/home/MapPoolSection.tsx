'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CS2_MAP_POOL } from '@/lib/mockData';
import { MapPin, Target, Compass, Crosshair, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';

export default function MapPoolSection() {
  const [selectedMap, setSelectedMap] = useState(CS2_MAP_POOL[0]);

  return (
    <section id="maps" className="relative py-28 bg-military-black border-t border-b border-gunmetal overflow-hidden scroll-mt-20">
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-olive/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge variant="orange" size="sm">COD4 PROMODLIVE 2.20 EU MAP POOL</Badge>
              <span className="text-mutedText text-xs font-mono">
                {`// ${CS2_MAP_POOL.length} SANCTIONED COMBAT THEATERS`}
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase text-tacticalWhite tracking-tight leading-tight">
              THE BATTLEFIELD <span className="text-sand">TERRAIN</span>
            </h2>
          </div>

          <div className="text-xs font-mono text-mutedText max-w-md">
            <span className="text-sand font-bold">[OFFICIAL PROMOD VETO PROTOCOL]</span>: Sanctioned map pool for tournament rounds. Better seed selects map, lower seed selects side.
          </div>
        </div>

        <div className="relative mb-12 bg-card border border-gunmetal overflow-hidden">
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
                <span className="px-3 py-1 bg-surface/90 border border-olive/50 text-sand text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                  FOCUS SECTOR // {selectedMap.name}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-card/95 backdrop-blur-md">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-mutedText mb-2">
                  <span className="flex items-center gap-1.5 text-sand">
                    <MapPin className="w-3.5 h-3.5" /> {selectedMap.location}
                  </span>
                  <span className="text-olive-light">{selectedMap.scenario}</span>
                </div>

                <h3 className="font-display font-black text-3xl sm:text-4xl text-tacticalWhite uppercase tracking-wider mb-3">
                  {selectedMap.name}
                </h3>

                <p className="text-xs sm:text-sm text-mutedText font-mono leading-relaxed mb-6">
                  {selectedMap.description}
                </p>

                <div className="p-3 bg-surface border border-gunmetal text-xs font-mono text-sand">
                  <span className="text-mutedText block text-[10px] uppercase mb-0.5">TACTICAL PROFILE</span>
                  {selectedMap.meta}
                </div>
              </div>

              <div className="pt-6 border-t border-gunmetal flex items-center justify-between text-[11px] font-mono text-mutedText mt-6">
                <span>RADAR STATUS: ACTIVE TELEMETRY</span>
                <span className="text-tacticalWhite flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> VETO READY
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CS2_MAP_POOL.map((m) => {
            const isSelected = selectedMap.name === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMap(m)}
                aria-label={`Select ${m.name} map`}
                aria-pressed={isSelected}
                className={`relative p-3 text-left transition-all duration-300 clip-tactical border group ${
                  isSelected
                    ? 'bg-surface border-sand text-tacticalWhite shadow-[0_2px_12px_rgba(194,178,138,0.25)]'
                    : 'bg-card/60 border-gunmetal text-mutedText hover:border-olive hover:text-tacticalWhite'
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden mb-3 border border-gunmetal">
                  <Image
                    src={m.image}
                    alt={`${m.name} map`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-2 text-[10px] font-mono text-tacticalWhite/80">
                    0{CS2_MAP_POOL.indexOf(m) + 1}
                  </span>
                  <span className="absolute top-1 right-2 text-[9px] font-mono font-bold text-sand bg-military-black/80 px-1 py-0.5 border border-gunmetal/60">
                    {'callsign' in m ? String(m.callsign) : ''}
                  </span>
                </div>
                <div className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-tacticalWhite">
                  {m.name}
                </div>
                <div className="text-[10px] font-mono text-sand/80 mt-1 truncate">
                  {m.location.split('//')[0]?.trim()}
                </div>
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sand" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
