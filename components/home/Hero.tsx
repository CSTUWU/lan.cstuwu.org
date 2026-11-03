'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { Shield, Crosshair, Trophy, Clock, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import { getStoredCountdown } from '@/lib/storage';
import { api } from '@/lib/api';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 17,
    hours: 8,
    minutes: 45,
    seconds: 0,
  });

  useEffect(() => {
    api.public.getSettings().then((res) => {
      // Background sync
    }).catch(() => {});

    const updateCountdown = () => {
      const active = getStoredCountdown();
      const target = new Date(active.tournamentDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Atmospheric Glow
      tl.fromTo(
        bgGlowRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.8 }
      );

      // Tactical Boundary Frame Fade-in
      tl.fromTo(
        frameRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 1.2 },
        '-=1.4'
      );

      // HUD Corner Telemetry Boundaries
      tl.fromTo(
        hudRef.current?.children || [],
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 },
        '-=1.0'
      );

      // Title Char Reveal
      tl.fromTo(
        titleRef.current?.querySelectorAll('.char-reveal') || [],
        { y: 35, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.05, duration: 0.9 },
        '-=0.8'
      );

      // Subtitle Reveal
      tl.fromTo(
        subtitleRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.6'
      );

      // Countdown Card Reveal
      tl.fromTo(
        countdownRef.current,
        { y: 20, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        '-=0.5'
      );

      // Action Buttons
      tl.fromTo(
        ctaRef.current?.children || [],
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
        '-=0.4'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 bg-[#080B10] border-b border-tactical-border"
    >
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 tactical-grid-bg opacity-25 pointer-events-none" />

      {/* Atmospheric Ambient Lighting Glows */}
      <div
        ref={bgGlowRef}
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      >
        <div className="absolute -left-20 top-1/4 w-[500px] h-[500px] bg-cyan/15 rounded-full blur-[140px]" />
        <div className="absolute -right-20 top-1/4 w-[500px] h-[500px] bg-orange/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan/5 rounded-full blur-[120px]" />
      </div>

      {/* =================================================================== */}
      {/* BEAUTIFUL TACTICAL BOUNDARY FRAME WITH CORNER ACCENTS */}
      {/* =================================================================== */}
      <div
        ref={frameRef}
        className="absolute inset-3 sm:inset-6 lg:inset-10 pointer-events-none border border-tactical-border/50 rounded-sm z-10"
      >
        {/* 4 Outer Glowing Corner Brackets */}
        <span className="absolute -top-[2px] -left-[2px] w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-l-2 border-cyan shadow-[0_0_12px_rgba(0,213,255,0.7)]" />
        <span className="absolute -top-[2px] -right-[2px] w-4 sm:w-6 h-4 sm:h-6 border-t-2 border-r-2 border-orange shadow-[0_0_12px_rgba(255,116,56,0.7)]" />
        <span className="absolute -bottom-[2px] -left-[2px] w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-l-2 border-cyan shadow-[0_0_12px_rgba(0,213,255,0.7)]" />
        <span className="absolute -bottom-[2px] -right-[2px] w-4 sm:w-6 h-4 sm:h-6 border-b-2 border-r-2 border-orange shadow-[0_0_12px_rgba(255,116,56,0.7)]" />

        {/* Top Boundary Center Accent Pip */}
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 px-3 py-0.5 bg-background border border-tactical-border text-[9px] font-mono text-secondaryText tracking-widest hidden sm:flex items-center gap-2 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span>CST_CS2 // TACTICAL GRID BOUNDARY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* MILITARY HUD CORNER BOUNDARIES (DESKTOP) */}
      {/* =================================================================== */}
      <div
        ref={hudRef}
        className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-6 lg:px-14 py-28 hidden lg:flex flex-col justify-between z-20"
      >
        {/* Top Corners */}
        <div className="flex justify-between items-start text-[11px] font-mono tracking-widest">
          <div className="flex items-center gap-2 border-l-2 border-cyan pl-3 py-1 bg-surface/50 backdrop-blur-sm border-t border-cyan/20">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-secondaryText font-bold">TAC_OP // SECTOR_01 [CT_COMMAND]</span>
          </div>
          <div className="flex items-center gap-2 border-r-2 border-orange pr-3 py-1 bg-surface/50 backdrop-blur-sm border-t border-orange/20 text-right">
            <span className="text-secondaryText font-bold">TAC_OP // SECTOR_02 [T_COMMAND]</span>
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          </div>
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between items-end text-[10px] font-mono">
          <div className="bg-surface/50 backdrop-blur-sm px-3 py-1.5 border-l-2 border-b border-cyan/40 border-l-cyan">
            <p className="text-secondaryText">LAT: 6.9934° N, LON: 81.0550° E</p>
            <p className="text-cyan font-bold">BADULLA // UVA WELLASSA UNIVERSITY</p>
          </div>
          <div className="text-right bg-surface/50 backdrop-blur-sm px-3 py-1.5 border-r-2 border-b border-orange/40 border-r-orange">
            <p className="text-secondaryText">ENGINE: SOURCE 2 // SUB-TICK 128</p>
            <p className="text-orange font-bold">STATUS: 5v5 MR12 TOURNAMENT READY</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN CENTERED HERO CONTENT (CLEAN & STREAMLINED) */}
      {/* =================================================================== */}
      <div className="relative z-20 max-w-4xl w-full mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center">
        
        {/* Event Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/80 border border-tactical-border text-xs font-mono text-cyan uppercase tracking-wider mb-5 backdrop-blur-sm">
          <Shield className="w-3.5 h-3.5 text-cyan shrink-0" />
          <span>UVA WELLASSA UNIVERSITY // COUNTER-STRIKE 2</span>
        </div>

        {/* Clean Hero Title */}
        <div ref={titleRef} className="mb-4 select-none">
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.95] text-white">
            <span className="char-reveal inline-block">CST</span>{' '}
            <span className="char-reveal inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-cyan">
              LAN
            </span>{' '}
            <br />
            <span className="char-reveal inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange to-orange">
              CHALLENGE
            </span>{' '}
            <span className="char-reveal inline-block text-white">2026</span>
          </h1>
        </div>

        {/* Concise Subtitle */}
        <div ref={subtitleRef} className="max-w-xl mx-auto space-y-1 mb-8">
          <p className="text-base sm:text-xl font-display font-bold tracking-wide text-white uppercase">
            ENTER THE BATTLEFIELD. PROVE YOUR SKILL.
          </p>
          <p className="text-xs sm:text-sm font-mono text-secondaryText">
            Organized by the Computer Science &amp; Technology Degree Programme
          </p>
        </div>

        {/* Compact Clean Countdown */}
        <div
          ref={countdownRef}
          className="mb-8 w-full max-w-md bg-card/85 border border-tactical-border backdrop-blur-md p-3 sm:p-4 clip-tactical shadow-[0_0_25px_rgba(0,213,255,0.1)]"
        >
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyan uppercase tracking-widest font-bold mb-2.5">
            <Clock className="w-3.5 h-3.5 text-cyan" />
            <span>TOURNAMENT KICKOFF COUNTDOWN</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="bg-surface/80 border border-tactical-border p-2">
              <div className="font-display font-black text-2xl sm:text-3xl text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">DAYS</div>
            </div>
            <div className="bg-surface/80 border border-tactical-border p-2">
              <div className="font-display font-black text-2xl sm:text-3xl text-cyan">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">HOURS</div>
            </div>
            <div className="bg-surface/80 border border-tactical-border p-2">
              <div className="font-display font-black text-2xl sm:text-3xl text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">MINS</div>
            </div>
            <div className="bg-surface/80 border border-orange/40 p-2">
              <div className="font-display font-black text-2xl sm:text-3xl text-orange">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">SECS</div>
            </div>
          </div>
        </div>

        {/* 2 Clean Action Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
        >
          <Button
            href="/register"
            variant="cyan"
            size="lg"
            icon={<Crosshair className="w-4 h-4" />}
            className="w-full sm:w-auto font-black shadow-[0_0_20px_rgba(0,213,255,0.35)]"
          >
            REGISTER YOUR TEAM
          </Button>

          <Button
            href="/#prizepool"
            variant="outline"
            size="lg"
            icon={<Trophy className="w-4 h-4 text-tactical-gold" />}
            className="w-full sm:w-auto hover:border-tactical-gold hover:text-tactical-gold"
          >
            VIEW PRIZE POOL
          </Button>
        </div>

      </div>

      {/* Subtle Scroll Indicator */}
      <Link
        href="/#prizepool"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[9px] font-mono tracking-widest text-secondaryText/60 hover:text-cyan transition-colors z-20 cursor-pointer"
      >
        <span className="hidden sm:inline">EXPLORE TOURNAMENT</span>
        <ChevronDown className="w-3.5 h-3.5 text-cyan animate-bounce" />
      </Link>
    </section>
  );
}
