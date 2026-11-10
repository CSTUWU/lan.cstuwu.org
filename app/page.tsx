import React from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import CinematicShowcase from '@/components/home/CinematicShowcase';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

const LiveMatchHomeBanner = dynamic(() => import('@/components/home/LiveMatchHomeBanner'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="relative w-full">
      <Hero />

      <CinematicShowcase />

      <LiveMatchHomeBanner />

      <PrizePoolSection />
      <AboutSection />
      <TournamentFormat />
      <MapPoolSection />
      <TeamsPreview />
    </div>
  );
}
