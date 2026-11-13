'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Shield, Crosshair, Trophy, Clock, ChevronDown, Activity, Mouse, Sparkles, Radio } from 'lucide-react';
import Button from '../ui/Button';
import { getStoredCountdown, saveCountdown, getStoredMatches } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendSettings } from '@/lib/transformers';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

const TOTAL_FRAMES = 199;

export default function Hero() {
  const { isOpen } = useRegistrationStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const topStandoffBadgeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const countdownBlockRef = useRef<HTMLDivElement>(null);
  const ctaBlockRef = useRef<HTMLDivElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 17,
    hours: 8,
    minutes: 45,
    seconds: 0,
  });
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const [liveInfo, setLiveInfo] = useState<{ scoreA: number; scoreB: number; teamATag: string; teamBTag: string } | null>(null);

  useEffect(() => {
    const checkLive = () => {
      try {
        const stored = getStoredMatches();
        const lm = stored.find((m) => m.status === 'live');
        if (lm) {
          setHasLiveMatch(true);
          setLiveInfo({ scoreA: lm.scoreA, scoreB: lm.scoreB, teamATag: lm.teamATag, teamBTag: lm.teamBTag });
        }
        api.public.getMatches({ status: 'LIVE' }).then((res) => {
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const m = res.data[0];
            setHasLiveMatch(true);
            setLiveInfo({ scoreA: m.scoreA ?? 0, scoreB: m.scoreB ?? 0, teamATag: m.teamATag || 'TMA', teamBTag: m.teamBTag || 'TMB' });
          } else if (!lm) {
            setHasLiveMatch(false);
            setLiveInfo(null);
          }
        }).catch(() => {});
      } catch (e) {}
    };

    checkLive();
    const liveInterval = setInterval(checkLive, 4000);
    window.addEventListener('cst_matches_updated', checkLive);

    const updateCountdown = () => {
      const active = getStoredCountdown();
      const target = new Date(active.tournamentDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (isNaN(diff) || diff <= 0) {
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

    // Query live database directly on mount and synchronize countdown
    api.public.getSettings().then((res) => {
      if (res?.success && res.data) {
        const transformed = transformBackendSettings(res.data);
        saveCountdown(transformed);
        updateCountdown();
      }
    }).catch(() => {});

    const handleUpdate = () => {
      updateCountdown();
    };
    window.addEventListener('cst_countdown_updated', handleUpdate);

    const interval = setInterval(updateCountdown, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
      window.removeEventListener('cst_countdown_updated', handleUpdate);
      window.removeEventListener('cst_matches_updated', checkLive);
    };
  }, []);

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

  // 4. Preload frame sequence
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

    // Load Frame 1 immediately for instant paint
    const firstImg = new Image();
    firstImg.src = '/frames/hero/frame_0001.webp?v=3';
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

    // On mobile devices (< 768px), we use the lightweight 1.2MB hero-video.mp4 instead of downloading 200 image frames
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobileDevice) {
      // Load remaining frames progressively for Desktop interactive scrub
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNum = String(i + 1).padStart(4, '0');
        img.src = `/frames/hero/frame_${frameNum}.webp?v=3`;
        img.onload = () => {
          if (isCancelled) return;
          images[i] = img;
        };
        img.onerror = () => {
          if (isCancelled) return;
        };
      }
    }

    imagesRef.current = images;

    window.addEventListener('resize', handleResize);
    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, drawFrame]);

  // 5. GSAP ScrollTrigger Sequence & Choreography with Mobile Responsiveness
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.opacity = '1';
        contentWrapperRef.current.style.pointerEvents = 'auto';
      }
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        isMobile: '(max-width: 767px)',
      },
      (context) => {
        const { isMobile } = context.conditions as { isDesktop: boolean; isMobile: boolean };
        const frameObj = { frame: 0 };
        let enterTl: gsap.core.Timeline | null = null;

        const scrubTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: isMobile ? '+=900' : '+=1600',
            pin: true,
            scrub: isMobile ? 0.25 : 0.35,
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

              // Ensure scroll down button never fights or overlaps when scrolling
              if (self.progress > 0.02) {
                if (enterTl && enterTl.isActive()) {
                  enterTl.kill();
                }
                if (scrollHintRef.current) {
                  scrollHintRef.current.style.pointerEvents = 'none';
                }
              } else {
                if (scrollHintRef.current) {
                  scrollHintRef.current.style.pointerEvents = 'auto';
                }
              }
            },
          },
        });

        scrubTimeline.to(
          frameObj,
          {
            frame: TOTAL_FRAMES - 1,
            ease: 'none',
            duration: 10,
          },
          0
        );

        // Immediate bulletproof disappearance of the scroll hint on scrub
        scrubTimeline.to(
          [scrollHintRef.current, topStandoffBadgeRef.current],
          {
            autoAlpha: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.in',
            pointerEvents: 'none',
          },
          0.05
        );

        scrubTimeline.fromTo(
          contentWrapperRef.current,
          {
            autoAlpha: 0,
            scale: isMobile ? 0.94 : 0.90,
            y: isMobile ? 20 : 35,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            pointerEvents: 'auto',
            ease: 'power3.out',
            duration: 2.4,
          },
          isMobile ? 3.0 : 3.6
        );

        scrubTimeline.fromTo(
          countdownBlockRef.current,
          {
            y: 20,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 2.0,
            ease: 'back.out(1.4)',
          },
          isMobile ? 3.8 : 4.4
        );

        scrubTimeline.fromTo(
          ctaBlockRef.current,
          {
            y: 15,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.6,
            ease: 'power3.out',
          },
          isMobile ? 4.4 : 5.0
        );

        enterTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        enterTl.fromTo(
          frameRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 1.2 }
        );

        enterTl.fromTo(
          topStandoffBadgeRef.current,
          { autoAlpha: 0, y: -15 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '-=0.6'
        );

        // Only run entrance reveal if at page top
        if (typeof window !== 'undefined' && (window.scrollY || 0) < 30) {
          enterTl.fromTo(
            scrollHintRef.current,
            { autoAlpha: 0, y: 25, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 },
            '-=0.5'
          );
        } else {
          gsap.set(scrollHintRef.current, { autoAlpha: 0, pointerEvents: 'none' });
        }
      }
    );

    return () => mm.revert();
  }, [drawFrame]);

  const handleScrollToContent = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      window.scrollTo({
        top: isMobile ? 950 : 1650,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-military-black overflow-hidden select-none"
    >
      {/* Mobile Video Background Fallback (Fast 1.2MB stream, eliminates 200 frame downloads) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.90)' }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Desktop Frame sequence canvas */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frames/hero/frame_0001.webp?v=3"
        alt="Battlefield Standoff Preview"
        width={1920}
        height={1080}
        className="hidden md:block absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.90)' }}
      />
      <canvas
        ref={canvasRef}
        className="hidden md:block absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ filter: 'contrast(1.08) brightness(0.90)' }}
      />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(17,20,17,0.15)_0%,rgba(17,20,17,0.88)_100%)]" />

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-military-black via-military-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-military-black via-military-black/80 to-transparent" />

        <div className="absolute inset-0 tactical-grid-bg opacity-15" />
      </div>

      <div
        ref={frameRef}
        className="absolute inset-3 sm:inset-5 lg:inset-8 pointer-events-none border border-gunmetal/60 rounded-sm z-10"
      >
        <span className="absolute -top-[2px] -left-[2px] w-5 sm:w-7 h-5 sm:h-7 border-t-2 border-l-2 border-olive shadow-[0_0_8px_rgba(89,99,74,0.6)]" />
        <span className="absolute -top-[2px] -right-[2px] w-5 sm:w-7 h-5 sm:h-7 border-t-2 border-r-2 border-sand shadow-[0_0_8px_rgba(194,178,138,0.6)]" />
        <span className="absolute -bottom-[2px] -left-[2px] w-5 sm:w-7 h-5 sm:h-7 border-b-2 border-l-2 border-olive shadow-[0_0_8px_rgba(89,99,74,0.6)]" />
        <span className="absolute -bottom-[2px] -right-[2px] w-5 sm:w-7 h-5 sm:h-7 border-b-2 border-r-2 border-sand shadow-[0_0_8px_rgba(194,178,138,0.6)]" />

        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 px-3 py-0.5 bg-military-black/95 border border-gunmetal text-[9px] font-mono text-mutedText tracking-widest flex items-center gap-2.5 backdrop-blur-md">
          <Activity className="w-3 h-3 text-sand" />
          <div className="w-16 sm:w-28 h-1 bg-surface border border-gunmetal rounded-full overflow-hidden">
            <div
              ref={scrubBarRef}
              className="h-full bg-gradient-to-r from-olive via-sand to-olive-light transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>
          <span ref={progressTextRef} className="text-sand font-bold">
            00:00.0s // 0%
          </span>
        </div>
      </div>


      <div
        ref={topStandoffBadgeRef}
        className="absolute top-20 sm:top-24 lg:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-2 w-max max-w-[95vw] text-center"
      >
        <div className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-1.5 bg-military-black/90 border border-gunmetal clip-badge backdrop-blur-md shadow-2xl">
          <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-sand shrink-0" />
          <span className="text-[11px] sm:text-sm font-display font-black text-tacticalWhite tracking-wider uppercase">
            CST LAN CHALLENGE 2026
          </span>
          <span className="text-gunmetal font-mono text-[10px]">|</span>
          <span className="text-[9px] sm:text-xs font-mono text-sand font-bold tracking-wider">
            COD4 MODERN WARFARE
          </span>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        onClick={handleScrollToContent}
        className="absolute bottom-6 sm:bottom-10 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-3 text-center cursor-pointer group max-w-[95vw] px-2"
      >
        <div className="relative px-3.5 sm:px-7 py-2 sm:py-3 bg-military-black/95 border border-olive/50 backdrop-blur-xl rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:border-sand group-hover:scale-105 flex items-center gap-2.5 sm:gap-3.5">
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-olive" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-sand" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-olive" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-sand" />

          <div className="w-4 sm:w-5 h-6 sm:h-8 rounded-full border-2 border-olive-light/80 flex items-start justify-center p-0.5 sm:p-1 bg-surface/80 shrink-0">
            <div className="w-1.5 h-1.5 sm:h-2 rounded-full bg-sand animate-bounce" />
          </div>

          <div className="text-left font-mono">
            <div className="text-[11px] sm:text-sm font-black tracking-widest uppercase text-tacticalWhite flex items-center gap-1.5 group-hover:text-sand transition-colors">
              <span>SCROLL DOWN TO REVEAL</span>
              <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-sand animate-bounce" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-mutedText tracking-wide mt-0.5">
              Engage tactical reconnaissance &amp; unlock intel
            </p>
          </div>
        </div>

        <span className="text-[8px] sm:text-[10px] font-mono text-sand/80 tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sand animate-ping" />
          SCROLL WHEEL • SWIPE • OR CLICK TO ENTER
        </span>
      </div>

      <div
        ref={contentWrapperRef}
        className="relative z-30 h-full max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center pt-20 sm:pt-28 lg:pt-32 pb-8 opacity-0 pointer-events-none will-change-transform"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/90 border border-gunmetal text-[11px] sm:text-xs font-mono text-sand uppercase tracking-wider mb-3 backdrop-blur-md shadow-xl">
          <Shield className="w-3.5 h-3.5 text-sand shrink-0" />
          <span>UVA WELLASSA UNIVERSITY // COD4 MODERN WARFARE</span>
        </div>

        <div ref={titleRef} className="mb-2 sm:mb-3 select-none">
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight uppercase leading-[0.92] text-tacticalWhite drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)]">
            <span className="inline-block text-tacticalWhite">CST</span>{' '}
            <span className="inline-block text-sand">
              LAN
            </span>{' '}
            <br />
            <span className="inline-block text-olive-light">
              CHALLENGE
            </span>{' '}
            <span className="inline-block text-tacticalWhite">2026</span>
          </h1>

          <div className="max-w-xl mx-auto space-y-0.5 mt-2.5 sm:mt-3">
            <p className="text-xs sm:text-base font-display font-bold tracking-wide text-tacticalWhite uppercase drop-shadow-md">
              ENTER THE BATTLEFIELD. PROVE YOUR SKILL.
            </p>
            <p className="text-[11px] sm:text-xs font-mono text-mutedText drop-shadow">
              Organized by the Computer Science &amp; Technology Degree Programme
            </p>
          </div>
        </div>

        <div
          ref={countdownBlockRef}
          className="mb-4 sm:mb-5 w-full max-w-sm sm:max-w-md bg-card/95 border border-gunmetal backdrop-blur-xl p-2.5 sm:p-3.5 clip-tactical shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold mb-2 px-1 border-b border-gunmetal pb-1">
            <div className="flex items-center gap-1.5 text-sand">
              <Clock className="w-3.5 h-3.5 text-sand" />
              <span>TOURNAMENT COUNTDOWN</span>
            </div>
            <span className="text-olive-light flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-olive-light animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center font-mono">
            <div className="bg-surface/90 border border-gunmetal p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-tacticalWhite">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider mt-0.5">DAYS</div>
            </div>
            <div className="bg-surface/90 border border-gunmetal p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-sand">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider mt-0.5">HOURS</div>
            </div>
            <div className="bg-surface/90 border border-gunmetal p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-tacticalWhite">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider mt-0.5">MINS</div>
            </div>
            <div className="bg-surface/90 border border-olive/50 p-1.5 sm:p-2">
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-sand">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[8px] sm:text-[9px] text-mutedText uppercase tracking-wider mt-0.5">SECS</div>
            </div>
          </div>
        </div>

        <div
          ref={ctaBlockRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto"
        >
          {hasLiveMatch && liveInfo && (
            <Button
              href="/scoreboard/live"
              variant="outline"
              size="md"
              icon={<Radio className="w-4 h-4 text-rose-500 animate-pulse" />}
              className="w-full sm:w-auto border-rose-500/80 bg-rose-950/40 text-tacticalWhite hover:bg-rose-900/60 hover:border-rose-400 font-black shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all text-xs sm:text-sm"
            >
              STAGE MATCH LIVE ({liveInfo.teamATag} {liveInfo.scoreA} : {liveInfo.scoreB} {liveInfo.teamBTag})
            </Button>
          )}

          {isOpen && (
            <Button
              href="/register"
              variant="cyan"
              size="md"
              icon={<Crosshair className="w-4 h-4" />}
              className="w-full sm:w-auto font-black shadow-[0_2px_12px_rgba(37,44,36,0.8)] hover:scale-105 transition-transform text-xs sm:text-sm"
            >
              REGISTER YOUR TEAM
            </Button>
          )}

          <Button
            href="/#prizepool"
            variant="outline"
            size="md"
            icon={<Trophy className="w-4 h-4 text-sand" />}
            className="w-full sm:w-auto hover:border-sand hover:text-tacticalWhite bg-surface/70 backdrop-blur-md text-xs sm:text-sm"
          >
            VIEW PRIZE POOL
          </Button>
        </div>

      </div>
    </div>
  );
}
