import { Team, Match, CountdownSettings, ApprovalStatus, CS2Map, MatchStatus, Player } from './types';

export function transformBackendTeam(raw: any): Team {
  if (!raw) return {} as Team;

  const id = raw._id || raw.id || `team-${Math.random()}`;
  const name = raw.teamName || raw.name || 'Unknown Squad';
  const tag = raw.teamTag || raw.tag || 'CS2';
  const university = raw.university || 'University of Sri Lanka';
  const logo = raw.teamLogo || raw.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80';

  let status: ApprovalStatus = 'approved';
  if (raw.status) {
    status = raw.status.toLowerCase() as ApprovalStatus;
  } else if (raw.isActive !== undefined) {
    status = raw.isActive ? 'approved' : 'pending';
  }

  const captain = {
    name: raw.captain?.name || raw.captain?.fullName || 'Team Captain',
    whatsappNumber: raw.captain?.whatsappNumber || raw.captain?.phone || '',
    phone: raw.captain?.whatsappNumber || raw.captain?.phone || '',
    faculty: raw.captain?.faculty || '',
    email: raw.captain?.email || '',
  };

  const players: Player[] = Array.isArray(raw.players)
    ? raw.players.map((p: any, idx: number) => ({
        id: p._id || p.id || `p-${idx}`,
        name: p.fullName || p.name || `Player ${idx + 1}`,
        faculty: p.faculty || 'Faculty of Applied Sciences',
        ign: p.inGameName || p.ign || '',
        steamId: p.steamId || '',
        email: p.email || '',
        role: p.role || 'Player',
      }))
    : [];

  return {
    id,
    name,
    tag,
    university,
    logo,
    status,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    captain,
    players,
    matchesPlayed: raw.matchesPlayed ?? 0,
    wins: raw.wins ?? 0,
    losses: raw.losses ?? 0,
    roundsWon: raw.roundsWon ?? 0,
    roundsLost: raw.roundsLost ?? 0,
    roundDiff: raw.roundDiff ?? 0,
    winRate: raw.winRate ?? 0,
    form: raw.form || [],
    points: raw.points ?? 0,
  };
}

export function transformBackendRegistration(raw: any): Team {
  return transformBackendTeam(raw);
}

export function transformBackendMatch(raw: any): Match {
  if (!raw) return {} as Match;

  const id = raw._id || raw.id || `match-${Math.random()}`;
  const teamAId = raw.teamA?._id || raw.teamA || raw.teamAId || 'teamA';
  const teamBId = raw.teamB?._id || raw.teamB || raw.teamBId || 'teamB';
  const teamAName = raw.teamAName || raw.teamA?.teamName || raw.teamA?.name || 'Team Alpha';
  const teamATag = raw.teamATag || raw.teamA?.teamTag || raw.teamA?.tag || 'TMA';
  const teamALogo = raw.teamALogo || raw.teamA?.teamLogo || raw.teamA?.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80';

  const teamBName = raw.teamBName || raw.teamB?.teamName || raw.teamB?.name || 'Team Bravo';
  const teamBTag = raw.teamBTag || raw.teamB?.teamTag || raw.teamB?.tag || 'TMB';
  const teamBLogo = raw.teamBLogo || raw.teamB?.teamLogo || raw.teamB?.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80';

  const map = (raw.mapName || raw.map || 'Mirage') as CS2Map;
  const dateTime = raw.scheduledAt ? new Date(raw.scheduledAt).toISOString() : raw.dateTime || new Date().toISOString();

  let status: MatchStatus = 'upcoming';
  if (raw.status) {
    const s = String(raw.status).toLowerCase();
    if (s === 'live' || s === 'completed' || s === 'upcoming') {
      status = s as MatchStatus;
    }
  }

  return {
    id,
    matchNumber: raw.matchNumber,
    teamAId,
    teamBId,
    teamAName,
    teamATag,
    teamALogo,
    teamBName,
    teamBTag,
    teamBLogo,
    map,
    dateTime,
    status,
    scoreA: raw.scoreA ?? 0,
    scoreB: raw.scoreB ?? 0,
    stage: raw.stage || 'Official Match',
    streamUrl: raw.streamUrl,
    mvp: raw.mvp,
    bracketRound: raw.bracketRound,
    bracketPosition: raw.bracketPosition,
    nextMatchId: raw.nextMatchId || (raw.nextMatchNumber ? `m-${raw.nextMatchNumber}` : undefined),
    nextMatchSlot: raw.nextMatchSlot,
    winnerId: raw.winner?._id || raw.winner || (raw.status === 'completed' ? (raw.scoreA > raw.scoreB ? teamAId : teamBId) : undefined),
    currentRound: raw.currentRound ?? ((raw.scoreA ?? 0) + (raw.scoreB ?? 0)),
    half: raw.half || 1,
    c4Planted: !!raw.c4Planted,
    roundHistory: raw.roundHistory || [],
    teamASide: raw.teamASide || 'CT',
    teamBSide: raw.teamBSide || 'T',
  };
}

export function transformBackendSettings(raw: any): CountdownSettings {
  if (!raw) {
    return {
      tournamentDate: '2026-11-20T09:00:00',
      registrationDeadline: '2026-11-10T23:59:59',
      eventStatus: 'REGISTRATIONS OPEN',
      isRegistrationOpen: true,
      announcementText: 'CST LAN CHALLENGE 2026 - Official Counter-Strike 2 Championship hosted by Uva Wellassa University',
    };
  }

  const isOpen = typeof raw.registrationOpen === 'boolean'
    ? raw.registrationOpen
    : (raw.eventStatus === 'REGISTRATIONS OPEN');

  return {
    tournamentDate: raw.tournamentDate ? new Date(raw.tournamentDate).toISOString() : '2026-11-20T09:00:00',
    registrationDeadline: raw.registrationDeadline ? new Date(raw.registrationDeadline).toISOString() : '2026-11-10T23:59:59',
    eventStatus: raw.eventStatus || 'REGISTRATIONS OPEN',
    isRegistrationOpen: isOpen,
    announcementText: raw.announcementText || 'CST LAN CHALLENGE 2026',
  };
}

