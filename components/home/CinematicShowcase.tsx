'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import {
  Shield,
  Crosshair,
  Trophy,
  Swords,
  Flame,
  Zap,
  Target,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import Button from '../ui/Button';

const TOTAL_FRAMES = 199;

export default function CinematicShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Content Slide Refs (Left -> Right -> Center)
  const slideLeftRef = useRef<HTMLDivElement>(null);
  const slideRightRef = useRef<HTMLDivElement>(null);
  const slideCenterRef = useRef<HTMLDivElement>(null);

  // HUD telemetry
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const telemetryTagRef = useRef<HTMLSpanElement>(null);

  // Image sequence cache
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  // 1. Draw frame on canvas with aspect ratio cover
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const hRatio = canvasWidth / img.naturalWidth;
    const vRatio = canvasHeight / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);

    const drawWidth = img.naturalWidth * ratio;
    const drawHeight = img.naturalHeight * ratio;
    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    currentFrameRef.current = frameIndex;
  }, []);

  // 2. High-DPI Canvas resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const height = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // 3. Preload frame sequence progressively
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    // Instant load Frame 1
    const firstImg = new Image();
    firstImg.src = '/frames/home/frame_0001.webp';
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      imagesRef.current = images;
      handleResize();
      drawFrame(0);
      setIsReady(true);
    };

    // Load remaining frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `/frames/home/frame_${frameNum}.webp`;
      img.onload = () => {
        if (isCancelled) return;
        images[i] = img;
      };
      img.onerror = () => {
        if (isCancelled) return;
      };
    }

    imagesRef.current = images;

    window.addEventListener('resize', handleResize);
    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, drawFrame]);

  // 4. GSAP ScrollTrigger Sequence: Left -> Right -> Center
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };

      const scrubTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=2400',
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
          onUpdate: (self) => {
            const currentFrame = Math.min(
              TOTAL_FRAMES - 1,
              Math.floor(self.progress * (TOTAL_FRAMES - 1))
            );
            drawFrame(currentFrame);

            // Update bottom telemetry bar
            if (scrubBarRef.current) {
              scrubBarRef.current.style.width = `${Math.round(self.progress * 100)}%`;
            }

            // Update phase tag
            if (telemetryTagRef.current) {
              if (self.progress < 0.35) {
                telemetryTagRef.current.innerText = 'PHASE 1: CT VECTOR DEPLOYMENT // LEFT BRIEFING';
              } else if (self.progress < 0.70) {
                telemetryTagRef.current.innerText = 'PHASE 2: T RAPTOR MOBILIZATION // RIGHT BRIEFING';
              } else {
                telemetryTagRef.current.innerText = 'PHASE 3: CS2 SHOWDOWN // CENTER ARENA';
              }
            }
          },
        },
      });

      // Scrub frames 0 -> 198 across virtual duration 10
      scrubTimeline.to(
        frameObj,
        {
          frame: TOTAL_FRAMES - 1,
          ease: 'none',
          duration: 10,
        },
        0
      );

      // ===================================================================
      // PHASE 1: VECTOR IS ON THE RIGHT -> LEFT SIDE APPEARS!
      // (Scroll 0.0 to 3.2s)
      // ===================================================================
      scrubTimeline.fromTo(
        slideLeftRef.current,
        {
          x: -60,
          opacity: 0,
          scale: 0.94,
          filter: 'blur(8px)',
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power3.out',
          duration: 1.5,
        },
        0.3
      );

      // Slide Left Exits as camera pans to Raptor
      scrubTimeline.to(
        slideLeftRef.current,
        {
          x: -40,
          opacity: 0,
          scale: 0.96,
          filter: 'blur(6px)',
          ease: 'power2.in',
          duration: 1.0,
        },
        3.0
      );

      // ===================================================================
      // PHASE 2: RAPTOR IS ON THE LEFT -> RIGHT SIDE APPEARS!
      // (Scroll 3.6 to 6.8s)
      // ===================================================================
      scrubTimeline.fromTo(
        slideRightRef.current,
        {
          x: 60,
          opacity: 0,
          scale: 0.94,
          filter: 'blur(8px)',
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power3.out',
          duration: 1.5,
        },
        3.8
      );

      // Slide Right Exits as both characters converge
      scrubTimeline.to(
        slideRightRef.current,
        {
          x: 40,
          opacity: 0,
          scale: 0.96,
          filter: 'blur(6px)',
          ease: 'power2.in',
          duration: 1.0,
        },
        6.5
      );

      // ===================================================================
      // PHASE 3: BOTH COMMANDERS STAND FACE-TO-FACE -> CENTER ARENA APPEARS!
      // (Scroll 7.0 to 10.0s)
      // ===================================================================
      scrubTimeline.fromTo(
        slideCenterRef.current,
        {
          y: 50,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(10px)',
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'power3.out',
          duration: 1.8,
        },
        7.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#080B10] overflow-hidden select-none border-b border-tactical-border"
    >
      {/* =================================================================== */}
      {/* 1. CINEMATIC VIDEO FRAME SCRUBBING CANVAS & ZERO-LATENCY POSTER */}
      {/* =================================================================== */}
      {/* Instant poster so user sees frame 1 with 0ms delay */}
      <img
        src="/frames/home/frame_0001.webp"
        alt="CS2 Cinematic Preview"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.92)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.92)' }}
      />

      {/* =================================================================== */}
      {/* 2. ATMOSPHERIC GRADIENT SCATTER OVERLAYS */}
      {/* =================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Subtle Edge Vignettes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,11,16,0.1)_0%,rgba(8,11,16,0.85)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#080B10] via-[#080B10]/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080B10] via-[#080B10]/80 to-transparent" />

        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 tactical-grid-bg opacity-15" />
      </div>

      {/* =================================================================== */}
      {/* 3. TACTICAL CORNER BOUNDARY ACCENTS */}
      {/* =================================================================== */}
      <div className="absolute inset-4 sm:inset-6 lg:inset-8 pointer-events-none border border-tactical-border/40 rounded-sm z-10">
        <span className="absolute -top-[2px] -left-[2px] w-5 h-5 border-t-2 border-l-2 border-cyan shadow-[0_0_12px_rgba(0,213,255,0.7)]" />
        <span className="absolute -top-[2px] -right-[2px] w-5 h-5 border-t-2 border-r-2 border-orange shadow-[0_0_12px_rgba(255,116,56,0.7)]" />
        <span className="absolute -bottom-[2px] -left-[2px] w-5 h-5 border-b-2 border-l-2 border-cyan shadow-[0_0_12px_rgba(0,213,255,0.7)]" />
        <span className="absolute -bottom-[2px] -right-[2px] w-5 h-5 border-b-2 border-r-2 border-orange shadow-[0_0_12px_rgba(255,116,56,0.7)]" />

        {/* Bottom Real-time Telemetry Scrub Status */}
        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 px-4 py-0.5 bg-[#080B10]/95 border border-tactical-border text-[9px] sm:text-[10px] font-mono text-secondaryText tracking-widest flex items-center gap-3 backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-cyan animate-pulse" />
          <div className="w-20 sm:w-32 h-1 bg-surface border border-tactical-border rounded-full overflow-hidden">
            <div
              ref={scrubBarRef}
              className="h-full bg-gradient-to-r from-cyan via-white to-orange transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>
          <span ref={telemetryTagRef} className="text-cyan font-bold uppercase truncate max-w-[200px] sm:max-w-none">
            PHASE 1: CT VECTOR DEPLOYMENT // LEFT BRIEFING
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. CHOREOGRAPHED CONTENT LAYERS */}
      {/* =================================================================== */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 1: APPEARS ON LEFT (Vector is visible on the right!) */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={slideLeftRef}
          className="absolute left-4 sm:left-8 lg:left-12 max-w-lg lg:max-w-xl w-full opacity-0 pointer-events-auto will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-[#080B10]/90 border border-cyan/40 backdrop-blur-2xl rounded-md shadow-[0_0_45px_rgba(0,213,255,0.25)]">
            {/* Tactical Corner Marks */}
            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan" />

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-tactical-border/60 pb-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan" />
                <span className="text-[10px] font-mono text-cyan uppercase font-bold tracking-widest">
                  FACTION 01 // CT VECTOR RECON
                </span>
              </div>
              <span className="text-[9px] font-mono text-secondaryText px-2 py-0.5 bg-surface border border-tactical-border">
                DEFENSE MANDATE
              </span>
            </div>

            {/* Main Title */}
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase leading-tight mb-2">
              BATTLE FOR <span className="text-cyan">GLORY</span> &amp; TOURNAMENT <span className="text-tactical-gold">HONORS</span>
            </h2>

            <p className="text-xs sm:text-sm font-mono text-secondaryText leading-relaxed mb-5">
              Represent your university. The CST LAN Challenge 2026 brings elite student athletes together under Valve&apos;s Counter-Strike 2 sub-tick architecture.
            </p>

            {/* Reward Pool Highlight Banner */}
            <div className="p-3.5 bg-surface/70 border border-cyan/30 rounded mb-5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-secondaryText uppercase tracking-wider block">
                  COMMITTED CHAMPION POOL
                </span>
                <span className="font-display font-black text-xl sm:text-2xl text-tactical-gold">
                  LKR 80,000 + GRAND TROPHY
                </span>
              </div>
              <div className="p-2.5 bg-cyan/10 border border-cyan/40 text-cyan shrink-0">
                <Trophy className="w-5 h-5 text-tactical-gold" />
              </div>
            </div>

            {/* Bullet Highlights */}
            <div className="space-y-2 font-mono text-xs text-white/90 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
                <span>Source 2 High-Precision Tickless LAN Environment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
                <span>Collegiate Prestige &amp; Permanent Hall of Fame Entry</span>
              </div>
            </div>

            {/* Action Link */}
            <div className="flex items-center gap-3">
              <Button
                href="/#prizepool"
                variant="cyan"
                size="md"
                icon={<Trophy className="w-4 h-4" />}
                className="font-bold text-xs uppercase shadow-[0_0_20px_rgba(0,213,255,0.4)]"
              >
                VIEW FULL PRIZE POOL
              </Button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 2: APPEARS ON RIGHT (Raptor is visible on the left!) */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={slideRightRef}
          className="absolute right-4 sm:right-8 lg:right-12 max-w-lg lg:max-w-xl w-full ml-auto opacity-0 pointer-events-auto will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-[#080B10]/90 border border-orange/40 backdrop-blur-2xl rounded-md shadow-[0_0_45px_rgba(255,116,56,0.25)]">
            {/* Tactical Corner Marks */}
            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-orange" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-orange" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-orange" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-orange" />

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-tactical-border/60 pb-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange" />
                <span className="text-[10px] font-mono text-orange uppercase font-bold tracking-widest">
                  FACTION 02 // T RAPTOR ASSAULT
                </span>
              </div>
              <span className="text-[9px] font-mono text-secondaryText px-2 py-0.5 bg-surface border border-tactical-border">
                OFFENSE PROTOCOL
              </span>
            </div>

            {/* Main Title */}
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase leading-tight mb-2">
              5v5 MR12 <span className="text-orange">COMPETITIVE</span> ESPORTS RULES
            </h2>

            <p className="text-xs sm:text-sm font-mono text-secondaryText leading-relaxed mb-5">
              Strict competitive Valve rules apply. Teams navigate a tactical double-elimination bracket with map vetoes, overtime MR3 deciders, and strict anti-cheat verification.
            </p>

            {/* Feature Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
              <div className="p-3 bg-surface/70 border border-orange/30 rounded">
                <span className="text-[9px] text-secondaryText uppercase tracking-wider block">
                  ROUND STRUCTURE
                </span>
                <span className="font-display font-black text-lg text-white">
                  MR12 (FIRST TO 13)
                </span>
              </div>
              <div className="p-3 bg-surface/70 border border-orange/30 rounded">
                <span className="text-[9px] text-secondaryText uppercase tracking-wider block">
                  ROSTER SIZE
                </span>
                <span className="font-display font-black text-lg text-orange">
                  5 PLAYERS + 1 SUB
                </span>
              </div>
            </div>

            {/* Bullet Highlights */}
            <div className="space-y-2 font-mono text-xs text-white/90 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                <span>Valve Anti-Cheat (VAC) &amp; Verified Steam IDs required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                <span>Double Elimination Championship Bracket</span>
              </div>
            </div>

            {/* Action Link */}
            <div className="flex items-center gap-3">
              <Button
                href="/about"
                variant="outline"
                size="md"
                icon={<Crosshair className="w-4 h-4 text-orange" />}
                className="font-bold text-xs uppercase border-orange/50 hover:border-orange hover:text-orange"
              >
                TOURNAMENT RULES &amp; FAQ
              </Button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SLIDE 3: APPEARS IN CENTER (Both Vector and Raptor face each other!) */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={slideCenterRef}
          className="absolute left-1/2 -translate-x-1/2 max-w-xl sm:max-w-2xl w-full px-4 text-center opacity-0 pointer-events-auto will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-[#080B10]/95 border border-tactical-gold/60 backdrop-blur-2xl rounded-md shadow-[0_0_60px_rgba(255,184,0,0.3)]">
            {/* Top Center Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-tactical-gold via-yellow-300 to-tactical-gold text-background font-mono text-[10px] font-black uppercase tracking-widest clip-tactical shadow-lg flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-background" />
              <span>THE GRAND CONFRONTATION</span>
            </div>

            {/* Corner Tactical Marks */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-tactical-gold" />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-tactical-gold" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-tactical-gold" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-tactical-gold" />

            {/* Main Showdown Title */}
            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-tight mb-2 mt-2">
              CHOOSE YOUR <span className="text-cyan">SIDE</span>. PROVE YOUR <span className="text-orange">DOMINANCE</span>.
            </h2>

            <p className="text-xs sm:text-sm font-mono text-secondaryText leading-relaxed mb-5 max-w-lg mx-auto">
              7 Active Duty Maps. Full Sub-Tick 128 Telemetry. Ready your squad to enter the collegiate Counter-Strike 2 championship arena.
            </p>

            {/* Map Pool Lineup Strip */}
            <div className="p-3 bg-surface/80 border border-tactical-border rounded mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono text-white">
              <span className="px-2 py-0.5 bg-cyan/10 border border-cyan/40 text-cyan font-bold">DE_MIRAGE</span>
              <span className="px-2 py-0.5 bg-orange/10 border border-orange/40 text-orange font-bold">DE_INFERNO</span>
              <span className="px-2 py-0.5 bg-cyan/10 border border-cyan/40 text-cyan font-bold">DE_NUKE</span>
              <span className="px-2 py-0.5 bg-orange/10 border border-orange/40 text-orange font-bold">DE_DUST2</span>
              <span className="px-2 py-0.5 bg-cyan/10 border border-cyan/40 text-cyan font-bold">DE_ANUBIS</span>
              <span className="px-2 py-0.5 bg-orange/10 border border-orange/40 text-orange font-bold">DE_ANCIENT</span>
            </div>

            {/* 2 Centered CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                href="/register"
                variant="cyan"
                size="lg"
                icon={<Crosshair className="w-4 h-4" />}
                className="w-full sm:w-auto font-black shadow-[0_0_25px_rgba(0,213,255,0.4)] text-xs sm:text-sm"
              >
                REGISTER YOUR TEAM
              </Button>

              <Button
                href="/#prizepool"
                variant="outline"
                size="lg"
                icon={<Trophy className="w-4 h-4 text-tactical-gold" />}
                className="w-full sm:w-auto hover:border-tactical-gold hover:text-tactical-gold bg-surface/70 text-xs sm:text-sm"
              >
                VIEW PRIZE TIERS
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

