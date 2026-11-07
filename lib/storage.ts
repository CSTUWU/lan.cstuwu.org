'use client';

import { Team, Match, CountdownSettings, ApprovalStatus } from './types';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_COUNTDOWN } from './mockData';
import {
  generatePlayoffTreeFromTeams,
  analyzeAndAdvanceBracketWinners,
  generate16TeamPlayoffTree,
  SIXTEEN_BRACKET_TEAMS,
  getDefaultSlotPlaceholder,
} from './playoffEngine';

const TEAMS_KEY = 'cst_lan_teams_2026';
const MATCHES_KEY = 'cst_lan_matches_2026';
const MATCHES_16_KEY = 'cst_lan_matches_16_2026';
const COUNTDOWN_KEY = 'cst_lan_countdown_2026';
const AUTH_KEY = 'cst_lan_admin_auth';
const LIVE_CHANNEL_NAME = 'cst_cs2_live_channel';
const ACTIVE_BRACKET_MODE_KEY = 'cst_lan_active_bracket_mode';

export type ActiveBracketMode = '8-squad' | '16-squad';

export const getActiveBracketMode = (): ActiveBracketMode => {
  if (typeof window === 'undefined') return '8-squad';
  try {
    const stored = localStorage.getItem(ACTIVE_BRACKET_MODE_KEY);
    if (stored === '8-squad' || stored === '16-squad') return stored;
    // Auto-detect based on registered teams count
    const rawTeams = localStorage.getItem(TEAMS_KEY);
    const teams: Team[] = rawTeams ? JSON.parse(rawTeams) : [];
    const approved = teams.filter((t) => (t.status || '').toLowerCase() === 'approved');
    const sourceTeams = approved.length > 0 ? approved : teams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    const mode: ActiveBracketMode = sourceTeams.length > 8 ? '16-squad' : '8-squad';
    localStorage.setItem(ACTIVE_BRACKET_MODE_KEY, mode);
    return mode;
  } catch {
    return '8-squad';
  }
};

export const setActiveBracketMode = (mode: ActiveBracketMode) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_BRACKET_MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent('cst_bracket_mode_changed', { detail: { mode } }));
    const channel = getLiveBroadcastChannel();
    channel?.postMessage({
      type: 'CST_BRACKET_MODE_CHANGED',
      mode,
      timestamp: Date.now(),
    });
  } catch (e) {
    console.warn('Failed setting active bracket mode', e);
  }
};

// Cross-tab broadcast channel for instant (<10ms) stage projector synchronization
let liveBroadcastChannel: BroadcastChannel | null = null;
export const getLiveBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    if (!liveBroadcastChannel) {
      liveBroadcastChannel = new BroadcastChannel(LIVE_CHANNEL_NAME);
    }
    return liveBroadcastChannel;
  }
  return null;
};

