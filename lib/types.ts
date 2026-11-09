export const UWU_FACULTIES = [
  'Faculty of Applied Sciences',
  'Faculty of Management',
  'Faculty of Technological Studies',
  'Faculty of Animal Science and Export Agriculture',
  'Faculty of Medicine',
] as const;

export type UWUFaculty = (typeof UWU_FACULTIES)[number];

export const UWU_DEGREE_PROGRAMMES = [
  'Computer Science and Technology (CST)',
  'Industrial Information Technology (IIT)',
  'Science and Technology (SCT)',
  'Mineral Resources and Technology (MRT)',
  'Information and Communication Technology (BICT)',
  'Engineering Technology (BET)',
  'Biosystems Technology (BST)',
  'Entrepreneurship and Management (ENM)',
  'Hospitality, Tourism and Events Management (HTE)',
  'Human Resource Development (HRD)',
  'Animal Science (ANS)',
  'Aquatic Resources Technology (AQT)',
  'Export Agriculture (EAG)',
  'Plantation Management Technology (PMT)',
  'English Language & Applied Linguistics (ELAL)',
  'Bachelor of Medicine and Bachelor of Surgery (MBBS)',
] as const;

export type UWUDegreeProgram = (typeof UWU_DEGREE_PROGRAMMES)[number];

export const ACADEMIC_YEARS = ['1', '2', '3', '4'] as const;
export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export interface Player {
  id: string;
  name: string;
  faculty?: string;
  degreeProgram?: string;
  year?: string;
  ign?: string; // in-game name / Gaming Name
  gamingName?: string;
  steamId?: string; // steam ID / callsign
  email?: string;
  role?: string;
  enrollmentNumber?: string;
}

export interface Captain {
  name: string;
  whatsappNumber: string;
  faculty?: string;
  degreeProgram?: string;
  year?: string;
  enrollmentNumber?: string;
  email?: string;
  phone?: string;
  ign?: string;
  gamingName?: string;
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
  degreeProgram?: string;
  year?: string;
  enrollmentNumber?: string;
  email?: string;
  column1?: string;
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
  matchNumber?: number;
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
  stage: string; // e.g. "Quarterfinal 1", "Semifinal 1", "Grand Final"
  streamUrl?: string;
  mvp?: string;
  bracketRound?: 'round_of_16' | 'quarterfinals' | 'semifinals' | 'final' | 'third_place' | 'groups';
  bracketPosition?: number;
  nextMatchId?: string;
  nextMatchSlot?: 'teamA' | 'teamB';
  winnerId?: string;
  // Real-time projector live metrics
  currentRound?: number;
  half?: 1 | 2 | 'OT';
  c4Planted?: boolean;
  roundHistory?: ('teamA' | 'teamB')[];
  teamASide?: 'CT' | 'T';
  teamBSide?: 'CT' | 'T';
}

export interface PlayoffBracket {
  roundOf16?: Match[];
  quarterfinals: Match[];
  semifinals: Match[];
  final: Match | null;
  thirdPlace?: Match | null;
  champion?: Team | null;
}

export interface CountdownSettings {
  tournamentDate: string; // ISO string e.g. "2026-11-20T09:00:00"
  registrationDeadline: string; // ISO string
  eventStatus: 'REGISTRATIONS OPEN' | 'CHECK-IN PHASE' | 'BATTLEFIELD ACTIVE' | 'CHAMPIONS CROWNED';
  announcementText: string;
  isRegistrationOpen?: boolean;
}
