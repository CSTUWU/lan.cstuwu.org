'use client';

import React, { useEffect, useRef } from 'react';

interface EmberColor {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  baseVy: number;
  vy: number;
  color: EmberColor;
  isLargeEmber: boolean;
  alpha: number;
  targetAlpha: number;
  fadeSpeed: number;
  // Wind / heat sway oscillation
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  // Natural multi-frequency thermal flicker
  flickerPhase: number;
  flickerSpeed: number;
  flickerDepth: number;
  // Thermal updraft turbulence
  draftPhase: number;
  draftSpeed: number;
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

    // Warm ember & fire spark palette: glowing yellow #ffd000, hot gold #ffb700, orange #ff6600, incandescent amber #ff8800, deep ember red #cc2200
    const EMBER_COLORS: EmberColor[] = [
      { r: 255, g: 208, b: 0 },  // Glowing Yellow #ffd000
      { r: 255, g: 208, b: 0 },  // Glowing Yellow #ffd000 (weighted)
      { r: 255, g: 183, b: 0 },  // Hot Gold #ffb700
      { r: 255, g: 102, b: 0 },  // Orange #ff6600
      { r: 255, g: 136, b: 0 },  // Incandescent Amber #ff8800
      { r: 204, g: 34, b: 0 },   // Deep Ember Red #cc2200
    ];

    const getParticleCount = (w: number) => {
      if (w < 640) return 38;       // Mobile
      if (w < 1024) return 60;      // Tablet
      return 90;                    // Desktop
    };

    const createParticle = (spawnRandomY = true): Particle => {
      const isLargeEmber = Math.random() < 0.18; // ~18% are larger floating embers
      const color = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)];

      const baseRadius = isLargeEmber
        ? 2.0 + Math.random() * 1.8   // 2.0px to 3.8px
        : 0.6 + Math.random() * 1.1;  // 0.6px to 1.7px

      // Upward floating velocity (negative vy = rising heat / thermal draft)
      const baseVy = isLargeEmber
        ? -(0.35 + Math.random() * 0.45) // -0.35 to -0.80 px/frame
        : -(0.65 + Math.random() * 0.95); // -0.65 to -1.60 px/frame

      const targetAlpha = isLargeEmber
        ? 0.55 + Math.random() * 0.35
        : 0.35 + Math.random() * 0.45;

      return {
        x: Math.random() * width,
        y: spawnRandomY ? Math.random() * height : height + 10 + Math.random() * 25,
        baseRadius,
        radius: baseRadius,
        baseVy,
        vy: baseVy,
        color,
        isLargeEmber,
        alpha: spawnRandomY ? Math.random() * targetAlpha : 0,
        targetAlpha,
        fadeSpeed: 0.005 + Math.random() * 0.008,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.018 + Math.random() * 0.028,
        swayAmp: isLargeEmber ? 0.7 + Math.random() * 0.9 : 0.35 + Math.random() * 0.55,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: isLargeEmber ? 0.03 + Math.random() * 0.04 : 0.06 + Math.random() * 0.08,
        flickerDepth: 0.15 + Math.random() * 0.25,
        draftPhase: Math.random() * Math.PI * 2,
        draftSpeed: 0.015 + Math.random() * 0.025,
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

    // If reduced motion is requested, render static embers once without animation loop
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        const glowRadius = p.isLargeEmber ? p.baseRadius * 3.5 : p.baseRadius * 2.5;
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
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth fade-in
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + p.fadeSpeed);
        }

        // Natural multi-frequency thermal flicker
        p.flickerPhase += p.flickerSpeed;
        const flicker =
          Math.sin(p.flickerPhase) * 0.65 + Math.sin(p.flickerPhase * 2.3) * 0.35;

        // Draft turbulence modulation for upward velocity
        p.draftPhase += p.draftSpeed;
        const draftFactor = 1 + Math.sin(p.draftPhase) * 0.22;
        p.vy = p.baseVy * draftFactor;

        // Upward floating motion (heat rising)
        p.y += p.vy;

        // Horizontal sway / wind oscillation
        p.swayPhase += p.swaySpeed;
        p.x += Math.sin(p.swayPhase) * p.swayAmp;

        // Wrap boundaries: rising past top respawns at bottom
        if (p.y < -30) {
          p.y = height + 10 + Math.random() * 25;
          p.x = Math.random() * width;
          p.alpha = 0;
          p.swayPhase = Math.random() * Math.PI * 2;
          p.draftPhase = Math.random() * Math.PI * 2;
        }

        if (p.x < -30) {
          p.x = width + 20;
        } else if (p.x > width + 30) {
          p.x = -20;
        }

        // Natural cooling fade near the top of the viewport
        const topFade =
          p.y < height * 0.15 ? Math.max(0, p.y / (height * 0.15)) : 1;

        const currentAlpha = Math.max(
          0.03,
          Math.min(1, (p.alpha + flicker * p.flickerDepth) * topFade)
        );

        const currentRadius = p.isLargeEmber
          ? p.baseRadius * (1 + flicker * 0.14)
          : p.baseRadius * (1 + flicker * 0.08);

        const glowRadius = p.isLargeEmber ? currentRadius * 4.2 : currentRadius * 3.2;

        // Radial glow gradient: incandescent core -> warm ember tone -> transparent deep red
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          glowRadius
        );

        // White-hot center
        gradient.addColorStop(0, `rgba(255, 252, 225, ${currentAlpha})`);
        // Primary ember tone (#ffd000, #ffb700, #ff6600, etc.)
        gradient.addColorStop(
          0.32,
          `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha * 0.85})`
        );
        // Outer warm dissipation
        gradient.addColorStop(
          0.68,
          `rgba(${Math.min(255, p.color.r + 20)}, ${Math.floor(p.color.g * 0.35)}, 0, ${currentAlpha * 0.25})`
        );
        // Transparent edge
        gradient.addColorStop(1, 'rgba(204, 34, 0, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner solid core for intense brilliance
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, currentRadius * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 195, ${Math.min(1, currentAlpha * 1.3)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
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
      className="fixed inset-0 pointer-events-none z-[25] select-none"
      style={{ willChange: 'transform' }}
    />
  );
}
