import React from 'react';
import Hero from '@/components/home/Hero';
import CountdownSection from '@/components/home/CountdownSection';
import CommanderShowcase from '@/components/home/CommanderShowcase';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export default function HomePage() {
  return (
    <div className="relative w-full">
      <Hero />
      <CountdownSection />
      <CommanderShowcase />
      <AboutSection />
      <TournamentFormat />
      <MapPoolSection />
      <TeamsPreview />
    </div>
  );
}

