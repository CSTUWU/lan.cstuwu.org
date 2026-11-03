import { Team, Match, CountdownSettings } from './types';

export const INITIAL_COUNTDOWN: CountdownSettings = {
  tournamentDate: '2026-11-20T09:00:00',
  registrationDeadline: '2026-11-12T23:59:59',
  eventStatus: 'REGISTRATIONS OPEN',
  announcementText: 'UWU LAN Challenge 2026 live at Uva Wellassa University Main Auditorium. Inter-Faculty 5v5 MR12 Counter-Strike 2 championship.'
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'UWU Tactical Vanguard',
    tag: 'UWU.V',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-10-15T14:30:00Z',
    captain: {
      name: 'Kasun Bandara',
      whatsappNumber: '0771234567',
      faculty: 'Faculty of Applied Sciences',
      email: 'kasun.b@std.uwu.ac.lk',
      phone: '0771234567'
    },
    players: [
      { id: 'p1-1', name: 'Kasun Bandara', faculty: 'Faculty of Applied Sciences', ign: 'V3CT0R_99', steamId: 'STEAM_0:1:45829102', email: 'kasun.b@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p1-2', name: 'Ravindu Senarath', faculty: 'Faculty of Applied Sciences', ign: 'PhantomAWP', steamId: 'STEAM_0:0:38291048', email: 'ravindu.s@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p1-3', name: 'Dinuka Perera', faculty: 'Faculty of Applied Sciences', ign: 'ApexStrike', steamId: 'STEAM_0:1:94827103', email: 'dinuka.p@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p1-4', name: 'Naveen Jayasuriya', faculty: 'Faculty of Applied Sciences', ign: 'CryoN', steamId: 'STEAM_0:0:19283746', email: 'naveen.j@std.uwu.ac.lk', role: 'Support' },
      { id: 'p1-5', name: 'Shehan Alwis', faculty: 'Faculty of Applied Sciences', ign: 'V0rtex', steamId: 'STEAM_0:1:56473829', email: 'shehan.a@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 4,
    wins: 4,
    losses: 0,
    roundsWon: 52,
    roundsLost: 24,
    roundDiff: 28,
    winRate: 100,
    form: ['W', 'W', 'W', 'W'],
    points: 12
  },
  {
    id: 'team-2',
    name: 'UWU Cyber Titans',
    tag: 'UWU.CT',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-10-16T11:20:00Z',
    captain: {
      name: 'Isuru Wickramasinghe',
      whatsappNumber: '0719876543',
      faculty: 'Faculty of Technological Studies',
      email: 'isuru.w@std.uwu.ac.lk',
      phone: '0719876543'
    },
    players: [
      { id: 'p2-1', name: 'Isuru Wickramasinghe', faculty: 'Faculty of Technological Studies', ign: 'R34PER_X', steamId: 'STEAM_0:1:22334455', email: 'isuru.w@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p2-2', name: 'Sahan Fernando', faculty: 'Faculty of Technological Studies', ign: 'BulletStorm', steamId: 'STEAM_0:0:88776655', email: 'sahan.f@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p2-3', name: 'Minura Gunasekara', faculty: 'Faculty of Technological Studies', ign: 'Nighthawk', steamId: 'STEAM_0:1:99112233', email: 'minura.g@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p2-4', name: 'Sachith De Silva', faculty: 'Faculty of Technological Studies', ign: 'Overclock', steamId: 'STEAM_0:0:55443322', email: 'sachith.d@std.uwu.ac.lk', role: 'Support' },
      { id: 'p2-5', name: 'Kavindu Rathnayake', faculty: 'Faculty of Technological Studies', ign: 'Pulse', steamId: 'STEAM_0:1:77889900', email: 'kavindu.r@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 4,
    wins: 3,
    losses: 1,
    roundsWon: 48,
    roundsLost: 38,
    roundDiff: 10,
    winRate: 75,
    form: ['W', 'W', 'L', 'W'],
    points: 9
  },
  {
    id: 'team-3',
    name: 'UWU Apex Predators',
    tag: 'UWU.APX',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-10-18T09:15:00Z',
    captain: {
      name: 'Kavishka Ranasinghe',
      whatsappNumber: '0765432109',
      faculty: 'Faculty of Management',
      email: 'kavishka.r@std.uwu.ac.lk',
      phone: '0765432109'
    },
    players: [
      { id: 'p3-1', name: 'Kavishka Ranasinghe', faculty: 'Faculty of Management', ign: 'BlitzKrieg', steamId: 'STEAM_0:1:34125678', email: 'kavishka.r@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p3-2', name: 'Harsha Mendis', faculty: 'Faculty of Management', ign: 'SilentScope', steamId: 'STEAM_0:0:98761234', email: 'harsha.m@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p3-3', name: 'Oshan Liyanage', faculty: 'Faculty of Management', ign: 'ShadowFox', steamId: 'STEAM_0:1:87654321', email: 'oshan.l@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p3-4', name: 'Roshan Dias', faculty: 'Faculty of Management', ign: 'Tactix', steamId: 'STEAM_0:0:43218765', email: 'roshan.d@std.uwu.ac.lk', role: 'Support' },
      { id: 'p3-5', name: 'Nuwan Jayawardena', faculty: 'Faculty of Management', ign: 'Spectre', steamId: 'STEAM_0:1:65432187', email: 'nuwan.j@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 3,
    wins: 2,
    losses: 1,
    roundsWon: 35,
    roundsLost: 31,
    roundDiff: 4,
    winRate: 67,
    form: ['L', 'W', 'W'],
    points: 6
  },
  {
    id: 'team-4',
    name: 'UWU Iron Vipers',
    tag: 'UWU.VIP',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-10-20T16:45:00Z',
    captain: {
      name: 'Janith Dissanayake',
      whatsappNumber: '0708765432',
      faculty: 'Faculty of Animal Science and Export Agriculture',
      email: 'janith.d@std.uwu.ac.lk',
      phone: '0708765432'
    },
    players: [
      { id: 'p4-1', name: 'Janith Dissanayake', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'ViperKing', steamId: 'STEAM_0:1:11229988', email: 'janith.d@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p4-2', name: 'Chathura Kumara', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'Striker9', steamId: 'STEAM_0:0:33448877', email: 'chathura.k@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p4-3', name: 'Gayan Weerasinghe', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'DeagleGod', steamId: 'STEAM_0:1:55667788', email: 'gayan.w@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p4-4', name: 'Dulith Perera', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'Sentinel', steamId: 'STEAM_0:0:77881122', email: 'dulith.p@std.uwu.ac.lk', role: 'Support' },
      { id: 'p4-5', name: 'Akila Somarathna', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'VenomX', steamId: 'STEAM_0:1:99003344', email: 'akila.s@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 3,
    wins: 1,
    losses: 2,
    roundsWon: 27,
    roundsLost: 38,
    roundDiff: -11,
    winRate: 33,
    form: ['W', 'L', 'L'],
    points: 3
  },
  {
    id: 'team-5',
    name: 'UWU Medic Strikers',
    tag: 'UWU.MED',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    status: 'approved',
    createdAt: '2026-10-22T13:00:00Z',
    captain: {
      name: 'Ashen Samarajeewa',
      whatsappNumber: '0751112233',
      faculty: 'Faculty of Medicine',
      email: 'ashen.s@std.uwu.ac.lk',
      phone: '0751112233'
    },
    players: [
      { id: 'p5-1', name: 'Ashen Samarajeewa', faculty: 'Faculty of Medicine', ign: 'Draco', steamId: 'STEAM_0:1:44556677', email: 'ashen.s@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p5-2', name: 'Senura Abeykoon', faculty: 'Faculty of Medicine', ign: 'Firebrand', steamId: 'STEAM_0:0:66778899', email: 'senura.a@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p5-3', name: 'Tharindu Fonseka', faculty: 'Faculty of Medicine', ign: 'Hydro', steamId: 'STEAM_0:1:88990011', email: 'tharindu.f@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p5-4', name: 'Bawantha Silva', faculty: 'Faculty of Medicine', ign: 'Flashbang', steamId: 'STEAM_0:0:22338899', email: 'bawantha.s@std.uwu.ac.lk', role: 'Support' },
      { id: 'p5-5', name: 'Chamod Karunaratne', faculty: 'Faculty of Medicine', ign: 'SmokeScreen', steamId: 'STEAM_0:1:44551122', email: 'chamod.k@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 4,
    wins: 1,
    losses: 3,
    roundsWon: 33,
    roundsLost: 49,
    roundDiff: -16,
    winRate: 25,
    form: ['L', 'L', 'W', 'L'],
    points: 3
  },
  {
    id: 'team-6',
    name: 'UWU Phoenix Legion',
    tag: 'UWU.PHX',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80',
    status: 'pending',
    createdAt: '2026-10-25T17:10:00Z',
    captain: {
      name: 'Malinda Edirisinghe',
      whatsappNumber: '0783334455',
      faculty: 'Faculty of Applied Sciences',
      email: 'malinda.e@std.uwu.ac.lk',
      phone: '0783334455'
    },
    players: [
      { id: 'p6-1', name: 'Malinda Edirisinghe', faculty: 'Faculty of Applied Sciences', ign: 'PhoenixFlame', steamId: 'STEAM_0:1:12398745', email: 'malinda.e@std.uwu.ac.lk', role: 'Captain' },
      { id: 'p6-2', name: 'Lahiru Prabath', faculty: 'Faculty of Applied Sciences', ign: 'BlazeAWP', steamId: 'STEAM_0:0:98712365', email: 'lahiru.p@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p6-3', name: 'Damith Cooray', faculty: 'Faculty of Applied Sciences', ign: 'Havoc', steamId: 'STEAM_0:1:45612378', email: 'damith.c@std.uwu.ac.lk', role: 'Rifler' },
      { id: 'p6-4', name: 'Sandun Jayakody', faculty: 'Faculty of Applied Sciences', ign: 'GripTape', steamId: 'STEAM_0:0:78945612', email: 'sandun.j@std.uwu.ac.lk', role: 'Support' },
      { id: 'p6-5', name: 'Heshan Gunawardena', faculty: 'Faculty of Applied Sciences', ign: 'Nebula', steamId: 'STEAM_0:1:32165498', email: 'heshan.g@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    points: 0
  },
  {
    id: 'team-7',
    name: 'UWU Agro Wolves',
    tag: 'UWU.AGR',
    university: 'Uva Wellassa University of Sri Lanka',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    status: 'pending',
    createdAt: '2026-10-26T08:50:00Z',
    captain: {
      name: 'Supun Madushanka',
      whatsappNumber: '0724445566',
      faculty: 'Faculty of Animal Science and Export Agriculture',
      email: 'supun.m@std.uwu.ac.lk',
      phone: '0724445566'
    },
    players: [
      { id: 'p7-1', name: 'Supun Madushanka', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'AlphaWolf', steamId: 'STEAM_0:1:90123456', email: 'supun.m@std.uwu.ac.lk', role: 'In-Game Leader' },
      { id: 'p7-2', name: 'Praveen Jayalath', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'SilverFang', steamId: 'STEAM_0:0:89012345', email: 'praveen.j@std.uwu.ac.lk', role: 'Sniper' },
      { id: 'p7-3', name: 'Kavindu Siriwardena', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'Lunar', steamId: 'STEAM_0:1:78901234', email: 'kavindu.s@std.uwu.ac.lk', role: 'Entry Fragger' },
      { id: 'p7-4', name: 'Dulaj Rodrigo', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'Howler', steamId: 'STEAM_0:0:67890123', email: 'dulaj.r@std.uwu.ac.lk', role: 'Support' },
      { id: 'p7-5', name: 'Yasith Perera', faculty: 'Faculty of Animal Science and Export Agriculture', ign: 'Nightstalker', steamId: 'STEAM_0:1:56789012', email: 'yasith.p@std.uwu.ac.lk', role: 'Lurker' }
    ],
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    points: 0
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm-1',
    teamAId: 'team-1',
    teamBId: 'team-2',
    teamAName: 'UWU Tactical Vanguard',
    teamATag: 'UWU.V',
    teamALogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    teamBName: 'UWU Cyber Titans',
    teamBTag: 'UWU.CT',
    teamBLogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    map: 'Mirage',
    dateTime: '2026-11-20T10:00:00',
    status: 'live',
    scoreA: 11,
    scoreB: 9,
    stage: 'Upper Bracket Semifinal 1 (MR12)',
    streamUrl: 'https://twitch.tv/cst_lan_challenge',
    currentRound: 21,
    half: 2,
    c4Planted: false,
    roundHistory: ['teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA'],
    teamASide: 'CT',
    teamBSide: 'T'
  },
  {
    id: 'm-2',
    teamAId: 'team-3',
    teamBId: 'team-4',
    teamAName: 'Colombo Apex Esports',
    teamATag: 'UOC.APX',
    teamALogo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    teamBName: 'Peradeniya Iron Vipers',
    teamBTag: 'UOP.VIPER',
    teamBLogo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    map: 'Inferno',
    dateTime: '2026-11-20T13:00:00',
    status: 'upcoming',
    scoreA: 0,
    scoreB: 0,
    stage: 'Upper Bracket Semifinal 2'
  },
  {
    id: 'm-3',
    teamAId: 'team-1',
    teamBId: 'team-3',
    teamAName: 'UWU Tactical Vanguard',
    teamATag: 'UWU.V',
    teamALogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    teamBName: 'Colombo Apex Esports',
    teamBTag: 'UOC.APX',
    teamBLogo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    map: 'Dust II',
    dateTime: '2026-11-18T16:00:00',
    status: 'completed',
    scoreA: 13,
    scoreB: 9,
    stage: 'Group Stage Round 3',
    mvp: 'V3CT0R_99 (Rating 1.48)'
  },
  {
    id: 'm-4',
    teamAId: 'team-2',
    teamBId: 'team-5',
    teamAName: 'Moratuwa Cyber Titans',
    teamATag: 'MORA.CT',
    teamALogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    teamBName: 'SLIIT Cyber Dragons',
    teamBTag: 'SLIIT.DRG',
    teamBLogo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    map: 'Nuke',
    dateTime: '2026-11-18T18:30:00',
    status: 'completed',
    scoreA: 13,
    scoreB: 11,
    stage: 'Group Stage Round 3',
    mvp: 'R34PER_X (31 Kills)'
  },
  {
    id: 'm-5',
    teamAId: 'team-1',
    teamBId: 'team-4',
    teamAName: 'UWU Tactical Vanguard',
    teamATag: 'UWU.V',
    teamALogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    teamBName: 'Peradeniya Iron Vipers',
    teamBTag: 'UOP.VIPER',
    teamBLogo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    map: 'Ancient',
    dateTime: '2026-11-17T14:00:00',
    status: 'completed',
    scoreA: 13,
    scoreB: 6,
    stage: 'Group Stage Round 2',
    mvp: 'PhantomAWP (2.1 KD)'
  }
];

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

