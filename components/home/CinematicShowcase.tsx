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
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

const TOTAL_FRAMES = 199;

export default function CinematicShowcase() {
  const { isOpen } = useRegistrationStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const slideLeftRef = useRef<HTMLDivElement>(null);
  const slideRightRef = useRef<HTMLDivElement>(null);
  const slideCenterRef = useRef<HTMLDivElement>(null);

  const scrubBarRef = useRef<HTMLDivElement>(null);
  const telemetryTagRef = useRef<HTMLSpanElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

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

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const height = rect.height || (typeof window !== 'undefined' ? window.innerHeight : 1080);
    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    // Instant load Frame 1
    const firstImg = new Image();
    firstImg.src = '/frames/home/frame_0001.webp?v=3';
    firstImg.onload = () => {
      if (isCancelled) return;
      images[0] = firstImg;
      imagesRef.current = images;
      handleResize();
      drawFrame(0);
      setIsReady(true);
      try {
        ScrollTrigger.refresh();
      } catch (e) {}
    };

    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i + 1).padStart(4, '0');
      img.src = `/frames/home/frame_${frameNum}.webp?v=3`;
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

  // 4. GSAP ScrollTrigger Sequence: Left -> Right -> Center with Mobile Responsiveness
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
      },
      (context) => {
        const { isMobile } = context.conditions as { isDesktop: boolean; isMobile: boolean };
        const frameObj = { frame: 0 };

        const scrubTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: isMobile ? '+=900' : '+=1600',
            pin: true,
            scrub: isMobile ? 0.25 : 0.4,
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

        gsap.set(slideLeftRef.current, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(slideRightRef.current, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(slideCenterRef.current, { autoAlpha: 0, pointerEvents: 'none' });

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

        scrubTimeline.fromTo(
          slideLeftRef.current,
          {
            x: isMobile ? -30 : -60,
            autoAlpha: 0,
            scale: 0.94,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          },
          {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            pointerEvents: 'auto',
            ease: 'power3.out',
            duration: 1.5,
          },
          0.3
        );

        scrubTimeline.to(
          slideLeftRef.current,
          {
            x: isMobile ? -20 : -40,
            autoAlpha: 0,
            scale: 0.96,
            filter: 'blur(6px)',
            pointerEvents: 'none',
            ease: 'power2.in',
            duration: 1.0,
          },
          3.0
        );

        scrubTimeline.fromTo(
          slideRightRef.current,
          {
            x: isMobile ? 30 : 60,
            autoAlpha: 0,
            scale: 0.94,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          },
          {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            pointerEvents: 'auto',
            ease: 'power3.out',
            duration: 1.5,
          },
          3.8
        );

        scrubTimeline.to(
          slideRightRef.current,
          {
            x: isMobile ? 20 : 40,
            autoAlpha: 0,
            scale: 0.96,
            filter: 'blur(6px)',
            pointerEvents: 'none',
            ease: 'power2.in',
            duration: 1.0,
          },
          6.5
        );

        scrubTimeline.fromTo(
          slideCenterRef.current,
          {
            y: isMobile ? 30 : 50,
            autoAlpha: 0,
            scale: 0.92,
            filter: 'blur(10px)',
            pointerEvents: 'none',
          },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            pointerEvents: 'auto',
            ease: 'power3.out',
            duration: 1.8,
          },
          7.2
        );
      }
    );

    return () => mm.revert();
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-military-black overflow-hidden select-none border-b border-gunmetal"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frames/home/frame_0001.webp?v=3"
        alt="Tactical Engagement Preview"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.90)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.90)' }}
      />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(17,20,17,0.1)_0%,rgba(17,20,17,0.88)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-military-black via-military-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-military-black via-military-black/80 to-transparent" />

        <div className="absolute inset-0 tactical-grid-bg opacity-15" />
      </div>

      <div className="absolute inset-4 sm:inset-6 lg:inset-8 pointer-events-none border border-gunmetal/50 rounded-sm z-10">
        <span className="absolute -top-[2px] -left-[2px] w-5 h-5 border-t-2 border-l-2 border-olive shadow-[0_0_8px_rgba(89,99,74,0.6)]" />
        <span className="absolute -top-[2px] -right-[2px] w-5 h-5 border-t-2 border-r-2 border-sand shadow-[0_0_8px_rgba(194,178,138,0.6)]" />
        <span className="absolute -bottom-[2px] -left-[2px] w-5 h-5 border-b-2 border-l-2 border-olive shadow-[0_0_8px_rgba(89,99,74,0.6)]" />
        <span className="absolute -bottom-[2px] -right-[2px] w-5 h-5 border-b-2 border-r-2 border-sand shadow-[0_0_8px_rgba(194,178,138,0.6)]" />

        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 px-4 py-0.5 bg-military-black/95 border border-gunmetal text-[9px] sm:text-[10px] font-mono text-mutedText tracking-widest flex items-center gap-3 backdrop-blur-md">
          <Activity className="w-3.5 h-3.5 text-sand animate-pulse" />
          <div className="w-20 sm:w-32 h-1 bg-surface border border-gunmetal rounded-full overflow-hidden">
            <div
              ref={scrubBarRef}
              className="h-full bg-gradient-to-r from-olive via-sand to-olive-light transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>
          <span ref={telemetryTagRef} className="text-sand font-bold uppercase truncate max-w-[200px] sm:max-w-none">
            PHASE 1: TASK FORCE SECTOR // LEFT BRIEFING
          </span>
        </div>
      </div>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">

        <div
          ref={slideLeftRef}
          className="absolute left-3 right-3 sm:left-8 sm:right-auto lg:left-12 max-w-lg lg:max-w-xl opacity-0 pointer-events-none will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-card/90 border border-olive/50 backdrop-blur-2xl rounded-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-olive" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-olive" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-olive" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-olive" />

            <div className="flex items-center justify-between border-b border-gunmetal pb-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-sand" />
                <span className="text-[10px] font-mono text-sand uppercase font-bold tracking-widest">
                  TASK FORCE 01 // TACTICAL RECON
                </span>
              </div>
              <span className="text-[9px] font-mono text-mutedText px-2 py-0.5 bg-surface border border-gunmetal">
                DEFENSE MANDATE
              </span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite tracking-tight uppercase leading-tight mb-2">
              BATTLE FOR <span className="text-sand">GLORY</span> &amp; TOURNAMENT <span className="text-olive-light">HONORS</span>
            </h2>

            <p className="text-xs sm:text-sm font-mono text-mutedText leading-relaxed mb-5">
              The CST LAN Challenge 2026 brings elite collegiate tactical athletes together under competitive modern warfare regulations.
            </p>

            <div className="p-3.5 bg-surface/70 border border-gunmetal rounded mb-5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-mutedText uppercase tracking-wider block">
                  COMMITTED CHAMPION POOL
                </span>
                <span className="font-display font-black text-xl sm:text-2xl text-sand">
                  LKR 25,000 + GRAND TROPHY
                </span>
              </div>
              <div className="p-2.5 bg-olive/20 border border-olive/40 text-sand shrink-0">
                <Trophy className="w-5 h-5 text-sand" />
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-tacticalWhite/90 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-light shrink-0" />
                <span>Zero-Latency Military LAN Command Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sand shrink-0" />
                <span>Collegiate Prestige &amp; Permanent Hall of Fame Entry</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                href="/#prizepool"
                variant="cyan"
                size="md"
                icon={<Trophy className="w-4 h-4" />}
                className="font-bold text-xs uppercase shadow-[0_2px_12px_rgba(37,44,36,0.8)]"
              >
                VIEW FULL PRIZE POOL
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={slideRightRef}
          className="absolute left-3 right-3 sm:left-auto sm:right-8 lg:right-12 max-w-lg lg:max-w-xl opacity-0 pointer-events-none will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-card/90 border border-gunmetal backdrop-blur-2xl rounded-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-sand" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-sand" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-sand" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-sand" />

            <div className="flex items-center justify-between border-b border-gunmetal pb-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <Flame className="w-4 h-4 text-sand" />
                <span className="text-[10px] font-mono text-sand uppercase font-bold tracking-widest">
                  OPFOR 02 // STRIKE PROTOCOL
                </span>
              </div>
              <span className="text-[9px] font-mono text-mutedText px-2 py-0.5 bg-surface border border-gunmetal">
                OFFENSE PROTOCOL
              </span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite tracking-tight uppercase leading-tight mb-2">
              5v5 <span className="text-sand">COMPETITIVE</span> TOURNAMENT RULES
            </h2>

            <p className="text-xs sm:text-sm font-mono text-mutedText leading-relaxed mb-5">
              Strict military tactical tournament rules apply. Teams navigate a tactical playoff bracket with operational vetoes and official referee oversight.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
              <div className="p-3 bg-surface/70 border border-gunmetal rounded">
                <span className="text-[9px] text-mutedText uppercase tracking-wider block">
                  ROUND STRUCTURE
                </span>
                <span className="font-display font-black text-lg text-tacticalWhite">
                  MR12 (FIRST TO 13)
                </span>
              </div>
              <div className="p-3 bg-surface/70 border border-gunmetal rounded">
                <span className="text-[9px] text-mutedText uppercase tracking-wider block">
                  ROSTER SIZE
                </span>
                <span className="font-display font-black text-lg text-sand">
                  5 OPERATIVES
                </span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs text-tacticalWhite/90 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sand shrink-0" />
                <span>Verified University Student Eligibility &amp; Hardware Checks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-light shrink-0" />
                <span>Championship Elimination Playoff Bracket</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                href="/about"
                variant="outline"
                size="md"
                icon={<Crosshair className="w-4 h-4 text-sand" />}
                className="font-bold text-xs uppercase border-gunmetal hover:border-sand hover:text-tacticalWhite"
              >
                TOURNAMENT RULES &amp; FAQ
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={slideCenterRef}
          className="absolute left-1/2 -translate-x-1/2 w-[94vw] max-w-xl sm:max-w-2xl px-2 sm:px-4 text-center opacity-0 pointer-events-none will-change-transform"
        >
          <div className="relative p-6 sm:p-8 bg-card/95 border border-sand/60 backdrop-blur-2xl rounded-md shadow-[0_4px_40px_rgba(0,0,0,0.85)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-sand text-military-black font-mono text-[10px] font-black uppercase tracking-widest clip-tactical shadow-lg flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-military-black" />
              <span>THE GRAND CONFRONTATION</span>
            </div>

            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sand" />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sand" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sand" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sand" />

            <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-tacticalWhite tracking-tight uppercase leading-tight mb-2 mt-2">
              CHOOSE YOUR <span className="text-sand">SIDE</span>. PROVE YOUR <span className="text-olive-light">DOMINANCE</span>.
            </h2>

            <p className="text-xs sm:text-sm font-mono text-mutedText leading-relaxed mb-5 max-w-lg mx-auto">
              Active Duty Battlegrounds. Zero-Latency Military LAN Command. Ready your squad to enter the collegiate tactical championship arena.
            </p>

            <div className="p-3 bg-surface/80 border border-gunmetal rounded mb-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono text-tacticalWhite">
              <span className="px-2 py-0.5 bg-olive/20 border border-olive/50 text-sand font-bold">CRASH</span>
              <span className="px-2 py-0.5 bg-surface border border-gunmetal text-tacticalWhite font-bold">CROSSFIRE</span>
              <span className="px-2 py-0.5 bg-olive/20 border border-olive/50 text-sand font-bold">BACKLOT</span>
              <span className="px-2 py-0.5 bg-surface border border-gunmetal text-tacticalWhite font-bold">STRIKE</span>
              <span className="px-2 py-0.5 bg-olive/20 border border-olive/50 text-sand font-bold">CITYSTREET</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isOpen && (
                <Button
                  href="/register"
                  variant="cyan"
                  size="lg"
                  icon={<Crosshair className="w-4 h-4" />}
                  className="w-full sm:w-auto font-black shadow-[0_2px_12px_rgba(37,44,36,0.8)] text-xs sm:text-sm"
                >
                  REGISTER YOUR TEAM
                </Button>
              )}

              <Button
                href="/#prizepool"
                variant="outline"
                size="lg"
                icon={<Trophy className="w-4 h-4 text-sand" />}
                className="w-full sm:w-auto hover:border-sand hover:text-tacticalWhite bg-surface/70 text-xs sm:text-sm"
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

