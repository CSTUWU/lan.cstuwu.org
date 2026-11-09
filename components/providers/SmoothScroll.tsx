'use client';

import { useEffect, ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

    const handleResize = () => {
      // Avoid triggering refresh if only height changed (e.g. mobile address bar)
      if (typeof window !== 'undefined' && window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Refresh ScrollTrigger once DOM and initial assets are ready
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}
