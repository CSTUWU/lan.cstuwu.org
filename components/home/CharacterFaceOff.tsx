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

export default function CharacterFaceOff() {
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

  // Progress Indicators
  const progressBarRef = useRef<HTMLDivElement>(null);
  const telemetryStatusRef = useRef<HTMLSpanElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  // 1. Dynamic Interactive Canvas: Atmospheric Fog & Clash Sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 75;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.9,
      vy: (Math.random() - 0.5) * 0.9,
      size: 1 + Math.random() * 2.5,
      alpha: 0.15 + Math.random() * 0.65,
      color: Math.random() > 0.5 ? '#00D5FF' : '#FF7438',
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        const distFromCenter = Math.abs(p.x - width / 2) / (width / 2);
        if (distFromCenter < 0.2) {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 1.2})`;
          ctx.shadowColor = '#00D5FF';
          ctx.shadowBlur = 10;
        } else if (p.x < width / 2) {
          ctx.fillStyle = `rgba(0, 213, 255, ${currentAlpha})`;
          ctx.shadowColor = '#00D5FF';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(255, 116, 56, ${currentAlpha})`;
          ctx.shadowColor = '#FF7438';
          ctx.shadowBlur = 6;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Master GSAP ScrollTrigger Animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=420%',
          pin: true,
          scrub: 1,
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
        xPercent: -130,
        rotationY: 18,
        scale: 0.88,
        opacity: 0,
        filter: 'blur(10px) brightness(0.4)',
        transformPerspective: 1200,
        transformOrigin: 'right center',
      });

      gsap.set(raptorWrapperRef.current, {
        xPercent: 130,
        rotationY: -18,
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

      // SCENE 1: CINEMATIC ENTRANCE FROM LEFT & RIGHT (0% -> 25%)
      masterTl
        .to(vectorWrapperRef.current, {
          xPercent: -48,
          rotationY: 10,
          scale: 0.98,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          duration: 2.2,
          ease: 'power2.out',
        })
        .to(
          raptorWrapperRef.current,
          {
            xPercent: 48,
            rotationY: -10,
            scale: 0.98,
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
          xPercent: -24,
          rotationY: 5,
          scale: 1.05,
          duration: 3,
          ease: 'power1.inOut',
        })
        .to(
          raptorWrapperRef.current,
          {
            xPercent: 24,
            rotationY: -5,
            scale: 1.05,
            duration: 3,
            ease: 'power1.inOut',
          },
          '<0'
        )
        .to(vectorGazeLightRef.current, {
          opacity: 1,
          scale: 1.2,
          duration: 1.5,
          ease: 'power2.out',
        }, '<1.0')
        .to(raptorGazeLightRef.current, {
          opacity: 1,
          scale: 1.2,
          duration: 1.5,
          ease: 'power2.out',
        }, '<0')
        .to(energyCollisionRef.current, {
          scaleY: 1,
          opacity: 1,
          duration: 1.8,
          ease: 'power3.out',
        }, '<0.5')
        .to(confrontationTextRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 2,
          ease: 'back.out(1.2)',
        }, '<0.2');

      // SCENE 3: CAMERA PUSH-IN / FACE CLOSE-UP ZOOM (55% -> 80%)
      masterTl
        .to(cameraRigRef.current, {
          scale: 1.4,
          y: -40,
          duration: 3.5,
          ease: 'power2.inOut',
        })
        .to(vectorWrapperRef.current, {
          xPercent: -15,
          duration: 3.5,
          ease: 'power2.inOut',
        }, '<0')
        .to(raptorWrapperRef.current, {
          xPercent: 15,
          duration: 3.5,
          ease: 'power2.inOut',
        }, '<0')
        .to(shockwaveRef.current, {
          scale: 2.2,
          opacity: 0.8,
          duration: 2,
          ease: 'power2.out',
        }, '<1.0')
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
        .to(vectorWrapperRef.current, {
          xPercent: -38,
          rotationY: 12,
          scale: 0.92,
          duration: 2.5,
          ease: 'power3.out',
        }, '<0')
        .to(raptorWrapperRef.current, {
          xPercent: 38,
          rotationY: -12,
          scale: 0.92,
          duration: 2.5,
          ease: 'power3.out',
        }, '<0')
        .to(confrontationTextRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 1.2,
        }, '<0')
        .to(finalCalloutRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 2.2,
          ease: 'back.out(1.1)',
        }, '<0.8');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="commanders"
      ref={containerRef}
      className="relative w-full bg-[#05070B] text-white overflow-hidden select-none"
    >
      {/* Background Interactive Canvas Particle Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* Atmospheric Cinematic Lighting Flares */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-cyan/20 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-orange/20 rounded-full blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-cyan/15 via-white/10 to-orange/15 rounded-full blur-[130px]" />
        <div className="absolute inset-0 tactical-grid-bg opacity-25" />
      </div>

      {/* Top Telemetry & Scrub Bar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <div className="h-[3px] bg-surface w-full">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-cyan via-white to-orange transition-all duration-75"
            style={{ width: '0%' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-[10px] sm:text-xs font-mono bg-[#05070B]/85 backdrop-blur-md border-b border-tactical-border/60">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan animate-ping shrink-0" />
            <span ref={telemetryStatusRef} className="text-cyan font-bold tracking-wider uppercase">
              CONVERGENCE: VECTOR & RAPTOR INCOMING
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-secondaryText hidden sm:inline">{"STAGE CONFRONTATION:"}</span>
            <span className="px-2 py-0.5 bg-surface border border-tactical-border font-bold text-white">
              {scrollPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* PINNED VIEWPORT STAGE */}
      <div
        ref={stageRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden px-4"
        style={{ perspective: '1200px' }}
      >
        <div
          ref={cameraRigRef}
          className="relative w-full h-full flex items-center justify-center will-change-transform origin-center"
        >
          {/* CHARACTER 1: VECTOR (LEFT ENTRANCE, FACING RIGHT) */}
          <div
            ref={vectorWrapperRef}
            className="absolute z-20 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-[400px] sm:h-[540px] md:h-[640px] lg:h-[720px] will-change-transform"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-cyan/60 shadow-[0_0_70px_rgba(0,213,255,0.4)] bg-card/70 backdrop-blur-md">
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan z-30" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan z-30" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan z-30" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan z-30" />

              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span className="px-2 py-1 bg-cyan text-background font-black uppercase clip-tactical">
                  TEAM VECTOR // LEADER
                </span>
                <span className="text-cyan font-bold bg-background/80 px-2 py-0.5 border border-cyan/40">
                  CT_TACTICAL
                </span>
              </div>

              <div
                ref={vectorGazeLightRef}
                className="absolute top-[22%] right-[28%] w-16 h-16 rounded-full bg-cyan/60 blur-[15px] z-30 pointer-events-none mix-blend-screen"
              />

              <Image
                src="/images/commanders/vector.jpeg"
                alt="VECTOR - Team Vector Commander"
                fill
                priority
                className="object-cover object-top filter brightness-100 contrast-105"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 460px, 520px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent opacity-85 z-20" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,213,255,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />

              <div className="absolute bottom-5 left-5 right-5 z-30">
                <div className="text-[11px] font-mono text-cyan tracking-widest uppercase mb-1 flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-cyan" />
                  <span>CYAN TACTICAL DEFENSE</span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wider uppercase">
                  VECTOR
                </h3>
                <p className="text-[11px] font-mono text-secondaryText hidden sm:block mt-0.5">
                  Strategic Command • Visor Radar Recon • Site Anchor
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: ENERGY COLLISION & FACE-OFF SPARKS */}
          <div
            ref={energyCollisionRef}
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-cyan via-white to-orange z-25 pointer-events-none origin-center shadow-[0_0_25px_rgba(255,255,255,0.8)]"
          />

          <div
            ref={shockwaveRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-white/60 bg-radial from-white/20 via-cyan/10 to-transparent z-25 pointer-events-none blur-[4px]"
          />

          <div
            ref={confrontationTextRef}
            className="absolute z-30 max-w-md text-center px-6 py-6 bg-[#080B10]/90 border border-tactical-border backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] will-change-transform"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-cyan" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white font-bold">
                FACE-TO-FACE CONFRONTATION
              </span>
              <Swords className="w-4 h-4 text-orange" />
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-white my-2">
              <span className="text-cyan drop-shadow-[0_0_20px_rgba(0,213,255,0.5)]">VECTOR</span>
              <span className="text-secondaryText text-2xl mx-2 font-mono">VS</span>
              <span className="text-orange drop-shadow-[0_0_20px_rgba(255,116,56,0.5)]">RAPTOR</span>
            </h2>

            <p className="text-xs font-mono text-secondaryText leading-relaxed mt-2">
              Only two forces stand on the main stage. No compromise. No retreat. Who will dictate the CS2 championship?
            </p>

            <div className="mt-4 pt-3 border-t border-tactical-border/70 flex items-center justify-around text-[10px] font-mono">
              <span className="text-cyan font-bold">SUB-TICK 128 SOURCE 2</span>
              <span className="text-tactical-border">|</span>
              <span className="text-orange font-bold">MR12 REGULATION</span>
            </div>
          </div>

          {/* CHARACTER 2: RAPTOR (RIGHT ENTRANCE, FACING LEFT) */}
          <div
            ref={raptorWrapperRef}
            className="absolute z-20 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-[400px] sm:h-[540px] md:h-[640px] lg:h-[720px] will-change-transform"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-orange/60 shadow-[0_0_70px_rgba(255,116,56,0.4)] bg-card/70 backdrop-blur-md">
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-orange z-30" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-orange z-30" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-orange z-30" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-orange z-30" />

              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span className="text-orange font-bold bg-background/80 px-2 py-0.5 border border-orange/40">
                  T_WARFARE
                </span>
                <span className="px-2 py-1 bg-orange text-white font-black uppercase clip-tactical">
                  TEAM RAPTOR // LEADER
                </span>
              </div>

              <div
                ref={raptorGazeLightRef}
                className="absolute top-[24%] left-[28%] w-16 h-16 rounded-full bg-orange/60 blur-[15px] z-30 pointer-events-none mix-blend-screen"
              />

              <Image
                src="/images/commanders/raptor.jpeg"
                alt="RAPTOR - Team Raptor Commander"
                fill
                priority
                className="object-cover object-top filter brightness-100 contrast-105"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 460px, 520px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent opacity-85 z-20" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,116,56,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />

              <div className="absolute bottom-5 left-5 right-5 z-30 text-right">
                <div className="text-[11px] font-mono text-orange tracking-widest uppercase mb-1 flex items-center justify-end gap-1.5 font-bold">
                  <span>TACTICAL AGGRESSION & INVASION</span>
                  <Flame className="w-3.5 h-3.5 text-orange" />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wider uppercase">
                  RAPTOR
                </h3>
                <p className="text-[11px] font-mono text-secondaryText hidden sm:block mt-0.5">
                  High-Impact Assault • Frontline Entry • Territory Disruption
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL SCENE: CALL TO ARMS & TOURNAMENT LOCK-IN */}
        <div
          ref={finalCalloutRef}
          className="absolute z-40 max-w-2xl text-center px-6 py-8 sm:py-10 bg-[#080B10]/95 border-2 border-cyan/50 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.95)] will-change-transform mx-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan/10 border border-cyan/40 text-cyan text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>THE ARENA AWAITS YOUR FACTION</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight mb-3">
            CHOOSE YOUR <span className="text-cyan">SIDE</span>. PROVE YOUR <span className="text-orange">LEGACY</span>.
          </h2>

          <p className="text-xs sm:text-sm font-mono text-secondaryText leading-relaxed mb-6 max-w-lg mx-auto">
            Will you stand with <strong className="text-cyan">VECTOR</strong>&apos;s disciplined defense or attack with <strong className="text-orange">RAPTOR</strong>&apos;s unstoppable firepower? Enlist your 5-man collegiate squad now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href="/register"
              variant="cyan"
              size="lg"
              icon={<Crosshair className="w-5 h-5" />}
              className="w-full sm:w-auto font-black shadow-[0_0_25px_rgba(0,213,255,0.4)]"
            >
              ENLIST TEAM VECTOR
            </Button>

            <Button
              href="/register"
              variant="orange"
              size="lg"
              icon={<Flame className="w-5 h-5 text-white" />}
              className="w-full sm:w-auto font-black shadow-[0_0_25px_rgba(255,116,56,0.4)]"
            >
              ENLIST TEAM RAPTOR
            </Button>

            <Button
              href="/#format"
              variant="outline"
              size="lg"
              icon={<Award className="w-4 h-4 text-cyan" />}
              className="w-full sm:w-auto"
            >
              TOURNAMENT FORMAT
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-secondaryText/70 tracking-widest pointer-events-none">
        <span>SCROLL TO CONTROL DUEL</span>
        <ChevronDown className="w-3.5 h-3.5 text-cyan animate-bounce" />
      </div>
    </section>
  );
}

