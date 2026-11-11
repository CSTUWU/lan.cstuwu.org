'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import {
  Shield,
  Crosshair,
  Zap,
  Target,
  Swords,
  Radio,
  Terminal,
  Flame,
  Award,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import Button from '../ui/Button';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function CharacterFaceOff() {
  const { isOpen } = useRegistrationStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Character Elements
  const vectorWrapperRef = useRef<HTMLDivElement>(null);
  const raptorWrapperRef = useRef<HTMLDivElement>(null);
  const vectorGazeLightRef = useRef<HTMLDivElement>(null);
  const raptorGazeLightRef = useRef<HTMLDivElement>(null);

  // HUD & Collision Elements
  const energyCollisionRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const confrontationTextRef = useRef<HTMLDivElement>(null);
  const finalCalloutRef = useRef<HTMLDivElement>(null);
  const cameraRigRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Progress Indicators
  const progressBarRef = useRef<HTMLDivElement>(null);
  const telemetryStatusRef = useRef<HTMLSpanElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  // 1. Dynamic Interactive Canvas: Atmospheric Fire Sparks & Clash Embers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let width = 0;
    let height = 0;

    // Warm ember & fire spark palette: #ffd000, #ffb700, #ff6600, incandescent amber #ff8800, #cc2200
    const EMBER_PALETTE = [
      { r: 255, g: 208, b: 0 },   // Glowing Yellow #ffd000
      { r: 255, g: 208, b: 0 },   // Glowing Yellow (weighted)
      { r: 255, g: 183, b: 0 },   // Hot Gold #ffb700
      { r: 255, g: 102, b: 0 },   // Orange #ff6600
      { r: 255, g: 136, b: 0 },   // Incandescent Amber #ff8800
      { r: 204, g: 34, b: 0 },    // Deep Ember Red #cc2200
    ];

    interface FaceOffEmber {
      x: number;
      y: number;
      baseRadius: number;
      baseVy: number;
      vy: number;
      color: { r: number; g: number; b: number };
      isLarge: boolean;
      alpha: number;
      targetAlpha: number;
      swayPhase: number;
      swaySpeed: number;
      swayAmp: number;
      flickerPhase: number;
      flickerSpeed: number;
      draftPhase: number;
      draftSpeed: number;
    }

    const particleCount = 70;
    let particles: FaceOffEmber[] = [];

    const createFaceOffEmber = (spawnRandomY = true): FaceOffEmber => {
      const isLarge = Math.random() < 0.2;
      const color = EMBER_PALETTE[Math.floor(Math.random() * EMBER_PALETTE.length)];
      const baseRadius = isLarge ? 2.0 + Math.random() * 1.8 : 0.7 + Math.random() * 1.1;
      const baseVy = isLarge ? -(0.35 + Math.random() * 0.45) : -(0.65 + Math.random() * 0.95);
      const targetAlpha = isLarge ? 0.6 + Math.random() * 0.35 : 0.35 + Math.random() * 0.45;

      return {
        x: Math.random() * width,
        y: spawnRandomY ? Math.random() * height : height + 10 + Math.random() * 25,
        baseRadius,
        baseVy,
        vy: baseVy,
        color,
        isLarge,
        alpha: spawnRandomY ? Math.random() * targetAlpha : 0,
        targetAlpha,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayAmp: isLarge ? 0.8 + Math.random() * 0.9 : 0.4 + Math.random() * 0.5,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: isLarge ? 0.03 + Math.random() * 0.04 : 0.06 + Math.random() * 0.07,
        draftPhase: Math.random() * Math.PI * 2,
        draftSpeed: 0.015 + Math.random() * 0.025,
      };
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      particles = Array.from({ length: particleCount }, () => createFaceOffEmber(true));
    };

    handleResize();

    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };
    window.addEventListener('resize', debouncedResize);

    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        const glowRadius = p.baseRadius * 3;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `rgba(255, 250, 220, ${p.targetAlpha * 0.7})`);
        gradient.addColorStop(0.35, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.targetAlpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(204, 34, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(resizeTimer);
      };
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach((p) => {
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + 0.008);
        }

        p.flickerPhase += p.flickerSpeed;
        const flicker = Math.sin(p.flickerPhase) * 0.65 + Math.sin(p.flickerPhase * 2.3) * 0.35;

        p.draftPhase += p.draftSpeed;
        const draftMod = 1 + Math.sin(p.draftPhase) * 0.25;
        p.vy = p.baseVy * draftMod;

        // Upward floating motion
        p.y += p.vy;

        // Horizontal sway / wind oscillation
        p.swayPhase += p.swaySpeed;
        p.x += Math.sin(p.swayPhase) * p.swayAmp;

        // Respawn when floating past the top
        if (p.y < -30) {
          p.y = height + 10 + Math.random() * 20;
          p.x = Math.random() * width;
          p.alpha = 0;
          p.swayPhase = Math.random() * Math.PI * 2;
        }
        if (p.x < -30) p.x = width + 20;
        else if (p.x > width + 30) p.x = -20;

        const topCooldown = p.y < height * 0.18 ? Math.max(0, p.y / (height * 0.18)) : 1;
        const currentAlpha = Math.max(0.04, Math.min(1, (p.alpha + flicker * 0.2) * topCooldown));
        const currentRadius = p.baseRadius * (1 + flicker * 0.1);
        const glowRadius = p.isLarge ? currentRadius * 4.2 : currentRadius * 3.2;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        // Clash center intensifies to incandescent yellow/gold
        const distFromCenter = Math.abs(p.x - width / 2) / (width / 2);
        const isCenterClash = distFromCenter < 0.22;

        gradient.addColorStop(0, `rgba(255, 252, 225, ${currentAlpha})`);
        if (isCenterClash) {
          gradient.addColorStop(0.3, `rgba(255, 208, 0, ${currentAlpha * 0.95})`);
          gradient.addColorStop(0.65, `rgba(255, 183, 0, ${currentAlpha * 0.4})`);
        } else {
          gradient.addColorStop(0.3, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha * 0.85})`);
          gradient.addColorStop(0.65, `rgba(${Math.min(255, p.color.r + 20)}, ${Math.floor(p.color.g * 0.35)}, 0, ${currentAlpha * 0.25})`);
        }
        gradient.addColorStop(1, 'rgba(204, 34, 0, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, currentRadius * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 195, ${Math.min(1, currentAlpha * 1.3)})`;
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Master GSAP ScrollTrigger Animation with Mobile Responsiveness
  useEffect(() => {
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
        const endDistance = isMobile ? '+=230%' : '+=380%';
        const s1Offset = isMobile ? 32 : 48;
        const s2Offset = isMobile ? 18 : 24;
        const s3Scale = isMobile ? 1.15 : 1.4;
        const s3Offset = isMobile ? 10 : 15;
        const s4Offset = isMobile ? 26 : 38;

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: endDistance,
            pin: true,
            scrub: isMobile ? 0.8 : 1,
            onUpdate: (self) => {
              const prog = self.progress;
              setScrollPercent(Math.round(prog * 100));

              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${prog * 100}%`;
              }

              if (telemetryStatusRef.current) {
                if (prog < 0.25) {
                  telemetryStatusRef.current.innerText = 'CONVERGENCE: VECTOR & RAPTOR INCOMING';
                  telemetryStatusRef.current.className = 'text-cyan font-bold';
                } else if (prog < 0.55) {
                  telemetryStatusRef.current.innerText = 'PROXIMITY ALERT: FACE-TO-FACE ENGAGEMENT';
                  telemetryStatusRef.current.className = 'text-white font-bold tracking-wider';
                } else if (prog < 0.82) {
                  telemetryStatusRef.current.innerText = 'CRITICAL PROXIMITY: EYE-CONTACT CLASH FOCUS';
                  telemetryStatusRef.current.className = 'text-orange font-bold animate-pulse';
                } else {
                  telemetryStatusRef.current.innerText = 'MAXIMUM COLLISION: TOURNAMENT SHOWDOWN LOCK-IN';
                  telemetryStatusRef.current.className = 'text-emerald-400 font-bold';
                }
              }
            },
          },
        });

        // INITIAL STAGE POSITIONS
        gsap.set(vectorWrapperRef.current, {
          xPercent: isMobile ? -100 : -130,
          rotationY: isMobile ? 12 : 18,
          scale: 0.88,
          opacity: 0,
          filter: 'blur(10px) brightness(0.4)',
          transformPerspective: 1200,
          transformOrigin: 'right center',
        });

        gsap.set(raptorWrapperRef.current, {
          xPercent: isMobile ? 100 : 130,
          rotationY: isMobile ? -12 : -18,
          scale: 0.88,
          opacity: 0,
          filter: 'blur(10px) brightness(0.4)',
          transformPerspective: 1200,
          transformOrigin: 'left center',
        });

        gsap.set(energyCollisionRef.current, { scaleY: 0, opacity: 0 });
        gsap.set(shockwaveRef.current, { scale: 0, opacity: 0 });
        gsap.set(confrontationTextRef.current, { opacity: 0, scale: 0.8, y: 30 });
        gsap.set(finalCalloutRef.current, { opacity: 0, y: 60, scale: 0.95 });
        gsap.set(vectorGazeLightRef.current, { opacity: 0, scale: 0.5 });
        gsap.set(raptorGazeLightRef.current, { opacity: 0, scale: 0.5 });
        gsap.set(scrollHintRef.current, { autoAlpha: 1, y: 0 });

        // Hide scroll hint immediately on scrub start so it never overlaps buttons or cards
        masterTl.to(
          scrollHintRef.current,
          {
            autoAlpha: 0,
            y: 12,
            duration: 0.8,
            ease: 'power2.in',
            pointerEvents: 'none',
          },
          0
        );

        // SCENE 1: CINEMATIC ENTRANCE FROM LEFT & RIGHT (0% -> 25%)
        masterTl
          .to(vectorWrapperRef.current, {
            xPercent: -s1Offset,
            rotationY: isMobile ? 6 : 10,
            scale: isMobile ? 0.92 : 0.98,
            opacity: 1,
            filter: 'blur(0px) brightness(1)',
            duration: 2.2,
            ease: 'power2.out',
          })
          .to(
            raptorWrapperRef.current,
            {
              xPercent: s1Offset,
              rotationY: isMobile ? -6 : -10,
              scale: isMobile ? 0.92 : 0.98,
              opacity: 1,
              filter: 'blur(0px) brightness(1)',
              duration: 2.2,
              ease: 'power2.out',
            },
            '<0.1'
          );

        // SCENE 2: MOVING CLOSER & FACE-TO-FACE LOCK (25% -> 55%)
        masterTl
          .to(vectorWrapperRef.current, {
            xPercent: -s2Offset,
            rotationY: isMobile ? 3 : 5,
            scale: isMobile ? 0.98 : 1.05,
            duration: 3,
            ease: 'power1.inOut',
          })
          .to(
            raptorWrapperRef.current,
            {
              xPercent: s2Offset,
              rotationY: isMobile ? -3 : -5,
              scale: isMobile ? 0.98 : 1.05,
              duration: 3,
              ease: 'power1.inOut',
            },
            '<0'
          )
          .to(
            vectorGazeLightRef.current,
            {
              opacity: 1,
              scale: isMobile ? 1.0 : 1.2,
              duration: 1.5,
              ease: 'power2.out',
            },
            '<1.0'
          )
          .to(
            raptorGazeLightRef.current,
            {
              opacity: 1,
              scale: isMobile ? 1.0 : 1.2,
              duration: 1.5,
              ease: 'power2.out',
            },
            '<0'
          )
          .to(
            energyCollisionRef.current,
            {
              scaleY: 1,
              opacity: 1,
              duration: 1.8,
              ease: 'power3.out',
            },
            '<0.5'
          )
          .to(
            confrontationTextRef.current,
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 2,
              ease: 'back.out(1.2)',
            },
            '<0.2'
          );

        // SCENE 3: CAMERA PUSH-IN / FACE CLOSE-UP ZOOM (55% -> 80%)
        masterTl
          .to(cameraRigRef.current, {
            scale: s3Scale,
            y: isMobile ? -20 : -40,
            duration: 3.5,
            ease: 'power2.inOut',
          })
          .to(
            vectorWrapperRef.current,
            {
              xPercent: -s3Offset,
              duration: 3.5,
              ease: 'power2.inOut',
            },
            '<0'
          )
          .to(
            raptorWrapperRef.current,
            {
              xPercent: s3Offset,
              duration: 3.5,
              ease: 'power2.inOut',
            },
            '<0'
          )
          .to(
            shockwaveRef.current,
            {
              scale: isMobile ? 1.5 : 2.2,
              opacity: 0.8,
              duration: 2,
              ease: 'power2.out',
            },
            '<1.0'
          )
          .to(shockwaveRef.current, {
            opacity: 0,
            duration: 1.5,
          });

        // SCENE 4: CLIMAX & CALL TO ARMS ENLISTMENT (80% -> 100%)
        masterTl
          .to(cameraRigRef.current, {
            scale: 1.0,
            y: 0,
            duration: 2.5,
            ease: 'power3.out',
          })
          .to(
            vectorWrapperRef.current,
            {
              xPercent: -s4Offset,
              rotationY: isMobile ? 8 : 12,
              scale: isMobile ? 0.88 : 0.92,
              duration: 2.5,
              ease: 'power3.out',
            },
            '<0'
          )
          .to(
            raptorWrapperRef.current,
            {
              xPercent: s4Offset,
              rotationY: isMobile ? -8 : -12,
              scale: isMobile ? 0.88 : 0.92,
              duration: 2.5,
              ease: 'power3.out',
            },
            '<0'
          )
          .to(
            confrontationTextRef.current,
            {
              opacity: 0,
              scale: 0.9,
              duration: 1.2,
            },
            '<0'
          )
          .to(
            finalCalloutRef.current,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 2.2,
              ease: 'back.out(1.1)',
            },
            '<0.8'
          );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="commanders"
      ref={containerRef}
      className="relative w-full bg-military-black text-tacticalWhite overflow-hidden select-none border-b border-gunmetal"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-olive/10 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-sand/10 rounded-full blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-darkGreen/20 rounded-full blur-[130px]" />
        <div className="absolute inset-0 tactical-grid-bg opacity-25" />
      </div>

      <div className="absolute top-0 left-0 w-full z-50">
        <div className="h-[3px] bg-surface w-full">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-olive via-sand to-olive-light transition-all duration-75"
            style={{ width: '0%' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-[10px] sm:text-xs font-mono bg-military-black/85 backdrop-blur-md border-b border-gunmetal">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-sand animate-ping shrink-0" />
            <span ref={telemetryStatusRef} className="text-sand font-bold tracking-wider uppercase">
              CONVERGENCE: TASK FORCE &amp; OPFOR INCOMING
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-mutedText hidden sm:inline">{"STAGE CONFRONTATION:"}</span>
            <span className="px-2 py-0.5 bg-surface border border-gunmetal font-bold text-tacticalWhite">
              {scrollPercent}%
            </span>
          </div>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden px-4"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={cameraRigRef}
          className="relative w-full h-full flex items-center justify-center will-change-transform origin-center"
        >
          <div
            ref={vectorWrapperRef}
            className="absolute z-20 w-[230px] sm:w-[340px] md:w-[440px] lg:w-[520px] h-[340px] sm:h-[480px] md:h-[600px] lg:h-[720px] will-change-transform"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-olive/70 shadow-[0_4px_35px_rgba(0,0,0,0.85)] bg-card/70 backdrop-blur-md">
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-olive z-30" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-olive z-30" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-olive z-30" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-olive z-30" />

              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span className="px-2 py-1 bg-olive text-black font-bold font-black uppercase clip-tactical">
                  TASK FORCE // LEADER
                </span>
                <span className="text-sand font-bold bg-background/80 px-2 py-0.5 border border-olive/40">
                  CT_OPERATOR
                </span>
              </div>

              <div
                ref={vectorGazeLightRef}
                className="absolute top-[22%] right-[28%] w-16 h-16 rounded-full bg-olive/40 blur-[15px] z-30 pointer-events-none mix-blend-screen"
              />

              <Image
                src="/images/commanders/vector.jpeg"
                alt="VECTOR - Task Force Commander"
                fill
                priority
                className="object-cover object-top filter brightness-95 contrast-105"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 460px, 520px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-military-black via-transparent to-transparent opacity-85 z-20" />

              <div className="absolute bottom-5 left-5 right-5 z-30">
                <div className="text-[11px] font-mono text-sand tracking-widest uppercase mb-1 flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-sand" />
                  <span>TACTICAL DEFENSE MANDATE</span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite tracking-wider uppercase">
                  VECTOR
                </h3>
                <p className="text-[11px] font-mono text-mutedText hidden sm:block mt-0.5">
                  Strategic Command • Reconnaissance • Defense Anchor
                </p>
              </div>
            </div>
          </div>

          <div
            ref={energyCollisionRef}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-olive via-sand to-olive-light z-25 pointer-events-none origin-center shadow-[0_0_15px_rgba(194,178,138,0.6)]"
          />

          <div
            ref={shockwaveRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-sand/40 bg-radial from-sand/10 via-olive/5 to-transparent z-25 pointer-events-none blur-[4px]"
          />

          <div
            ref={confrontationTextRef}
            className="absolute z-30 w-[92vw] max-w-md text-center px-4 sm:px-6 py-4 sm:py-6 bg-military-black/95 border border-gunmetal backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.9)] will-change-transform"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-sand" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-tacticalWhite font-bold">
                TACTICAL CONFRONTATION
              </span>
              <Swords className="w-4 h-4 text-olive-light" />
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-tacticalWhite my-2">
              <span className="text-sand">VECTOR</span>
              <span className="text-mutedText text-2xl mx-2 font-mono">VS</span>
              <span className="text-olive-light">RAPTOR</span>
            </h2>

            <p className="text-xs font-mono text-mutedText leading-relaxed mt-2">
              Only two forces stand on the main stage. No compromise. No retreat. Who will dictate the collegiate championship?
            </p>

            <div className="mt-4 pt-3 border-t border-gunmetal flex items-center justify-around text-[10px] font-mono">
              <span className="text-sand font-bold">MODERN WARFARE PROTOCOL</span>
              <span className="text-gunmetal">|</span>
              <span className="text-olive-light font-bold">SEARCH AND DESTROY PML220</span>
            </div>
          </div>

          <div
            ref={raptorWrapperRef}
            className="absolute z-20 w-[230px] sm:w-[340px] md:w-[440px] lg:w-[520px] h-[340px] sm:h-[480px] md:h-[600px] lg:h-[720px] will-change-transform"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gunmetal shadow-[0_4px_35px_rgba(0,0,0,0.85)] bg-card/70 backdrop-blur-md">
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-sand z-30" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-sand z-30" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-sand z-30" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-sand z-30" />

              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span className="text-sand font-bold bg-background/80 px-2 py-0.5 border border-sand/40">
                  T_OPERATOR
                </span>
                <span className="px-2 py-1 bg-sand text-military-black font-black uppercase clip-tactical">
                  OPFOR // LEADER
                </span>
              </div>

              <div
                ref={raptorGazeLightRef}
                className="absolute top-[24%] left-[28%] w-16 h-16 rounded-full bg-sand/30 blur-[15px] z-30 pointer-events-none mix-blend-screen"
              />

              <Image
                src="/images/commanders/raptor.jpeg"
                alt="RAPTOR - Opfor Commander"
                fill
                priority
                className="object-cover object-top filter brightness-95 contrast-105"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 460px, 520px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-military-black via-transparent to-transparent opacity-85 z-20" />

              <div className="absolute bottom-5 left-5 right-5 z-30 text-right">
                <div className="text-[11px] font-mono text-sand tracking-widest uppercase mb-1 flex items-center justify-end gap-1.5 font-bold">
                  <span>TACTICAL AGGRESSION &amp; INVASION</span>
                  <Flame className="w-3.5 h-3.5 text-sand" />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite tracking-wider uppercase">
                  RAPTOR
                </h3>
                <p className="text-[11px] font-mono text-mutedText hidden sm:block mt-0.5">
                  High-Impact Assault • Frontline Pointman • Territory Disruption
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={finalCalloutRef}
          className="absolute z-40 w-[92vw] max-w-2xl text-center px-4 sm:px-6 py-6 sm:py-10 bg-military-black/95 border-2 border-olive/50 backdrop-blur-2xl shadow-[0_4px_50px_rgba(0,0,0,0.95)] will-change-transform mx-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-gunmetal text-sand text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sand" />
            <span>THE ARENA AWAITS YOUR FACTION</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-tacticalWhite uppercase tracking-tight mb-3">
            CHOOSE YOUR <span className="text-sand">SIDE</span>. PROVE YOUR <span className="text-olive-light">LEGACY</span>.
          </h2>

          <p className="text-xs sm:text-sm font-mono text-mutedText leading-relaxed mb-6 max-w-lg mx-auto">
            Will you stand with <strong className="text-sand">TASK FORCE</strong> disciplined defense or attack with <strong className="text-olive-light">OPFOR</strong> firepower? Enlist your 5-man collegiate squad now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isOpen && (
              <>
                <Button
                  href="/register"
                  variant="cyan"
                  size="lg"
                  icon={<Crosshair className="w-5 h-5" />}
                  className="w-full sm:w-auto font-black shadow-[0_2px_12px_rgba(37,44,36,0.8)]"
                >
                  ENLIST TASK FORCE
                </Button>

                <Button
                  href="/register"
                  variant="orange"
                  size="lg"
                  icon={<Flame className="w-5 h-5 text-military-black" />}
                  className="w-full sm:w-auto font-black shadow-[0_2px_12px_rgba(194,178,138,0.3)]"
                >
                  ENLIST OPFOR SQUAD
                </Button>
              </>
            )}

            <Button
              href="/#format"
              variant="outline"
              size="lg"
              icon={<Award className="w-4 h-4 text-sand" />}
              className="w-full sm:w-auto border-gunmetal hover:border-sand hover:text-tacticalWhite"
            >
              TOURNAMENT FORMAT
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollHintRef}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-mutedText tracking-widest pointer-events-none z-10"
      >
        <span>SCROLL TO CONTROL DUEL</span>
        <ChevronDown className="w-3.5 h-3.5 text-sand animate-bounce" />
      </div>
    </section>
  );
}

