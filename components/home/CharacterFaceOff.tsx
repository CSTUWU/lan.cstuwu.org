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
      color: Math.random() > 0.5 ? '#59634A' : '#C2B28A',
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
          ctx.fillStyle = `rgba(229, 229, 220, ${currentAlpha * 1.2})`;
          ctx.shadowColor = '#C2B28A';
          ctx.shadowBlur = 8;
        } else if (p.x < width / 2) {
          ctx.fillStyle = `rgba(89, 99, 74, ${currentAlpha})`;
          ctx.shadowColor = '#59634A';
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = `rgba(194, 178, 138, ${currentAlpha})`;
          ctx.shadowColor = '#C2B28A';
          ctx.shadowBlur = 5;
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
            className="absolute z-20 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-[400px] sm:h-[540px] md:h-[640px] lg:h-[720px] will-change-transform"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-olive/70 shadow-[0_4px_35px_rgba(0,0,0,0.85)] bg-card/70 backdrop-blur-md">
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-olive z-30" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-olive z-30" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-olive z-30" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-olive z-30" />

              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span className="px-2 py-1 bg-olive text-tacticalWhite font-black uppercase clip-tactical">
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
            className="absolute z-30 max-w-md text-center px-6 py-6 bg-military-black/95 border border-gunmetal backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.9)] will-change-transform"
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
              <span className="text-olive-light font-bold">5v5 MR12 REGULATION</span>
            </div>
          </div>

          <div
            ref={raptorWrapperRef}
            className="absolute z-20 w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] h-[400px] sm:h-[540px] md:h-[640px] lg:h-[720px] will-change-transform"
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
          className="absolute z-40 max-w-2xl text-center px-6 py-8 sm:py-10 bg-military-black/95 border-2 border-olive/50 backdrop-blur-2xl shadow-[0_4px_50px_rgba(0,0,0,0.95)] will-change-transform mx-4"
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-mutedText tracking-widest pointer-events-none">
        <span>SCROLL TO CONTROL DUEL</span>
        <ChevronDown className="w-3.5 h-3.5 text-sand animate-bounce" />
      </div>
    </section>
  );
}

