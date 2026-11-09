'use client';

import { Match, Team, PlayoffBracket, CS2Map } from './types';

const PLAYOFF_MAPS: CS2Map[] = ['Mirage', 'Inferno', 'Dust II', 'Ancient', 'Nuke', 'Anubis', 'Vertigo'];


export function generatePlayoffTreeFromTeams(teams?: Team[], manualMatches?: Match[]): Match[] {
  const currentTeams = teams || [];
  // Include all registered squads that are not rejected, prioritizing approved then pending
  const nonRejected = currentTeams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
  const sourceTeams = [...nonRejected].sort((a, b) => {
    const aApp = (a.status || '').toLowerCase() === 'approved' ? 1 : 0;
    const bApp = (b.status || '').toLowerCase() === 'approved' ? 1 : 0;
    if (bApp !== aApp) return bApp - aApp;
    return (b.points || 0) - (a.points || 0);
  });

  // Extract any 1st round / Quarterfinal fixtures manually scheduled by the administrator
  const scheduledTeamIds = new Set<string>();
  const rawManual = (manualMatches || []).filter(
    (m) =>
      m.bracketRound === 'quarterfinals' ||
      (m.stage && /quarterfinal|round 1|first round/i.test(m.stage)) ||
      (!m.bracketRound && !/semifinal|final|bronze|third/i.test(m.stage || ''))
  );

  const manualQF: (Match | undefined)[] = [undefined, undefined, undefined, undefined];
  rawManual.forEach((m) => {
    if (m.bracketPosition && m.bracketPosition >= 1 && m.bracketPosition <= 4 && !manualQF[m.bracketPosition - 1]) {
      manualQF[m.bracketPosition - 1] = m;
    } else if (m.id === 'm-qf-1' && !manualQF[0]) {
      manualQF[0] = m;
    } else if (m.id === 'm-qf-2' && !manualQF[1]) {
      manualQF[1] = m;
    } else if (m.id === 'm-qf-3' && !manualQF[2]) {
      manualQF[2] = m;
    } else if (m.id === 'm-qf-4' && !manualQF[3]) {
      manualQF[3] = m;
    }
  });

  rawManual.forEach((m) => {
    if (!manualQF.includes(m)) {
      const emptyIdx = manualQF.findIndex((x) => x === undefined);
      if (emptyIdx !== -1) manualQF[emptyIdx] = m;
    }
  });

  manualQF.forEach((m) => {
    if (m?.teamAId) scheduledTeamIds.add(m.teamAId);
    if (m?.teamBId) scheduledTeamIds.add(m.teamBId);
  });

  const availableSquads = sourceTeams.filter((t) => !scheduledTeamIds.has(t.id));

  // Symmetrical 8-squad dual-wing bracket seeding:
  // Left Wing (4 teams): QF 1 (Slots 0, 1) & QF 2 (Slots 2, 3)
  // Right Wing (4 teams): QF 3 (Slots 4, 5) & QF 4 (Slots 6, 7)
  const slotSquads: Team[] = Array.from({ length: 8 }, (_, idx) => {
    if (availableSquads[idx]) {
      return availableSquads[idx];
    }
    return DEFAULT_TBD_TEAMS[idx];
  });

  const now = new Date();
  const baseTime = new Date(now.getTime() + 86400000); // Tomorrow
  baseTime.setHours(10, 0, 0, 0);

  const qf1 = manualQF[0];
  const qf2 = manualQF[1];
  const qf3 = manualQF[2];
  const qf4 = manualQF[3];

  const matches: Match[] = [
    // ================= 1. QUARTERFINALS (LAYER 1: 4 MATCHES) =================
    // Left Wing Top: Match 1 (Slots 0 vs 1)
    {
      id: 'm-qf-1',
      matchNumber: 101,
      bracketRound: 'quarterfinals',
      bracketPosition: 1,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamA',
      stage: qf1?.stage || 'Quarterfinal 01 (MR12)',
      teamAId: qf1?.teamAId || slotSquads[0].id,
      teamAName: qf1?.teamAName || slotSquads[0].name,
      teamATag: qf1?.teamATag || slotSquads[0].tag,
      teamALogo: qf1?.teamALogo || slotSquads[0].logo || '/images/team-placeholder.svg',
      teamBId: qf1?.teamBId || slotSquads[1].id,
      teamBName: qf1?.teamBName || slotSquads[1].name,
      teamBTag: qf1?.teamBTag || slotSquads[1].tag,
      teamBLogo: qf1?.teamBLogo || slotSquads[1].logo || '/images/team-placeholder.svg',
      map: qf1?.map || 'Mirage',
      dateTime: qf1?.dateTime || new Date(baseTime.getTime()).toISOString(),
      status: qf1?.status || 'upcoming',
      scoreA: qf1?.scoreA ?? 0,
      scoreB: qf1?.scoreB ?? 0,
      winnerId: qf1?.winnerId,
      currentRound: qf1?.currentRound ?? 0,
      half: qf1?.half || 1,
      roundHistory: qf1?.roundHistory || [],
      teamASide: qf1?.teamASide || 'CT',
      teamBSide: qf1?.teamBSide || 'T',
    },
    // Left Wing Bottom: Match 2 (Slots 2 vs 3)
    {
      id: 'm-qf-2',
      matchNumber: 102,
      bracketRound: 'quarterfinals',
      bracketPosition: 2,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamB',
      stage: qf2?.stage || 'Quarterfinal 02 (MR12)',
      teamAId: qf2?.teamAId || slotSquads[2].id,
      teamAName: qf2?.teamAName || slotSquads[2].name,
      teamATag: qf2?.teamATag || slotSquads[2].tag,
      teamALogo: qf2?.teamALogo || slotSquads[2].logo || '/images/team-placeholder.svg',
      teamBId: qf2?.teamBId || slotSquads[3].id,
      teamBName: qf2?.teamBName || slotSquads[3].name,
      teamBTag: qf2?.teamBTag || slotSquads[3].tag,
      teamBLogo: qf2?.teamBLogo || slotSquads[3].logo || '/images/team-placeholder.svg',
      map: qf2?.map || 'Inferno',
      dateTime: qf2?.dateTime || new Date(baseTime.getTime() + 7200000).toISOString(),
      status: qf2?.status || 'upcoming',
      scoreA: qf2?.scoreA ?? 0,
      scoreB: qf2?.scoreB ?? 0,
      winnerId: qf2?.winnerId,
      currentRound: qf2?.currentRound ?? 0,
      half: qf2?.half || 1,
      roundHistory: qf2?.roundHistory || [],
      teamASide: qf2?.teamASide || 'CT',
      teamBSide: qf2?.teamBSide || 'T',
    },
    // Right Wing Top: Match 3 (Slots 4 vs 5)
    {
      id: 'm-qf-3',
      matchNumber: 103,
      bracketRound: 'quarterfinals',
      bracketPosition: 3,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamA',
      stage: qf3?.stage || 'Quarterfinal 03 (MR12)',
      teamAId: qf3?.teamAId || slotSquads[4].id,
      teamAName: qf3?.teamAName || slotSquads[4].name,
      teamATag: qf3?.teamATag || slotSquads[4].tag,
      teamALogo: qf3?.teamALogo || slotSquads[4].logo || '/images/team-placeholder.svg',
      teamBId: qf3?.teamBId || slotSquads[5].id,
      teamBName: qf3?.teamBName || slotSquads[5].name,
      teamBTag: qf3?.teamBTag || slotSquads[5].tag,
      teamBLogo: qf3?.teamBLogo || slotSquads[5].logo || '/images/team-placeholder.svg',
      map: qf3?.map || 'Dust II',
      dateTime: qf3?.dateTime || new Date(baseTime.getTime() + 14400000).toISOString(),
      status: qf3?.status || 'upcoming',
      scoreA: qf3?.scoreA ?? 0,
      scoreB: qf3?.scoreB ?? 0,
      winnerId: qf3?.winnerId,
      currentRound: qf3?.currentRound ?? 0,
      half: qf3?.half || 1,
      roundHistory: qf3?.roundHistory || [],
      teamASide: qf3?.teamASide || 'CT',
      teamBSide: qf3?.teamBSide || 'T',
    },
    // Right Wing Bottom: Match 4 (Slots 6 vs 7)
    {
      id: 'm-qf-4',
      matchNumber: 104,
      bracketRound: 'quarterfinals',
      bracketPosition: 4,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamB',
      stage: qf4?.stage || 'Quarterfinal 04 (MR12)',
      teamAId: qf4?.teamAId || slotSquads[6].id,
      teamAName: qf4?.teamAName || slotSquads[6].name,
      teamATag: qf4?.teamATag || slotSquads[6].tag,
      teamALogo: qf4?.teamALogo || slotSquads[6].logo || '/images/team-placeholder.svg',
      teamBId: qf4?.teamBId || slotSquads[7].id,
      teamBName: qf4?.teamBName || slotSquads[7].name,
      teamBTag: qf4?.teamBTag || slotSquads[7].tag,
      teamBLogo: qf4?.teamBLogo || slotSquads[7].logo || '/images/team-placeholder.svg',
      map: qf4?.map || 'Ancient',
      dateTime: qf4?.dateTime || new Date(baseTime.getTime() + 21600000).toISOString(),
      status: qf4?.status || 'upcoming',
      scoreA: qf4?.scoreA ?? 0,
      scoreB: qf4?.scoreB ?? 0,
      winnerId: qf4?.winnerId,
      currentRound: qf4?.currentRound ?? 0,
      half: qf4?.half || 1,
      roundHistory: qf4?.roundHistory || [],
      teamASide: qf4?.teamASide || 'CT',
      teamBSide: qf4?.teamBSide || 'T',
    },

    // ================= 2. SEMIFINALS (START COMPLETELY FREE) =================
    // Left Semifinal (Winner QF 01 vs Winner QF 02)
    {
      id: 'm-sf-1',
      matchNumber: 105,
      bracketRound: 'semifinals',
      bracketPosition: 1,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamA',
      stage: 'Semifinal 01 (MR12)',
      teamAId: 'tbd-sf1-a',
      teamAName: 'Winner QF 01',
      teamATag: 'W.QF1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-sf1-b',
      teamBName: 'Winner QF 02',
      teamBTag: 'W.QF2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Nuke',
      dateTime: new Date(baseTime.getTime() + 86400000 + 3600000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      streamUrl: 'https://twitch.tv/cst_lan_challenge',
      currentRound: 0,
      half: 1,
      c4Planted: false,
      roundHistory: [],
      teamASide: 'CT',
      teamBSide: 'T',
    },
    // Right Semifinal (Winner QF 03 vs Winner QF 04)
    {
      id: 'm-sf-2',
      matchNumber: 106,
      bracketRound: 'semifinals',
      bracketPosition: 2,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamB',
      stage: 'Semifinal 02 (MR12)',
      teamAId: 'tbd-sf2-a',
      teamAName: 'Winner QF 03',
      teamATag: 'W.QF3',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-sf2-b',
      teamBName: 'Winner QF 04',
      teamBTag: 'W.QF4',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Anubis',
      dateTime: new Date(baseTime.getTime() + 86400000 + 10800000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      streamUrl: 'https://twitch.tv/cst_lan_challenge',
      currentRound: 0,
      half: 1,
      c4Planted: false,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= 3. GRAND FINAL (STARTS COMPLETELY FREE) =================
    {
      id: 'm-gf',
      matchNumber: 107,
      bracketRound: 'final',
      bracketPosition: 1,
      stage: 'Grand Final (LAN Main Auditorium Stage)',
      teamAId: 'tbd-sf1',
      teamAName: 'Winner Semifinal 01',
      teamATag: 'W.SF1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-sf2',
      teamBName: 'Winner Semifinal 02',
      teamBTag: 'W.SF2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Mirage',
      dateTime: new Date(baseTime.getTime() + 86400000 + 21600000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      streamUrl: 'https://twitch.tv/cst_lan_challenge',
      currentRound: 0,
      half: 1,
      c4Planted: false,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= 4. 3RD PLACE BRONZE DECIDER (FREE) =================
    {
      id: 'm-3rd',
      matchNumber: 108,
      bracketRound: 'third_place',
      bracketPosition: 1,
      stage: '3rd Place Bronze Decider',
      teamAId: 'tbd-lsf1',
      teamAName: 'Runner-up Semifinal 01',
      teamATag: 'RU.SF1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-lsf2',
      teamBName: 'Runner-up Semifinal 02',
      teamBTag: 'RU.SF2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Dust II',
      dateTime: new Date(baseTime.getTime() + 86400000 + 18000000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      streamUrl: 'https://twitch.tv/cst_lan_challenge',
      currentRound: 0,
      half: 1,
      c4Planted: false,
      teamASide: 'CT',
      teamBSide: 'T',
    },
  ];

  return matches;
}

/**
 * Dynamic Bracket Analyzer & Winner Advancement Engine
 * Analyzes match outcomes, determines winners (MR12 target 13 rounds), and pushes winners down the tree.
 * Uses multi-pass cascading loop so downstream matches (QF -> SF -> Grand Final -> Champion)
 * automatically update all the way to the trophy pedestal in a single operation.
 */
export function analyzeAndAdvanceBracketWinners(
  matches: Match[],
  teams: Team[]
): { updatedMatches: Match[]; champion: Team | null; isUpdated: boolean } {
  let isUpdated = false;
  const cloned: Match[] = JSON.parse(JSON.stringify(matches));
  let champion: Team | null = null;

  // Build lookup index
  const matchMap = new Map<string, Match>();
  cloned.forEach((m) => matchMap.set(m.id, m));

  const teamLookup = new Map<string, Team>();
  teams.forEach((t) => teamLookup.set(t.id, t));

  let changedInPass = true;
  let pass = 0;
  const maxPasses = 8; // Deep cascading through R16 -> QF -> SF -> Final -> Champion

  while (changedInPass && pass < maxPasses) {
    changedInPass = false;
    pass++;

    for (const match of cloned) {
      // 1. Determine if match has reached completion via score (CS2 MR12 regulation target 13)
      const hasReachedScoreVictory =
        (match.scoreA >= 13 && match.scoreA - match.scoreB >= 2) ||
        (match.scoreB >= 13 && match.scoreB - match.scoreA >= 2) ||
        (match.scoreA === 13 && match.scoreB <= 11) ||
        (match.scoreB === 13 && match.scoreA <= 11) ||
        (match.status === 'completed' && match.scoreA !== match.scoreB);

      if (hasReachedScoreVictory) {
        const winningTeamId = match.scoreA > match.scoreB ? match.teamAId : match.teamBId;
        if (match.winnerId !== winningTeamId) {
          match.winnerId = winningTeamId;
          match.status = 'completed';
          isUpdated = true;
          changedInPass = true;
        }
      } else if (match.status === 'completed' && match.winnerId) {
        // Already marked completed with valid winnerId
      } else if (match.status !== 'completed' && match.status !== 'upcoming') {
        if (match.scoreA > 0 || match.scoreB > 0) {
          if (match.status !== 'live') {
            match.status = 'live';
            isUpdated = true;
          }
        }
      }

      // 2. Advance winner to the downstream match (QF, SF, or Grand Final)
      let nextId = match.nextMatchId;
      let nextNum = (match as any).nextMatchNumber;
      let nextSlot = match.nextMatchSlot;

      const roundLower = (match.bracketRound || '').toLowerCase();
      const stageLower = (match.stage || '').toLowerCase();
      const mNum = match.matchNumber || (match.bracketPosition ? 100 + match.bracketPosition : 0);

      const isQF1 =
        mNum === 101 ||
        mNum === 1 ||
        (roundLower === 'quarterfinals' && match.bracketPosition === 1) ||
        stageLower.includes('quarterfinal 1') ||
        stageLower.includes('quarterfinal 01');
      const isQF2 =
        mNum === 102 ||
        mNum === 2 ||
        (roundLower === 'quarterfinals' && match.bracketPosition === 2) ||
        stageLower.includes('quarterfinal 2') ||
        stageLower.includes('quarterfinal 02');
      const isQF3 =
        mNum === 103 ||
        mNum === 3 ||
        (roundLower === 'quarterfinals' && match.bracketPosition === 3) ||
        stageLower.includes('quarterfinal 3') ||
        stageLower.includes('quarterfinal 03');
      const isQF4 =
        mNum === 104 ||
        mNum === 4 ||
        (roundLower === 'quarterfinals' && match.bracketPosition === 4) ||
        stageLower.includes('quarterfinal 4') ||
        stageLower.includes('quarterfinal 04');

      const isSF1 =
        mNum === 105 ||
        (roundLower === 'semifinals' && match.bracketPosition === 1) ||
        stageLower.includes('semifinal 1') ||
        stageLower.includes('semifinal 01') ||
        match.id === 'm-sf-1';
      const isSF2 =
        mNum === 106 ||
        (roundLower === 'semifinals' && match.bracketPosition === 2) ||
        stageLower.includes('semifinal 2') ||
        stageLower.includes('semifinal 02') ||
        match.id === 'm-sf-2';

      if (isQF1) {
        nextId = nextId || 'm-sf-1';
        nextNum = nextNum || 105;
        nextSlot = nextSlot || 'teamA';
      } else if (isQF2) {
        nextId = nextId || 'm-sf-1';
        nextNum = nextNum || 105;
        nextSlot = nextSlot || 'teamB';
      } else if (isQF3) {
        nextId = nextId || 'm-sf-2';
        nextNum = nextNum || 106;
        nextSlot = nextSlot || 'teamA';
      } else if (isQF4) {
        nextId = nextId || 'm-sf-2';
        nextNum = nextNum || 106;
        nextSlot = nextSlot || 'teamB';
      } else if (isSF1) {
        nextId = nextId || 'm-gf';
        nextNum = nextNum || 107;
        nextSlot = nextSlot || 'teamA';
      } else if (isSF2) {
        nextId = nextId || 'm-gf';
        nextNum = nextNum || 107;
        nextSlot = nextSlot || 'teamB';
      }

      if (match.winnerId && (nextId || nextNum)) {
        let nextMatch = nextId ? matchMap.get(nextId) : null;
        if (!nextMatch && nextNum) {
          nextMatch = cloned.find((m) => m.matchNumber === nextNum);
        }
        if (!nextMatch && nextId) {
          if (nextId === 'm-105' || nextId === '105') {
            nextMatch = matchMap.get('m-sf-1') || cloned.find((m) => m.matchNumber === 105);
          } else if (nextId === 'm-106' || nextId === '106') {
            nextMatch = matchMap.get('m-sf-2') || cloned.find((m) => m.matchNumber === 106);
          } else if (nextId === 'm-107' || nextId === '107') {
            nextMatch = matchMap.get('m-gf') || cloned.find((m) => m.matchNumber === 107);
          }
        }

        // Dynamically create downstream match (Semifinals / Grand Final) if it does not exist yet!
        if (!nextMatch && (nextId || nextNum)) {
          const defaultTargetId = nextId || (nextNum ? `m-${nextNum}` : `m-auto-${Date.now()}`);
          const defaultStage =
            isSF1 || isSF2
              ? 'Grand Final (LAN Main Auditorium Stage)'
              : nextNum === 106 || isQF3 || isQF4
              ? 'Semifinal 02 (MR12)'
              : 'Semifinal 01 (MR12)';
          const defaultRound = isSF1 || isSF2 ? 'final' : 'semifinals';
          const defaultPos = isQF3 || isQF4 || isSF2 ? 2 : 1;
          const defaultMap = isSF1 || isSF2 ? 'Mirage' : isQF3 || isQF4 ? 'Anubis' : 'Nuke';

          const winningTeam = teamLookup.get(match.winnerId) || {
            id: match.winnerId,
            name: match.winnerId === match.teamAId ? match.teamAName : match.teamBName,
            tag: match.winnerId === match.teamAId ? match.teamATag : match.teamBTag,
            logo: match.winnerId === match.teamAId ? match.teamALogo : match.teamBLogo,
          };

          nextMatch = {
            id: defaultTargetId,
            matchNumber: nextNum,
            bracketRound: defaultRound,
            bracketPosition: defaultPos,
            nextMatchId: defaultRound === 'semifinals' ? 'm-gf' : undefined,
            nextMatchSlot: defaultRound === 'semifinals' ? (defaultPos === 1 ? 'teamA' : 'teamB') : undefined,
            stage: defaultStage,
            teamAId: nextSlot === 'teamA' ? winningTeam.id : 'tbd-a',
            teamAName: nextSlot === 'teamA' ? winningTeam.name : 'TBD',
            teamATag: nextSlot === 'teamA' ? winningTeam.tag : 'TBD',
            teamALogo: nextSlot === 'teamA' ? (winningTeam.logo || '/images/team-placeholder.svg') : '/images/team-placeholder.svg',
            teamBId: nextSlot === 'teamB' ? winningTeam.id : 'tbd-b',
            teamBName: nextSlot === 'teamB' ? winningTeam.name : 'TBD',
            teamBTag: nextSlot === 'teamB' ? winningTeam.tag : 'TBD',
            teamBLogo: nextSlot === 'teamB' ? (winningTeam.logo || '/images/team-placeholder.svg') : '/images/team-placeholder.svg',
            map: defaultMap as any,
            dateTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'upcoming',
            scoreA: 0,
            scoreB: 0,
            streamUrl: 'https://twitch.tv/cst_lan_challenge',
            currentRound: 0,
            half: 1,
            c4Planted: false,
            roundHistory: [],
            teamASide: 'CT',
            teamBSide: 'T',
          };
          cloned.push(nextMatch);
          matchMap.set(nextMatch.id, nextMatch);
          isUpdated = true;
          changedInPass = true;
        }

        if (nextMatch) {
          const winningTeam = teamLookup.get(match.winnerId) || {
            id: match.winnerId,
            name: match.winnerId === match.teamAId ? match.teamAName : match.teamBName,
            tag: match.winnerId === match.teamAId ? match.teamATag : match.teamBTag,
            logo: match.winnerId === match.teamAId ? match.teamALogo : match.teamBLogo,
          };

          if (nextSlot === 'teamA') {
            if (
              nextMatch.teamAId !== winningTeam.id ||
              nextMatch.teamAName !== winningTeam.name ||
              nextMatch.teamATag !== winningTeam.tag
            ) {
              nextMatch.teamAId = winningTeam.id;
              nextMatch.teamAName = winningTeam.name;
              nextMatch.teamATag = winningTeam.tag;
              nextMatch.teamALogo = winningTeam.logo || nextMatch.teamALogo;
              isUpdated = true;
              changedInPass = true;
            }
          } else if (nextSlot === 'teamB') {
            if (
              nextMatch.teamBId !== winningTeam.id ||
              nextMatch.teamBName !== winningTeam.name ||
              nextMatch.teamBTag !== winningTeam.tag
            ) {
              nextMatch.teamBId = winningTeam.id;
              nextMatch.teamBName = winningTeam.name;
              nextMatch.teamBTag = winningTeam.tag;
              nextMatch.teamBLogo = winningTeam.logo || nextMatch.teamBLogo;
              isUpdated = true;
              changedInPass = true;
            }
          }

          // If next match's winner was pointing to a team no longer participating, invalidate and re-evaluate
          if (
            nextMatch.winnerId &&
            nextMatch.winnerId !== nextMatch.teamAId &&
            nextMatch.winnerId !== nextMatch.teamBId
          ) {
            nextMatch.winnerId = undefined;
            if (nextMatch.status === 'completed') {
              nextMatch.status = 'upcoming';
            }
            isUpdated = true;
            changedInPass = true;
          }
        }
      } else if (!match.winnerId && (nextId || match.nextMatchId)) {
        // If match winner is cleared or not yet determined, revert downstream slot to clean placeholder
        const nextMatch = matchMap.get(nextId || match.nextMatchId!);
        if (nextMatch) {
          const slotToRevert = nextSlot || match.nextMatchSlot || 'teamA';
          const placeholder = getDefaultSlotPlaceholder(nextMatch.id, slotToRevert);
          if (slotToRevert === 'teamA') {
            if (
              nextMatch.teamAId !== placeholder.id &&
              (nextMatch.teamAId === match.teamAId || nextMatch.teamAId === match.teamBId)
            ) {
              nextMatch.teamAId = placeholder.id;
              nextMatch.teamAName = placeholder.name;
              nextMatch.teamATag = placeholder.tag;
              nextMatch.teamALogo = placeholder.logo;
              isUpdated = true;
              changedInPass = true;
            }
          } else if (match.nextMatchSlot === 'teamB') {
            if (
              nextMatch.teamBId !== placeholder.id &&
              (nextMatch.teamBId === match.teamAId || nextMatch.teamBId === match.teamBId)
            ) {
              nextMatch.teamBId = placeholder.id;
              nextMatch.teamBName = placeholder.name;
              nextMatch.teamBTag = placeholder.tag;
              nextMatch.teamBLogo = placeholder.logo;
              isUpdated = true;
              changedInPass = true;
            }
          }
        }
      }

      // 3. Grand Championship Final detection
      if (match.bracketRound === 'final' && match.status === 'completed' && match.winnerId) {
        champion =
          teamLookup.get(match.winnerId) ||
          ({
            id: match.winnerId,
            name: match.winnerId === match.teamAId ? match.teamAName : match.teamBName,
            tag: match.winnerId === match.teamAId ? match.teamATag : match.teamBTag,
            logo: match.winnerId === match.teamAId ? match.teamALogo : match.teamBLogo,
          } as Team);
      }
    }
  }

  return { updatedMatches: cloned, champion, isUpdated };
}

/**
 * Helper to get clean placeholder for downstream bracket slots (QF, SF, Grand Final)
 */
export function getDefaultSlotPlaceholder(
  matchId: string,
  slot: 'teamA' | 'teamB'
): { id: string; name: string; tag: string; logo: string } {
  const map: Record<string, { teamA: { name: string; tag: string }; teamB: { name: string; tag: string } }> = {
    'm-qf-1': { teamA: { name: 'Winner R16.1', tag: 'W.R16.1' }, teamB: { name: 'Winner R16.2', tag: 'W.R16.2' } },
    'm-qf-2': { teamA: { name: 'Winner R16.3', tag: 'W.R16.3' }, teamB: { name: 'Winner R16.4', tag: 'W.R16.4' } },
    'm-qf-3': { teamA: { name: 'Winner R16.5', tag: 'W.R16.5' }, teamB: { name: 'Winner R16.6', tag: 'W.R16.6' } },
    'm-qf-4': { teamA: { name: 'Winner R16.7', tag: 'W.R16.7' }, teamB: { name: 'Winner R16.8', tag: 'W.R16.8' } },
    'm-sf-1': { teamA: { name: 'Winner QF 1', tag: 'W.QF1' }, teamB: { name: 'Winner QF 2', tag: 'W.QF2' } },
    'm-sf-2': { teamA: { name: 'Winner QF 3', tag: 'W.QF3' }, teamB: { name: 'Winner QF 4', tag: 'W.QF4' } },
    'm-gf':   { teamA: { name: 'Winner Semifinal 1', tag: 'W.SF1' }, teamB: { name: 'Winner Semifinal 2', tag: 'W.SF2' } },
  };

  const entry = map[matchId]?.[slot] || {
    name: slot === 'teamA' ? 'Winner Match A' : 'Winner Match B',
    tag: 'TBD',
  };

  return {
    id: `tbd-${matchId}-${slot}`,
    name: entry.name,
    tag: entry.tag,
    logo: '/images/team-placeholder.svg',
  };
}

/**
 * 16 Clean Default TBD Slots for Dual-Wing Tournament Bracket
 * Seeded dynamically with real approved registered teams.
 */
export const DEFAULT_TBD_TEAMS: Team[] = Array.from({ length: 16 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    id: `tbd-slot-${i + 1}`,
    name: `TBD (Slot ${num})`,
    tag: `SLOT${num}`,
    university: 'Awaiting Seeding',
    logo: '/images/team-placeholder.svg',
    status: 'approved' as const,
    createdAt: new Date().toISOString(),
    captain: { name: 'TBD', whatsappNumber: '' },
    players: [],
  };
});

// Alias for backwards compatibility
export const SIXTEEN_BRACKET_TEAMS: Team[] = DEFAULT_TBD_TEAMS;

/**
 * Generate a complete 16-squad single-elimination Playoff Tree
 * matching the exact structure from the reference tournament bracket
 */
export function generate16TeamPlayoffTree(customTeams?: Team[]): Match[] {
  // Include all registered squads that are not rejected, prioritizing approved then pending
  const nonRejected = customTeams ? customTeams.filter((t) => (t.status || '').toLowerCase() !== 'rejected') : [];
  const sourceTeams = [...nonRejected].sort((a, b) => {
    const aApp = (a.status || '').toLowerCase() === 'approved' ? 1 : 0;
    const bApp = (b.status || '').toLowerCase() === 'approved' ? 1 : 0;
    if (bApp !== aApp) return bApp - aApp;
    return (b.points || 0) - (a.points || 0);
  });

  const t = Array.from({ length: 16 }, (_, idx) => {
    if (sourceTeams[idx]) {
      return sourceTeams[idx];
    }
    return DEFAULT_TBD_TEAMS[idx];
  });
  const now = new Date();

  return [
    // ================= ROUND OF 16 (8 MATCHES) =================
    // Quadrant 1: Top-Left (Purple)
    {
      id: 'm-r16-1',
      matchNumber: 201,
      bracketRound: 'round_of_16',
      bracketPosition: 1,
      nextMatchId: 'm-qf-1',
      nextMatchSlot: 'teamA',
      stage: 'R16 • Match 01',
      teamAId: t[0].id,
      teamAName: t[0].name,
      teamATag: t[0].tag,
      teamALogo: t[0].logo,
      teamBId: t[1].id,
      teamBName: t[1].name,
      teamBTag: t[1].tag,
      teamBLogo: t[1].logo,
      map: 'Mirage',
      dateTime: new Date(now.getTime() + 86400000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-r16-2',
      matchNumber: 202,
      bracketRound: 'round_of_16',
      bracketPosition: 2,
      nextMatchId: 'm-qf-1',
      nextMatchSlot: 'teamB',
      stage: 'R16 • Match 02',
      teamAId: t[2].id,
      teamAName: t[2].name,
      teamATag: t[2].tag,
      teamALogo: t[2].logo,
      teamBId: t[3].id,
      teamBName: t[3].name,
      teamBTag: t[3].tag,
      teamBLogo: t[3].logo,
      map: 'Inferno',
      dateTime: new Date(now.getTime() + 90000000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // Quadrant 2: Bottom-Left (Orange)
    {
      id: 'm-r16-3',
      matchNumber: 203,
      bracketRound: 'round_of_16',
      bracketPosition: 3,
      nextMatchId: 'm-qf-2',
      nextMatchSlot: 'teamA',
      stage: 'R16 • Match 03',
      teamAId: t[4].id,
      teamAName: t[4].name,
      teamATag: t[4].tag,
      teamALogo: t[4].logo,
      teamBId: t[5].id,
      teamBName: t[5].name,
      teamBTag: t[5].tag,
      teamBLogo: t[5].logo,
      map: 'Dust II',
      dateTime: new Date(now.getTime() + 93600000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-r16-4',
      matchNumber: 204,
      bracketRound: 'round_of_16',
      bracketPosition: 4,
      nextMatchId: 'm-qf-2',
      nextMatchSlot: 'teamB',
      stage: 'R16 • Match 04',
      teamAId: t[6].id,
      teamAName: t[6].name,
      teamATag: t[6].tag,
      teamALogo: t[6].logo,
      teamBId: t[7].id,
      teamBName: t[7].name,
      teamBTag: t[7].tag,
      teamBLogo: t[7].logo,
      map: 'Ancient',
      dateTime: new Date(now.getTime() + 97200000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // Quadrant 3: Top-Right (Cyan)
    {
      id: 'm-r16-5',
      matchNumber: 205,
      bracketRound: 'round_of_16',
      bracketPosition: 5,
      nextMatchId: 'm-qf-3',
      nextMatchSlot: 'teamA',
      stage: 'R16 • Match 05',
      teamAId: t[8].id,
      teamAName: t[8].name,
      teamATag: t[8].tag,
      teamALogo: t[8].logo,
      teamBId: t[9].id,
      teamBName: t[9].name,
      teamBTag: t[9].tag,
      teamBLogo: t[9].logo,
      map: 'Nuke',
      dateTime: new Date(now.getTime() + 100800000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-r16-6',
      matchNumber: 206,
      bracketRound: 'round_of_16',
      bracketPosition: 6,
      nextMatchId: 'm-qf-3',
      nextMatchSlot: 'teamB',
      stage: 'R16 • Match 06',
      teamAId: t[10].id,
      teamAName: t[10].name,
      teamATag: t[10].tag,
      teamALogo: t[10].logo,
      teamBId: t[11].id,
      teamBName: t[11].name,
      teamBTag: t[11].tag,
      teamBLogo: t[11].logo,
      map: 'Anubis',
      dateTime: new Date(now.getTime() + 104400000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // Quadrant 4: Bottom-Right (Red)
    {
      id: 'm-r16-7',
      matchNumber: 207,
      bracketRound: 'round_of_16',
      bracketPosition: 7,
      nextMatchId: 'm-qf-4',
      nextMatchSlot: 'teamA',
      stage: 'R16 • Match 07',
      teamAId: t[12].id,
      teamAName: t[12].name,
      teamATag: t[12].tag,
      teamALogo: t[12].logo,
      teamBId: t[13].id,
      teamBName: t[13].name,
      teamBTag: t[13].tag,
      teamBLogo: t[13].logo,
      map: 'Vertigo',
      dateTime: new Date(now.getTime() + 108000000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-r16-8',
      matchNumber: 208,
      bracketRound: 'round_of_16',
      bracketPosition: 8,
      nextMatchId: 'm-qf-4',
      nextMatchSlot: 'teamB',
      stage: 'R16 • Match 08',
      teamAId: t[14].id,
      teamAName: t[14].name,
      teamATag: t[14].tag,
      teamALogo: t[14].logo,
      teamBId: t[15].id,
      teamBName: t[15].name,
      teamBTag: t[15].tag,
      teamBLogo: t[15].logo,
      map: 'Inferno',
      dateTime: new Date(now.getTime() + 111600000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= QUARTERFINALS (4 MATCHES) =================
    // QF 1: Top-Left (Purple)
    {
      id: 'm-qf-1',
      matchNumber: 101,
      bracketRound: 'quarterfinals',
      bracketPosition: 1,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamA',
      stage: 'Quarterfinal 01 (Purple)',
      teamAId: 'tbd-qf1-a',
      teamAName: 'Winner R16.1',
      teamATag: 'W.R16.1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-qf1-b',
      teamBName: 'Winner R16.2',
      teamBTag: 'W.R16.2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Mirage',
      dateTime: new Date(now.getTime() + 172800000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // QF 2: Bottom-Left (Orange)
    {
      id: 'm-qf-2',
      matchNumber: 102,
      bracketRound: 'quarterfinals',
      bracketPosition: 2,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamB',
      stage: 'Quarterfinal 02 (Orange)',
      teamAId: 'tbd-qf2-a',
      teamAName: 'Winner R16.3',
      teamATag: 'W.R16.3',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-qf2-b',
      teamBName: 'Winner R16.4',
      teamBTag: 'W.R16.4',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Inferno',
      dateTime: new Date(now.getTime() + 180000000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // QF 3: Top-Right (Cyan)
    {
      id: 'm-qf-3',
      matchNumber: 103,
      bracketRound: 'quarterfinals',
      bracketPosition: 3,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamA',
      stage: 'Quarterfinal 03 (Cyan)',
      teamAId: 'tbd-qf3-a',
      teamAName: 'Winner R16.5',
      teamATag: 'W.R16.5',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-qf3-b',
      teamBName: 'Winner R16.6',
      teamBTag: 'W.R16.6',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Dust II',
      dateTime: new Date(now.getTime() + 187200000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // QF 4: Bottom-Right (Red)
    {
      id: 'm-qf-4',
      matchNumber: 104,
      bracketRound: 'quarterfinals',
      bracketPosition: 4,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamB',
      stage: 'Quarterfinal 04 (Red)',
      teamAId: 'tbd-qf4-a',
      teamAName: 'Winner R16.7',
      teamATag: 'W.R16.7',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-qf4-b',
      teamBName: 'Winner R16.8',
      teamBTag: 'W.R16.8',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Ancient',
      dateTime: new Date(now.getTime() + 194400000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= SEMIFINALS (2 MATCHES) =================
    // Semifinal 1: Left Wing Clash
    {
      id: 'm-sf-1',
      matchNumber: 105,
      bracketRound: 'semifinals',
      bracketPosition: 1,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamA',
      stage: 'Left Wing Semifinal',
      teamAId: 'tbd-sf1-a',
      teamAName: 'Winner QF 1',
      teamATag: 'W.QF1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-sf1-b',
      teamBName: 'Winner QF 2',
      teamBTag: 'W.QF2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Nuke',
      dateTime: new Date(now.getTime() + 259200000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // Semifinal 2: Right Wing Clash
    {
      id: 'm-sf-2',
      matchNumber: 106,
      bracketRound: 'semifinals',
      bracketPosition: 2,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamB',
      stage: 'Right Wing Semifinal',
      teamAId: 'tbd-sf2-a',
      teamAName: 'Winner QF 3',
      teamATag: 'W.QF3',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-sf2-b',
      teamBName: 'Winner QF 4',
      teamBTag: 'W.QF4',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Anubis',
      dateTime: new Date(now.getTime() + 266400000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= GRAND CHAMPIONSHIP FINAL =================
    {
      id: 'm-gf',
      matchNumber: 107,
      bracketRound: 'final',
      bracketPosition: 1,
      stage: 'Grand Championship Final',
      teamAId: 'tbd-gf-a',
      teamAName: 'Winner Semifinal 1',
      teamATag: 'W.SF1',
      teamALogo: '/images/team-placeholder.svg',
      teamBId: 'tbd-gf-b',
      teamBName: 'Winner Semifinal 2',
      teamBTag: 'W.SF2',
      teamBLogo: '/images/team-placeholder.svg',
      map: 'Mirage',
      dateTime: new Date(now.getTime() + 345600000).toISOString(),
      status: 'upcoming',
      scoreA: 0,
      scoreB: 0,
      teamASide: 'CT',
      teamBSide: 'T',
      currentRound: 0,
      half: 1,
    },
  ];
}

/**
 * Group matches into structured PlayoffBracket model
 */
export function getPlayoffBracket(matches: Match[] = [], teams: Team[] = []): PlayoffBracket {
  const safeMatches = Array.isArray(matches) ? matches : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  const playoffList = safeMatches.filter((m) =>
    ['round_of_16', 'quarterfinals', 'semifinals', 'final', 'third_place'].includes(m.bracketRound || '')
  );

  const roundOf16 = playoffList
    .filter((m) => m.bracketRound === 'round_of_16')
    .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0));

  const quarterfinals = playoffList
    .filter((m) => m.bracketRound === 'quarterfinals')
    .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0));

  const semifinals = playoffList
    .filter((m) => m.bracketRound === 'semifinals')
    .sort((a, b) => (a.bracketPosition || 0) - (b.bracketPosition || 0));

  const final = playoffList.find((m) => m.bracketRound === 'final') || null;
  const thirdPlace = playoffList.find((m) => m.bracketRound === 'third_place') || null;

  let champion: Team | null = null;
  if (final && final.status === 'completed' && final.winnerId) {
    champion =
      safeTeams.find((t) => t.id === final.winnerId) ||
      ({
        id: final.winnerId,
        name: final.winnerId === final.teamAId ? final.teamAName : final.teamBName,
        tag: final.winnerId === final.teamAId ? final.teamATag : final.teamBTag,
        logo: final.winnerId === final.teamAId ? final.teamALogo : final.teamBLogo,
      } as Team);
  }

  return {
    roundOf16,
    quarterfinals,
    semifinals,
    final,
    thirdPlace,
    champion,
  };
}