const notifyMatchesUpdated = (matches: Match[], updatedMatchId?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    window.dispatchEvent(new CustomEvent('cst_matches_updated', { detail: { matches, updatedMatchId } }));
    
    // Broadcast to other windows/tabs (e.g. stage projector)
    try {
      const channel = getLiveBroadcastChannel();
      channel?.postMessage({
        type: 'CST_LIVE_MATCH_UPDATE',
        updatedMatchId,
        matches,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }
};

export const notify16MatchesUpdated = (matches: Match[], updatedMatchId?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MATCHES_16_KEY, JSON.stringify(matches));
    window.dispatchEvent(new CustomEvent('cst_16_matches_updated', { detail: { matches, updatedMatchId } }));

    try {
      const channel = getLiveBroadcastChannel();
      channel?.postMessage({
        type: 'CST_16_MATCHES_UPDATE',
        updatedMatchId,
        matches,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  }
};

export const getStored16Matches = (): Match[] => {
  if (typeof window === 'undefined') return generate16TeamPlayoffTree();
  try {
    const raw = localStorage.getItem(MATCHES_16_KEY);
    let list: Match[] = [];
    if (!raw) {
      list = generate16TeamPlayoffTree(getStoredTeams());
      localStorage.setItem(MATCHES_16_KEY, JSON.stringify(list));
    } else {
      list = JSON.parse(raw);
      // Clean legacy completed mock state or legacy mock squads if present from previous sessions
      const hasLegacyMockTeams =
        Array.isArray(list) &&
        list.some(
          (m) =>
            m.teamAId === 't-gr' ||
            m.teamBId === 't-sv' ||
            m.teamAName === 'Ghost Reapers' ||
            m.teamBName === 'Shadow Vipers' ||
            m.teamAName === 'Apex Hunters' ||
            m.teamAName === 'Alpha Protocol' ||
            (m.id === 'm-r16-1' && m.status === 'completed' && m.scoreA === 13)
        );
      if (hasLegacyMockTeams) {
        list = generate16TeamPlayoffTree(getStoredTeams());
        localStorage.setItem(MATCHES_16_KEY, JSON.stringify(list));
      }
    }

    // Auto-advance winners in 16-squad playoff bracket tree
    const { updatedMatches, isUpdated } = analyzeAndAdvanceBracketWinners(list, getStoredTeams());
    if (isUpdated) {
      localStorage.setItem(MATCHES_16_KEY, JSON.stringify(updatedMatches));
      return updatedMatches;
    }
    return list;
  } catch (e) {
    console.error('Failed reading 16-squad matches from localStorage', e);
    return generate16TeamPlayoffTree(getStoredTeams());
  }
};

export const update16MatchScore = (
  matchId: string,
  scoreA: number,
  scoreB: number,
  status: Match['status'] = 'completed',
  mvp?: string
): boolean => {
  const matches = getStored16Matches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return false;

  const currentRound = scoreA + scoreB;
  const half: Match['half'] = currentRound <= 12 ? 1 : currentRound <= 24 ? 2 : 'OT';

  matches[index] = {
    ...matches[index],
    scoreA,
    scoreB,
    status,
    currentRound,
    half,
    ...(mvp !== undefined ? { mvp } : {}),
  };

  const { updatedMatches } = analyzeAndAdvanceBracketWinners(matches, getStoredTeams());
  notify16MatchesUpdated(updatedMatches, matchId);
  return true;
};

export const increment16MatchScore = (
  matchId: string,
  winningTeam: 'teamA' | 'teamB',
  delta: number = 1
): Match | null => {
  const matches = getStored16Matches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return null;

  const match = { ...matches[index] };
  if (delta > 0) {
    if (winningTeam === 'teamA') match.scoreA = Math.max(0, match.scoreA + 1);
    else match.scoreB = Math.max(0, match.scoreB + 1);
  } else if (delta < 0) {
    if (winningTeam === 'teamA') match.scoreA = Math.max(0, match.scoreA - 1);
    else match.scoreB = Math.max(0, match.scoreB - 1);
  }

  const currentRound = match.scoreA + match.scoreB;
  match.currentRound = currentRound;
  match.half = currentRound <= 12 ? 1 : currentRound <= 24 ? 2 : 'OT';

  // CS2 MR12 victory condition
  if (
    (match.scoreA >= 13 && match.scoreA - match.scoreB >= 2) ||
    (match.scoreB >= 13 && match.scoreB - match.scoreA >= 2)
  ) {
    match.status = 'completed';
  } else {
    match.status = 'live';
  }

  matches[index] = match;
  const { updatedMatches } = analyzeAndAdvanceBracketWinners(matches, getStoredTeams());
  notify16MatchesUpdated(updatedMatches, matchId);
  return updatedMatches[index] || match;
};

export const set16MatchWinner = (
  matchId: string,
  winningTeam: 'teamA' | 'teamB'
): Match | null => {
  const matches = getStored16Matches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return null;

  const match = { ...matches[index] };
  if (winningTeam === 'teamA') {
    match.scoreA = 13;
    match.scoreB = Math.min(match.scoreB, 11);
    match.winnerId = match.teamAId;
  } else {
    match.scoreB = 13;
    match.scoreA = Math.min(match.scoreA, 11);
    match.winnerId = match.teamBId;
  }
  match.status = 'completed';
  matches[index] = match;

  const { updatedMatches } = analyzeAndAdvanceBracketWinners(matches, getStoredTeams());
  notify16MatchesUpdated(updatedMatches, matchId);
  return updatedMatches[index] || match;
};

export const reset16Matches = (): Match[] => {
  const fresh = generate16TeamPlayoffTree(getStoredTeams());
  notify16MatchesUpdated(fresh);
  return fresh;
};

/**
 * Regenerate / synchronize the 1st layer of the 16-Squad Playoff Tree
 * from registered and approved teams. Unfilled slots display clean TBD (Slot XX).
 * Subsequent layers (Quarterfinals, Semifinals, Grand Final, Trophy)
 * derive strictly from winning details.
 */
export const refresh16PlayoffTreeFromApprovedTeams = (providedTeams?: Team[]): Match[] => {
  const currentTeams = providedTeams || getStoredTeams();
  const approvedTeams = currentTeams.filter((t) => t.status === 'approved');
  let currentMatches = getStored16Matches();

  if (!Array.isArray(currentMatches) || currentMatches.length === 0) {
    const fresh = generate16TeamPlayoffTree(approvedTeams);
    notify16MatchesUpdated(fresh);
    return fresh;
  }

  // Update Round of 16 (1st Layer: 8 matches, 16 slots)
  for (let matchIdx = 0; matchIdx < 8; matchIdx++) {
    const matchId = `m-r16-${matchIdx + 1}`;
    const m = currentMatches.find((x) => x.id === matchId);
    if (!m) continue;

    const teamASlotIdx = matchIdx * 2;
    const teamBSlotIdx = matchIdx * 2 + 1;

    const slotANum = String(teamASlotIdx + 1).padStart(2, '0');
    const slotBNum = String(teamBSlotIdx + 1).padStart(2, '0');

    const teamA = approvedTeams[teamASlotIdx] || {
      id: `tbd-slot-${teamASlotIdx + 1}`,
      name: `TBD (Slot ${slotANum})`,
      tag: `SLOT${slotANum}`,
      logo: '/images/team-placeholder.svg',
    };

    const teamB = approvedTeams[teamBSlotIdx] || {
      id: `tbd-slot-${teamBSlotIdx + 1}`,
      name: `TBD (Slot ${slotBNum})`,
      tag: `SLOT${slotBNum}`,
      logo: '/images/team-placeholder.svg',
    };

    // If match hasn't finished, update with real approved squad
    if (m.status !== 'completed') {
      m.teamAId = teamA.id;
      m.teamAName = teamA.name;
      m.teamATag = teamA.tag;
      m.teamALogo = teamA.logo || '/images/team-placeholder.svg';

      m.teamBId = teamB.id;
      m.teamBName = teamB.name;
      m.teamBTag = teamB.tag;
      m.teamBLogo = teamB.logo || '/images/team-placeholder.svg';
    }
  }

  // Auto-advance winners through outer layers (Quarterfinals -> Semifinals -> Grand Final -> Champion)
  const { updatedMatches } = analyzeAndAdvanceBracketWinners(currentMatches, currentTeams);
  notify16MatchesUpdated(updatedMatches);
  return updatedMatches;
};

/**
 * Core Administrator Action: CREATE / SEED PLAYOFF TREE
 * Automatically adapts based on registered team count:
 * - If <= 8 teams: generates 8-team dual-wing tree (4 teams Left, 4 teams Right, Semifinals & Finals free).
 * - If > 8 teams: generates 16-team dual-wing tree (8 teams Left, 8 teams Right, QF, SF & Finals free).
 * - Downstream rounds start completely free (0-0, upcoming).
 * - Match wins cascade automatically down the tree to crown the Champion!
 */
export const createAndSeedPlayoffTree = (teams?: Team[]): Match[] => {
  const currentTeams = teams && teams.length > 0 ? teams : getStoredTeams();
  // Prefer approved teams; if none explicitly approved, use all registered non-rejected teams
  const approved = currentTeams.filter((t) => (t.status || '').toLowerCase() === 'approved');
  const sourceTeams = approved.length > 0 ? approved : currentTeams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');

  const count = sourceTeams.length;
  const isEightSquad = count <= 8;

  if (isEightSquad) {
    // Generate clean 8-squad dual-wing playoff tree:
    // Left Wing (4 teams): QF 1 & QF 2 -> Semifinal 1
    // Right Wing (4 teams): QF 3 & QF 4 -> Semifinal 2
    // Grand Final: Left Semifinal Winner vs Right Semifinal Winner
    const fresh8Tree = generatePlayoffTreeFromTeams(sourceTeams);
    const clean8Tree = fresh8Tree.map((m) => {
      if (m.bracketRound === 'semifinals' || m.bracketRound === 'final' || m.bracketRound === 'third_place') {
        return {
          ...m,
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming' as const,
          winnerId: undefined,
          currentRound: 0,
        };
      }
      return {
        ...m,
        scoreA: 0,
        scoreB: 0,
        status: 'upcoming' as const,
        winnerId: undefined,
        currentRound: 0,
      };
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(clean8Tree));
      notifyMatchesUpdated(clean8Tree);
      setActiveBracketMode('8-squad');
      recalculateStandings(clean8Tree);
    }

    return clean8Tree;
  } else {
    // Generate clean 16-squad playoff tree from source teams
    const freshTree = generate16TeamPlayoffTree(sourceTeams);

    // Guarantee that 2nd Round (Quarterfinals), Semifinals, and Final are completely free / reset
    const cleanTree = freshTree.map((m) => {
      if (m.bracketRound === 'quarterfinals') {
        const pA = getDefaultSlotPlaceholder(m.id, 'teamA');
        const pB = getDefaultSlotPlaceholder(m.id, 'teamB');
        return {
          ...m,
          teamAId: pA.id,
          teamAName: pA.name,
          teamATag: pA.tag,
          teamALogo: pA.logo,
          teamBId: pB.id,
          teamBName: pB.name,
          teamBTag: pB.tag,
          teamBLogo: pB.logo,
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming' as const,
          winnerId: undefined,
          currentRound: 0,
        };
      }
      if (m.bracketRound === 'semifinals') {
        const pA = getDefaultSlotPlaceholder(m.id, 'teamA');
        const pB = getDefaultSlotPlaceholder(m.id, 'teamB');
        return {
          ...m,
          teamAId: pA.id,
          teamAName: pA.name,
          teamATag: pA.tag,
          teamALogo: pA.logo,
          teamBId: pB.id,
          teamBName: pB.name,
          teamBTag: pB.tag,
          teamBLogo: pB.logo,
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming' as const,
          winnerId: undefined,
          currentRound: 0,
        };
      }
      if (m.bracketRound === 'final') {
        const pA = getDefaultSlotPlaceholder(m.id, 'teamA');
        const pB = getDefaultSlotPlaceholder(m.id, 'teamB');
        return {
          ...m,
          teamAId: pA.id,
          teamAName: pA.name,
          teamATag: pA.tag,
          teamALogo: pA.logo,
          teamBId: pB.id,
          teamBName: pB.name,
          teamBTag: pB.tag,
          teamBLogo: pB.logo,
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming' as const,
          winnerId: undefined,
          currentRound: 0,
        };
      }
      return {
        ...m,
        scoreA: 0,
        scoreB: 0,
        status: 'upcoming' as const,
        winnerId: undefined,
        currentRound: 0,
      };
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(MATCHES_16_KEY, JSON.stringify(cleanTree));
      notify16MatchesUpdated(cleanTree);
      setActiveBracketMode('16-squad');
    }

    // Also seed 8-squad UWU bracket
    generateAndStorePlayoffBracket(sourceTeams);

    return cleanTree;
  }
};

export const getStoredTeams = (): Team[] => {
  if (typeof window === 'undefined') return INITIAL_TEAMS;
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (!raw) {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(INITIAL_TEAMS));
      return INITIAL_TEAMS;
    }
    const parsed: Team[] = JSON.parse(raw);
    // Purge legacy mock data if detected
    if (Array.isArray(parsed) && parsed.some((t) => t.id === 'team-1' && t.name === 'UWU Tactical Vanguard')) {
      localStorage.setItem(TEAMS_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Failed reading teams from localStorage', e);
    return INITIAL_TEAMS;
  }
};

export const saveTeam = (newTeam: Omit<Team, 'id' | 'createdAt' | 'status'>): Team => {
  const teams = getStoredTeams();
  const created: Team = {
    ...newTeam,
    id: `team-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    roundsWon: 0,
    roundsLost: 0,
    roundDiff: 0,
    winRate: 0,
    form: [],
    points: 0,
  };
  const updated = [created, ...teams];
  if (typeof window !== 'undefined') {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('cst_teams_updated'));
    try {
      const channel = getLiveBroadcastChannel();
      channel?.postMessage({
        type: 'CST_TEAMS_UPDATE',
        teams: updated,
        timestamp: Date.now(),
      });
    } catch (e) {}
  }
  return created;
};

export const updateTeam = (teamId: string, partial: Partial<Team>): boolean => {
  const teams = getStoredTeams();
  const index = teams.findIndex((t) => t.id === teamId);
  if (index === -1) return false;
  teams[index] = { ...teams[index], ...partial };
  if (typeof window !== 'undefined') {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    window.dispatchEvent(new Event('cst_teams_updated'));
    try {
      const channel = getLiveBroadcastChannel();
      channel?.postMessage({
        type: 'CST_TEAMS_UPDATE',
        teams,
        timestamp: Date.now(),
      });
    } catch (e) {}
  }
  return true;
};

export const updateTeamStatus = (teamId: string, status: ApprovalStatus): boolean => {
  const success = updateTeam(teamId, { status });
  if (success) {
    refresh16PlayoffTreeFromApprovedTeams();
  }
  return success;
};

export const getStoredMatches = (): Match[] => {
  if (typeof window === 'undefined') return INITIAL_MATCHES;
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    let list: Match[] = [];
    if (!raw) {
      list = INITIAL_MATCHES;
      localStorage.setItem(MATCHES_KEY, JSON.stringify(INITIAL_MATCHES));
    } else {
      list = JSON.parse(raw);
      // Purge legacy mock matches if detected
      if (Array.isArray(list) && list.some((m) => (m.id === 'm-qf-1' && m.mvp?.includes('Kasun')) || m.id === 'match-1')) {
        list = [];
        localStorage.setItem(MATCHES_KEY, JSON.stringify([]));
      }
    }

    // Auto-advance winners in playoff bracket tree
    const { updatedMatches, isUpdated } = analyzeAndAdvanceBracketWinners(list, getStoredTeams());
    if (isUpdated) {
      localStorage.setItem(MATCHES_KEY, JSON.stringify(updatedMatches));
      return updatedMatches;
    }
    return list;
  } catch (e) {
    console.error('Failed reading matches from localStorage', e);
    return INITIAL_MATCHES;
  }
};

export const generateAndStorePlayoffBracket = (teams?: Team[]): Match[] => {
  const currentTeams = teams || getStoredTeams();
  const playoffMatches = generatePlayoffTreeFromTeams(currentTeams);
  if (typeof window !== 'undefined') {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(playoffMatches));
    notifyMatchesUpdated(playoffMatches);
    recalculateStandings(playoffMatches);
  }
  return playoffMatches;
};

export const getMatchById = (matchId: string): Match | undefined => {
  const matches = getStoredMatches();
  const found = matches.find((m) => m.id === matchId);
  if (found) return found;
  return getStored16Matches().find((m) => m.id === matchId);
};

export const getActiveLiveMatch = (): Match | undefined => {
  const matches = getStoredMatches();
  return matches.find((m) => m.status === 'live') || getStored16Matches().find((m) => m.status === 'live') || matches[0];
};

export const createMatch = (matchData: Omit<Match, 'id'>): Match => {
  const matches = getStoredMatches();
  const newMatch: Match = {
    ...matchData,
    id: `match-${Date.now()}`,
    currentRound: matchData.currentRound ?? 0,
    half: matchData.half ?? 1,
    c4Planted: matchData.c4Planted ?? false,
    roundHistory: matchData.roundHistory ?? [],
    teamASide: matchData.teamASide ?? 'CT',
    teamBSide: matchData.teamBSide ?? 'T',
  };
  const updated = [newMatch, ...matches];
  notifyMatchesUpdated(updated, newMatch.id);
  return newMatch;
};

export const updateMatchScore = (
  matchId: string,
  scoreA: number,
  scoreB: number,
  status: Match['status'],
  mvp?: string
): boolean => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) {
    // Check if match belongs to 16-team tournament tree
    const match16 = getStored16Matches().find((m) => m.id === matchId);
    if (match16) {
      return update16MatchScore(matchId, scoreA, scoreB, status, mvp);
    }
    return false;
  }

  const currentRound = scoreA + scoreB;
  let half: Match['half'] = currentRound <= 12 ? 1 : currentRound <= 24 ? 2 : 'OT';

  matches[index] = {
    ...matches[index],
    scoreA,
    scoreB,
    status,
    currentRound,
    half,
    ...(mvp !== undefined ? { mvp } : {}),
  };

  const { updatedMatches } = analyzeAndAdvanceBracketWinners(matches, getStoredTeams());
  notifyMatchesUpdated(updatedMatches, matchId);

  // Recalculate standings when match is updated or completed
  recalculateStandings(updatedMatches);
  return true;
};

// Quick referee round increment for live projector
export const incrementMatchScore = (
  matchId: string,
  winningTeam: 'teamA' | 'teamB',
  delta: number = 1
): Match | null => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) {
    // Check if match belongs to 16-team tournament tree
    const match16 = getStored16Matches().find((m) => m.id === matchId);
    if (match16) {
      return increment16MatchScore(matchId, winningTeam, delta);
    }
    return null;
  }

  const match = { ...matches[index] };
  const history = [...(match.roundHistory || [])];

  if (delta > 0) {
    if (winningTeam === 'teamA') {
      match.scoreA = Math.max(0, match.scoreA + 1);
      history.push('teamA');
    } else {
      match.scoreB = Math.max(0, match.scoreB + 1);
      history.push('teamB');
    }
  } else if (delta < 0) {
    if (winningTeam === 'teamA') {
      match.scoreA = Math.max(0, match.scoreA - 1);
    } else {
      match.scoreB = Math.max(0, match.scoreB - 1);
    }
    history.pop();
  }

  match.roundHistory = history;
  const currentRound = match.scoreA + match.scoreB;
  match.currentRound = currentRound;

  // Determine CS2 MR12 half
  if (currentRound <= 12) {
    match.half = 1;
  } else if (currentRound <= 24) {
    match.half = 2;
  } else {
    match.half = 'OT';
  }

  // Clear C4 on round conclusion
  match.c4Planted = false;

  // Check victory condition: MR12 regulation target is 13
  if ((match.scoreA >= 13 && match.scoreA - match.scoreB >= 2) || (match.scoreB >= 13 && match.scoreB - match.scoreA >= 2)) {
    match.status = 'completed';
  } else {
    match.status = 'live';
  }

  matches[index] = match;
  const { updatedMatches } = analyzeAndAdvanceBracketWinners(matches, getStoredTeams());
  notifyMatchesUpdated(updatedMatches, matchId);
  recalculateStandings(updatedMatches);
  return updatedMatches[index] || match;
};

// Halftime Side Switch (CT <-> T)
export const switchMatchSides = (matchId: string): Match | null => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return null;

  const match = { ...matches[index] };
  const currentASide = match.teamASide || 'CT';
  match.teamASide = currentASide === 'CT' ? 'T' : 'CT';
  match.teamBSide = match.teamASide === 'CT' ? 'T' : 'CT';

  matches[index] = match;
  notifyMatchesUpdated(matches, matchId);
  return match;
};

// C4 Planted Emergency Strobe Alert
export const toggleMatchC4 = (matchId: string): boolean => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return false;

  const newState = !matches[index].c4Planted;
  matches[index].c4Planted = newState;

  notifyMatchesUpdated(matches, matchId);
  return newState;
};

// Set Active Match Live Status
export const setMatchLiveStatus = (matchId: string, status: Match['status']): Match | null => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return null;

  matches[index].status = status;
  notifyMatchesUpdated(matches, matchId);
  recalculateStandings(matches);
  return matches[index];
};

// Update arbitrary match properties
export const updateLiveMatch = (matchId: string, updates: Partial<Match>): Match | null => {
  const matches = getStoredMatches();
  const index = matches.findIndex((m) => m.id === matchId);
  if (index === -1) return null;

  matches[index] = { ...matches[index], ...updates };
  notifyMatchesUpdated(matches, matchId);
  if (updates.status === 'completed' || updates.scoreA !== undefined || updates.scoreB !== undefined) {
    recalculateStandings(matches);
  }
  return matches[index];
};

export const recalculateStandings = (matches: Match[]) => {
  const teams = getStoredTeams();
  const teamStats: Record<
    string,
    {
      played: number;
      wins: number;
      losses: number;
      roundsWon: number;
      roundsLost: number;
      form: ('W' | 'L')[];
      points: number;
    }
  > = {};

  teams.forEach((t) => {
    teamStats[t.id] = {
      played: 0,
      wins: 0,
      losses: 0,
      roundsWon: 0,
      roundsLost: 0,
      form: [],
      points: 0,
    };
  });

  // Calculate from completed matches
  matches.forEach((m) => {
    if (m.status === 'completed') {
      if (!teamStats[m.teamAId]) {
        teamStats[m.teamAId] = { played: 0, wins: 0, losses: 0, roundsWon: 0, roundsLost: 0, form: [], points: 0 };
      }
      if (!teamStats[m.teamBId]) {
        teamStats[m.teamBId] = { played: 0, wins: 0, losses: 0, roundsWon: 0, roundsLost: 0, form: [], points: 0 };
      }

      teamStats[m.teamAId].played += 1;
      teamStats[m.teamBId].played += 1;

      teamStats[m.teamAId].roundsWon += m.scoreA;
      teamStats[m.teamAId].roundsLost += m.scoreB;

      teamStats[m.teamBId].roundsWon += m.scoreB;
      teamStats[m.teamBId].roundsLost += m.scoreA;

      if (m.scoreA > m.scoreB) {
        teamStats[m.teamAId].wins += 1;
        teamStats[m.teamAId].points += 3;
        teamStats[m.teamAId].form.push('W');

        teamStats[m.teamBId].losses += 1;
        teamStats[m.teamBId].form.push('L');
      } else if (m.scoreB > m.scoreA) {
        teamStats[m.teamBId].wins += 1;
        teamStats[m.teamBId].points += 3;
        teamStats[m.teamBId].form.push('W');

        teamStats[m.teamAId].losses += 1;
        teamStats[m.teamAId].form.push('L');
      }
    }
  });

  const updatedTeams = teams.map((t) => {
    const stats = teamStats[t.id];
    if (!stats) return t;

    const roundDiff = stats.roundsWon - stats.roundsLost;
    const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
    const form = stats.form.slice(-5); // last 5 results

    return {
      ...t,
      matchesPlayed: stats.played,
      wins: stats.wins,
      losses: stats.losses,
      roundsWon: stats.roundsWon,
      roundsLost: stats.roundsLost,
      roundDiff,
      winRate,
      form,
      points: stats.points,
    };
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(updatedTeams));
    window.dispatchEvent(new Event('cst_teams_updated'));
  }
};

export const getStoredCountdown = (): CountdownSettings => {
  if (typeof window === 'undefined') return INITIAL_COUNTDOWN;
  try {
    const raw = localStorage.getItem(COUNTDOWN_KEY);
    if (!raw) {
      localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(INITIAL_COUNTDOWN));
      return INITIAL_COUNTDOWN;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COUNTDOWN;
  }
};

export const saveCountdown = (settings: CountdownSettings) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('cst_countdown_updated'));
    window.dispatchEvent(new CustomEvent('cst_registration_status_changed', { detail: { settings } }));
    
    // If registration is closed, lock in real approved teams to the 1st layer of playoff tree
    if (!settings.isRegistrationOpen) {
      refresh16PlayoffTreeFromApprovedTeams();
    }
  }
};

export const isRegistrationOpen = (): boolean => {
  const settings = getStoredCountdown();
  if (typeof settings.isRegistrationOpen === 'boolean') {
    return settings.isRegistrationOpen;
  }
  return settings.eventStatus === 'REGISTRATIONS OPEN';
};

export const setRegistrationOpen = (isOpen: boolean): CountdownSettings => {
  const current = getStoredCountdown();
  const updated: CountdownSettings = {
    ...current,
    isRegistrationOpen: isOpen,
    eventStatus: isOpen ? 'REGISTRATIONS OPEN' : (current.eventStatus === 'REGISTRATIONS OPEN' ? 'CHECK-IN PHASE' : current.eventStatus),
  };
  saveCountdown(updated);

  // Automatically refresh and lock 1st layer of playoff tree
  refresh16PlayoffTreeFromApprovedTeams();

  try {
    const channel = getLiveBroadcastChannel();
    channel?.postMessage({
      type: 'CST_REGISTRATION_STATUS_UPDATE',
      isOpen,
      settings: updated,
      timestamp: Date.now(),
    });
  } catch (e) {
    // Channel not supported
  }

  return updated;
};

export const checkAdminAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const inLocalStorage = localStorage.getItem(AUTH_KEY) === 'authenticated';
    const inCookie = document.cookie.includes('cst_lan_admin_auth=authenticated');
    return inLocalStorage || inCookie;
  } catch (e) {
    return false;
  }
};

export const setAdminAuth = (auth: boolean) => {
  if (typeof window !== 'undefined') {
    try {
      if (auth) {
        localStorage.setItem(AUTH_KEY, 'authenticated');
        document.cookie = 'cst_lan_admin_auth=authenticated; path=/; max-age=86400';
      } else {
        localStorage.removeItem(AUTH_KEY);
        document.cookie = 'cst_lan_admin_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      window.dispatchEvent(new Event('cst_admin_auth_changed'));
    } catch (e) {
      console.error('Error saving admin auth', e);
    }
  }
};

export const resetAllData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(MATCHES_KEY, JSON.stringify(INITIAL_MATCHES));
    const fresh16 = generate16TeamPlayoffTree([]);
    localStorage.setItem(MATCHES_16_KEY, JSON.stringify(fresh16));
    localStorage.setItem(COUNTDOWN_KEY, JSON.stringify(INITIAL_COUNTDOWN));
    window.dispatchEvent(new Event('cst_teams_updated'));
    window.dispatchEvent(new Event('cst_matches_updated'));
    window.dispatchEvent(new Event('cst_16_matches_updated'));
    window.dispatchEvent(new Event('cst_countdown_updated'));
  }
};
