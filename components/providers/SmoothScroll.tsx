'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();

  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle cross-page and within-page hash scrolls reliably on pathname change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If entering home page with a pending hash, temporarily hide content to prevent top flash
    const hasPendingHash = Boolean(
      window.location.hash || sessionStorage.getItem('cst_pending_scroll_hash')
    );

    if (hasPendingHash && pathname === '/') {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    const performScrollToHash = (isCrossPage: boolean, retryCount = 0) => {
      const hash = window.location.hash || sessionStorage.getItem('cst_pending_scroll_hash') || '';
      if (!hash) return;

      const id = hash.replace(/^#/, '');
      const target = document.getElementById(id);

      if (target) {
        ScrollTrigger.refresh();
        const yOffset = -80; // Navbar height offset
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: 'auto',
        });

        sessionStorage.removeItem('cst_pending_scroll_hash');
      } else if (retryCount < 10) {
        // Run synchronously with animation frames to eliminate 2-3 frame flash
        requestAnimationFrame(() => performScrollToHash(isCrossPage, retryCount + 1));
      }
    };

    // Execute immediately before browser paints next frame
    const isPendingCrossPage = Boolean(sessionStorage.getItem('cst_pending_scroll_hash'));
    requestAnimationFrame(() => {
      performScrollToHash(isPendingCrossPage);
    });

    // In-page hash changes (User clicking links while remaining on the same page)
    const handleHashChange = () => {
      performScrollToHash(false);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  return <>{children}</>;
}
