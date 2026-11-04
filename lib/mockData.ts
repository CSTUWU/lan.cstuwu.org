import { Team, Match, CountdownSettings } from './types';

export const INITIAL_COUNTDOWN: CountdownSettings = {
  tournamentDate: '2026-11-20T09:00:00',
  registrationDeadline: '2026-11-12T23:59:59',
  eventStatus: 'REGISTRATIONS OPEN',
  isRegistrationOpen: true,
  announcementText: 'UWU LAN Challenge 2026 live at Uva Wellassa University Main Auditorium. Inter-Faculty 5v5 MR12 Counter-Strike 2 championship.'
};

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_MATCHES: Match[] = [];

export const CS2_MAP_POOL = [
  {
    name: 'Mirage',
    scenario: 'Bomb Defusal',
    location: 'Middle East',
    description: 'A staple Counter-Strike map emphasizing middle control, tactical smoke executes on A site, and lightning-fast palace takes.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    meta: 'High Tactical Depth • Mid-Control Focus'
  },
  {
    name: 'Dust II',
    scenario: 'Bomb Defusal',
    location: 'Morocco',
    description: 'The most iconic layout in FPS history. Four corridors, long sightlines, rapid rotation options, and intense long A sniper duels.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    meta: 'Aim Duel Heavy • Classic CS Layout'
  },
  {
    name: 'Inferno',
    scenario: 'Bomb Defusal',
    location: 'Italy',
    description: 'Choke point heavy, requires disciplined utility usage down Banana, tight apartment retakes, and synchronized team executions.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
    meta: 'Utility Mastery • Intense Chokepoints'
  },
  {
    name: 'Ancient',
    scenario: 'Bomb Defusal',
    location: 'Central America',
    description: 'Lush ruins offering deep mid skirmishes, cavern flanks, tight B site ramp defenses, and rich CS2 volumetric smoke interactions.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    meta: 'Volumetric Smoke Synergy • Mid Flanks'
  },
  {
    name: 'Nuke',
    scenario: 'Bomb Defusal',
    location: 'USA (Cedar Creek)',
    description: 'Multi-level verticality with subterranean B site, roof drops, ventilation shafts, and outside yard smoke line dominance.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    meta: 'Vertical Audio Precision • Outside Control'
  },
  {
    name: 'Anubis',
    scenario: 'Bomb Defusal',
    location: 'Egypt',
    description: 'Water canals, palace arches, fast-paced T-sided tactical splits, and dynamic bridge firefights in pristine desert architectures.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    meta: 'Canal Mobility • Dynamic Rotations'
  },
  {
    name: 'Vertigo',
    scenario: 'Bomb Defusal',
    location: 'High-Rise Construction',
    description: 'High-altitude construction site featuring ramp pressure, scaffold boosts, generator pushes, and quick rotation ladders.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    meta: 'High-Altitude Verticals • A-Ramp Brawls'
  }
];
