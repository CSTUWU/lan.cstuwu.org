export const UWU_FACULTIES = [
  'Faculty of Applied Sciences',
  'Faculty of Management',
  'Faculty of Technological Studies',
  'Faculty of Animal Science and Export Agriculture',
  'Faculty of Medicine',
] as const;

export type UWUFaculty = (typeof UWU_FACULTIES)[number];

export interface Player {
  id: string;
  name: string;
  faculty: string;
  ign?: string; // in-game name (optional)
  steamId?: string; // steam ID (optional)
  email?: string;
  role?: string;
}

export interface Captain {
  name: string;
  whatsappNumber: string;
  faculty?: string;
  email?: string;
  phone?: string;
}

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Team {
  id: string;
  name: string;
  tag: string;
  university: string;
  logo: string;
  status: ApprovalStatus;
  createdAt: string;
  captain: Captain;
  players: Player[]; // exactly 5 players
  faculty?: string;
  matchesPlayed?: number;
  wins?: number;
  losses?: number;
  roundsWon?: number;
  roundsLost?: number;
  roundDiff?: number;
  winRate?: number;
  form?: ('W' | 'L')[];
  points?: number;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export type CS2Map = 'Mirage' | 'Dust II' | 'Inferno' | 'Ancient' | 'Nuke' | 'Anubis' | 'Vertigo';

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamATag: string;
  teamALogo: string;
  teamBName: string;
  teamBTag: string;
  teamBLogo: string;
  map: CS2Map;
  dateTime: string;
  status: MatchStatus;
  scoreA: number;
  scoreB: number;
  stage: string; // e.g. "Upper Bracket Semifinal", "Grand Final"
  streamUrl?: string;
  mvp?: string;
  // Real-time projector live metrics
  currentRound?: number;
  half?: 1 | 2 | 'OT';
  c4Planted?: boolean;
  roundHistory?: ('teamA' | 'teamB')[];
  teamASide?: 'CT' | 'T';
  teamBSide?: 'CT' | 'T';
}

export interface CountdownSettings {
  tournamentDate: string; // ISO string e.g. "2026-11-20T09:00:00"
  registrationDeadline: string; // ISO string
  eventStatus: 'REGISTRATIONS OPEN' | 'CHECK-IN PHASE' | 'BATTLEFIELD ACTIVE' | 'CHAMPIONS CROWNED';
  announcementText: string;
}
