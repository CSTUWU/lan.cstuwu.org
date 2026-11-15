import { Team, Match, CountdownSettings } from './types';
import seedData from './seedData.json';

export const INITIAL_COUNTDOWN: CountdownSettings = {
  tournamentDate: '2026-11-20T09:00:00',
  registrationDeadline: '2026-12-01T23:59:59',
  eventStatus: 'REGISTRATIONS OPEN',
  isRegistrationOpen: true,
  announcementText: 'CST LAN Challenge 2026 live at Uva Wellassa University Main Auditorium. Inter-Faculty 5v5 MR12 Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship.'
};

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_MATCHES: Match[] = [];

export const CS2_MAP_POOL = [
  {
    name: 'Crash',
    callsign: 'mp_crash',
    scenario: 'Search & Destroy (MR12)',
    location: 'Middle East // Downed Sea Knight',
    description: 'An iconic Call of Duty 4 Promod battlefield featuring vertical duels around the three-story building, blue building perches, and high-stakes bombsite takes at A and B.',
    image: '/mp_crash.jpeg',
    meta: 'Downed Sea Knight • Vertical Combat • Fast Retakes'
  },
  {
    name: 'Crossfire',
    callsign: 'mp_crossfire',
    scenario: 'Search & Destroy (MR12)',
    location: 'Middle East // Sniper Alley',
    description: 'The definitive sniper duel arena of CoD4 Promod. Demands disciplined smoke executes, high-ground control, bus chokepoint suppression, and intense building-to-building clears.',
    image: '/mp_crossfire.jpeg',
    meta: 'Sniper Alley • Chokepoint Crossings • High Ground'
  },
  {
    name: 'Backlot',
    callsign: 'mp_backlot',
    scenario: 'Search & Destroy (MR12)',
    location: 'Middle East // Construction Site',
    description: 'Balanced tactical theater centered on an unfinished multi-story construction building, gas station flank, and narrow alleyways leading into heavily contested bombsites.',
    image: '/mp_backlot.jpeg',
    meta: 'Construction Site • Mid Flanks • Grenade Trajectories'
  },
  {
    name: 'Citystreets',
    callsign: 'mp_citystreet',
    scenario: 'Search & Destroy (MR12)',
    location: 'Urban District // Market Square',
    description: 'Expansive urban labyrinth (District) with winding market stalls, second-floor window perches, and long sightlines connecting open avenues to compact indoor bombsites.',
    image: '/mp_citystreet.jpeg',
    meta: 'Market Labyrinth • Window Overlooks • Long Avenues'
  },
  {
    name: 'Strike',
    callsign: 'mp_strike',
    scenario: 'Search & Destroy (MR12)',
    location: 'Urban Town // Hotel Square',
    description: 'Premier competitive Promod battleground featuring high-stakes center road crossings, hotel sniper vantage points, market flanks, and rapid close-quarters bombsite combat.',
    image: '/mp_strike.jpeg',
    meta: 'Hotel Control • Market Flanks • High-Stakes Crossings'
  }
];

export function getMapImage(mapName?: string): string {
  if (!mapName) return '/mp_crash.jpeg';
  const normalized = mapName.toLowerCase();
  if (normalized.includes('backlot')) return '/mp_backlot.jpeg';
  if (normalized.includes('city') || normalized.includes('district')) return '/mp_citystreet.jpeg';
  if (normalized.includes('crossfire')) return '/mp_crossfire.jpeg';
  if (normalized.includes('strike')) return '/mp_strike.jpeg';
  return '/mp_crash.jpeg';
}
