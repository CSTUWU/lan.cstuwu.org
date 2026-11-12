import React from 'react';
import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import CinematicShowcase from '@/components/home/CinematicShowcase';
import LiveMatchHomeBanner from '@/components/home/LiveMatchHomeBanner';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'CST LAN Challenge 2026 - Official Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) university esports championship by Uva Wellassa University of Sri Lanka. View schedules, teams, scoreboard, and register your squad.',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Home',
    description:
      'Official CoD4 MW PromodLive 2.20 EU tournament by CST Degree Programme, Uva Wellassa University of Sri Lanka.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Home',
      },
    ],
  },
};

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
