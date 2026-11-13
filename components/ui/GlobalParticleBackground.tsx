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
  spriteIndex: number;
  isLargeEmber: boolean;
  alpha: number;
  targetAlpha: number;
  fadeSpeed: number;
  // Wind / heat sway oscillation
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  windDrift: number;
  // Multi-frequency thermal flicker
  flickerPhase: number;
  flickerSpeed: number;
  flickerDepth: number;
  // Thermal updraft turbulence
  draftPhase: number;
  draftSpeed: number;
}

// Warm ember palette: glowing yellow #ffd000, hot gold #ffb700, orange #ff6600, incandescent amber #ff8800, deep ember red #cc2200
const EMBER_PALETTE: EmberColor[] = [
  { r: 255, g: 208, b: 0 },  // Glowing Yellow #ffd000
  { r: 255, g: 208, b: 0 },  // Glowing Yellow #ffd000 (weighted)
  { r: 255, g: 183, b: 0 },  // Hot Gold #ffb700
  { r: 255, g: 102, b: 0 },  // Orange #ff6600
  { r: 255, g: 136, b: 0 },  // Incandescent Amber #ff8800
  { r: 204, g: 34, b: 0 },   // Deep Ember Red #cc2200
];

/**
 * Creates pre-rendered sprite canvases to eliminate per-frame CanvasGradient allocations.
 * Enables guaranteed 60-120fps with zero GC stutter.
 */
