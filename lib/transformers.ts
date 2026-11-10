import { Team, Match, CountdownSettings, ApprovalStatus, CS2Map, MatchStatus, Player } from './types';

export function transformBackendTeam(raw: any): Team {
  if (!raw) return {} as Team;

  const id = raw._id || raw.id || `team-${Math.random()}`;
  const name = raw.teamName || raw.name || 'Unknown Squad';
  const tag = raw.teamTag || raw.tag || 'CS2';
  const university = raw.university || 'University of Sri Lanka';
  const logo = raw.teamLogo || raw.logo || '/images/team-placeholder.svg';

  let status: ApprovalStatus = 'approved';
  if (raw.status) {
    status = raw.status.toLowerCase() as ApprovalStatus;
  } else if (raw.isActive !== undefined) {
    status = raw.isActive ? 'approved' : 'pending';
  }

  const degreeProgram = raw.degreeProgram || raw.captain?.degreeProgram || raw.faculty || '';
  const year = raw.year || raw.captain?.year ? String(raw.year || raw.captain?.year) : '';
  const enrollmentNumber = raw.enrollmentNumber || raw.column1 || raw.captain?.enrollmentNumber || '';
  const email = raw.email || raw.captain?.email || '';

  const captain = {
    name: raw.captain?.name || raw.captain?.fullName || 'Team Captain',
    whatsappNumber: raw.captain?.whatsappNumber || raw.captain?.phone || '',
    phone: raw.captain?.whatsappNumber || raw.captain?.phone || '',
    faculty: raw.captain?.faculty || degreeProgram,
    degreeProgram,
    year,
    enrollmentNumber,
    email,
    ign: raw.captain?.ign || raw.captain?.inGameName || raw.players?.[0]?.inGameName || raw.players?.[0]?.ign || '',
    gamingName: raw.captain?.gamingName || raw.captain?.inGameName || raw.players?.[0]?.inGameName || raw.players?.[0]?.ign || '',
  };

  const players: Player[] = Array.isArray(raw.players)
    ? raw.players.map((p: any, idx: number) => {
        const isLeader = idx === 0 || p.role === 'Team Leader';
        const memberName = p.fullName || p.name || (isLeader ? captain.name : `Operative 0${idx + 1}`);
        const memberIgn = p.gamingName || p.inGameName || p.ign || (isLeader ? captain.gamingName : '');
        const memberYear = p.year ? String(p.year) : (isLeader && year ? year : '1');
        const memberEnrollment = p.enrollmentNumber ? String(p.enrollmentNumber) : (isLeader ? enrollmentNumber : '');
        return {
          id: p._id || p.id || `p-${idx}`,
          name: memberName,
          faculty: p.faculty || degreeProgram || 'Faculty of Applied Sciences',
          degreeProgram: p.degreeProgram || degreeProgram,
          year: memberYear,
          ign: memberIgn,
          gamingName: memberIgn,
          steamId: p.steamId || '',
          email: p.email || (isLeader ? email : ''),
          role: p.role || (isLeader ? 'Team Leader' : `Operative 0${idx + 1}`),
          enrollmentNumber: memberEnrollment,
        };
      })
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
    degreeProgram,
    year,
    enrollmentNumber,
    column1: enrollmentNumber,
    email,
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

  const rawId = raw._id || raw.id;
  const id = typeof rawId === 'object' && rawId !== null
    ? (rawId.$oid || rawId.toString?.() || String(rawId))
    : String(rawId || `match-${Math.random()}`);

  const rawA = raw.teamA?._id || raw.teamA || raw.teamAId || 'teamA';
  const teamAId = typeof rawA === 'object' && rawA !== null ? (rawA.$oid || rawA.toString?.() || String(rawA)) : String(rawA);

  const rawB = raw.teamB?._id || raw.teamB || raw.teamBId || 'teamB';
  const teamBId = typeof rawB === 'object' && rawB !== null ? (rawB.$oid || rawB.toString?.() || String(rawB)) : String(rawB);

  const teamAName = raw.teamAName || raw.teamA?.teamName || raw.teamA?.name || 'Team Alpha';
  const teamATag = raw.teamATag || raw.teamA?.teamTag || raw.teamA?.tag || 'TMA';
  const teamALogo = raw.teamALogo || raw.teamA?.teamLogo || raw.teamA?.logo || '/images/team-placeholder.svg';

  const teamBName = raw.teamBName || raw.teamB?.teamName || raw.teamB?.name || 'Team Bravo';
  const teamBTag = raw.teamBTag || raw.teamB?.teamTag || raw.teamB?.tag || 'TMB';
  const teamBLogo = raw.teamBLogo || raw.teamB?.teamLogo || raw.teamB?.logo || '/images/team-placeholder.svg';

  const map = (raw.mapName || raw.map || 'Mirage') as CS2Map;
  const dateTime = raw.scheduledAt ? new Date(raw.scheduledAt).toISOString() : raw.dateTime || new Date().toISOString();

  let status: MatchStatus = 'upcoming';
  if (raw.status) {
    const s = String(raw.status).toLowerCase();
    if (s === 'live' || s === 'completed' || s === 'upcoming') {
      status = s as MatchStatus;
    }
  }

  const rawWinner = raw.winner?._id || raw.winner || (status === 'completed' && raw.scoreA !== raw.scoreB ? (raw.scoreA > raw.scoreB ? teamAId : teamBId) : undefined);
  const winnerId = rawWinner ? (typeof rawWinner === 'object' ? (rawWinner.$oid || rawWinner.toString?.() || String(rawWinner)) : String(rawWinner)) : undefined;

  const stage = raw.stage || 'Official Match';
  const stageLower = stage.toLowerCase();
  const matchNum = raw.matchNumber !== undefined ? Number(raw.matchNumber) : undefined;

  let bracketRound = raw.bracketRound;
  let bracketPosition = raw.bracketPosition;

  if (!bracketRound || bracketRound === 'groups') {
    if (matchNum === 101 || matchNum === 1 || stageLower.includes('quarterfinal 1') || stageLower.includes('quarterfinal 01')) {
      bracketRound = 'quarterfinals';
      bracketPosition = bracketPosition || 1;
    } else if (matchNum === 102 || matchNum === 2 || stageLower.includes('quarterfinal 2') || stageLower.includes('quarterfinal 02')) {
      bracketRound = 'quarterfinals';
      bracketPosition = bracketPosition || 2;
    } else if (matchNum === 103 || matchNum === 3 || stageLower.includes('quarterfinal 3') || stageLower.includes('quarterfinal 03')) {
      bracketRound = 'quarterfinals';
      bracketPosition = bracketPosition || 3;
    } else if (matchNum === 104 || matchNum === 4 || stageLower.includes('quarterfinal 4') || stageLower.includes('quarterfinal 04')) {
      bracketRound = 'quarterfinals';
      bracketPosition = bracketPosition || 4;
    } else if (matchNum === 105 || stageLower.includes('semifinal 1') || stageLower.includes('semifinal 01')) {
      bracketRound = 'semifinals';
      bracketPosition = bracketPosition || 1;
    } else if (matchNum === 106 || stageLower.includes('semifinal 2') || stageLower.includes('semifinal 02')) {
      bracketRound = 'semifinals';
      bracketPosition = bracketPosition || 2;
    } else if (matchNum === 107 || stageLower.includes('grand final') || stageLower.includes('championship final')) {
      bracketRound = 'final';
      bracketPosition = bracketPosition || 1;
    } else if (matchNum === 108 || stageLower.includes('3rd') || stageLower.includes('bronze')) {
      bracketRound = 'third_place';
      bracketPosition = bracketPosition || 1;
    } else if (stageLower.includes('quarterfinal') || stageLower.includes('qf')) {
      bracketRound = 'quarterfinals';
    } else if (stageLower.includes('semifinal') || stageLower.includes('sf')) {
      bracketRound = 'semifinals';
    } else if (stageLower.includes('final')) {
      bracketRound = 'final';
    }
  }

  if (!bracketPosition && matchNum) {
    if (matchNum >= 101 && matchNum <= 104) bracketPosition = matchNum - 100;
    else if (matchNum === 105) bracketPosition = 1;
    else if (matchNum === 106) bracketPosition = 2;
    else if (matchNum === 107 || matchNum === 108) bracketPosition = 1;
  }

  return {
    id,
    matchNumber: matchNum,
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
    stage,
    streamUrl: raw.streamUrl,
    mvp: raw.mvp,
    bracketRound,
    bracketPosition,
    nextMatchId: raw.nextMatchId || (raw.nextMatchNumber ? `m-${raw.nextMatchNumber}` : undefined),
    nextMatchSlot: raw.nextMatchSlot,
    winnerId,
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
      registrationDeadline: '2026-11-12T23:59:59',
      eventStatus: 'REGISTRATIONS OPEN',
      isRegistrationOpen: true,
      announcementText: 'CST LAN CHALLENGE 2026 live at Uva Wellassa University Main Auditorium. Inter-Faculty 5v5 MR12 Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship.',
    };
  }

  const isOpen = typeof raw.registrationOpen === 'boolean'
    ? raw.registrationOpen
    : (raw.eventStatus === 'REGISTRATIONS OPEN');

  const rawDate = raw.tournamentDate || raw.eventDate;
  const tournamentDate = rawDate ? new Date(rawDate).toISOString() : '2026-11-20T09:00:00';
  const rawDeadline = raw.registrationDeadline;
  const registrationDeadline = rawDeadline ? new Date(rawDeadline).toISOString() : '2026-11-12T23:59:59';

  return {
    tournamentDate,
    registrationDeadline,
    eventStatus: raw.eventStatus || 'REGISTRATIONS OPEN',
    isRegistrationOpen: isOpen,
    announcementText: raw.announcementText || 'CST LAN CHALLENGE 2026',
  };
}

