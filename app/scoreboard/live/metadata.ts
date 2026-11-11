import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Auditorium Projector',
  description:
    'CST LAN Challenge 2026 live auditorium stage projector HUD. Real-time CoD4 MW PromodLive 2.20 EU match telemetry, round scores, and broadcast feed.',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Live Auditorium Projector',
    description:
      'Live stage projector broadcast for CST LAN Challenge 2026.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Live',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};