function createEmberSprites(): HTMLCanvasElement[] {
  const size = 64;
  const center = size / 2;
  const radius = size / 2;

  // 1. Color sprites for each warm ember tone
  const sprites = EMBER_PALETTE.map((color) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
    // White-hot core
    grad.addColorStop(0, 'rgba(255, 252, 235, 1)');
    // Vibrant ember color (#ffd000, #ffb700, #ff6600, #ff8800, #cc2200)
    grad.addColorStop(0.24, `rgba(${color.r}, ${color.g}, ${color.b}, 0.95)`);
    // Outer warm dissipation
    grad.addColorStop(0.58, `rgba(${Math.min(255, color.r + 20)}, ${Math.floor(color.g * 0.38)}, 0, 0.4)`);
    // Deep smoky red edge
    grad.addColorStop(0.85, 'rgba(204, 34, 0, 0.12)');
    // Pure transparent boundary
    grad.addColorStop(1, 'rgba(204, 34, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  });

  // 2. Extra white-hot spark sprite for high-intensity centers
  const sparkCanvas = document.createElement('canvas');
  sparkCanvas.width = size;
  sparkCanvas.height = size;
  const sparkCtx = sparkCanvas.getContext('2d');
  if (sparkCtx) {
    const grad = sparkCtx.createRadialGradient(center, center, 0, center, center, radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 250, 215, 0.95)');
    grad.addColorStop(0.45, 'rgba(255, 208, 0, 0.7)');
    grad.addColorStop(0.75, 'rgba(255, 102, 0, 0.25)');
    grad.addColorStop(1, 'rgba(204, 34, 0, 0)');

    sparkCtx.fillStyle = grad;
    sparkCtx.beginPath();
    sparkCtx.arc(center, center, radius, 0, Math.PI * 2);
    sparkCtx.fill();
  }
  sprites.push(sparkCanvas);

  return sprites;
}

export default function GlobalParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-render sprite textures for 60/120fps hardware-accelerated drawImage
    const sprites = createEmberSprites();
    const whiteHotSprite = sprites[sprites.length - 1];

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const getParticleCount = (w: number) => {
      if (w < 640) return 16;       // Mobile: sleek, battery/CPU-friendly
      if (w < 1024) return 36;      // Tablet
      return 85;                    // Desktop: full immersive embers
    };

    const createParticle = (spawnRandomY = true): Particle => {
      const isLargeEmber = Math.random() < 0.18; // ~18% larger floating embers
      const spriteIndex = Math.floor(Math.random() * (sprites.length - 1));

      // Sizing: small sparks 0.6–1.7px; larger embers 2.0–3.8px
      const baseRadius = isLargeEmber
        ? 2.0 + Math.random() * 1.8
        : 0.6 + Math.random() * 1.1;

      // Negative vy = floating upward simulating heat convection
      const baseVy = isLargeEmber
        ? -(0.35 + Math.random() * 0.45) // -0.35 to -0.80 px/frame baseline
        : -(0.65 + Math.random() * 0.95); // -0.65 to -1.60 px/frame baseline

      const targetAlpha = isLargeEmber
        ? 0.55 + Math.random() * 0.35
        : 0.35 + Math.random() * 0.45;

      return {
        x: Math.random() * (width || window.innerWidth),
        y: spawnRandomY
          ? Math.random() * (height || window.innerHeight)
          : (height || window.innerHeight) + 10 + Math.random() * 25,
        baseRadius,
        radius: baseRadius,
        baseVy,
        vy: baseVy,
        spriteIndex,
        isLargeEmber,
        alpha: spawnRandomY ? Math.random() * targetAlpha : 0,
        targetAlpha,
        fadeSpeed: 0.005 + Math.random() * 0.008,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.018 + Math.random() * 0.028,
        swayAmp: isLargeEmber ? 0.7 + Math.random() * 0.9 : 0.35 + Math.random() * 0.55,
        windDrift: (Math.random() - 0.4) * 0.25, // Slight prevailing atmospheric drift
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: isLargeEmber ? 0.03 + Math.random() * 0.04 : 0.06 + Math.random() * 0.08,
        flickerDepth: 0.15 + Math.random() * 0.25,
        draftPhase: Math.random() * Math.PI * 2,
        draftSpeed: 0.015 + Math.random() * 0.025,
      };
    };

    const drawStaticEmbers = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const sprite = sprites[p.spriteIndex];
        const glowRadius = p.isLargeEmber ? p.baseRadius * 4.2 : p.baseRadius * 3.2;
        const drawSize = glowRadius * 2;

        ctx.globalAlpha = p.targetAlpha * 0.75;
        ctx.drawImage(sprite, p.x - glowRadius, p.y - glowRadius, drawSize, drawSize);

        // Core white-hot spark center
        const coreSize = Math.max(1.2, p.baseRadius * 1.3);
        ctx.drawImage(whiteHotSprite, p.x - coreSize / 2, p.y - coreSize / 2, coreSize, coreSize);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const resizeCanvas = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // Prevent jarring resets during mobile URL bar hide/show scroll
      if (width === newWidth && Math.abs(height - newHeight) < 80) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = newWidth;
      height = newHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Use setTransform to avoid accumulating scale transforms
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = getParticleCount(width);

      // Preserve existing particles instead of snapping/popping on resize
      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, () => createParticle(true));
      } else {
        // Wrap any out-of-bound particles into current viewport
        particles.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });

        if (particles.length < targetCount) {
          const needed = targetCount - particles.length;
          for (let i = 0; i < needed; i++) {
            particles.push(createParticle(true));
          }
        } else if (particles.length > targetCount) {
          particles.length = targetCount;
        }
      }

      if (prefersReducedMotion) {
        drawStaticEmbers();
      }
    };

    resizeCanvas();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener('resize', handleResize);

    // If reduced motion is requested, render static embers once and redraw on resize
    if (prefersReducedMotion) {
      drawStaticEmbers();
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimer);
      };
    }

    // Delta-time scaled 60fps/120fps animation loop
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Clamp dt to prevent tab-switch leaps
      lastTime = currentTime;
      const timeScale = dt * 60; // 1.0 at standard 60fps

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth fade-in
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.targetAlpha, p.alpha + p.fadeSpeed * timeScale);
        }

        // Natural multi-frequency thermal flicker
        p.flickerPhase += p.flickerSpeed * timeScale;
        const flicker =
          Math.sin(p.flickerPhase) * 0.65 + Math.sin(p.flickerPhase * 2.3) * 0.35;

        // Draft turbulence modulation for upward velocity
        p.draftPhase += p.draftSpeed * timeScale;
        const draftFactor = 1 + Math.sin(p.draftPhase) * 0.22;
        p.vy = p.baseVy * draftFactor;

        // Upward floating motion (heat rising)
        p.y += p.vy * timeScale;

        // Horizontal sway / wind oscillation
        p.swayPhase += p.swaySpeed * timeScale;
        p.x += (Math.sin(p.swayPhase) * p.swayAmp + p.windDrift) * timeScale;

        // Wrap boundaries: rising past top respawns smoothly at bottom
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

        // Natural cooling fade near top of the viewport
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
        const drawSize = glowRadius * 2;
        const sprite = sprites[p.spriteIndex];

        // Draw outer glow aura
        ctx.globalAlpha = currentAlpha;
        ctx.drawImage(sprite, p.x - glowRadius, p.y - glowRadius, drawSize, drawSize);

        // Draw inner white-hot core for intense brilliance
        const coreSize = Math.max(1.2, currentRadius * 1.4);
        ctx.globalAlpha = Math.min(1, currentAlpha * 1.3);
        ctx.drawImage(whiteHotSprite, p.x - coreSize / 2, p.y - coreSize / 2, coreSize, coreSize);
      }

      ctx.globalAlpha = 1;
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
