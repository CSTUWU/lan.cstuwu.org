'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Shield, Crosshair, Trophy, Clock, ChevronDown, Activity, Mouse, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { getStoredCountdown } from '@/lib/storage';
import { api } from '@/lib/api';

const TOTAL_FRAMES = 199;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const topStandoffBadgeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const countdownBlockRef = useRef<HTMLDivElement>(null);
  const ctaBlockRef = useRef<HTMLDivElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  // Loaded frames cache
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 17,
    hours: 8,
    minutes: 45,
    seconds: 0,
  });

  // 1. Live Countdown ticker
  useEffect(() => {
    api.public.getSettings().then(() => {}).catch(() => {});

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

  // 2. Render frame to canvas with aspect-ratio cover
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Aspect ratio cover
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

  // 3. Canvas resize handler for Retina / 4K
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // 4. Preload frame sequence
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    // Load Frame 1 immediately for instant paint
    const firstImg = new Image();
    firstImg.src = '/frames/hero/frame_0001.webp';
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      imagesRef.current = images;
      handleResize();
      drawFrame(0);
      setIsReady(true);
    };

    // Load remaining frames progressively
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `/frames/hero/frame_${frameNum}.webp`;
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

  // 5. GSAP ScrollTrigger Sequence & Choreography
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.opacity = '1';
        contentWrapperRef.current.style.pointerEvents = 'auto';
      }
      window.dispatchEvent(new CustomEvent('cst_hero_text_visible', { detail: { visible: true } }));
      return;
    }

    const ctx = gsap.context(() => {
      const frameObj = { frame: 0 };
      let lastNotifiedVisible: boolean | null = null;

      // Master Scroll Scrubbing Timeline
      const scrubTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=2500',
          pin: true,
          scrub: 0.35,
          anticipatePin: 1,
          onUpdate: (self) => {
            const currentFrame = Math.min(
              TOTAL_FRAMES - 1,
              Math.floor(self.progress * (TOTAL_FRAMES - 1))
            );
            drawFrame(currentFrame);

            // Update scrub HUD telemetry
            if (scrubBarRef.current) {
              scrubBarRef.current.style.width = `${Math.round(self.progress * 100)}%`;
            }
            if (progressTextRef.current) {
              const sec = (self.progress * 9.96).toFixed(1);
              progressTextRef.current.innerText = `00:0${sec}s // ${(self.progress * 100).toFixed(0)}%`;
            }

            // Notify Navbar when text appears (progress >= 0.55 when characters slide out)
            const isTextVisible = self.progress >= 0.55;
            if (lastNotifiedVisible !== isTextVisible) {
              lastNotifiedVisible = isTextVisible;
              window.dispatchEvent(
                new CustomEvent('cst_hero_text_visible', { detail: { visible: isTextVisible } })
              );
            }
          },
        },
      });

      // Frame scrubbing virtual property across the full 10-second sequence
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
      // PHASE 1 (0.0 to 3.0s): INITIAL LOAD - CHARACTERS ARE FACING OFF
      // The initial prominent "SCROLL DOWN" callout and top tag fade out
      // as the user scrolls down!
      // ===================================================================
      scrubTimeline.to(
        [scrollHintRef.current, topStandoffBadgeRef.current],
        {
          opacity: 0,
          y: -20,
          duration: 1.8,
          ease: 'power2.in',
        },
        0.8
      );

      // ===================================================================
      // PHASE 2 (5.5s to 7.0s): CHARACTERS SLIDE OUT
      // Video camera zooms through and characters slide off-screen.
      // ===================================================================

      // ===================================================================
      // PHASE 3 (5.8s to 8.8s): CHARACTERS HAVE MOVED OUT -> LOAD TEXT WITH ANIMATIONS!
      // Navbar also slides down in sync.
      // ===================================================================
      scrubTimeline.fromTo(
        contentWrapperRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: 35,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power3.out',
          duration: 2.8,
          onStart: () => {
            if (contentWrapperRef.current) {
              contentWrapperRef.current.style.pointerEvents = 'auto';
            }
          },
          onReverseComplete: () => {
            if (contentWrapperRef.current) {
              contentWrapperRef.current.style.pointerEvents = 'none';
            }
          },
        },
        5.8
      );

      // Countdown Block drops into position with a glowing pulse
      scrubTimeline.fromTo(
        countdownBlockRef.current,
        {
          y: 25,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 2.2,
          ease: 'back.out(1.4)',
        },
        6.6
      );

      // CTA Buttons lock into high visibility
      scrubTimeline.fromTo(
        ctaBlockRef.current,
        {
          y: 20,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: 'power3.out',
        },
        7.2
      );

      // Initial entrance timeline (plays once when page loads)
      const enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      enterTl.fromTo(
        frameRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 1.2 }
      );

      enterTl.fromTo(
        hudRef.current?.children || [],
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.7 },
        '-=0.8'
      );

      enterTl.fromTo(
        topStandoffBadgeRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      );

      enterTl.fromTo(
        scrollHintRef.current,
        { opacity: 0, y: 25, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9 },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [drawFrame]);

  // Smooth scroll helper when clicking the initial cue
  const handleScrollToContent = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 1550,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#080B10] overflow-hidden select-none"
    >
      {/* =================================================================== */}
      {/* 1. CINEMATIC VIDEO FRAME SCRUBBING CANVAS */}
      {/* =================================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.92)' }}
      />

      {/* =================================================================== */}
      {/* 2. ATMOSPHERIC TACTICAL GRADIENT OVERLAYS */}
      {/* =================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,11,16,0.15)_0%,rgba(8,11,16,0.85)_100%)]" />

        {/* Top & Bottom Depth Scrims */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#080B10] via-[#080B10]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#080B10] via-[#080B10]/80 to-transparent" />

        {/* Tactical Subtle Grid */}
        <div className="absolute inset-0 tactical-grid-bg opacity-15" />
      </div>

      {/* =================================================================== */}
      {/* 3. TACTICAL BOUNDARY FRAME WITH CORNER ACCENTS (USER LOVED BOUNDARY) */}
      {/* =================================================================== */}
      <div
        ref={frameRef}
        className="absolute inset-3 sm:inset-5 lg:inset-8 pointer-events-none border border-tactical-border/60 rounded-sm z-10"
      >
        {/* 4 Outer Glowing Corner Brackets */}
        <span className="absolute -top-[2px] -left-[2px] w-5 sm:w-7 h-5 sm:h-7 border-t-2 border-l-2 border-cyan shadow-[0_0_15px_rgba(0,213,255,0.8)]" />
        <span className="absolute -top-[2px] -right-[2px] w-5 sm:w-7 h-5 sm:h-7 border-t-2 border-r-2 border-orange shadow-[0_0_15px_rgba(255,116,56,0.8)]" />
        <span className="absolute -bottom-[2px] -left-[2px] w-5 sm:w-7 h-5 sm:h-7 border-b-2 border-l-2 border-cyan shadow-[0_0_15px_rgba(0,213,255,0.8)]" />
        <span className="absolute -bottom-[2px] -right-[2px] w-5 sm:w-7 h-5 sm:h-7 border-b-2 border-r-2 border-orange shadow-[0_0_15px_rgba(255,116,56,0.8)]" />

        {/* Bottom Interactive Video Scrub Telemetry */}
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#080B10]/95 border border-tactical-border text-[9px] font-mono text-secondaryText tracking-widest flex items-center gap-2.5 backdrop-blur-md">
          <Activity className="w-3 h-3 text-cyan" />
          <div className="w-16 sm:w-28 h-1 bg-surface border border-tactical-border rounded-full overflow-hidden">
            <div
              ref={scrubBarRef}
              className="h-full bg-gradient-to-r from-cyan via-white to-orange transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>
          <span ref={progressTextRef} className="text-cyan font-bold">
            00:00.0s // 0%
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MILITARY HUD CORNER BOUNDARIES (DESKTOP) */}
      {/* =================================================================== */}
      <div
        ref={hudRef}
        className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 hidden lg:flex flex-col justify-between z-20"
      >
        {/* Top Corners */}
        <div className="flex justify-between items-start text-[11px] font-mono tracking-widest">
          <div className="flex items-center gap-2 border-l-2 border-cyan pl-3 py-1 bg-surface/60 backdrop-blur-md border-t border-cyan/20">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="text-white font-bold">TAC_OP // SECTOR_01 [VECTOR]</span>
          </div>
          <div className="flex items-center gap-2 border-r-2 border-orange pr-3 py-1 bg-surface/60 backdrop-blur-md border-t border-orange/20 text-right">
            <span className="text-white font-bold">TAC_OP // SECTOR_02 [RAPTOR]</span>
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          </div>
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between items-end text-[10px] font-mono">
          <div className="bg-surface/60 backdrop-blur-md px-3 py-1.5 border-l-2 border-b border-cyan/40 border-l-cyan">
            <p className="text-secondaryText">LAT: 6.9934° N, LON: 81.0550° E</p>
            <p className="text-cyan font-bold">BADULLA // UVA WELLASSA UNIVERSITY</p>
          </div>
          <div className="text-right bg-surface/60 backdrop-blur-md px-3 py-1.5 border-r-2 border-b border-orange/40 border-r-orange">
            <p className="text-secondaryText">ENGINE: SOURCE 2 // SUB-TICK 128</p>
            <p className="text-orange font-bold">STATUS: 5v5 MR12 TOURNAMENT READY</p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TOP STANDOFF BADGE (VISIBLE ON FIRST LOAD) */}
      {/* Immediately identifies the tournament to any visitor */}
      {/* =================================================================== */}
      <div
        ref={topStandoffBadgeRef}
        className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#080B10]/90 border border-tactical-border clip-badge backdrop-blur-md shadow-2xl">
          <Shield className="w-4 h-4 text-cyan shrink-0" />
          <span className="text-xs sm:text-sm font-display font-black text-white tracking-wider uppercase">
            CST LAN CHALLENGE 2026
          </span>
          <span className="text-tactical-border font-mono text-[10px]">|</span>
          <span className="text-[10px] sm:text-xs font-mono text-cyan font-bold tracking-wider">
            COUNTER-STRIKE 2
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PROMINENT INITIAL "SCROLL DOWN" CALLOUT (VISIBLE ON FIRST LOAD) */}
      {/* Clearly tells the visitor to scroll down (or click) to reveal all details! */}
      {/* =================================================================== */}
      <div
        ref={scrollHintRef}
        onClick={handleScrollToContent}
        className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 text-center cursor-pointer group"
      >
        {/* Animated Tactical Scroll Down Card */}
        <div className="relative px-5 sm:px-7 py-3 bg-[#080B10]/95 border border-cyan/50 backdrop-blur-xl rounded-md shadow-[0_0_35px_rgba(0,213,255,0.35)] transition-all duration-300 group-hover:border-cyan group-hover:shadow-[0_0_50px_rgba(0,213,255,0.6)] group-hover:scale-105 flex items-center gap-3.5">
          {/* Outer corner micro accents */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-orange" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-orange" />

          {/* Mouse Scroll Wheel Icon Animation */}
          <div className="w-5 h-8 rounded-full border-2 border-cyan/80 flex items-start justify-center p-1 bg-surface/80 shrink-0">
            <div className="w-1.5 h-2.5 rounded-full bg-cyan animate-bounce" />
          </div>

          <div className="text-left font-mono">
            <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-white flex items-center gap-1.5 group-hover:text-cyan transition-colors">
              <span>SCROLL DOWN TO REVEAL</span>
              <ChevronDown className="w-4 h-4 text-cyan animate-bounce" />
            </div>
            <p className="text-[10px] text-secondaryText tracking-wide mt-0.5">
              Watch standoff &amp; unlock tournament details
            </p>
          </div>
        </div>

        {/* Small Subtitle Cue */}
        <span className="text-[10px] font-mono text-cyan/80 tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
          SCROLL WHEEL • SWIPE • OR CLICK TO ENTER
        </span>
      </div>

      {/* =================================================================== */}
      {/* 5. HERO TEXT & CONTENT (REVEALED WHEN CHARACTERS MOVE OUT!) */}
      {/* Features ample top clearance (pt-24 lg:pt-32) to eliminate any navbar overlap! */}
      {/* =================================================================== */}
      <div
        ref={contentWrapperRef}
        className="relative z-20 h-full max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center pt-24 sm:pt-28 lg:pt-32 pb-8 opacity-0 pointer-events-none will-change-transform"
      >
        {/* Event Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/90 border border-tactical-border text-[11px] sm:text-xs font-mono text-cyan uppercase tracking-wider mb-3 backdrop-blur-md shadow-xl">
          <Shield className="w-3.5 h-3.5 text-cyan shrink-0" />
          <span>UVA WELLASSA UNIVERSITY // COUNTER-STRIKE 2</span>
        </div>

        {/* Title Block */}
        <div ref={titleRef} className="mb-2 sm:mb-3 select-none">
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight uppercase leading-[0.92] text-white drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)]">
            <span className="inline-block">CST</span>{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-cyan drop-shadow-[0_0_30px_rgba(0,213,255,0.7)]">
              LAN
            </span>{' '}
            <br />
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-orange to-orange drop-shadow-[0_0_30px_rgba(255,116,56,0.7)]">
              CHALLENGE
            </span>{' '}
            <span className="inline-block text-white">2026</span>
          </h1>

          <div className="max-w-xl mx-auto space-y-0.5 mt-2.5 sm:mt-3">
            <p className="text-xs sm:text-base font-display font-bold tracking-wide text-white uppercase drop-shadow-md">
              ENTER THE BATTLEFIELD. PROVE YOUR SKILL.
            </p>
            <p className="text-[11px] sm:text-xs font-mono text-secondaryText drop-shadow">
              Organized by the Computer Science &amp; Technology Degree Programme
            </p>
          </div>
        </div>

        {/* Compact Live Countdown */}
        <div
          ref={countdownBlockRef}
          className="mb-4 sm:mb-5 w-full max-w-sm sm:max-w-md bg-card/95 border border-tactical-border backdrop-blur-xl p-2.5 sm:p-3.5 clip-tactical shadow-[0_0_35px_rgba(0,213,255,0.2)]"
        >
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold mb-2 px-1 border-b border-tactical-border/60 pb-1">
            <div className="flex items-center gap-1.5 text-cyan">
              <Clock className="w-3.5 h-3.5 text-cyan" />
              <span>TOURNAMENT COUNTDOWN</span>
            </div>
            <span className="text-orange flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping" />
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center font-mono">
            <div className="bg-surface/90 border border-tactical-border p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">DAYS</div>
            </div>
            <div className="bg-surface/90 border border-tactical-border p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-cyan">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">HOURS</div>
            </div>
            <div className="bg-surface/90 border border-tactical-border p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">MINS</div>
            </div>
            <div className="bg-surface/90 border border-orange/50 p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-orange">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-secondaryText uppercase tracking-wider mt-0.5">SECS</div>
            </div>
          </div>
        </div>

        {/* 2 Clean Action Buttons */}
        <div
          ref={ctaBlockRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto"
        >
          <Button
            href="/register"
            variant="cyan"
            size="md"
            icon={<Crosshair className="w-4 h-4" />}
            className="w-full sm:w-auto font-black shadow-[0_0_25px_rgba(0,213,255,0.45)] hover:scale-105 transition-transform text-xs sm:text-sm"
          >
            REGISTER YOUR TEAM
          </Button>

          <Button
            href="/#prizepool"
            variant="outline"
            size="md"
            icon={<Trophy className="w-4 h-4 text-tactical-gold" />}
            className="w-full sm:w-auto hover:border-tactical-gold hover:text-tactical-gold bg-surface/70 backdrop-blur-md text-xs sm:text-sm"
          >
            VIEW PRIZE POOL
          </Button>
        </div>

        {/* Next Section Indicator */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center gap-1 text-[9px] sm:text-[10px] font-mono tracking-widest text-secondaryText/80 pointer-events-none">
          <span className="flex items-center gap-1.5 text-cyan">
            <span>SCROLL DOWN FOR PRIZE POOL</span>
            <ChevronDown className="w-3 h-3 text-cyan animate-bounce" />
          </span>
        </div>

      </div>
    </div>
  );
}
