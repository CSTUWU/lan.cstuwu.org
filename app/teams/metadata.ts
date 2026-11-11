import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registered Squads',
  description:
    'CST LAN Challenge 2026 registered collegiate squads and team rosters. View deployed teams, standings, and player lineups for the CoD4 MW PromodLive 2.20 EU championship.',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Registered Squads',
    description:
      'Team rosters and registered squads for CST LAN Challenge 2026.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Teams',
      },
    ],
  },
};
