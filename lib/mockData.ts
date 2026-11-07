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
  image: 'https://cdn.playcs.gg/img/maps/de_mirage.webp',
  meta: 'High Tactical Depth • Mid-Control Focus'
},
  {
  name: 'Dust II',
  scenario: 'Bomb Defusal',
  location: 'Morocco, North Africa',
  description: 'An iconic Counter-Strike map featuring long-range A Long engagements, intense mid control through the central doors, and fast-paced B-site rushes through tunnels.',
  image: 'https://cdn.playcs.gg/img/maps/de_dust2.webp',
  meta: 'Classic Tactical Gameplay • Long-Range Combat Focus'
},
  {
  name: 'Cache',
  scenario: 'Bomb Defusal',
  location: 'Pripyat, Ukraine',
  description: 'A competitive Counter-Strike map set in an abandoned industrial complex, featuring intense mid control, strategic rotations through vents, and coordinated attacks on A and B bombsites.',
  image: 'https://cdn.playcs.gg/img/maps/de_cache.webp',
  meta: 'High Tactical Depth • Mid-Control Focus'
},
  {
  name: 'Ancient',
  scenario: 'Bomb Defusal',
  location: 'Central America',
  description: 'A jungle-themed Counter-Strike map featuring tight corridors, challenging mid control, stone ruins, and tactical executes on A and B bombsites.',
  image: 'https://cdn.playcs.gg/img/maps/de_ancient.webp',
  meta: 'High Tactical Depth • Jungle Warfare Focus'
},
  {
  name: 'Nuke',
  scenario: 'Bomb Defusal',
  location: 'United States',
  description: 'A vertically designed Counter-Strike map set in a nuclear power plant, featuring intense outside control, tactical rotations through vents, and coordinated attacks across its stacked A and B bombsites.',
  image: 'https://cdn.playcs.gg/img/maps/de_nuke.webp',
  meta: 'High Tactical Depth • Vertical Gameplay Focus'
},
  {
  name: 'Anubis',
  scenario: 'Bomb Defusal',
  location: 'Egypt, North Africa',
  description: 'A visually striking Counter-Strike map inspired by ancient Egyptian architecture, featuring intense mid control, tactical waterway rotations, and coordinated attacks through canals and temple corridors.',
  image: 'https://cdn.playcs.gg/img/maps/de_anubis.webp',
  meta: 'High Tactical Depth • Waterway-Control Focus'
}
];
