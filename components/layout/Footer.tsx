'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <footer className="relative bg-military-black border-t border-gunmetal pt-16 pb-12 overflow-hidden text-mutedText">
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-olive/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-sand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-olive to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gunmetal/70">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-auto aspect-[1024/456] transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/images/cyber-strike-logo.png"
                  alt="Cyber Strike of Titans 2026"
                  width={130}
                  height={58}
                  sizes="130px"
                  className="h-12 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(255,208,0,0.2)]"
                />
              </div>
            </Link>

            <p className="text-xs text-mutedText leading-relaxed max-w-sm">
              The premier collegiate military tactical gaming championship organized by the
              <span className="text-tacticalWhite font-semibold"> Computer Science and Technology Degree Programme</span>, 
              Faculty of Applied Sciences, <span className="text-sand font-semibold">Uva Wellassa University of Sri Lanka</span>.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase bg-surface border border-olive/40 text-sand">
                <Radio className="w-3 h-3 animate-pulse text-sand" /> CALL OF DUTY 4 MW
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase bg-surface border border-gunmetal text-mutedText">
                <Trophy className="w-3 h-3 text-sand" /> 5v5 SEARCH & DESTROY
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-tacticalWhite mb-4 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sand" /> DIRECTORY
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-sand transition-colors">{"01 // Home"}</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sand transition-colors">{"02 // Tactical Briefing"}</Link>
              </li>
              <li>
                <Link href="/#commanders" className="hover:text-sand transition-colors">{"03 // Task Force Operators"}</Link>
              </li>
              <li>
                <Link href="/#format" className="hover:text-sand transition-colors">{"04 // Mission Format"}</Link>
              </li>
              <li>
                <Link href="/#maps" className="hover:text-sand transition-colors">{"05 // Theater of Operations"}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-tacticalWhite mb-4 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-sand" /> OPERATIONS
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              {isOpen && (
                <li>
                  <Link href="/register" className="text-sand hover:underline transition-colors font-bold">
                    {"// Squad Enlistment"}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/teams" className="hover:text-tacticalWhite transition-colors">{"// Deployed Squads"}</Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-tacticalWhite transition-colors">{"// Mission Schedule"}</Link>
              </li>
              <li>
                <Link href="/scoreboard" className="hover:text-tacticalWhite transition-colors">{"// Telemetry Scoreboard"}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-tacticalWhite mb-4">
              HEADQUARTERS
            </h4>
            <p className="text-xs leading-relaxed mb-3">
              Uva Wellassa University of Sri Lanka<br />
              Passara Road, Badulla 90000<br />
              Sri Lanka
            </p>
            <p className="text-xs font-mono text-sand mb-4">
              cstlan@uwu.ac.lk
            </p>
            <div className="flex items-center gap-2">
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Discord">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Twitch">
                <Twitch className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center md:items-baseline justify-between gap-4 text-[11px] font-mono text-center md:text-left">
          <div>
            <p>© 2026 CST LAN Challenge. Computer Science and Technology Degree Programme, Uva Wellassa University.</p>
            <p className="text-mutedText mt-0.5">All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 text-mutedText self-center md:self-auto shrink-0">
            <span>TACTICAL ESPORTS OPERATIONS</span>
            <span className="hidden sm:inline">•</span>
            <span>OFFICIAL UNIVERSITY CHAMPIONSHIP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
