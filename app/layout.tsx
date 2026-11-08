import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GlobalParticleBackground from '@/components/ui/GlobalParticleBackground';

export const metadata: Metadata = {
  title: 'CST LAN Challenge 2026 | Counter-Strike 2 Esports Tournament',
  description:
    'Official website for CST LAN Challenge 2026 CS2 tournament, organized by the Computer Science and Technology Degree Programme, Uva Wellassa University of Sri Lanka.',
  keywords: [
    'CS2',
    'Counter-Strike 2',
    'CST LAN Challenge',
    'Uva Wellassa University',
    'UWU',
    'Esports Sri Lanka',
    'University Gaming Tournament',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-primaryText font-sans min-h-screen flex flex-col antialiased selection:bg-cyan selection:text-background">
        <GlobalParticleBackground />
        <SmoothScroll>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
