'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Radio, Terminal, Cpu, Trophy, MessageSquare, Twitter, Youtube, Twitch } from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function Footer() {
  const pathname = usePathname();
  const { isOpen } = useRegistrationStatus();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/scoreboard/live')) {
    return null;
  }
  return (
    <footer className="relative bg-[#06090D] border-t border-tactical-border pt-16 pb-12 overflow-hidden text-secondaryText">
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-tactical-border/70">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-surface border border-cyan/50 clip-tactical group-hover:border-cyan shadow-[0_0_15px_rgba(0,213,255,0.25)]">
                <Shield className="w-5 h-5 text-cyan" />
              </div>
              <span className="font-display font-black text-xl tracking-wider text-white">
                CST <span className="text-cyan">LAN</span> <span className="text-orange">2026</span>
              </span>
            </Link>

            <p className="text-xs text-secondaryText leading-relaxed max-w-sm">
              The premier Counter-Strike 2 gaming championship organized by the
              <span className="text-white font-semibold"> Computer Science and Technology Degree Programme</span>, 
              Faculty of Applied Sciences, <span className="text-cyan font-semibold">Uva Wellassa University of Sri Lanka</span>.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase bg-surface border border-cyan/30 text-cyan">
                <Radio className="w-3 h-3 animate-pulse text-cyan" /> CS2 SUB-TICK ARCHITECTURE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase bg-surface border border-orange/30 text-orange">
                <Trophy className="w-3 h-3 text-orange" /> 5v5 COMPETITIVE
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan" /> DIRECTORY
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-cyan transition-colors">{"01 // Home"}</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan transition-colors">{"02 // About Tournament"}</Link>
              </li>
              <li>
                <Link href="/#commanders" className="hover:text-cyan transition-colors">{"03 // Commander Showcase"}</Link>
              </li>
              <li>
                <Link href="/#format" className="hover:text-cyan transition-colors">{"04 // Tournament Format"}</Link>
              </li>
              <li>
                <Link href="/#maps" className="hover:text-cyan transition-colors">{"05 // Active Map Pool"}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-orange" /> OPERATIONS
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              {isOpen && (
                <li>
                  <Link href="/register" className="text-cyan hover:underline transition-colors font-bold">
                    {"// Team Registration"}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/teams" className="hover:text-white transition-colors">{"// Registered Squads"}</Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-white transition-colors">{"// Match Schedule"}</Link>
              </li>
              <li>
                <Link href="/scoreboard" className="hover:text-white transition-colors">{"// Live Scoreboard"}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white mb-4">
              HEADQUARTERS
            </h4>
            <p className="text-xs leading-relaxed mb-3">
              Uva Wellassa University of Sri Lanka<br />
              Passara Road, Badulla 90000<br />
              Sri Lanka
            </p>
            <p className="text-xs font-mono text-cyan mb-4">
              cstlan@uwu.ac.lk
            </p>
            <div className="flex items-center gap-2">
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-tactical-border bg-surface flex items-center justify-center text-secondaryText hover:text-cyan hover:border-cyan transition-colors" aria-label="Discord">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-tactical-border bg-surface flex items-center justify-center text-secondaryText hover:text-cyan hover:border-cyan transition-colors" aria-label="Twitch">
                <Twitch className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-tactical-border bg-surface flex items-center justify-center text-secondaryText hover:text-orange hover:border-orange transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-tactical-border bg-surface flex items-center justify-center text-secondaryText hover:text-cyan hover:border-cyan transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <p>© 2026 CST LAN Challenge. Computer Science and Technology Degree Programme, Uva Wellassa University. All rights reserved.</p>
          <div className="flex items-center gap-4 text-secondaryText">
            <span>CS2 IS A TRADEMARK OF VALVE CORPORATION</span>
            <span className="hidden sm:inline">•</span>
            <span>OFFICIAL UNIVERSITY ESPORTS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
