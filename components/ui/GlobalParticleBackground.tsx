'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  alpha: number;
  targetAlpha: number;
  fadeSpeed: number;
  depth: number; // 0 (far) to 1 (near) for parallax feel
  spark: boolean;
  sparkPhase: number;
  sparkSpeed: number;
}

export default function GlobalParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    // COD4 military green neon palette
    const NEON_GREEN = 'rgba(57, 255, 20, ';     // #39FF14
    const MILITARY_GREEN = 'rgba(124, 252, 0, ';  // #7CFC00
    const DARK_GREEN_GLOW = 'rgba(20, 33, 22, ';  // #142116

    const colors = [NEON_GREEN, MILITARY_GREEN];

    const getParticleCount = (w: number) => {
      if (w < 640) return 32;       // Mobile
      if (w < 1024) return 55;      // Tablet
      return 85;                    // Desktop
    };

    const createParticle = (spawnRandomY = true): Particle => {
      const depth = Math.random(); // 0 = small/slow/faint, 1 = larger/faster/brighter
      const isSpark = Math.random() < 0.22; // ~22% particles have energy shimmer

      // Size scaled with depth
      const baseRadius = 0.7 + depth * 1.7; // 0.7px to 2.4px
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Gentle floating velocities (slight ambient upward draft + sideways drift)
      const speedMultiplier = 0.2 + depth * 0.45;
      const vx = (Math.random() - 0.5) * speedMultiplier;
      const vy = (Math.random() * -0.5 - 0.1) * speedMultiplier;

      const targetAlpha = 0.2 + depth * 0.55;

      return {
        x: Math.random() * width,
        y: spawnRandomY ? Math.random() * height : height + 10,
        radius: baseRadius,
        baseRadius,
        vx,
        vy,
        color,
        glowColor: DARK_GREEN_GLOW,
        alpha: spawnRandomY ? Math.random() * targetAlpha : 0,
        targetAlpha,
        fadeSpeed: 0.003 + Math.random() * 0.006,
        depth,
        spark: isSpark,
        sparkPhase: Math.random() * Math.PI * 2,
        sparkSpeed: 0.03 + Math.random() * 0.05,
      };
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      const targetCount = getParticleCount(width);
      particles = Array.from({ length: targetCount }, () => createParticle(true));
    };

    resizeCanvas();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener('resize', handleResize);

    // If reduced motion is requested, render once and don't loop
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.targetAlpha * 0.5})`;
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth fade-in to target alpha
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + p.fadeSpeed);
        }

        // Shimmer / spark pulse calculations
        let currentAlpha = p.alpha;
        let currentRadius = p.radius;

        if (p.spark) {
          p.sparkPhase += p.sparkSpeed;
          const shimmer = (Math.sin(p.sparkPhase) + 1) / 2; // 0 to 1
          currentAlpha = Math.min(1, p.alpha + shimmer * 0.35);
          currentRadius = p.baseRadius * (1 + shimmer * 0.3);
        }

        // Motion update
        p.x += p.vx;
        p.y += p.vy;

        // Subtle horizontal wave/drift
        p.x += Math.sin(p.y * 0.005 + p.sparkPhase) * 0.15;

        // Wrap boundaries seamlessly with fade transition
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.alpha = 0;
        } else if (p.y > height + 20) {
          p.y = -10;
          p.x = Math.random() * width;
          p.alpha = 0;
        }

        if (p.x < -20) {
          p.x = width + 10;
        } else if (p.x > width + 20) {
          p.x = -10;
        }

        // Draw particle with subtle multi-layer neon green glow
        const glowRadius = currentRadius * 3.5;

        // Outer soft glow aura
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          glowRadius
        );
        gradient.addColorStop(0, `${p.color}${currentAlpha * 0.95})`);
        gradient.addColorStop(0.35, `${p.color}${currentAlpha * 0.35})`);
        gradient.addColorStop(1, 'rgba(20, 33, 22, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(1, currentAlpha * 1.2)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] select-none"
      style={{ willChange: 'transform' }}
    />
  );
}

