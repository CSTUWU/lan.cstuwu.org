'use client';

import { useEffect, ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Ensure GSAP ScrollTrigger updates on window resize or load
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    // Refresh ScrollTrigger once DOM and initial assets are ready
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}

