'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  // Prevent mobile address bar show/hide from triggering heavy recalculations
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });

  // Default ease and config
  gsap.defaults({
    ease: 'power3.out',
    duration: 0.8,
  });
}

export { gsap, ScrollTrigger };
