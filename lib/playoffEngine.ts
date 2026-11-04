'use client';

import { Match, Team, PlayoffBracket, CS2Map } from './types';

// Map rotation for playoff stages
const PLAYOFF_MAPS: CS2Map[] = ['Mirage', 'Inferno', 'Dust II', 'Ancient', 'Nuke', 'Anubis', 'Vertigo'];

/**
 * Generate a complete 8-squad single-elimination Playoff Tree (Quarterfinals -> Semifinals -> Grand Final + 3rd Place)
 */
export function generatePlayoffTreeFromTeams(teams: Team[]): Match[] {
  const approved = teams.filter((t) => t.status === 'approved');
  // Seed teams by points, then round difference, then wins
  const sorted = [...approved].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    if ((b.roundDiff || 0) !== (a.roundDiff || 0)) return (b.roundDiff || 0) - (a.roundDiff || 0);
    return (b.wins || 0) - (a.wins || 0);
  });

  // Ensure 8 team slots (using available squads or fallback placeholder UWU squads)
  const slotSquads: (Team | null)[] = [
    sorted[0] || null, // Seed 1
    sorted[7] || sorted[1] || null, // Seed 8
    sorted[3] || null, // Seed 4
    sorted[4] || null, // Seed 5
    sorted[1] || null, // Seed 2
    sorted[6] || null, // Seed 7
    sorted[2] || null, // Seed 3
    sorted[5] || null, // Seed 6
  ];

  const now = new Date();
  const baseTime = new Date(now.getTime() + 86400000); // Tomorrow
  baseTime.setHours(10, 0, 0, 0);

  const matches: Match[] = [
    // 1. Quarterfinals
    {
      id: 'm-qf-1',
      matchNumber: 101,
      bracketRound: 'quarterfinals',
      bracketPosition: 1,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamA',
      stage: 'Quarterfinal 01 (MR12)',
      teamAId: slotSquads[0]?.id || 't-qf1-a',
      teamAName: slotSquads[0]?.name || 'UWU Tactical Vanguard',
      teamATag: slotSquads[0]?.tag || 'UWU.V',
      teamALogo: slotSquads[0]?.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[1]?.id || 't-qf1-b',
      teamBName: slotSquads[1]?.name || 'UWU Cyber Titans',
      teamBTag: slotSquads[1]?.tag || 'UWU.CT',
      teamBLogo: slotSquads[1]?.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
      map: 'Mirage',
      dateTime: new Date(baseTime.getTime()).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 10,
      winnerId: slotSquads[0]?.id || 't-qf1-a',
      mvp: 'Kasun Bandara (1.42 Rating)',
      currentRound: 23,
      half: 2,
      roundHistory: ['teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamA', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA'],
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-qf-2',
      matchNumber: 102,
      bracketRound: 'quarterfinals',
      bracketPosition: 2,
      nextMatchId: 'm-sf-1',
      nextMatchSlot: 'teamB',
      stage: 'Quarterfinal 02 (MR12)',
      teamAId: slotSquads[2]?.id || 't-qf2-a',
      teamAName: slotSquads[2]?.name || 'UWU Management Titans',
      teamATag: slotSquads[2]?.tag || 'UWU.MGT',
      teamALogo: slotSquads[2]?.logo || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[3]?.id || 't-qf2-b',
      teamBName: slotSquads[3]?.name || 'UWU Iron Vipers',
      teamBTag: slotSquads[3]?.tag || 'UWU.VIP',
      teamBLogo: slotSquads[3]?.logo || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
      map: 'Inferno',
      dateTime: new Date(baseTime.getTime() + 7200000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 7,
      winnerId: slotSquads[2]?.id || 't-qf2-a',
      mvp: 'Kavishka Ranasinghe (1.55 Rating)',
      currentRound: 20,
      half: 2,
      roundHistory: ['teamA', 'teamA', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamB', 'teamA', 'teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA'],
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-qf-3',
      matchNumber: 103,
      bracketRound: 'quarterfinals',
      bracketPosition: 3,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamA',
      stage: 'Quarterfinal 03 (MR12)',
      teamAId: slotSquads[4]?.id || 't-qf3-a',
      teamAName: slotSquads[4]?.name || 'UWU Medic Strikers',
      teamATag: slotSquads[4]?.tag || 'UWU.MED',
      teamALogo: slotSquads[4]?.logo || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[5]?.id || 't-qf3-b',
      teamBName: slotSquads[5]?.name || 'UWU Tech Overlords',
      teamBTag: slotSquads[5]?.tag || 'UWU.TECH',
      teamBLogo: slotSquads[5]?.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      map: 'Dust II',
      dateTime: new Date(baseTime.getTime() + 14400000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 11,
      winnerId: slotSquads[4]?.id || 't-qf3-a',
      mvp: 'Ashen Samarajeewa (1.38 Rating)',
      currentRound: 24,
      half: 2,
      roundHistory: ['teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA'],
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-qf-4',
      matchNumber: 104,
      bracketRound: 'quarterfinals',
      bracketPosition: 4,
      nextMatchId: 'm-sf-2',
      nextMatchSlot: 'teamB',
      stage: 'Quarterfinal 04 (MR12)',
      teamAId: slotSquads[6]?.id || 't-qf4-a',
      teamAName: slotSquads[6]?.name || 'UWU Agro Wolves',
      teamATag: slotSquads[6]?.tag || 'UWU.AGR',
      teamALogo: slotSquads[6]?.logo || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[7]?.id || 't-qf4-b',
      teamBName: slotSquads[7]?.name || 'UWU Bio Phantoms',
      teamBTag: slotSquads[7]?.tag || 'UWU.BIO',
      teamBLogo: slotSquads[7]?.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
      map: 'Ancient',
      dateTime: new Date(baseTime.getTime() + 21600000).toISOString(),
      status: 'completed',
      scoreA: 8,
      scoreB: 13,
      winnerId: slotSquads[7]?.id || 't-qf4-b',
      mvp: 'Sandun Jayakody (1.46 Rating)',
      currentRound: 21,
      half: 2,
      roundHistory: ['teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB'],
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // 2. Semifinals
    {
      id: 'm-sf-1',
      matchNumber: 105,
      bracketRound: 'semifinals',
      bracketPosition: 1,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamA',
      stage: 'Semifinal 01 (MR12 Live)',
      teamAId: slotSquads[0]?.id || 't-qf1-a',
      teamAName: slotSquads[0]?.name || 'UWU Tactical Vanguard',
      teamATag: slotSquads[0]?.tag || 'UWU.V',
      teamALogo: slotSquads[0]?.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[2]?.id || 't-qf2-a',
      teamBName: slotSquads[2]?.name || 'UWU Management Titans',
      teamBTag: slotSquads[2]?.tag || 'UWU.MGT',
      teamBLogo: slotSquads[2]?.logo || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
      map: 'Nuke',
      dateTime: new Date(baseTime.getTime() + 86400000 + 3600000).toISOString(),
      status: 'live',
      scoreA: 11,
      scoreB: 9,
      streamUrl: 'https://twitch.tv/cst_lan_challenge',
      currentRound: 20,
      half: 2,
      c4Planted: false,
      roundHistory: ['teamA', 'teamA', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamB', 'teamA', 'teamB', 'teamA', 'teamA'],
      teamASide: 'CT',
      teamBSide: 'T',
    },
    {
      id: 'm-sf-2',
      matchNumber: 106,
      bracketRound: 'semifinals',
      bracketPosition: 2,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamB',
      stage: 'Semifinal 02 (MR12 Upcoming)',
      teamAId: slotSquads[4]?.id || 't-qf3-a',
      teamAName: slotSquads[4]?.name || 'UWU Medic Strikers',
      teamATag: slotSquads[4]?.tag || 'UWU.MED',
      teamALogo: slotSquads[4]?.logo || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
      teamBId: slotSquads[7]?.id || 't-qf4-b',
      teamBName: slotSquads[7]?.name || 'UWU Bio Phantoms',
      teamBTag: slotSquads[7]?.tag || 'UWU.BIO',
      teamBLogo: slotSquads[7]?.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
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

    // 3. Grand Championship Final
    {
      id: 'm-gf',
      matchNumber: 107,
      bracketRound: 'final',
      bracketPosition: 1,
      stage: 'Grand Final (LAN Main Auditorium Stage)',
      teamAId: 'tbd-sf1',
      teamAName: 'Winner Semifinal 01',
      teamATag: 'W.SF1',
      teamALogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      teamBId: 'tbd-sf2',
      teamBName: 'Winner Semifinal 02',
      teamBTag: 'W.SF2',
      teamBLogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
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

    // 4. 3rd Place Bronze Decider
    {
      id: 'm-3rd',
      matchNumber: 108,
      bracketRound: 'third_place',
      bracketPosition: 1,
      stage: '3rd Place Bronze Decider',
      teamAId: 'tbd-lsf1',
      teamAName: 'Runner-up Semifinal 01',
      teamATag: 'RU.SF1',
      teamALogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      teamBId: 'tbd-lsf2',
      teamBName: 'Runner-up Semifinal 02',
      teamBTag: 'RU.SF2',
      teamBLogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
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
      if (match.winnerId && match.nextMatchId) {
        const nextMatch = matchMap.get(match.nextMatchId);
        if (nextMatch) {
          const winningTeam = teamLookup.get(match.winnerId) || {
            id: match.winnerId,
            name: match.winnerId === match.teamAId ? match.teamAName : match.teamBName,
            tag: match.winnerId === match.teamAId ? match.teamATag : match.teamBTag,
            logo: match.winnerId === match.teamAId ? match.teamALogo : match.teamBLogo,
          };

          if (match.nextMatchSlot === 'teamA') {
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
          } else if (match.nextMatchSlot === 'teamB') {
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
 * 16 Squads for the Dual-Wing Tournament Bracket
 */
export const SIXTEEN_BRACKET_TEAMS: Team[] = [
  // Top-Left (Neon Purple)
  { id: 't-gr', name: 'Ghost Reapers', tag: 'GHOST', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Kasun Bandara', whatsappNumber: '0771112233' }, players: [] },
  { id: 't-sv', name: 'Shadow Vipers', tag: 'VIPER', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Janith D.', whatsappNumber: '0771112234' }, players: [] },
  { id: 't-ns', name: 'Night Spectres', tag: 'SPECTRE', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Nuwan J.', whatsappNumber: '0771112235' }, players: [] },
  { id: 't-vk', name: 'Valkyrie 5', tag: 'VALK', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Malinda E.', whatsappNumber: '0771112236' }, players: [] },

  // Bottom-Left (Neon Orange)
  { id: 't-ah', name: 'Apex Hunters', tag: 'HUNTER', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Supun M.', whatsappNumber: '0771112237' }, players: [] },
  { id: 't-df', name: 'Desert Foxes', tag: 'FOX', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Sahan F.', whatsappNumber: '0771112238' }, players: [] },
  { id: 't-ts', name: 'Titan Squad', tag: 'TITAN', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Ashen S.', whatsappNumber: '0771112239' }, players: [] },
  { id: 't-cf', name: 'Cyber Force', tag: 'CYBER', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Chamod K.', whatsappNumber: '0771112240' }, players: [] },

  // Top-Right (Neon Cyan)
  { id: 't-ap', name: 'Alpha Protocol', tag: 'ALPHA', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Isuru W.', whatsappNumber: '0771112241' }, players: [] },
  { id: 't-vc', name: 'Vortex Crew', tag: 'VORTEX', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Kavindu R.', whatsappNumber: '0771112242' }, players: [] },
  { id: 't-dlt', name: 'Delta Forces', tag: 'DELTA', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Sachith D.', whatsappNumber: '0771112243' }, players: [] },
  { id: 't-ic', name: 'Iron Clad 5', tag: 'IRON', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Akila S.', whatsappNumber: '0771112244' }, players: [] },

  // Bottom-Right (Neon Red)
  { id: 't-bs', name: 'Bravo Spectres', tag: 'BRAVO', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Kavishka R.', whatsappNumber: '0771112245' }, players: [] },
  { id: 't-pu', name: 'Phantom Unit', tag: 'PHANTOM', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Oshan L.', whatsappNumber: '0771112246' }, players: [] },
  { id: 't-om', name: 'Omega Protocol', tag: 'OMEGA', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Harsha M.', whatsappNumber: '0771112247' }, players: [] },
  { id: 't-rc', name: 'Raven Clan', tag: 'RAVEN', university: 'Uva Wellassa University', logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80', status: 'approved', createdAt: new Date().toISOString(), captain: { name: 'Roshan D.', whatsappNumber: '0771112248' }, players: [] },
];

/**
 * Generate a complete 16-squad single-elimination Playoff Tree
 * matching the exact structure from the reference tournament bracket
 */
export function generate16TeamPlayoffTree(): Match[] {
  const t = SIXTEEN_BRACKET_TEAMS;
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
      dateTime: new Date(now.getTime() - 86400000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 7,
      winnerId: t[0].id,
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
      dateTime: new Date(now.getTime() - 82800000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 9,
      winnerId: t[2].id,
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
      dateTime: new Date(now.getTime() - 79200000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 10,
      winnerId: t[4].id,
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
      dateTime: new Date(now.getTime() - 75600000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 8,
      winnerId: t[6].id,
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
      dateTime: new Date(now.getTime() - 72000000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 6,
      winnerId: t[8].id,
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
      dateTime: new Date(now.getTime() - 68400000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 11,
      winnerId: t[10].id,
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
      dateTime: new Date(now.getTime() - 64800000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 5,
      winnerId: t[12].id,
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
      dateTime: new Date(now.getTime() - 61200000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 9,
      winnerId: t[14].id,
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
      teamAId: t[0].id,
      teamAName: t[0].name,
      teamATag: t[0].tag,
      teamALogo: t[0].logo,
      teamBId: t[2].id,
      teamBName: t[2].name,
      teamBTag: t[2].tag,
      teamBLogo: t[2].logo,
      map: 'Mirage',
      dateTime: new Date(now.getTime() - 43200000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 8,
      winnerId: t[0].id,
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
      teamAId: t[4].id,
      teamAName: t[4].name,
      teamATag: t[4].tag,
      teamALogo: t[4].logo,
      teamBId: t[6].id,
      teamBName: t[6].name,
      teamBTag: t[6].tag,
      teamBLogo: t[6].logo,
      map: 'Inferno',
      dateTime: new Date(now.getTime() - 36000000).toISOString(),
      status: 'completed',
      scoreA: 9,
      scoreB: 13,
      winnerId: t[6].id,
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
      teamAId: t[8].id,
      teamAName: t[8].name,
      teamATag: t[8].tag,
      teamALogo: t[8].logo,
      teamBId: t[10].id,
      teamBName: t[10].name,
      teamBTag: t[10].tag,
      teamBLogo: t[10].logo,
      map: 'Dust II',
      dateTime: new Date(now.getTime() - 28800000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 10,
      winnerId: t[8].id,
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
      teamAId: t[12].id,
      teamAName: t[12].name,
      teamATag: t[12].tag,
      teamALogo: t[12].logo,
      teamBId: t[14].id,
      teamBName: t[14].name,
      teamBTag: t[14].tag,
      teamBLogo: t[14].logo,
      map: 'Ancient',
      dateTime: new Date(now.getTime() - 21600000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 11,
      winnerId: t[12].id,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // ================= SEMIFINALS (2 MATCHES) =================
    // Semifinal 1: Left Wing Clash (Ghost Reapers vs Titan Squad)
    {
      id: 'm-sf-1',
      matchNumber: 105,
      bracketRound: 'semifinals',
      bracketPosition: 1,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamA',
      stage: 'Left Wing Semifinal',
      teamAId: t[0].id,
      teamAName: t[0].name,
      teamATag: t[0].tag,
      teamALogo: t[0].logo,
      teamBId: t[6].id,
      teamBName: t[6].name,
      teamBTag: t[6].tag,
      teamBLogo: t[6].logo,
      map: 'Nuke',
      dateTime: new Date(now.getTime() - 10800000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 9,
      winnerId: t[0].id,
      teamASide: 'CT',
      teamBSide: 'T',
    },

    // Semifinal 2: Right Wing Clash (Alpha Protocol vs Bravo Spectres)
    {
      id: 'm-sf-2',
      matchNumber: 106,
      bracketRound: 'semifinals',
      bracketPosition: 2,
      nextMatchId: 'm-gf',
      nextMatchSlot: 'teamB',
      stage: 'Right Wing Semifinal',
      teamAId: t[8].id,
      teamAName: t[8].name,
      teamATag: t[8].tag,
      teamALogo: t[8].logo,
      teamBId: t[12].id,
      teamBName: t[12].name,
      teamBTag: t[12].tag,
      teamBLogo: t[12].logo,
      map: 'Anubis',
      dateTime: new Date(now.getTime() - 3600000).toISOString(),
      status: 'completed',
      scoreA: 13,
      scoreB: 8,
      winnerId: t[8].id,
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
      teamAId: t[0].id,
      teamAName: t[0].name,
      teamATag: t[0].tag,
      teamALogo: t[0].logo,
      teamBId: t[8].id,
      teamBName: t[8].name,
      teamBTag: t[8].tag,
      teamBLogo: t[8].logo,
      map: 'Mirage',
      dateTime: new Date(now.getTime()).toISOString(),
      status: 'live',
      scoreA: 11,
      scoreB: 9,
      teamASide: 'CT',
      teamBSide: 'T',
      currentRound: 20,
      half: 2,
    },
  ];
}

/**
 * Group matches into structured PlayoffBracket model
 */
export function getPlayoffBracket(matches: Match[], teams: Team[]): PlayoffBracket {
  const playoffList = matches.filter((m) =>
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
      teams.find((t) => t.id === final.winnerId) ||
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

