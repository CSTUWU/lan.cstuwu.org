'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Shield, Radio, Terminal, Cpu, Trophy, Youtube, Facebook, Mail, Phone } from 'lucide-react';
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
                <Link href="/#format" className="hover:text-sand transition-colors">{"03 // Mission Format"}</Link>
              </li>
              <li>
                <Link href="/#maps" className="hover:text-sand transition-colors">{"04 // Theater of Operations"}</Link>
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
            <div className="space-y-1.5 mb-4 text-xs font-mono">
              <a 
                href="mailto:cstlanchallenge@gmail.com" 
                className="text-sand hover:underline flex items-center gap-1.5 transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-sand shrink-0" />
                cstlanchallenge@gmail.com
              </a>

              <a 
                href="tel:0763043722" 
                className="text-tacticalWhite hover:text-sand hover:underline flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-sand shrink-0" />
                Tharindu: 076 304 3722
              </a>

              <a 
                href="https://wa.me/94763043722" 
                target="_blank" 
                rel="noreferrer" 
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp: 076 304 3722
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://web.facebook.com/cyberstrikeoftitans" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@cstlanchallenge" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://wa.me/94763043722" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-emerald-400 hover:border-emerald-400 transition-colors" aria-label="WhatsApp">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="tel:0763043722" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Call Tharindu">
                <Phone className="w-4 h-4" />
              </a>
              <a href="mailto:cstlanchallenge@gmail.com" className="w-8 h-8 rounded-none border border-gunmetal bg-surface flex items-center justify-center text-mutedText hover:text-sand hover:border-sand transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
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
