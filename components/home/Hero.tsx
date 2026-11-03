'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { Shield, Crosshair, ChevronDown, Zap, Terminal, Trophy } from 'lucide-react';
import Button from '../ui/Button';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const vectorRef = useRef<HTMLDivElement>(null);
  const reaperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Initial Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate background glow
      tl.fromTo(
        bgGlowRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 2 }
      );

      // Vector slide from left
      tl.fromTo(
        vectorRef.current,
        { x: -80, opacity: 0, filter: 'brightness(0.3)' },
        { x: 0, opacity: 1, filter: 'brightness(1)', duration: 1.2 },
        '-=1.5'
      );

      // Reaper slide from right
      tl.fromTo(
        reaperRef.current,
        { x: 80, opacity: 0, filter: 'brightness(0.3)' },
        { x: 0, opacity: 1, filter: 'brightness(1)', duration: 1.2 },
        '-=1.2'
      );

      // Stagger center elements
      tl.fromTo(
        titleRef.current?.querySelectorAll('.char-reveal') || [],
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.8 },
        '-=1.0'
      );

      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );

      tl.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );

      tl.fromTo(
        hudRef.current?.children || [],
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, stagger: 0.1, duration: 0.8 },
        '-=0.5'
      );

      // Mouse Parallax on Desktop
      const handleMouseMove = (e: MouseEvent) => {
        if (!heroRef.current || window.innerWidth < 1024) return;
        const { clientX, clientY } = e;
        const xPos = clientX / window.innerWidth - 0.5;
        const yPos = clientY / window.innerHeight - 0.5;

        gsap.to(vectorRef.current, {
          x: xPos * -25,
          y: yPos * -15,
          duration: 1.2,
          ease: 'power2.out',
        });

        gsap.to(reaperRef.current, {
          x: xPos * 25,
          y: yPos * -15,
          duration: 1.2,
          ease: 'power2.out',
        });

        gsap.to(titleRef.current, {
          x: xPos * 12,
          y: yPos * 8,
          duration: 1.5,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16 bg-[#080B10]"
    >
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 tactical-grid-bg opacity-30 pointer-events-none" />

      {/* Dual Lighting Effects */}
      <div
        ref={bgGlowRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Cyan Ambient Left (Vector) */}
        <div className="absolute -left-20 top-1/4 w-[500px] h-[500px] bg-cyan/15 rounded-full blur-[140px]" />
        {/* Orange Ambient Right (Reaper) */}
        <div className="absolute -right-20 top-1/4 w-[500px] h-[500px] bg-orange/15 rounded-full blur-[140px]" />
        {/* Center Spotlight */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Military HUD corner coordinates */}
      <div
        ref={hudRef}
        className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-6 py-28 hidden lg:flex flex-col justify-between"
      >
        <div className="flex justify-between items-start text-[11px] font-mono text-secondaryText/70 tracking-widest">
          <div className="flex items-center gap-2 border-l-2 border-cyan pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span>{"TAC_OP // SECTOR_01 [CT_COMMAND]"}</span>
          </div>
          <div className="flex items-center gap-2 border-r-2 border-orange pr-2 text-right">
            <span>{"TAC_OP // SECTOR_02 [T_COMMAND]"}</span>
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between items-end text-[10px] font-mono text-secondaryText/60">
          <div>
            <p>LAT: 6.9934° N, LON: 81.0550° E</p>
            <p className="text-cyan">{"BADULLA // UVA WELLASSA UNIVERSITY"}</p>
          </div>
          <div className="text-right">
            <p>{"ENGINE: SOURCE 2 // SUB-TICK 128"}</p>
            <p className="text-orange">STATUS: TOURNAMENT DEPLOYMENT READY</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center min-h-[620px] lg:min-h-[720px]">
          
          {/* LEFT: COMMANDER VECTOR (CT) */}
          <div
            ref={vectorRef}
            className="col-span-1 lg:col-span-3 order-2 lg:order-1 flex flex-col items-center lg:items-start group w-full"
          >
            <div className="relative w-full max-w-[280px] lg:max-w-none h-[280px] sm:h-[380px] lg:h-[500px] overflow-hidden rounded-md border border-cyan/40 bg-surface/40 backdrop-blur-sm shadow-[0_0_35px_rgba(0,213,255,0.25)] transition-all duration-500 hover:border-cyan hover:shadow-[0_0_50px_rgba(0,213,255,0.4)]">
              {/* Corner tactical brackets */}
              <span className="absolute top-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-cyan z-20" />
              <span className="absolute top-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-cyan z-20" />
              <span className="absolute bottom-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-cyan z-20" />
              <span className="absolute bottom-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-cyan z-20" />

              {/* Tag Header */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-20 flex justify-between items-center text-[9px] sm:text-[10px] font-mono tracking-wider">
                <span className="px-1.5 sm:px-2 py-0.5 bg-cyan/20 text-cyan border border-cyan/40 font-bold truncate">
                  CT COMMANDER
                </span>
                <span className="text-cyan/80 hidden sm:inline">#01_TACTICAL</span>
              </div>

              {/* Character Poster */}
              <Image
                src="/images/commanders/vector.jpeg"
                alt="Commander Vector - CT Team Commander"
                fill
                priority
                className="object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 280px, 320px"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-90 z-10" />

              {/* Bottom Character Info */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
                <div className="text-[9px] sm:text-[10px] font-mono text-cyan uppercase tracking-widest flex items-center gap-1.5 mb-0.5 sm:mb-1">
                  <span className="w-1.5 h-1.5 bg-cyan animate-pulse" />
                  <span className="truncate">CYAN OPERATOR</span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-2xl text-white tracking-wider">
                  VECTOR
                </h3>
                <p className="text-[10px] sm:text-[11px] text-secondaryText leading-tight mt-0.5 sm:mt-1 hidden sm:block">
                  Tactical Recon & In-Game Command specialist. Holographic defense deployment.
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: TOURNAMENT IDENTITY & ACTIONS */}
          <div className="col-span-2 lg:col-span-6 order-1 lg:order-2 text-center flex flex-col items-center justify-center py-4 lg:py-6">
            {/* University & Degree Programme Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface/80 border border-tactical-border clip-badge mb-3 sm:mb-4 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-cyan shrink-0" />
              <span className="text-[10px] sm:text-xs font-mono font-medium tracking-wider text-secondaryText truncate max-w-[280px] sm:max-w-none">
                UVA WELLASSA UNIVERSITY OF SRI LANKA
              </span>
            </div>

            {/* Game Badge */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="h-[1px] w-6 sm:w-8 bg-cyan" />
              <span className="text-[11px] sm:text-sm font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] text-cyan uppercase">
                COUNTER-STRIKE 2 ESPORTS
              </span>
              <span className="h-[1px] w-6 sm:w-8 bg-orange" />
            </div>

            {/* Main Title */}
            <div ref={titleRef} className="mb-3 sm:mb-4">
              <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.95] text-white">
                <span className="char-reveal inline-block">CST</span>{' '}
                <span className="char-reveal inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-cyan">
                  LAN
                </span>{' '}
                <br className="hidden sm:inline" />
                <span className="char-reveal inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange to-orange">
                  CHALLENGE
                </span>{' '}
                <span className="char-reveal inline-block text-white">2026</span>
              </h1>
            </div>

            {/* Subtitle & Official Organizer hierarchy */}
            <div ref={subtitleRef} className="max-w-xl mx-auto space-y-1.5 sm:space-y-2 mb-6 sm:mb-8 px-2">
              <p className="text-sm sm:text-lg md:text-xl font-display font-bold tracking-wider sm:tracking-widest text-primaryText uppercase">
                ENTER THE BATTLEFIELD. PROVE YOUR SKILL.
              </p>
              <p className="text-[11px] sm:text-sm font-mono text-cyan/90 uppercase tracking-wider">
                &ldquo;POWERED BY COMPETITION. UNITED BY TECHNOLOGY.&rdquo;
              </p>
              <p className="text-[11px] sm:text-xs text-secondaryText font-mono">
                Organized by the <span className="text-white font-medium">Computer Science and Technology Degree Programme</span>
                <br className="hidden sm:inline" /> Uva Wellassa University of Sri Lanka
              </p>
            </div>

            {/* Action Buttons */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
            >
              <Button
                href="/register"
                variant="cyan"
                size="lg"
                icon={<Crosshair className="w-5 h-5" />}
                className="w-full sm:w-auto text-xs sm:text-sm lg:text-base font-extrabold"
              >
                REGISTER YOUR TEAM
              </Button>

              <Button
                href="/#commanders"
                variant="outline"
                size="lg"
                icon={<Trophy className="w-4 h-4" />}
                className="w-full sm:w-auto text-xs sm:text-sm lg:text-base"
              >
                EXPLORE TOURNAMENT
              </Button>
            </div>

            {/* Quick Live Preview Banner */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono text-secondaryText border border-tactical-border/70 bg-surface/50 px-3 sm:px-4 py-2 clip-tactical">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-white font-bold">STATUS:</span>
                <span className="text-cyan">REGISTRATION ACTIVE</span>
              </div>
              <span className="text-tactical-border hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-orange shrink-0" />
                <span>FORMAT: 5v5 COMPETITIVE CS2</span>
              </div>
            </div>
          </div>

          {/* RIGHT: COMMANDER REAPER (T) */}
          <div
            ref={reaperRef}
            className="col-span-1 lg:col-span-3 order-3 flex flex-col items-center lg:items-end group w-full"
          >
            <div className="relative w-full max-w-[280px] lg:max-w-none h-[280px] sm:h-[380px] lg:h-[500px] overflow-hidden rounded-md border border-orange/40 bg-surface/40 backdrop-blur-sm shadow-[0_0_35px_rgba(255,116,56,0.25)] transition-all duration-500 hover:border-orange hover:shadow-[0_0_50px_rgba(255,116,56,0.4)]">
              {/* Corner tactical brackets */}
              <span className="absolute top-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-l-2 border-orange z-20" />
              <span className="absolute top-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border-t-2 border-r-2 border-orange z-20" />
              <span className="absolute bottom-2 left-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-l-2 border-orange z-20" />
              <span className="absolute bottom-2 right-2 w-3 sm:w-4 h-3 sm:h-4 border-b-2 border-r-2 border-orange z-20" />

              {/* Tag Header */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-20 flex justify-between items-center text-[9px] sm:text-[10px] font-mono tracking-wider">
                <span className="px-1.5 sm:px-2 py-0.5 bg-orange/20 text-orange border border-orange/40 font-bold truncate">
                  T COMMANDER
                </span>
                <span className="text-orange/80 hidden sm:inline">#02_TACTICAL</span>
              </div>

              {/* Character Poster */}
              <Image
                src="/images/commanders/reaper.jpeg"
                alt="Commander Reaper - T Team Commander"
                fill
                priority
                className="object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 280px, 320px"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-90 z-10" />

              {/* Bottom Character Info */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
                <div className="text-[9px] sm:text-[10px] font-mono text-orange uppercase tracking-widest flex items-center gap-1.5 mb-0.5 sm:mb-1">
                  <span className="w-1.5 h-1.5 bg-orange animate-pulse" />
                  <span className="truncate">ORANGE OPERATOR</span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-2xl text-white tracking-wider">
                  REAPER
                </h3>
                <p className="text-[10px] sm:text-[11px] text-secondaryText leading-tight mt-0.5 sm:mt-1 hidden sm:block">
                  High-caliber frontline assault leader. Master of site entry, rifle dominance, and territory disruption.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] font-mono tracking-widest text-secondaryText/70 animate-bounce pointer-events-none">
        <span>SCROLL DOWN</span>
        <ChevronDown className="w-4 h-4 text-cyan" />
      </div>
    </section>
  );
}
