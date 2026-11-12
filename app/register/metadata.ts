import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Squad Registration',
  description:
    'Register your 5-player squad for CST LAN Challenge 2026. Official CoD4 MW PromodLive 2.20 EU university esports enrollment portal for Uva Wellassa University students.',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Squad Registration',
    description:
      'Official team enrollment portal for CST LAN Challenge 2026.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Registration',
      },
    ],
  },
};
