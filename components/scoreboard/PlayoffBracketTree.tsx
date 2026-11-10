'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy,
  Swords,
  Crown,
  Radio,
  Flame,
  Bomb,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Crosshair,
  MapPin,
  Eye,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Match, Team, PlayoffBracket, CS2Map } from '@/lib/types';
import { getMapImage } from '@/lib/mockData';
import {
  getPlayoffBracket,
  analyzeAndAdvanceBracketWinners,
  generatePlayoffTreeFromTeams,
  generate16TeamPlayoffTree,
  DEFAULT_TBD_TEAMS,
  SIXTEEN_BRACKET_TEAMS,
} from '@/lib/playoffEngine';
import {
  incrementMatchScore,
  updateMatchScore,
  generateAndStorePlayoffBracket,
  getStored16Matches,
  update16MatchScore,
  increment16MatchScore,
  set16MatchWinner,
  reset16Matches,
  getLiveBroadcastChannel,
  refresh16PlayoffTreeFromApprovedTeams,
  createAndSeedPlayoffTree,
  getActiveBracketMode,
  setActiveBracketMode,
  isPlayoffTreePublished,
  setPlayoffTreePublished,
  checkAdminAuth,
} from '@/lib/storage';

interface PlayoffBracketTreeProps {
  matches: Match[];
  teams: Team[];
  onRefresh?: () => void;
  defaultMode?: '16-squad' | '8-squad' | 'linear';
  showAdminControls?: boolean;
}

type BracketLayoutMode = '16-squad' | '8-squad' | 'linear';

const QUADRANT_THEMES = {
  purple: {
    name: 'SECTOR ALPHA [OLIVE]',
    accent: '#59634A',
    border: 'border-olive/60',
    borderActive: 'border-olive-light',
    bg: 'bg-darkGreen/40',
    bgBadge: 'bg-olive/20',
    text: 'text-sand',
    glow: 'rgba(89, 99, 74, 0.45)',
    shadow: 'shadow-[0_2px_14px_rgba(24,30,24,0.6)]',
    cardGlow: 'hover:border-olive-light hover:shadow-[0_2px_18px_rgba(89,99,74,0.4)]',
    gradient: 'from-darkGreen/80 via-card/90 to-military-black',
    wireStroke: '#59634A',
    wireGlow: 'rgba(89, 99, 74, 0.7)',
  },
  orange: {
    name: 'SECTOR BRAVO [GUNMETAL]',
    accent: '#8C876B',
    border: 'border-gunmetal',
    borderActive: 'border-khaki',
    bg: 'bg-surface/80',
    bgBadge: 'bg-gunmetal/30',
    text: 'text-khaki',
    glow: 'rgba(140, 135, 107, 0.35)',
    shadow: 'shadow-[0_2px_14px_rgba(20,25,20,0.6)]',
    cardGlow: 'hover:border-khaki hover:shadow-[0_2px_18px_rgba(140,135,107,0.35)]',
    gradient: 'from-gunmetal/60 via-card/90 to-military-black',
    wireStroke: '#8C876B',
    wireGlow: 'rgba(140, 135, 107, 0.6)',
  },
  cyan: {
    name: 'SECTOR CHARLIE [SAND]',
    accent: '#C2B28A',
    border: 'border-sand/50',
    borderActive: 'border-sand',
    bg: 'bg-darkGreen/30',
    bgBadge: 'bg-sand/15',
    text: 'text-sand',
    glow: 'rgba(194, 178, 138, 0.4)',
    shadow: 'shadow-[0_2px_14px_rgba(194,178,138,0.2)]',
    cardGlow: 'hover:border-sand hover:shadow-[0_2px_18px_rgba(194,178,138,0.35)]',
    gradient: 'from-sand/15 via-card/90 to-military-black',
    wireStroke: '#C2B28A',
    wireGlow: 'rgba(194, 178, 138, 0.7)',
  },
  red: {
    name: 'SECTOR DELTA [KHAKI]',
    accent: '#8C876B',
    border: 'border-gunmetal/80',
    borderActive: 'border-olive-light',
    bg: 'bg-card/90',
    bgBadge: 'bg-olive/15',
    text: 'text-tacticalWhite',
    glow: 'rgba(140, 135, 107, 0.35)',
    shadow: 'shadow-[0_2px_14px_rgba(24,30,24,0.6)]',
    cardGlow: 'hover:border-olive-light hover:shadow-[0_2px_18px_rgba(89,99,74,0.35)]',
    gradient: 'from-surface via-card/90 to-military-black',
    wireStroke: '#8C876B',
    wireGlow: 'rgba(140, 135, 107, 0.6)',
  },
  gold: {
    name: 'COMMAND FINALS // CHAMPIONSHIP',
    accent: '#C2B28A',
    border: 'border-sand/70',
    borderActive: 'border-sand',
    bg: 'bg-darkGreen/50',
    bgBadge: 'bg-sand/20',
    text: 'text-sand',
    glow: 'rgba(194, 178, 138, 0.45)',
    shadow: 'shadow-[0_4px_24px_rgba(194,178,138,0.25)]',
    cardGlow: 'hover:border-sand hover:shadow-[0_4px_30px_rgba(194,178,138,0.4)]',
    gradient: 'from-sand/20 via-card/95 to-military-black',
    wireStroke: '#C2B28A',
    wireGlow: 'rgba(194, 178, 138, 0.8)',
  },
};

export default function PlayoffBracketTree({
  matches,
  teams,
  onRefresh,
  defaultMode,
  showAdminControls = false,
}: PlayoffBracketTreeProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => showAdminControls || checkAdminAuth());
  const [isPublished, setIsPublished] = useState<boolean>(() => isPlayoffTreePublished());
  const [scale, setScale] = useState(1);
  const [activeHoverTeam, setActiveHoverTeam] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeStageFilter, setActiveStageFilter] = useState<'all' | 'left' | 'right' | 'final'>('all');
  const [isAuditoriumFullscreen, setIsAuditoriumFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [sixteenMatches, setSixteenMatches] = useState<Match[]>(() => getStored16Matches());
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);

  // Dynamic automatic bracket sizing: 16-squad vs 8-squad based on scheduled matches
  const has16Matches = useMemo(() => {
    if (defaultMode === '8-squad') return false;
    if (defaultMode === '16-squad') return true;

    if (matches.some((m) => m.bracketRound === 'round_of_16')) {
      return true;
    }
    if (sixteenMatches.some((m) => m.bracketRound === 'round_of_16' && (m.teamAId || m.teamBId || m.teamAName))) {
      return true;
    }
    if (matches.some((m) => m.bracketRound === 'quarterfinals')) {
      return false;
    }
    return getActiveBracketMode() === '16-squad';
  }, [sixteenMatches, matches, defaultMode]);

  const [viewStyle, setViewStyle] = useState<'bracket' | 'linear'>('bracket');
  const activeLayout: BracketLayoutMode = viewStyle === 'linear' ? 'linear' : (has16Matches ? '16-squad' : '8-squad');

  const eightBracket = useMemo(() => getPlayoffBracket(matches, teams), [matches, teams]);
  const sixteenBracket = useMemo(() => getPlayoffBracket(sixteenMatches, teams), [sixteenMatches, teams]);

  useEffect(() => {
    setIsAdmin(showAdminControls || checkAdminAuth());
    setIsPublished(isPlayoffTreePublished());

    api.public.getSettings().then((res: any) => {
      if (res?.data?.playoffTreePublished !== undefined) {
        setIsPublished(res.data.playoffTreePublished);
        setPlayoffTreePublished(res.data.playoffTreePublished);
      }
    }).catch(() => null);

    const handlePubChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ published: boolean }>;
      if (typeof customEvent.detail?.published === 'boolean') {
        setIsPublished(customEvent.detail.published);
      } else {
        setIsPublished(isPlayoffTreePublished());
      }
    };
    window.addEventListener('cst_playoff_published_changed', handlePubChange);

    const handleAuthChange = () => {
      setIsAdmin(showAdminControls || checkAdminAuth());
    };
    window.addEventListener('cst_admin_auth_changed', handleAuthChange);

    const channel = getLiveBroadcastChannel();
    const handleChannelMsg = (event: MessageEvent) => {
      if (event.data?.type === 'CST_PLAYOFF_PUBLISHED_UPDATE') {
        setIsPublished(event.data.published);
      }
    };
    channel?.addEventListener('message', handleChannelMsg);

    return () => {
      window.removeEventListener('cst_playoff_published_changed', handlePubChange);
      window.removeEventListener('cst_admin_auth_changed', handleAuthChange);
      channel?.removeEventListener('message', handleChannelMsg);
    };
  }, [showAdminControls]);

  useEffect(() => {
    const sync16 = () => {
      setSixteenMatches(getStored16Matches());
    };

    window.addEventListener('cst_16_matches_updated', sync16);
    window.addEventListener('cst_matches_updated', sync16);
    window.addEventListener('storage', sync16);

    const channel = getLiveBroadcastChannel();
    const handleChannelMsg = (event: MessageEvent) => {
      if (event.data?.type === 'CST_16_MATCHES_UPDATE') {
        sync16();
      }
    };
    channel?.addEventListener('message', handleChannelMsg);

    return () => {
      window.removeEventListener('cst_16_matches_updated', sync16);
      window.removeEventListener('cst_matches_updated', sync16);
      window.removeEventListener('storage', sync16);
      channel?.removeEventListener('message', handleChannelMsg);
    };
  }, []);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setScale(1);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsAuditoriumFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsAuditoriumFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsAuditoriumFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSimulate16Win = (matchId: string, winningSide: 'teamA' | 'teamB') => {
    const updated = set16MatchWinner(matchId, winningSide);
    if (updated) {
      const fresh = getStored16Matches();
      setSixteenMatches(fresh);
      const winningTeamName = winningSide === 'teamA' ? updated.teamAName : updated.teamBName;
      triggerNotice(`✓ ${winningTeamName} WON (13 Rounds) and advanced downstream!`);
    }
  };

  const handleSimulate16Round = (matchId: string, side: 'teamA' | 'teamB') => {
    const updated = increment16MatchScore(matchId, side, 1);
    if (updated) {
      const fresh = getStored16Matches();
      setSixteenMatches(fresh);
      triggerNotice(`+1 Round to ${side === 'teamA' ? updated.teamATag : updated.teamBTag} (${updated.scoreA} : ${updated.scoreB})`);
    }
  };

  const handleSimulate8Win = (matchId: string, winningSide: 'teamA' | 'teamB') => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const scoreA = winningSide === 'teamA' ? 13 : Math.min(targetMatch.scoreB, 11);
    const scoreB = winningSide === 'teamB' ? 13 : Math.min(targetMatch.scoreA, 11);
    const winningTeamName = winningSide === 'teamA' ? targetMatch.teamAName : targetMatch.teamBName;

    updateMatchScore(matchId, scoreA, scoreB, 'completed', `${winningTeamName} (MVP Rating 1.45)`);
    triggerNotice(`✓ ${winningTeamName} advanced down the tournament tree!`);
    if (onRefresh) onRefresh();
  };

  const handleSimulate8Round = (matchId: string, side: 'teamA' | 'teamB') => {
    const res = incrementMatchScore(matchId, side, 1);
    if (res) {
      triggerNotice(`+1 Round to ${side === 'teamA' ? res.teamATag : res.teamBTag} (${res.scoreA} : ${res.scoreB})`);
      if (onRefresh) onRefresh();
    }
  };

  const handleReset16Tree = () => {
    const fresh = reset16Matches();
    setSixteenMatches(fresh);
    triggerNotice('✓ 16-Squad Playoff Tree restored to initial major tournament state!');
  };

  const handleCreatePlayoffTree = async () => {
    const fresh = createAndSeedPlayoffTree(teams);
    setSixteenMatches(fresh);
    setIsPublished(true);
    setPlayoffTreePublished(true);
    try {
      await api.admin.generatePlayoffs().catch(() => null);
      await api.admin.updateSettings({ playoffTreePublished: true }).catch(() => null);
    } catch (e) {}
    triggerNotice('✓ Official Playoff Tree created & published to public site! 1st stage seeded. Semifinals & Finals advance automatically on match wins.');
    if (onRefresh) onRefresh();
  };

  const handleAutoSimulateChampionship = async () => {
    if (isSimulatingAll) return;
    setIsSimulatingAll(true);
    triggerNotice('⚡ Running Automatic Tournament Simulation (Round of 16 to Final)...');

    reset16Matches();
    setSixteenMatches(getStored16Matches());
    await new Promise((r) => setTimeout(r, 400));

    const r16Ids = ['m-r16-1', 'm-r16-2', 'm-r16-3', 'm-r16-4', 'm-r16-5', 'm-r16-6', 'm-r16-7', 'm-r16-8'];
    const r16Wins: ('teamA' | 'teamB')[] = ['teamA', 'teamA', 'teamB', 'teamA', 'teamA', 'teamB', 'teamA', 'teamB'];
    for (let i = 0; i < r16Ids.length; i++) {
      set16MatchWinner(r16Ids[i], r16Wins[i]);
      setSixteenMatches(getStored16Matches());
      await new Promise((r) => setTimeout(r, 220));
    }

    triggerNotice('✓ Quarterfinals determined! Simulating Quarterfinals...');
    await new Promise((r) => setTimeout(r, 350));

    const qfIds = ['m-qf-1', 'm-qf-2', 'm-qf-3', 'm-qf-4'];
    const qfWins: ('teamA' | 'teamB')[] = ['teamA', 'teamB', 'teamA', 'teamA'];
    for (let i = 0; i < qfIds.length; i++) {
      set16MatchWinner(qfIds[i], qfWins[i]);
      setSixteenMatches(getStored16Matches());
      await new Promise((r) => setTimeout(r, 260));
    }

    triggerNotice('✓ Semifinalists locked in! Simulating Semifinals...');
    await new Promise((r) => setTimeout(r, 350));

    set16MatchWinner('m-sf-1', 'teamA');
    setSixteenMatches(getStored16Matches());
    await new Promise((r) => setTimeout(r, 320));

    set16MatchWinner('m-sf-2', 'teamA');
    setSixteenMatches(getStored16Matches());
    await new Promise((r) => setTimeout(r, 380));

    triggerNotice('🏆 GRAND FINAL CLASH! Simulating Final match...');
    await new Promise((r) => setTimeout(r, 450));

    set16MatchWinner('m-gf', 'teamA');
    setSixteenMatches(getStored16Matches());
    setIsSimulatingAll(false);
    triggerNotice('👑 TOURNAMENT CHAMPION CROWNED ON THE TROPHY PODIUM!');
  };

  // Check if real playoff fixtures exist in either 8-squad or 16-squad brackets
  const hasPlayoffMatches = useMemo(() => {
    return (
      matches.some(
        (m) =>
          m.bracketRound === 'quarterfinals' ||
          m.bracketRound === 'semifinals' ||
          m.bracketRound === 'final' ||
          m.bracketRound === 'third_place' ||
          m.bracketRound === 'round_of_16'
      ) || sixteenMatches.some((m) => m.bracketRound === 'round_of_16')
    );
  }, [matches, sixteenMatches]);

  const livePlayoffMatch = useMemo(() => {
    return matches.find((m) => m.status === 'live') || sixteenMatches.find((m) => m.status === 'live') || null;
  }, [matches, sixteenMatches]);

  // If playoff bracket is disabled/unpublished and viewer is NOT using admin controls and no playoff matches exist:
  if (!isPublished && !showAdminControls && !hasPlayoffMatches) {
    return (
      <div className="space-y-6 select-none font-sans" ref={containerRef}>
        <div className="bg-card border-2 border-gunmetal p-8 sm:p-14 text-center relative overflow-hidden clip-tactical shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sand/5 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-surface border-2 border-sand/40 flex items-center justify-center text-sand clip-tactical shadow-[0_2px_16px_rgba(194,178,138,0.2)]">
              <Shield className="w-10 h-10 animate-pulse text-sand" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-gunmetal text-sand text-xs font-mono uppercase tracking-widest font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-sand animate-ping" />
              <span>PLAYOFF TREE // DISABLED (STANDBY)</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider mb-3">
              PLAYOFF BRACKET CURRENTLY DISABLED
            </h2>

            <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed mb-6">
              The official championship playoff tree has not yet been published by tournament command.
              1st round fixture scheduling and squad bracket seeds are currently being calibrated.
              When tournament administrators publish the bracket, the live interactive dual-wing championship tree will broadcast here automatically.
            </p>

            <div className="p-4 bg-surface/80 border border-gunmetal flex flex-wrap justify-center items-center gap-6 text-xs font-mono text-mutedKhaki">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>STATUS: AWAITING ADMIN PUBLICATION</span>
              </div>
              <div>• FORMAT: COD4 MW 5v5 S&amp;D SINGLE ELIMINATION</div>
              <div>• VENUE: UWU MAIN AUDITORIUM</div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scoreboard/live"
                className="px-4 py-2 bg-surface hover:bg-card border border-gunmetal text-sand font-mono text-xs uppercase font-bold flex items-center gap-2 transition-colors"
              >
                <Radio className="w-4 h-4" />
                <span>VIEW STAGE TELEMETRY HUD</span>
              </Link>
              <Link
                href="/schedule"
                className="px-4 py-2 bg-surface hover:bg-card border border-gunmetal text-mutedKhaki hover:text-tacticalWhite font-mono text-xs uppercase font-bold flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>VIEW SCHEDULED MATCHES</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans" ref={containerRef}>
      
      <div className="bg-card border-2 border-gunmetal p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.8)] clip-tactical">
        <div className="absolute top-0 right-0 w-96 h-52 bg-gradient-to-b from-sand/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-32 bg-olive/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-sand animate-ping" />
              <Badge variant="cyan" size="sm">
                TACTICAL OPERATIONS TREE // DUAL-WING ARENA
              </Badge>
              <span className="text-[11px] font-mono text-mutedText">
                {"// COD4 MW 5v5 SEARCH & DESTROY • SINGLE ELIMINATION"}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider flex items-center gap-3">
              <span>PLAYOFF</span> <span className="text-sand">CHAMPIONSHIP TREE</span>
            </h2>
            <p className="text-xs font-mono text-mutedText mt-1 max-w-2xl leading-relaxed">
              Symmetrical dual-wing tactical bracket converging directly toward the Grand Final and Champion Trophy Podium. Hover over any squad to trace their complete route to victory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Dynamic Bracket Pool Indicator (No manual 16 vs 8 toggle needed - depends on fixtures created) */}
            <div className="bg-surface/90 border border-gunmetal px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
              <span className="text-mutedKhaki font-bold uppercase">BRACKET POOL:</span>
              <Badge variant={has16Matches ? 'cyan' : 'sand'} size="sm">
                {has16Matches ? '16-SQUAD MAJOR (AUTO)' : '8-SQUAD BRACKET (AUTO)'}
              </Badge>
            </div>

            {/* Layout representation: Symmetrical Dual-Wing Tree vs Linear Stages */}
            <div className="bg-surface/90 border border-gunmetal p-1 flex items-center gap-1">
              <button
                onClick={() => setViewStyle('bracket')}
                className={`px-3 py-1.5 font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all ${
                  viewStyle === 'bracket'
                    ? 'bg-olive text-tacticalWhite shadow-[0_2px_10px_rgba(37,44,36,0.8)]'
                    : 'text-mutedText hover:text-tacticalWhite'
                }`}
                title="Dual-Wing Symmetrical Tactical Championship Tree"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>DUAL-WING TREE</span>
              </button>

              <button
                onClick={() => setViewStyle('linear')}
                className={`px-3 py-1.5 font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all ${
                  viewStyle === 'linear'
                    ? 'bg-gunmetal text-tacticalWhite font-black shadow-sm'
                    : 'text-mutedText hover:text-tacticalWhite'
                }`}
                title="Linear Stage Progression Column View"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>LINEAR STAGES</span>
              </button>
            </div>

            <div className="bg-surface/90 border border-gunmetal p-1 flex items-center gap-1">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-mutedText hover:text-tacticalWhite hover:bg-card transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-mutedText hover:text-tacticalWhite hover:bg-card transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-mutedText hover:text-tacticalWhite hover:bg-card transition-colors text-[11px] font-mono font-bold px-2"
                title="Reset Zoom (100%)"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-sand hover:text-tacticalWhite hover:bg-olive/20 transition-colors"
                title="Toggle Auditorium Projector Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {showAdminControls && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCreatePlayoffTree}
                  className="px-3.5 py-2 bg-olive hover:bg-olive-light text-tacticalWhite font-mono text-xs uppercase font-black flex items-center gap-1.5 border border-olive-light/50 shadow-[0_2px_12px_rgba(37,44,36,0.8)] transition-all"
                  title="Seed 1st layer with registered squads; Round 2, Semifinals & Finals start free and advance automatically on win"
                >
                  <Trophy className="w-3.5 h-3.5 text-sand" />
                  <span>CREATE PLAYOFF TREE</span>
                </button>

                {activeLayout === '16-squad' ? (
                  <>
                    <button
                      onClick={handleAutoSimulateChampionship}
                      disabled={isSimulatingAll}
                      className="px-3.5 py-2 bg-sand text-military-black hover:bg-sand-light font-mono text-xs uppercase font-black flex items-center gap-1.5 border border-sand-light shadow-[0_2px_12px_rgba(194,178,138,0.3)] transition-all disabled:opacity-50"
                      title="Watch automated progression from Round of 16 all the way to Champion Trophy!"
                    >
                      <Zap className={`w-3.5 h-3.5 text-military-black ${isSimulatingAll ? 'animate-spin' : 'animate-bounce'}`} />
                      <span>{isSimulatingAll ? 'SIMULATING...' : 'AUTO-SIMULATE ALL'}</span>
                    </button>

                    <button
                      onClick={handleReset16Tree}
                      className="px-3 py-2 bg-surface border border-gunmetal hover:border-olive text-mutedText hover:text-tacticalWhite font-mono text-xs uppercase flex items-center gap-1.5 transition-colors"
                      title="Reset 16 squads to initial tournament bracket state"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>RESET BRACKET</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreatePlayoffTree}
                    className="px-3 py-2 bg-surface border border-gunmetal hover:border-sand text-mutedText hover:text-tacticalWhite font-mono text-xs uppercase flex items-center gap-1.5 transition-colors"
                    title="Re-seed 8-squad bracket from registered teams"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RE-SEED UWU</span>
                  </button>
                )}
              </div>
            )}

            <Link
              href="/scoreboard/live"
              target="_blank"
              className="px-3.5 py-2 bg-olive hover:bg-olive-light text-tacticalWhite font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border border-olive-light/40 shadow-[0_2px_12px_rgba(37,44,36,0.8)] transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-sand" />
              <span>STAGE HUD</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {livePlayoffMatch && (
          <div className="mt-4 p-3.5 bg-gradient-to-r from-rose-950/80 via-military-black to-card border border-rose-500/80 rounded flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <div>
                <div className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  <span>🔴 AUDITORIUM STAGE ENGAGEMENT LIVE</span>
                  <span className="text-mutedKhaki">•</span>
                  <span className="text-sand">{livePlayoffMatch.stage}</span>
                </div>
                <div className="text-sm font-display font-black text-tacticalWhite uppercase mt-0.5">
                  [{livePlayoffMatch.teamATag}] {livePlayoffMatch.teamAName}{' '}
                  <span className="text-sand mx-1.5 font-mono">{livePlayoffMatch.scoreA} : {livePlayoffMatch.scoreB}</span>{' '}
                  [{livePlayoffMatch.teamBTag}] {livePlayoffMatch.teamBName}
                </div>
              </div>
            </div>
            <Link
              href={`/scoreboard/live?matchId=${livePlayoffMatch.id}`}
              target="_blank"
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 clip-tactical shadow-md shrink-0"
            >
              <Radio className="w-3.5 h-3.5 text-sand animate-pulse" />
              <span>OPEN AUDITORIUM HUD</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        )}

        {actionNotice && (
          <div className="mt-4 p-3 bg-olive/20 border border-olive text-sand font-mono text-xs flex items-center gap-2 animate-pulse shadow-[0_2px_10px_rgba(24,30,24,0.6)]">
            <Radio className="w-4 h-4 shrink-0 animate-ping text-sand" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      <div className="bg-military-black border-2 border-gunmetal p-4 sm:p-8 relative overflow-x-auto overflow-y-hidden shadow-2xl min-h-[720px]">
        <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />
          <div className="absolute top-10 left-10 w-96 h-96 bg-olive/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-sand/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-darkGreen/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-olive/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-sand/5 rounded-full blur-[140px] pointer-events-none" />

          <div
            className="transition-transform duration-200 origin-top-center flex items-center justify-center min-w-[1260px] py-4"
            style={{ transform: `scale(${scale})` }}
          >
            {activeLayout === '16-squad' && (
              sixteenMatches.length === 0 ? (
                <div className="py-24 text-center max-w-xl mx-auto px-4">
                  <div className="w-16 h-16 bg-surface border-2 border-gunmetal flex items-center justify-center mx-auto mb-4 clip-tactical">
                    <Trophy className="w-8 h-8 text-sand/60" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-gunmetal text-sand text-xs font-mono uppercase tracking-widest font-bold mb-3">
                    <span>PLAYOFF BRACKET // STANDBY</span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider mb-2">
                    TOURNAMENT PLAYOFF TREE PENDING
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed max-w-md mx-auto mb-6">
                    The official championship playoff bracket will be revealed once initial schedule rounds are locked and the bracket tree is generated by tournament command.
                  </p>
                  {(showAdminControls || isAdmin) && (
                    <button
                      onClick={handleCreatePlayoffTree}
                      className="px-5 py-2.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 mx-auto border border-gunmetal shadow-lg"
                    >
                      <Trophy className="w-4 h-4 text-sand" />
                      <span>GENERATE PLAYOFF TREE NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <DualWingBracket16View
                  bracket={sixteenBracket}
                  matches={sixteenMatches}
                  activeHoverTeam={activeHoverTeam}
                  setActiveHoverTeam={setActiveHoverTeam}
                  onSelectMatch={setSelectedMatch}
                  onSimulateWin={(showAdminControls || isAdmin) ? handleSimulate16Win : undefined}
                  onSimulateRound={(showAdminControls || isAdmin) ? handleSimulate16Round : undefined}
                />
              )
            )}

            {activeLayout === '8-squad' && (
              (!matches || matches.length === 0 || !eightBracket.quarterfinals || eightBracket.quarterfinals.length === 0) ? (
                <div className="py-24 text-center max-w-xl mx-auto px-4">
                  <div className="w-16 h-16 bg-surface border-2 border-gunmetal flex items-center justify-center mx-auto mb-4 clip-tactical">
                    <Trophy className="w-8 h-8 text-sand/60" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-gunmetal text-sand text-xs font-mono uppercase tracking-widest font-bold mb-3">
                    <span>PLAYOFF BRACKET // STANDBY</span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider mb-2">
                    TOURNAMENT PLAYOFF TREE PENDING
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed max-w-md mx-auto mb-6">
                    The official 8-squad playoff bracket will be revealed once fixtures are scheduled and seeded by tournament command.
                  </p>
                  {(showAdminControls || isAdmin) && (
                    <button
                      onClick={handleCreatePlayoffTree}
                      className="px-5 py-2.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 mx-auto border border-gunmetal shadow-lg"
                    >
                      <Trophy className="w-4 h-4 text-sand" />
                      <span>GENERATE PLAYOFF TREE NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <DualWingBracket8View
                  bracket={eightBracket}
                  matches={matches}
                  activeHoverTeam={activeHoverTeam}
                  setActiveHoverTeam={setActiveHoverTeam}
                  onSelectMatch={setSelectedMatch}
                  onSimulateWin={(showAdminControls || isAdmin) ? handleSimulate8Win : undefined}
                  onSimulateRound={(showAdminControls || isAdmin) ? handleSimulate8Round : undefined}
                />
              )
            )}

            {activeLayout === 'linear' && (
              (!matches || matches.length === 0 || !eightBracket.quarterfinals || eightBracket.quarterfinals.length === 0) ? (
                <div className="py-24 text-center max-w-xl mx-auto px-4">
                  <div className="w-16 h-16 bg-surface border-2 border-gunmetal flex items-center justify-center mx-auto mb-4 clip-tactical">
                    <Trophy className="w-8 h-8 text-sand/60" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-gunmetal text-sand text-xs font-mono uppercase tracking-widest font-bold mb-3">
                    <span>PLAYOFF BRACKET // STANDBY</span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider mb-2">
                    TOURNAMENT PLAYOFF TREE PENDING
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed max-w-md mx-auto mb-6">
                    The official linear stage bracket will be published once fixtures are scheduled and seeded by tournament command.
                  </p>
                  {(showAdminControls || isAdmin) && (
                    <button
                      onClick={() => {
                        createAndSeedPlayoffTree(teams);
                        if (onRefresh) onRefresh();
                        triggerNotice('✓ Seeded official playoff tree!');
                      }}
                      className="px-5 py-2.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 mx-auto border border-gunmetal shadow-lg"
                    >
                      <Trophy className="w-4 h-4 text-sand" />
                      <span>GENERATE PLAYOFF TREE NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <LinearStageBracketView
                  bracket={eightBracket}
                  onSelectMatch={setSelectedMatch}
                  onSimulateWin={(showAdminControls || isAdmin) ? handleSimulate8Win : undefined}
                  onSimulateRound={(showAdminControls || isAdmin) ? handleSimulate8Round : undefined}
                />
              )
            )}
          </div>
        </div>

      {selectedMatch && (
        <MatchDossierModal
          match={selectedMatch}
          showAdminControls={showAdminControls || isAdmin}
          onClose={() => setSelectedMatch(null)}
          onSimulateWin={(side) => {
            if (activeLayout === '16-squad') handleSimulate16Win(selectedMatch.id, side);
            else handleSimulate8Win(selectedMatch.id, side);
          }}
          onSimulateRound={(side) => {
            if (activeLayout === '16-squad') handleSimulate16Round(selectedMatch.id, side);
            else handleSimulate8Round(selectedMatch.id, side);
          }}
        />
      )}
    </div>
  );
}

// ========================================================================================
// 16-SQUAD DUAL-WING BRACKET (EXACT 1:1 REPLICA OF USER REFERENCE IMAGE + AESTHETIC UPGRADES)
// ========================================================================================
interface DualWingBracket16Props {
  bracket: PlayoffBracket;
  matches: Match[];
  activeHoverTeam: string | null;
  setActiveHoverTeam: (id: string | null) => void;
  onSelectMatch: (m: Match) => void;
  onSimulateWin?: (id: string, side: 'teamA' | 'teamB') => void;
  onSimulateRound?: (id: string, side: 'teamA' | 'teamB') => void;
}

const createFallbackMatch = (id: string, stage: string, map: CS2Map = 'Mirage'): Match => ({
  id,
  matchNumber: 0,
  teamAId: `${id}-teamA`,
  teamBId: `${id}-teamB`,
  teamAName: 'TBD',
  teamBName: 'TBD',
  teamATag: 'TBD',
  teamBTag: 'TBD',
  teamALogo: '/images/team-placeholder.svg',
  teamBLogo: '/images/team-placeholder.svg',
  map,
  dateTime: new Date().toISOString(),
  status: 'upcoming',
  scoreA: 0,
  scoreB: 0,
  stage,
});

function DualWingBracket16View({
  bracket,
  matches,
  activeHoverTeam,
  setActiveHoverTeam,
  onSelectMatch,
  onSimulateWin,
  onSimulateRound,
}: DualWingBracket16Props) {
  // Extract matches by ID or order with full safety fallbacks
  const safeMatches = Array.isArray(matches) ? matches : [];
  const r16_1 = safeMatches.find((m) => m.id === 'm-r16-1') || safeMatches[0] || createFallbackMatch('m-r16-1', 'Round of 16 - 01');
  const r16_2 = safeMatches.find((m) => m.id === 'm-r16-2') || safeMatches[1] || createFallbackMatch('m-r16-2', 'Round of 16 - 02');
  const r16_3 = safeMatches.find((m) => m.id === 'm-r16-3') || safeMatches[2] || createFallbackMatch('m-r16-3', 'Round of 16 - 03');
  const r16_4 = safeMatches.find((m) => m.id === 'm-r16-4') || safeMatches[3] || createFallbackMatch('m-r16-4', 'Round of 16 - 04');
  const r16_5 = safeMatches.find((m) => m.id === 'm-r16-5') || safeMatches[4] || createFallbackMatch('m-r16-5', 'Round of 16 - 05');
  const r16_6 = safeMatches.find((m) => m.id === 'm-r16-6') || safeMatches[5] || createFallbackMatch('m-r16-6', 'Round of 16 - 06');
  const r16_7 = safeMatches.find((m) => m.id === 'm-r16-7') || safeMatches[6] || createFallbackMatch('m-r16-7', 'Round of 16 - 07');
  const r16_8 = safeMatches.find((m) => m.id === 'm-r16-8') || safeMatches[7] || createFallbackMatch('m-r16-8', 'Round of 16 - 08');

  const qf_1 = safeMatches.find((m) => m.id === 'm-qf-1') || safeMatches[8] || createFallbackMatch('m-qf-1', 'Quarterfinal 01');
  const qf_2 = safeMatches.find((m) => m.id === 'm-qf-2') || safeMatches[9] || createFallbackMatch('m-qf-2', 'Quarterfinal 02');
  const qf_3 = safeMatches.find((m) => m.id === 'm-qf-3') || safeMatches[10] || createFallbackMatch('m-qf-3', 'Quarterfinal 03');
  const qf_4 = safeMatches.find((m) => m.id === 'm-qf-4') || safeMatches[11] || createFallbackMatch('m-qf-4', 'Quarterfinal 04');

  const sf_1 = safeMatches.find((m) => m.id === 'm-sf-1') || safeMatches[12] || createFallbackMatch('m-sf-1', 'Semifinal 01');
  const sf_2 = safeMatches.find((m) => m.id === 'm-sf-2') || safeMatches[13] || createFallbackMatch('m-sf-2', 'Semifinal 02');

  const finalMatch = safeMatches.find((m) => m.id === 'm-gf') || safeMatches[14] || bracket?.final || createFallbackMatch('m-gf', 'Grand Final');

  const simWin = (id?: string, side?: 'teamA' | 'teamB') =>
    onSimulateWin && id && side ? () => onSimulateWin(id, side) : undefined;

  // Dynamic Connector wire styling that illuminates the winning route
  const getWireClasses = (teamId?: string, winnerId?: string) => {
    const isHovered = activeHoverTeam && activeHoverTeam === teamId;
    const isWinningRoute = winnerId && winnerId === teamId;
    if (isHovered) {
      return 'stroke-white stroke-[3.5] filter drop-shadow-[0_0_12px_#fff] transition-all duration-300';
    }
    if (isWinningRoute) {
      return 'stroke-current stroke-[2.75] opacity-100 filter drop-shadow-[0_0_8px_currentColor] transition-all duration-300';
    }
    if (winnerId && !isWinningRoute) {
      return 'stroke-current stroke-[1.25] opacity-20 transition-all duration-300';
    }
    return 'stroke-current stroke-[2] opacity-70 transition-all duration-300';
  };

  return (
    <div className="relative w-[1380px] h-[680px] flex items-center justify-between mx-auto select-none">
      
      {/* ============================================================================ */}
      {/* SVG CONNECTOR WIRES LAYER (MILLIMETER ACCURACY CONVERGING TO CENTER)         */}
      {/* ============================================================================ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ----------------- LEFT WING: PURPLE QUADRANT (TOP-LEFT) ----------------- */}
        <g className="text-purple-500" filter="url(#glowPurple)">
          {/* Pair 1 (R16-1): Ghost Reapers & Shadow Vipers -> QF1 Team A */}
          <path d="M 175,48 H 205 V 76 H 235" fill="none" className={getWireClasses(r16_1.teamAId, r16_1.winnerId)} />
          <path d="M 175,104 H 205 V 76 H 235" fill="none" className={getWireClasses(r16_1.teamBId, r16_1.winnerId)} />

          {/* Pair 2 (R16-2): Night Spectres & Valkyrie 5 -> QF1 Team B */}
          <path d="M 175,164 H 205 V 192 H 235" fill="none" className={getWireClasses(r16_2.teamAId, r16_2.winnerId)} />
          <path d="M 175,220 H 205 V 192 H 235" fill="none" className={getWireClasses(r16_2.teamBId, r16_2.winnerId)} />

          {/* QF1 -> Semifinal 1 Team A */}
          <path d="M 405,76 H 440 V 290 H 480" fill="none" className={getWireClasses(qf_1.teamAId, qf_1.winnerId)} strokeWidth="2.5" />
          <path d="M 405,192 H 440 V 290 H 480" fill="none" className={getWireClasses(qf_1.teamBId, qf_1.winnerId)} strokeWidth="2.5" />
        </g>

        {/* ----------------- LEFT WING: ORANGE QUADRANT (BOTTOM-LEFT) ----------------- */}
        <g className="text-orange-500" filter="url(#glowOrange)">
          {/* Pair 3 (R16-3): Apex Hunters & Desert Foxes -> QF2 Team A */}
          <path d="M 175,448 H 205 V 476 H 235" fill="none" className={getWireClasses(r16_3.teamAId, r16_3.winnerId)} />
          <path d="M 175,504 H 205 V 476 H 235" fill="none" className={getWireClasses(r16_3.teamBId, r16_3.winnerId)} />

          {/* Pair 4 (R16-4): Titan Squad & Cyber Force -> QF2 Team B */}
          <path d="M 175,564 H 205 V 592 H 235" fill="none" className={getWireClasses(r16_4.teamAId, r16_4.winnerId)} />
          <path d="M 175,620 H 205 V 592 H 235" fill="none" className={getWireClasses(r16_4.teamBId, r16_4.winnerId)} />

          {/* QF2 -> Semifinal 1 Team B */}
          <path d="M 405,476 H 440 V 378 H 480" fill="none" className={getWireClasses(qf_2.teamAId, qf_2.winnerId)} strokeWidth="2.5" />
          <path d="M 405,592 H 440 V 378 H 480" fill="none" className={getWireClasses(qf_2.teamBId, qf_2.winnerId)} strokeWidth="2.5" />
        </g>

        {/* ----------------- LEFT SEMIFINALS TO CENTER GRAND FINAL ----------------- */}
        <g className="text-purple-400">
          <path d="M 600,290 H 645" fill="none" strokeWidth="3" className={sf_1.winnerId === sf_1.teamAId ? "stroke-purple-400 opacity-100 filter drop-shadow-[0_0_10px_#A855F7]" : "stroke-purple-400 opacity-25"} />
        </g>
        <g className="text-orange-400">
          <path d="M 600,378 H 645" fill="none" strokeWidth="3" className={sf_1.winnerId === sf_1.teamBId ? "stroke-orange-400 opacity-100 filter drop-shadow-[0_0_10px_#F97316]" : "stroke-orange-400 opacity-25"} />
        </g>

        {/* ----------------- RIGHT WING: CYAN QUADRANT (TOP-RIGHT) ----------------- */}
        <g className="text-cyan-400" filter="url(#glowCyan)">
          {/* Pair 5 (R16-5): Alpha Protocol & Vortex Crew -> QF3 Team A */}
          <path d="M 1205,48 H 1175 V 76 H 1145" fill="none" className={getWireClasses(r16_5.teamAId, r16_5.winnerId)} />
          <path d="M 1205,104 H 1175 V 76 H 1145" fill="none" className={getWireClasses(r16_5.teamBId, r16_5.winnerId)} />

          {/* Pair 6 (R16-6): Delta Forces & Iron Clad 5 -> QF3 Team B */}
          <path d="M 1205,164 H 1175 V 192 H 1145" fill="none" className={getWireClasses(r16_6.teamAId, r16_6.winnerId)} />
          <path d="M 1205,220 H 1175 V 192 H 1145" fill="none" className={getWireClasses(r16_6.teamBId, r16_6.winnerId)} />

          {/* QF3 -> Semifinal 2 Team A */}
          <path d="M 975,76 H 940 V 290 H 900" fill="none" className={getWireClasses(qf_3.teamAId, qf_3.winnerId)} strokeWidth="2.5" />
          <path d="M 975,192 H 940 V 290 H 900" fill="none" className={getWireClasses(qf_3.teamBId, qf_3.winnerId)} strokeWidth="2.5" />
        </g>

        {/* ----------------- RIGHT WING: RED QUADRANT (BOTTOM-RIGHT) ----------------- */}
        <g className="text-rose-500" filter="url(#glowRed)">
          {/* Pair 7 (R16-7): Bravo Spectres & Phantom Unit -> QF4 Team A */}
          <path d="M 1205,448 H 1175 V 476 H 1145" fill="none" className={getWireClasses(r16_7.teamAId, r16_7.winnerId)} />
          <path d="M 1205,504 H 1175 V 476 H 1145" fill="none" className={getWireClasses(r16_7.teamBId, r16_7.winnerId)} />

          {/* Pair 8 (R16-8): Omega Protocol & Raven Clan -> QF4 Team B */}
          <path d="M 1205,564 H 1175 V 592 H 1145" fill="none" className={getWireClasses(r16_8.teamAId, r16_8.winnerId)} />
          <path d="M 1205,620 H 1175 V 592 H 1145" fill="none" className={getWireClasses(r16_8.teamBId, r16_8.winnerId)} />

          {/* QF4 -> Semifinal 2 Team B */}
          <path d="M 975,476 H 940 V 378 H 900" fill="none" className={getWireClasses(qf_4.teamAId, qf_4.winnerId)} strokeWidth="2.5" />
          <path d="M 975,592 H 940 V 378 H 900" fill="none" className={getWireClasses(qf_4.teamBId, qf_4.winnerId)} strokeWidth="2.5" />
        </g>

        {/* ----------------- RIGHT SEMIFINALS TO CENTER GRAND FINAL ----------------- */}
        <g className="text-cyan-400">
          <path d="M 780,290 H 735" fill="none" strokeWidth="3" className={sf_2.winnerId === sf_2.teamAId ? "stroke-cyan-400 opacity-100 filter drop-shadow-[0_0_10px_#00D5FF]" : "stroke-cyan-400 opacity-25"} />
        </g>
        <g className="text-rose-400">
          <path d="M 780,378 H 735" fill="none" strokeWidth="3" className={sf_2.winnerId === sf_2.teamBId ? "stroke-rose-400 opacity-100 filter drop-shadow-[0_0_10px_#F43F5E]" : "stroke-rose-400 opacity-25"} />
        </g>
      </svg>

      {/* ============================================================================ */}
      {/* COLUMN 1 (LEFT OUTER): ROUND OF 16 (8 SQUADS)                                 */}
      {/* ============================================================================ */}
      <div className="w-[175px] h-full flex flex-col justify-between py-6 z-10">
        
        {/* TOP-LEFT (PURPLE QUADRANT) */}
        <div className="space-y-6">
          <div className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-purple-500/40">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]" />
            <span>PURPLE QUADRANT</span>
          </div>

          {/* Match 1 */}
          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_1.teamAName}
              tag={r16_1.teamATag}
              logo={r16_1.teamALogo}
              score={r16_1.scoreA}
              isWinner={r16_1.winnerId === r16_1.teamAId}
              isEliminated={r16_1.winnerId ? r16_1.winnerId !== r16_1.teamAId : false}
              themeKey="purple"
              isHovered={activeHoverTeam === r16_1.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_1.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_1)}
              onSimWin={simWin(r16_1?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_1.teamBName}
              tag={r16_1.teamBTag}
              logo={r16_1.teamBLogo}
              score={r16_1.scoreB}
              isWinner={r16_1.winnerId === r16_1.teamBId}
              isEliminated={r16_1.winnerId ? r16_1.winnerId !== r16_1.teamBId : false}
              themeKey="purple"
              isHovered={activeHoverTeam === r16_1.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_1.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_1)}
              onSimWin={simWin(r16_1?.id, 'teamB')}
            />
          </div>

          {/* Match 2 */}
          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_2.teamAName}
              tag={r16_2.teamATag}
              logo={r16_2.teamALogo}
              score={r16_2.scoreA}
              isWinner={r16_2.winnerId === r16_2.teamAId}
              isEliminated={r16_2.winnerId ? r16_2.winnerId !== r16_2.teamAId : false}
              themeKey="purple"
              isHovered={activeHoverTeam === r16_2.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_2.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_2)}
              onSimWin={simWin(r16_2?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_2.teamBName}
              tag={r16_2.teamBTag}
              logo={r16_2.teamBLogo}
              score={r16_2.scoreB}
              isWinner={r16_2.winnerId === r16_2.teamBId}
              isEliminated={r16_2.winnerId ? r16_2.winnerId !== r16_2.teamBId : false}
              themeKey="purple"
              isHovered={activeHoverTeam === r16_2.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_2.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_2)}
              onSimWin={simWin(r16_2?.id, 'teamB')}
            />
          </div>
        </div>

        {/* BOTTOM-LEFT (ORANGE QUADRANT) */}
        <div className="space-y-6 pt-4">
          <div className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-orange-500/40">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#F97316]" />
            <span>ORANGE QUADRANT</span>
          </div>

          {/* Match 3 */}
          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_3.teamAName}
              tag={r16_3.teamATag}
              logo={r16_3.teamALogo}
              score={r16_3.scoreA}
              isWinner={r16_3.winnerId === r16_3.teamAId}
              isEliminated={r16_3.winnerId ? r16_3.winnerId !== r16_3.teamAId : false}
              themeKey="orange"
              isHovered={activeHoverTeam === r16_3.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_3.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_3)}
              onSimWin={simWin(r16_3?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_3.teamBName}
              tag={r16_3.teamBTag}
              logo={r16_3.teamBLogo}
              score={r16_3.scoreB}
              isWinner={r16_3.winnerId === r16_3.teamBId}
              isEliminated={r16_3.winnerId ? r16_3.winnerId !== r16_3.teamBId : false}
              themeKey="orange"
              isHovered={activeHoverTeam === r16_3.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_3.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_3)}
              onSimWin={simWin(r16_3?.id, 'teamB')}
            />
          </div>

          {/* Match 4 */}
          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_4.teamAName}
              tag={r16_4.teamATag}
              logo={r16_4.teamALogo}
              score={r16_4.scoreA}
              isWinner={r16_4.winnerId === r16_4.teamAId}
              isEliminated={r16_4.winnerId ? r16_4.winnerId !== r16_4.teamAId : false}
              themeKey="orange"
              isHovered={activeHoverTeam === r16_4.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_4.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_4)}
              onSimWin={simWin(r16_4?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_4.teamBName}
              tag={r16_4.teamBTag}
              logo={r16_4.teamBLogo}
              score={r16_4.scoreB}
              isWinner={r16_4.winnerId === r16_4.teamBId}
              isEliminated={r16_4.winnerId ? r16_4.winnerId !== r16_4.teamBId : false}
              themeKey="orange"
              isHovered={activeHoverTeam === r16_4.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_4.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_4)}
              onSimWin={simWin(r16_4?.id, 'teamB')}
            />
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* COLUMN 2 (LEFT MID): QUARTERFINALS                                            */}
      {/* ============================================================================ */}
      <div className="w-[170px] h-full flex flex-col justify-between py-12 ml-14 z-10">
        
        {/* Top QF (Purple) */}
        <div className="space-y-16 pt-2">
          <TacticalTeamPill
            name={qf_1.teamAName}
            tag={qf_1.teamATag}
            logo={qf_1.teamALogo}
            score={qf_1.scoreA}
            isWinner={qf_1.winnerId === qf_1.teamAId}
            isEliminated={qf_1.winnerId ? qf_1.winnerId !== qf_1.teamAId : false}
            themeKey="purple"
            isHovered={activeHoverTeam === qf_1.teamAId}
            onMouseEnter={() => setActiveHoverTeam(qf_1.teamAId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_1)}
            onSimWin={simWin(qf_1?.id, 'teamA')}
          />
          <TacticalTeamPill
            name={qf_1.teamBName}
            tag={qf_1.teamBTag}
            logo={qf_1.teamBLogo}
            score={qf_1.scoreB}
            isWinner={qf_1.winnerId === qf_1.teamBId}
            isEliminated={qf_1.winnerId ? qf_1.winnerId !== qf_1.teamBId : false}
            themeKey="purple"
            isHovered={activeHoverTeam === qf_1.teamBId}
            onMouseEnter={() => setActiveHoverTeam(qf_1.teamBId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_1)}
            onSimWin={simWin(qf_1?.id, 'teamB')}
          />
        </div>

        {/* Bottom QF (Orange) */}
        <div className="space-y-16 pb-2">
          <TacticalTeamPill
            name={qf_2.teamAName}
            tag={qf_2.teamATag}
            logo={qf_2.teamALogo}
            score={qf_2.scoreA}
            isWinner={qf_2.winnerId === qf_2.teamAId}
            isEliminated={qf_2.winnerId ? qf_2.winnerId !== qf_2.teamAId : false}
            themeKey="orange"
            isHovered={activeHoverTeam === qf_2.teamAId}
            onMouseEnter={() => setActiveHoverTeam(qf_2.teamAId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_2)}
            onSimWin={simWin(qf_2?.id, 'teamA')}
          />
          <TacticalTeamPill
            name={qf_2.teamBName}
            tag={qf_2.teamBTag}
            logo={qf_2.teamBLogo}
            score={qf_2.scoreB}
            isWinner={qf_2.winnerId === qf_2.teamBId}
            isEliminated={qf_2.winnerId ? qf_2.winnerId !== qf_2.teamBId : false}
            themeKey="orange"
            isHovered={activeHoverTeam === qf_2.teamBId}
            onMouseEnter={() => setActiveHoverTeam(qf_2.teamBId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_2)}
            onSimWin={simWin(qf_2?.id, 'teamB')}
          />
        </div>
      </div>

      {/* ============================================================================ */}
      {/* COLUMN 3 (LEFT INNER): SEMIFINALISTS                                          */}
      {/* ============================================================================ */}
      <div className="w-[125px] h-full flex flex-col justify-center gap-12 ml-16 z-10">
        {/* Purple Semifinal Winner Capsule */}
        <div className="relative group">
          <div
            className={`px-3 py-2 bg-gradient-to-r from-purple-900/90 via-purple-700/80 to-purple-900/90 border-2 border-purple-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
              sf_1.winnerId === sf_1.teamAId
                ? 'ring-2 ring-white shadow-[0_0_25px_rgba(168,85,247,0.9)] opacity-100'
                : sf_1.winnerId
                ? 'opacity-35 line-through decoration-purple-400/50'
                : 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
            }`}
            onClick={() => onSelectMatch(sf_1)}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {sf_1.teamAName}
            </div>
            <div className="text-[9px] font-mono text-purple-200 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <span>SEMIFINAL</span>
              {sf_1.scoreA > 0 && <span className="font-mono font-black text-white ml-1">({sf_1.scoreA})</span>}
            </div>
          </div>
        </div>

        {/* Orange Semifinal Winner Capsule */}
        <div className="relative group">
          <div
            className={`px-3 py-2 bg-gradient-to-r from-orange-900/90 via-orange-600/80 to-orange-900/90 border-2 border-orange-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
              sf_1.winnerId === sf_1.teamBId
                ? 'ring-2 ring-white shadow-[0_0_25px_rgba(249,115,22,0.9)] opacity-100'
                : sf_1.winnerId
                ? 'opacity-35 line-through decoration-orange-400/50'
                : 'shadow-[0_0_15px_rgba(249,115,22,0.5)]'
            }`}
            onClick={() => onSelectMatch(sf_1)}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {sf_1.teamBName}
            </div>
            <div className="text-[9px] font-mono text-orange-200 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <span>SEMIFINAL</span>
              {sf_1.scoreB > 0 && <span className="font-mono font-black text-white ml-1">({sf_1.scoreB})</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* COLUMN 4 (CENTER HUB): GRAND CHAMPIONSHIP & TROPHY PODIUM                     */}
      {/* ============================================================================ */}
      <div className="w-[210px] h-full flex flex-col items-center justify-center z-20 px-2">
        
        {/* Circular Glowing Trophy Badge */}
        <div className="relative mb-4 flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#070A0F] border-2 border-tactical-gold flex items-center justify-center shadow-[0_0_35px_rgba(255,184,0,0.6)] animate-pulse">
            <Trophy className="w-8 h-8 text-tactical-gold drop-shadow-[0_0_12px_#FFB800]" />
          </div>
          <div className="mt-1.5 font-display font-black text-[11px] uppercase tracking-widest text-tactical-gold bg-amber-500/10 border border-amber-500/40 px-3 py-0.5 shadow-sm">
            FINAL
          </div>
        </div>

        {/* Championship Match Cards (Left vs Right) */}
        <div className="w-full space-y-3">
          
          {/* Top Finalist (from Left Wing: Ghost Reapers) */}
          <div
            onClick={() => onSelectMatch(finalMatch)}
            className={`w-full p-2.5 bg-gradient-to-r from-orange-900/90 via-[#2A1406] to-orange-900/90 border-2 border-orange-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all relative overflow-hidden ${
              finalMatch.winnerId === finalMatch.teamAId
                ? 'ring-2 ring-tactical-gold shadow-[0_0_30px_rgba(255,184,0,0.8)] opacity-100'
                : finalMatch.winnerId
                ? 'opacity-35 line-through decoration-orange-400/50'
                : 'shadow-[0_0_20px_rgba(249,115,22,0.6)]'
            }`}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {finalMatch.teamAName}
            </div>
            <div className="text-[9px] font-mono text-orange-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1 mt-0.5">
              <span>CHAMPIONSHIP</span>
              {finalMatch.scoreA > 0 && <span className="text-white font-mono font-black ml-1">({finalMatch.scoreA})</span>}
            </div>
          </div>

          {/* Versus Center Divider */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-tactical-gold to-transparent" />
            <span className="text-[10px] font-mono font-black text-tactical-gold uppercase px-1.5 py-0.5 bg-surface border border-tactical-gold/40">
              VS
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-tactical-gold to-transparent" />
          </div>

          {/* Bottom Finalist (from Right Wing: Alpha Protocol) */}
          <div
            onClick={() => onSelectMatch(finalMatch)}
            className={`w-full p-2.5 bg-gradient-to-r from-cyan-900/90 via-[#0A1B28] to-cyan-900/90 border-2 border-cyan-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all relative overflow-hidden ${
              finalMatch.winnerId === finalMatch.teamBId
                ? 'ring-2 ring-tactical-gold shadow-[0_0_30px_rgba(255,184,0,0.8)] opacity-100'
                : finalMatch.winnerId
                ? 'opacity-35 line-through decoration-cyan-400/50'
                : 'shadow-[0_0_20px_rgba(0,213,255,0.6)]'
            }`}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {finalMatch.teamBName}
            </div>
            <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1 mt-0.5">
              <span>CHAMPIONSHIP</span>
              {finalMatch.scoreB > 0 && <span className="text-white font-mono font-black ml-1">({finalMatch.scoreB})</span>}
            </div>
          </div>
        </div>

        {/* Crowned Champion Badge or Awaiting Champion Status */}
        {bracket.champion ? (
          <div className="mt-4 pt-3 border-t border-tactical-gold/40 text-center animate-in zoom-in-95 duration-500 w-full">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-tactical-gold uppercase tracking-widest px-2.5 py-1 bg-amber-500/20 border border-amber-500/60 shadow-[0_0_20px_rgba(255,184,0,0.5)]">
              <Crown className="w-3.5 h-3.5 text-tactical-gold animate-bounce" />
              <span className="truncate max-w-[170px]">{bracket.champion.name}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-tactical-gold/20 text-center w-full">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-tactical-gold/80 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 border border-amber-500/30">
              <Trophy className="w-3 h-3 text-tactical-gold/70" />
              <span>AWAITING CHAMPION</span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================================ */}
      {/* COLUMN 5 (RIGHT INNER): SEMIFINALISTS                                         */}
      {/* ============================================================================ */}
      <div className="w-[125px] h-full flex flex-col justify-center gap-12 mr-16 z-10">
        {/* Cyan Semifinal Winner Capsule */}
        <div className="relative group">
          <div
            className={`px-3 py-2 bg-gradient-to-r from-cyan-900/90 via-cyan-600/80 to-cyan-900/90 border-2 border-cyan-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
              sf_2.winnerId === sf_2.teamAId
                ? 'ring-2 ring-white shadow-[0_0_25px_rgba(0,213,255,0.9)] opacity-100'
                : sf_2.winnerId
                ? 'opacity-35 line-through decoration-cyan-400/50'
                : 'shadow-[0_0_15px_rgba(0,213,255,0.5)]'
            }`}
            onClick={() => onSelectMatch(sf_2)}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {sf_2.teamAName}
            </div>
            <div className="text-[9px] font-mono text-cyan-200 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <span>SEMIFINAL</span>
              {sf_2.scoreA > 0 && <span className="font-mono font-black text-white ml-1">({sf_2.scoreA})</span>}
            </div>
          </div>
        </div>

        {/* Red Semifinal Winner Capsule */}
        <div className="relative group">
          <div
            className={`px-3 py-2 bg-gradient-to-r from-rose-900/90 via-rose-600/80 to-rose-900/90 border-2 border-rose-400 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
              sf_2.winnerId === sf_2.teamBId
                ? 'ring-2 ring-white shadow-[0_0_25px_rgba(244,63,94,0.9)] opacity-100'
                : sf_2.winnerId
                ? 'opacity-35 line-through decoration-rose-400/50'
                : 'shadow-[0_0_15px_rgba(244,63,94,0.5)]'
            }`}
            onClick={() => onSelectMatch(sf_2)}
          >
            <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
              {sf_2.teamBName}
            </div>
            <div className="text-[9px] font-mono text-rose-200 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <span>SEMIFINAL</span>
              {sf_2.scoreB > 0 && <span className="font-mono font-black text-white ml-1">({sf_2.scoreB})</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* COLUMN 6 (RIGHT MID): QUARTERFINALS                                           */}
      {/* ============================================================================ */}
      <div className="w-[170px] h-full flex flex-col justify-between py-12 mr-14 z-10">
        
        {/* Top QF (Cyan) */}
        <div className="space-y-16 pt-2">
          <TacticalTeamPill
            name={qf_3.teamAName}
            tag={qf_3.teamATag}
            logo={qf_3.teamALogo}
            score={qf_3.scoreA}
            isWinner={qf_3.winnerId === qf_3.teamAId}
            isEliminated={qf_3.winnerId ? qf_3.winnerId !== qf_3.teamAId : false}
            themeKey="cyan"
            isHovered={activeHoverTeam === qf_3.teamAId}
            onMouseEnter={() => setActiveHoverTeam(qf_3.teamAId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_3)}
            onSimWin={simWin(qf_3?.id, 'teamA')}
          />
          <TacticalTeamPill
            name={qf_3.teamBName}
            tag={qf_3.teamBTag}
            logo={qf_3.teamBLogo}
            score={qf_3.scoreB}
            isWinner={qf_3.winnerId === qf_3.teamBId}
            isEliminated={qf_3.winnerId ? qf_3.winnerId !== qf_3.teamBId : false}
            themeKey="cyan"
            isHovered={activeHoverTeam === qf_3.teamBId}
            onMouseEnter={() => setActiveHoverTeam(qf_3.teamBId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_3)}
            onSimWin={simWin(qf_3?.id, 'teamB')}
          />
        </div>

        {/* Bottom QF (Red) */}
        <div className="space-y-16 pb-2">
          <TacticalTeamPill
            name={qf_4.teamAName}
            tag={qf_4.teamATag}
            logo={qf_4.teamALogo}
            score={qf_4.scoreA}
            isWinner={qf_4.winnerId === qf_4.teamAId}
            isEliminated={qf_4.winnerId ? qf_4.winnerId !== qf_4.teamAId : false}
            themeKey="red"
            isHovered={activeHoverTeam === qf_4.teamAId}
            onMouseEnter={() => setActiveHoverTeam(qf_4.teamAId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_4)}
            onSimWin={simWin(qf_4?.id, 'teamA')}
          />
          <TacticalTeamPill
            name={qf_4.teamBName}
            tag={qf_4.teamBTag}
            logo={qf_4.teamBLogo}
            score={qf_4.scoreB}
            isWinner={qf_4.winnerId === qf_4.teamBId}
            isEliminated={qf_4.winnerId ? qf_4.winnerId !== qf_4.teamBId : false}
            themeKey="red"
            isHovered={activeHoverTeam === qf_4.teamBId}
            onMouseEnter={() => setActiveHoverTeam(qf_4.teamBId)}
            onMouseLeave={() => setActiveHoverTeam(null)}
            onClick={() => onSelectMatch(qf_4)}
            onSimWin={simWin(qf_4?.id, 'teamB')}
          />
        </div>
      </div>

      <div className="w-[175px] h-full flex flex-col justify-between py-6 z-10">
        
        <div className="space-y-6">
          <div className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex items-center justify-end gap-1.5 pb-1 border-b border-cyan-500/40">
            <span>CYAN QUADRANT</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D5FF]" />
          </div>

          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_5.teamAName}
              tag={r16_5.teamATag}
              logo={r16_5.teamALogo}
              score={r16_5.scoreA}
              isWinner={r16_5.winnerId === r16_5.teamAId}
              isEliminated={r16_5.winnerId ? r16_5.winnerId !== r16_5.teamAId : false}
              themeKey="cyan"
              isHovered={activeHoverTeam === r16_5.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_5.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_5)}
              onSimWin={simWin(r16_5?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_5.teamBName}
              tag={r16_5.teamBTag}
              logo={r16_5.teamBLogo}
              score={r16_5.scoreB}
              isWinner={r16_5.winnerId === r16_5.teamBId}
              isEliminated={r16_5.winnerId ? r16_5.winnerId !== r16_5.teamBId : false}
              themeKey="cyan"
              isHovered={activeHoverTeam === r16_5.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_5.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_5)}
              onSimWin={simWin(r16_5?.id, 'teamB')}
            />
          </div>

          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_6.teamAName}
              tag={r16_6.teamATag}
              logo={r16_6.teamALogo}
              score={r16_6.scoreA}
              isWinner={r16_6.winnerId === r16_6.teamAId}
              isEliminated={r16_6.winnerId ? r16_6.winnerId !== r16_6.teamAId : false}
              themeKey="cyan"
              isHovered={activeHoverTeam === r16_6.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_6.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_6)}
              onSimWin={simWin(r16_6?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_6.teamBName}
              tag={r16_6.teamBTag}
              logo={r16_6.teamBLogo}
              score={r16_6.scoreB}
              isWinner={r16_6.winnerId === r16_6.teamBId}
              isEliminated={r16_6.winnerId ? r16_6.winnerId !== r16_6.teamBId : false}
              themeKey="cyan"
              isHovered={activeHoverTeam === r16_6.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_6.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_6)}
              onSimWin={simWin(r16_6?.id, 'teamB')}
            />
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest flex items-center justify-end gap-1.5 pb-1 border-b border-rose-500/40">
            <span>RED QUADRANT</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
          </div>

          {/* Match 7 */}
          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_7.teamAName}
              tag={r16_7.teamATag}
              logo={r16_7.teamALogo}
              score={r16_7.scoreA}
              isWinner={r16_7.winnerId === r16_7.teamAId}
              isEliminated={r16_7.winnerId ? r16_7.winnerId !== r16_7.teamAId : false}
              themeKey="red"
              isHovered={activeHoverTeam === r16_7.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_7.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_7)}
              onSimWin={simWin(r16_7?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_7.teamBName}
              tag={r16_7.teamBTag}
              logo={r16_7.teamBLogo}
              score={r16_7.scoreB}
              isWinner={r16_7.winnerId === r16_7.teamBId}
              isEliminated={r16_7.winnerId ? r16_7.winnerId !== r16_7.teamBId : false}
              themeKey="red"
              isHovered={activeHoverTeam === r16_7.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_7.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_7)}
              onSimWin={simWin(r16_7?.id, 'teamB')}
            />
          </div>

          <div className="space-y-3">
            <TacticalTeamPill
              name={r16_8.teamAName}
              tag={r16_8.teamATag}
              logo={r16_8.teamALogo}
              score={r16_8.scoreA}
              isWinner={r16_8.winnerId === r16_8.teamAId}
              isEliminated={r16_8.winnerId ? r16_8.winnerId !== r16_8.teamAId : false}
              themeKey="red"
              isHovered={activeHoverTeam === r16_8.teamAId}
              onMouseEnter={() => setActiveHoverTeam(r16_8.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_8)}
              onSimWin={simWin(r16_8?.id, 'teamA')}
            />
            <TacticalTeamPill
              name={r16_8.teamBName}
              tag={r16_8.teamBTag}
              logo={r16_8.teamBLogo}
              score={r16_8.scoreB}
              isWinner={r16_8.winnerId === r16_8.teamBId}
              isEliminated={r16_8.winnerId ? r16_8.winnerId !== r16_8.teamBId : false}
              themeKey="red"
              isHovered={activeHoverTeam === r16_8.teamBId}
              onMouseEnter={() => setActiveHoverTeam(r16_8.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(r16_8)}
              onSimWin={simWin(r16_8?.id, 'teamB')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DualWingBracket8Props {
  bracket: PlayoffBracket;
  matches: Match[];
  activeHoverTeam: string | null;
  setActiveHoverTeam: (id: string | null) => void;
  onSelectMatch: (m: Match) => void;
  onSimulateWin?: (id: string, side: 'teamA' | 'teamB') => void;
  onSimulateRound?: (id: string, side: 'teamA' | 'teamB') => void;
}

function DualWingBracket8View({
  bracket,
  activeHoverTeam,
  setActiveHoverTeam,
  onSelectMatch,
  onSimulateWin,
  onSimulateRound,
}: DualWingBracket8Props) {
  const qf1 = bracket.quarterfinals.find((m) => m.bracketPosition === 1 || m.matchNumber === 101) || bracket.quarterfinals[0] || null;
  const qf2 = bracket.quarterfinals.find((m) => m.bracketPosition === 2 || m.matchNumber === 102) || bracket.quarterfinals[1] || null;
  const qf3 = bracket.quarterfinals.find((m) => m.bracketPosition === 3 || m.matchNumber === 103) || bracket.quarterfinals[2] || null;
  const qf4 = bracket.quarterfinals.find((m) => m.bracketPosition === 4 || m.matchNumber === 104) || bracket.quarterfinals[3] || null;

  const sf1 = bracket.semifinals.find((m) => m.bracketPosition === 1 || m.matchNumber === 105) || bracket.semifinals[0] || null;
  const sf2 = bracket.semifinals.find((m) => m.bracketPosition === 2 || m.matchNumber === 106) || bracket.semifinals[1] || null;
  const finalMatch = bracket.final || null;

  const isQF1AWin = Boolean(qf1?.winnerId && String(qf1.winnerId) === String(qf1.teamAId)) || (qf1?.status === 'completed' && (qf1.scoreA ?? 0) > (qf1.scoreB ?? 0));
  const isQF1BWin = Boolean(qf1?.winnerId && String(qf1.winnerId) === String(qf1.teamBId)) || (qf1?.status === 'completed' && (qf1.scoreB ?? 0) > (qf1.scoreA ?? 0));

  const isQF2AWin = Boolean(qf2?.winnerId && String(qf2.winnerId) === String(qf2.teamAId)) || (qf2?.status === 'completed' && (qf2.scoreA ?? 0) > (qf2.scoreB ?? 0));
  const isQF2BWin = Boolean(qf2?.winnerId && String(qf2.winnerId) === String(qf2.teamBId)) || (qf2?.status === 'completed' && (qf2.scoreB ?? 0) > (qf2.scoreA ?? 0));

  const isSF1AWin = Boolean(sf1?.winnerId && String(sf1.winnerId) === String(sf1.teamAId)) || (sf1?.status === 'completed' && (sf1.scoreA ?? 0) > (sf1.scoreB ?? 0));
  const isSF1BWin = Boolean(sf1?.winnerId && String(sf1.winnerId) === String(sf1.teamBId)) || (sf1?.status === 'completed' && (sf1.scoreB ?? 0) > (sf1.scoreA ?? 0));

  const isSF2AWin = Boolean(sf2?.winnerId && String(sf2.winnerId) === String(sf2.teamAId)) || (sf2?.status === 'completed' && (sf2.scoreA ?? 0) > (sf2.scoreB ?? 0));
  const isSF2BWin = Boolean(sf2?.winnerId && String(sf2.winnerId) === String(sf2.teamBId)) || (sf2?.status === 'completed' && (sf2.scoreB ?? 0) > (sf2.scoreA ?? 0));

  const isFinalAWin = Boolean(finalMatch?.winnerId && String(finalMatch.winnerId) === String(finalMatch.teamAId)) || (finalMatch?.status === 'completed' && (finalMatch.scoreA ?? 0) > (finalMatch.scoreB ?? 0));
  const isFinalBWin = Boolean(finalMatch?.winnerId && String(finalMatch.winnerId) === String(finalMatch.teamBId)) || (finalMatch?.status === 'completed' && (finalMatch.scoreB ?? 0) > (finalMatch.scoreA ?? 0));

  const isQF3AWin = Boolean(qf3?.winnerId && String(qf3.winnerId) === String(qf3.teamAId)) || (qf3?.status === 'completed' && (qf3.scoreA ?? 0) > (qf3.scoreB ?? 0));
  const isQF3BWin = Boolean(qf3?.winnerId && String(qf3.winnerId) === String(qf3.teamBId)) || (qf3?.status === 'completed' && (qf3.scoreB ?? 0) > (qf3.scoreA ?? 0));

  const isQF4AWin = Boolean(qf4?.winnerId && String(qf4.winnerId) === String(qf4.teamAId)) || (qf4?.status === 'completed' && (qf4.scoreA ?? 0) > (qf4.scoreB ?? 0));
  const isQF4BWin = Boolean(qf4?.winnerId && String(qf4.winnerId) === String(qf4.teamBId)) || (qf4?.status === 'completed' && (qf4.scoreB ?? 0) > (qf4.scoreA ?? 0));

  const getWireClasses = (teamAId?: string, teamBId?: string) => {
    const isHovered = activeHoverTeam && (activeHoverTeam === teamAId || activeHoverTeam === teamBId);
    return isHovered ? 'stroke-white stroke-[3] filter drop-shadow-[0_0_8px_#fff]' : 'stroke-current stroke-[2] opacity-80';
  };

  return (
    <div className="relative w-[1180px] h-[540px] flex items-center justify-between mx-auto select-none">
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <g className="text-purple-500">
          <path d="M 230,110 H 290 V 270 H 330" fill="none" className={getWireClasses(qf1?.teamAId, qf1?.teamBId)} strokeWidth="2.5" />
        </g>
        <g className="text-orange-500">
          <path d="M 230,430 H 290 V 270 H 330" fill="none" className={getWireClasses(qf2?.teamAId, qf2?.teamBId)} strokeWidth="2.5" />
        </g>

        <g className="text-cyan-400">
          <path d="M 520,270 H 550" fill="none" strokeWidth="3" className="stroke-cyan-400" />
        </g>

        <g className="text-cyan-400">
          <path d="M 950,110 H 890 V 270 H 850" fill="none" className={getWireClasses(qf3?.teamAId, qf3?.teamBId)} strokeWidth="2.5" />
        </g>
        <g className="text-rose-500">
          <path d="M 950,430 H 890 V 270 H 850" fill="none" className={getWireClasses(qf4?.teamAId, qf4?.teamBId)} strokeWidth="2.5" />
        </g>

        <g className="text-rose-400">
          <path d="M 660,270 H 630" fill="none" strokeWidth="3" className="stroke-rose-400" />
        </g>
      </svg>

      <div className="w-[230px] h-full flex flex-col justify-between py-6 z-10">
        {qf1 && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-purple-500/30">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]" />
                <span>QF 01 • MAP: {qf1.map}</span>
              </span>
              {qf1.status === 'live' && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <TacticalTeamPill
              name={qf1.teamAName}
              tag={qf1.teamATag}
              logo={qf1.teamALogo}
              score={qf1.scoreA}
              isWinner={isQF1AWin}
              themeKey="purple"
              isHovered={activeHoverTeam === qf1.teamAId}
              onMouseEnter={() => setActiveHoverTeam(qf1.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf1)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf1.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={qf1.teamBName}
              tag={qf1.teamBTag}
              logo={qf1.teamBLogo}
              score={qf1.scoreB}
              isWinner={isQF1BWin}
              themeKey="purple"
              isHovered={activeHoverTeam === qf1.teamBId}
              onMouseEnter={() => setActiveHoverTeam(qf1.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf1)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf1.id, 'teamB') : undefined}
            />
          </div>
        )}

        {qf2 && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-orange-500/30">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#F97316]" />
                <span>QF 02 • MAP: {qf2.map}</span>
              </span>
              {qf2.status === 'live' && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <TacticalTeamPill
              name={qf2.teamAName}
              tag={qf2.teamATag}
              logo={qf2.teamALogo}
              score={qf2.scoreA}
              isWinner={isQF2AWin}
              themeKey="orange"
              isHovered={activeHoverTeam === qf2.teamAId}
              onMouseEnter={() => setActiveHoverTeam(qf2.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf2)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf2.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={qf2.teamBName}
              tag={qf2.teamBTag}
              logo={qf2.teamBLogo}
              score={qf2.scoreB}
              isWinner={isQF2BWin}
              themeKey="orange"
              isHovered={activeHoverTeam === qf2.teamBId}
              onMouseEnter={() => setActiveHoverTeam(qf2.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf2)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf2.id, 'teamB') : undefined}
            />
          </div>
        )}
      </div>

      {sf1 && (
        <div className="w-[190px] z-10 ml-10">
          <div className="p-3 bg-card/90 border-2 border-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.3)] clip-tactical space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-tactical-border text-[9px] font-mono text-purple-300">
              <span className="font-bold uppercase tracking-wider">SEMIFINAL 01</span>
              {sf1.status === 'live' ? (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              ) : (
                <span>{sf1.status.toUpperCase()}</span>
              )}
            </div>
            <TacticalTeamPill
              name={sf1.teamAName}
              tag={sf1.teamATag}
              logo={sf1.teamALogo}
              score={sf1.scoreA}
              isWinner={isSF1AWin}
              themeKey="purple"
              isHovered={activeHoverTeam === sf1.teamAId}
              onMouseEnter={() => setActiveHoverTeam(sf1.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(sf1)}
              onSimWin={onSimulateWin ? () => onSimulateWin(sf1.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={sf1.teamBName}
              tag={sf1.teamBTag}
              logo={sf1.teamBLogo}
              score={sf1.scoreB}
              isWinner={isSF1BWin}
              themeKey="orange"
              isHovered={activeHoverTeam === sf1.teamBId}
              onMouseEnter={() => setActiveHoverTeam(sf1.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(sf1)}
              onSimWin={onSimulateWin ? () => onSimulateWin(sf1.id, 'teamB') : undefined}
            />
          </div>
        </div>
      )}

      <div className="w-[200px] flex flex-col items-center justify-center z-20 px-2">
        <div className="relative mb-5 flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#070A0F] border-2 border-tactical-gold flex items-center justify-center shadow-[0_0_35px_rgba(255,184,0,0.6)] animate-pulse">
            <Trophy className="w-8 h-8 text-tactical-gold drop-shadow-[0_0_12px_#FFB800]" />
          </div>
          <div className="mt-2 font-display font-black text-xs uppercase tracking-widest text-tactical-gold bg-amber-500/10 border border-amber-500/40 px-3 py-0.5">
            FINAL
          </div>
        </div>

        {finalMatch && (
          <div className="w-full space-y-3">
            <div
              onClick={() => onSelectMatch(finalMatch)}
              className={`p-3 bg-gradient-to-r from-purple-900/80 to-[#1A1028] border-2 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
                isFinalAWin
                  ? 'border-tactical-gold shadow-[0_0_25px_rgba(255,184,0,0.6)] ring-1 ring-amber-400'
                  : 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              }`}
            >
              <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
                {finalMatch.teamAName}
              </div>
              <div className="text-[9px] font-mono text-purple-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 mt-0.5">
                <span>LEFT SEMIFINAL WINNER</span>
                {isFinalAWin && (
                  <span className="text-tactical-gold font-black">★ WON</span>
                )}
              </div>
              {(finalMatch.scoreA > 0 || finalMatch.scoreB > 0 || finalMatch.status === 'live' || finalMatch.status === 'completed') && (
                <div className="font-mono text-sm font-black text-tactical-gold mt-1">
                  {finalMatch.scoreA}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-black text-tactical-gold">VS</span>
            </div>

            <div
              onClick={() => onSelectMatch(finalMatch)}
              className={`p-3 bg-gradient-to-r from-cyan-900/80 to-[#0A1B28] border-2 text-center clip-tactical cursor-pointer hover:scale-105 transition-all ${
                isFinalBWin
                  ? 'border-tactical-gold shadow-[0_0_25px_rgba(255,184,0,0.6)] ring-1 ring-amber-400'
                  : 'border-cyan-400 shadow-[0_0_20px_rgba(0,213,255,0.5)]'
              }`}
            >
              <div className="font-display font-black text-xs uppercase text-white truncate tracking-wider">
                {finalMatch.teamBName}
              </div>
              <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 mt-0.5">
                <span>RIGHT SEMIFINAL WINNER</span>
                {isFinalBWin && (
                  <span className="text-tactical-gold font-black">★ WON</span>
                )}
              </div>
              {(finalMatch.scoreA > 0 || finalMatch.scoreB > 0 || finalMatch.status === 'live' || finalMatch.status === 'completed') && (
                <div className="font-mono text-sm font-black text-tactical-gold mt-1">
                  {finalMatch.scoreB}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crowned Champion Badge or Awaiting Champion Status */}
        {bracket.champion ? (
          <div className="mt-4 pt-3 border-t border-tactical-gold/40 text-center animate-in zoom-in-95 duration-500 w-full">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-tactical-gold uppercase tracking-widest px-2.5 py-1 bg-amber-500/20 border border-amber-500/60 shadow-[0_0_20px_rgba(255,184,0,0.5)]">
              <Crown className="w-3.5 h-3.5 text-tactical-gold animate-bounce" />
              <span className="truncate max-w-[170px]">{bracket.champion.name}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-tactical-gold/20 text-center w-full">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-tactical-gold/80 uppercase tracking-widest px-2.5 py-1 bg-amber-500/10 border border-amber-500/30">
              <Trophy className="w-3 h-3 text-tactical-gold/70" />
              <span>AWAITING CHAMPION</span>
            </div>
          </div>
        )}
      </div>

      {sf2 && (
        <div className="w-[190px] z-10 mr-10">
          <div className="p-3 bg-card/90 border-2 border-cyan-500/70 shadow-[0_0_25px_rgba(0,213,255,0.3)] clip-tactical space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-tactical-border text-[9px] font-mono text-cyan-300">
              <span className="font-bold uppercase tracking-wider">SEMIFINAL 02</span>
              {sf2.status === 'live' ? (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              ) : (
                <span>{sf2.status.toUpperCase()}</span>
              )}
            </div>
            <TacticalTeamPill
              name={sf2.teamAName}
              tag={sf2.teamATag}
              logo={sf2.teamALogo}
              score={sf2.scoreA}
              isWinner={isSF2AWin}
              themeKey="cyan"
              isHovered={activeHoverTeam === sf2.teamAId}
              onMouseEnter={() => setActiveHoverTeam(sf2.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(sf2)}
              onSimWin={onSimulateWin ? () => onSimulateWin(sf2.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={sf2.teamBName}
              tag={sf2.teamBTag}
              logo={sf2.teamBLogo}
              score={sf2.scoreB}
              isWinner={isSF2BWin}
              themeKey="red"
              isHovered={activeHoverTeam === sf2.teamBId}
              onMouseEnter={() => setActiveHoverTeam(sf2.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(sf2)}
              onSimWin={onSimulateWin ? () => onSimulateWin(sf2.id, 'teamB') : undefined}
            />
          </div>
        </div>
      )}

      <div className="w-[230px] h-full flex flex-col justify-between py-6 z-10">
        {qf3 && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-cyan-500/30">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D5FF]" />
                <span>QF 03 • MAP: {qf3.map}</span>
              </span>
              {qf3.status === 'live' && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <TacticalTeamPill
              name={qf3.teamAName}
              tag={qf3.teamATag}
              logo={qf3.teamALogo}
              score={qf3.scoreA}
              isWinner={isQF3AWin}
              themeKey="cyan"
              isHovered={activeHoverTeam === qf3.teamAId}
              onMouseEnter={() => setActiveHoverTeam(qf3.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf3)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf3.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={qf3.teamBName}
              tag={qf3.teamBTag}
              logo={qf3.teamBLogo}
              score={qf3.scoreB}
              isWinner={isQF3BWin}
              themeKey="cyan"
              isHovered={activeHoverTeam === qf3.teamBId}
              onMouseEnter={() => setActiveHoverTeam(qf3.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf3)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf3.id, 'teamB') : undefined}
            />
          </div>
        )}

        {qf4 && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-rose-500/30">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
                <span>QF 04 • MAP: {qf4.map}</span>
              </span>
              {qf4.status === 'live' && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <TacticalTeamPill
              name={qf4.teamAName}
              tag={qf4.teamATag}
              logo={qf4.teamALogo}
              score={qf4.scoreA}
              isWinner={isQF4AWin}
              themeKey="red"
              isHovered={activeHoverTeam === qf4.teamAId}
              onMouseEnter={() => setActiveHoverTeam(qf4.teamAId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf4)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf4.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={qf4.teamBName}
              tag={qf4.teamBTag}
              logo={qf4.teamBLogo}
              score={qf4.scoreB}
              isWinner={isQF4BWin}
              themeKey="red"
              isHovered={activeHoverTeam === qf4.teamBId}
              onMouseEnter={() => setActiveHoverTeam(qf4.teamBId)}
              onMouseLeave={() => setActiveHoverTeam(null)}
              onClick={() => onSelectMatch(qf4)}
              onSimWin={onSimulateWin ? () => onSimulateWin(qf4.id, 'teamB') : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface LinearStageBracketProps {
  bracket: PlayoffBracket;
  onSelectMatch: (m: Match) => void;
  onSimulateWin?: (id: string, side: 'teamA' | 'teamB') => void;
  onSimulateRound?: (id: string, side: 'teamA' | 'teamB') => void;
}

function LinearStageBracketView({
  bracket,
  onSelectMatch,
  onSimulateWin,
  onSimulateRound,
}: LinearStageBracketProps) {
  return (
    <div className="w-[1180px] grid grid-cols-4 gap-8 items-center py-6">
      
      <div className="space-y-6">
        <div className="pb-2 border-b border-tactical-border">
          <span className="text-[10px] font-mono text-secondaryText uppercase tracking-widest block">ROUND 01</span>
          <h4 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan" /> QUARTERFINALS
          </h4>
        </div>
        {bracket.quarterfinals.map((match, idx) => (
          <div key={match.id} className="p-3 bg-card border border-tactical-border hover:border-cyan transition-all space-y-2 clip-tactical">
            <div className="flex items-center justify-between text-[10px] font-mono text-secondaryText">
              <span>QF 0{idx + 1}</span>
              <span className="text-cyan font-bold">{match.map}</span>
            </div>
            <TacticalTeamPill
              name={match.teamAName}
              tag={match.teamATag}
              logo={match.teamALogo}
              score={match.scoreA}
              isWinner={match.winnerId === match.teamAId}
              themeKey={idx < 2 ? 'purple' : 'cyan'}
              onClick={() => onSelectMatch(match)}
              onSimWin={onSimulateWin ? () => onSimulateWin(match.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={match.teamBName}
              tag={match.teamBTag}
              logo={match.teamBLogo}
              score={match.scoreB}
              isWinner={match.winnerId === match.teamBId}
              themeKey={idx < 2 ? 'orange' : 'red'}
              onClick={() => onSelectMatch(match)}
              onSimWin={onSimulateWin ? () => onSimulateWin(match.id, 'teamB') : undefined}
            />
          </div>
        ))}
      </div>

      <div className="space-y-16">
        <div className="pb-2 border-b border-tactical-border">
          <span className="text-[10px] font-mono text-secondaryText uppercase tracking-widest block">ROUND 02</span>
          <h4 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange" /> SEMIFINALS
          </h4>
        </div>
        {bracket.semifinals.map((match, idx) => (
          <div key={match.id} className="p-3 bg-card border-2 border-cyan/40 hover:border-cyan transition-all space-y-2 clip-tactical">
            <div className="flex items-center justify-between text-[10px] font-mono text-secondaryText">
              <span>SEMIFINAL 0{idx + 1}</span>
              <span className="text-orange font-bold">{match.map}</span>
            </div>
            <TacticalTeamPill
              name={match.teamAName}
              tag={match.teamATag}
              logo={match.teamALogo}
              score={match.scoreA}
              isWinner={match.winnerId === match.teamAId}
              themeKey={idx === 0 ? 'purple' : 'cyan'}
              onClick={() => onSelectMatch(match)}
              onSimWin={onSimulateWin ? () => onSimulateWin(match.id, 'teamA') : undefined}
            />
            <TacticalTeamPill
              name={match.teamBName}
              tag={match.teamBTag}
              logo={match.teamBLogo}
              score={match.scoreB}
              isWinner={match.winnerId === match.teamBId}
              themeKey={idx === 0 ? 'orange' : 'red'}
              onClick={() => onSelectMatch(match)}
              onSimWin={onSimulateWin ? () => onSimulateWin(match.id, 'teamB') : undefined}
            />
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="pb-2 border-b border-tactical-border">
          <span className="text-[10px] font-mono text-tactical-gold uppercase tracking-widest block">CHAMPIONSHIP</span>
          <h4 className="font-display font-black text-sm uppercase text-tactical-gold tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-tactical-gold" /> GRAND FINAL
          </h4>
        </div>
        {bracket.final && (
          <div className="p-4 bg-gradient-to-b from-[#1E293B] via-card to-[#0F172A] border-2 border-tactical-gold shadow-[0_0_30px_rgba(255,184,0,0.3)] space-y-3 clip-tactical">
            <div className="flex items-center justify-between text-[10px] font-mono text-tactical-gold font-bold">
              <span>MAIN AUDITORIUM LAN</span>
              <span>{bracket.final.map}</span>
            </div>
            <TacticalTeamPill
              name={bracket.final.teamAName}
              tag={bracket.final.teamATag}
              logo={bracket.final.teamALogo}
              score={bracket.final.scoreA}
              isWinner={bracket.final.winnerId === bracket.final.teamAId}
              themeKey="gold"
              onClick={() => onSelectMatch(bracket.final!)}
              onSimWin={onSimulateWin ? () => onSimulateWin(bracket.final!.id, 'teamA') : undefined}
            />
            <div className="text-center font-mono text-xs font-black text-tactical-gold">VS</div>
            <TacticalTeamPill
              name={bracket.final.teamBName}
              tag={bracket.final.teamBTag}
              logo={bracket.final.teamBLogo}
              score={bracket.final.scoreB}
              isWinner={bracket.final.winnerId === bracket.final.teamBId}
              themeKey="gold"
              onClick={() => onSelectMatch(bracket.final!)}
              onSimWin={onSimulateWin ? () => onSimulateWin(bracket.final!.id, 'teamB') : undefined}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-surface border-2 border-tactical-gold/40 text-center shadow-[0_0_35px_rgba(255,184,0,0.2)] clip-tactical">
        <div className="relative w-20 h-20 rounded-full bg-surface border-2 border-tactical-gold flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,184,0,0.4)]">
          <Trophy className="w-10 h-10 text-tactical-gold drop-shadow-[0_0_12px_#FFB800]" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-tactical-gold font-bold mb-1">
          CST LAN 2026 CHAMPION
        </span>
        <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
          {bracket.champion ? bracket.champion.name : 'TBD (FINAL IN PROGRESS)'}
        </h3>
      </div>
    </div>
  );
}

interface TacticalTeamPillProps {
  name: string;
  tag: string;
  logo: string;
  score?: number;
  isWinner?: boolean;
  isEliminated?: boolean;
  themeKey?: 'purple' | 'orange' | 'cyan' | 'red' | 'gold';
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onSimWin?: () => void;
}

function TacticalTeamPill({
  name,
  tag,
  logo,
  score,
  isWinner = false,
  isEliminated = false,
  themeKey = 'cyan',
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onSimWin,
}: TacticalTeamPillProps) {
  const theme = QUADRANT_THEMES[themeKey] || QUADRANT_THEMES.cyan;
  const isPlaceholder = name.startsWith('TBD') || name.startsWith('Winner') || tag === 'TBD' || tag.startsWith('SLOT');

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`group relative flex items-center justify-between px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer select-none ${
        isPlaceholder
          ? 'bg-[#090D14]/80 border-dashed border-tactical-border/40 hover:border-tactical-border/80'
          : theme.bg
      } ${
        isHovered
          ? 'border-white bg-surface shadow-[0_0_20px_#fff] scale-105 z-30'
          : isWinner
          ? `${theme.borderActive} ${theme.shadow} z-20 scale-[1.02] ring-1 ring-white/60`
          : isEliminated
          ? 'border-tactical-border/40 opacity-40 hover:opacity-85 z-0'
          : isPlaceholder
          ? 'z-0'
          : `${theme.border} ${theme.cardGlow} z-10`
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div
          className={`relative w-6 h-6 rounded-full overflow-hidden border shrink-0 bg-surface ${
            isWinner ? theme.borderActive : isPlaceholder ? 'border-dashed border-tactical-border/50' : 'border-tactical-border'
          }`}
        >
          {logo && !logo.includes('team-placeholder.svg') ? (
            <Image src={logo} alt={name} fill className="object-cover" sizes="24px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-cyan/70 font-bold bg-[#0F172A]">
              {tag.slice(0, 3)}
            </div>
          )}
        </div>

        <div className="truncate">
          <span
            className={`font-display text-xs uppercase tracking-wider truncate block transition-colors ${
              isHovered
                ? 'text-white font-black'
                : isWinner
                ? 'text-white font-extrabold'
                : isPlaceholder
                ? 'text-secondaryText font-medium text-[11px]'
                : 'text-slate-200 font-black group-hover:text-white'
            }`}
          >
            {name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        {score !== undefined && (
          <span
            className={`font-mono text-xs font-black px-1.5 py-0.2 rounded ${
              isWinner
                ? 'bg-white text-black font-extrabold shadow-sm'
                : 'bg-black/40 text-secondaryText border border-tactical-border/50'
            }`}
          >
            {score}
          </span>
        )}

        {onSimWin && !isWinner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSimWin();
            }}
            className="opacity-0 group-hover:opacity-100 px-1 py-0.5 bg-tactical-gold text-background font-mono text-[9px] font-black uppercase rounded transition-opacity"
            title="Advance this team as winner"
          >
            WIN
          </button>
        )}
      </div>
    </div>
  );
}

interface MatchDossierModalProps {
  match: Match;
  onClose: () => void;
  showAdminControls?: boolean;
  onSimulateWin?: (side: 'teamA' | 'teamB') => void;
  onSimulateRound?: (side: 'teamA' | 'teamB') => void;
}

function MatchDossierModal({ match, onClose, showAdminControls = false, onSimulateWin, onSimulateRound }: MatchDossierModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative max-w-xl w-full bg-[#090D14] border-2 border-cyan/50 p-6 sm:p-8 clip-tactical shadow-[0_0_50px_rgba(0,213,255,0.25)] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-tactical-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
              <Badge variant="cyan" size="sm">
                TACTICAL DOSSIER
              </Badge>
              <span className="text-xs font-mono text-secondaryText">
                {`MATCH #${match.matchNumber || '101'}`}
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
              {match.stage}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-surface border border-tactical-border text-secondaryText hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3 items-center bg-surface/80 border border-tactical-border p-4">
          <div className="col-span-2 text-center space-y-2">
            <div className="relative w-14 h-14 mx-auto bg-surface border border-tactical-border rounded-full overflow-hidden">
              <Image src={match.teamALogo} alt={match.teamAName} fill className="object-cover" sizes="56px" />
            </div>
            <h4 className="font-display font-black text-sm text-white uppercase truncate">{match.teamAName}</h4>
            <div className="text-2xl font-display font-black text-cyan">{match.scoreA}</div>
            {showAdminControls && onSimulateWin && (
              <button
                onClick={() => onSimulateWin('teamA')}
                className="px-2.5 py-1 bg-cyan text-black font-mono text-[10px] font-black uppercase hover:bg-cyan/90 transition-colors"
              >
                SIM WIN (+13)
              </button>
            )}
          </div>

          <div className="col-span-1 text-center font-display font-black text-lg text-tactical-gold">
            VS
          </div>

          <div className="col-span-2 text-center space-y-2">
            <div className="relative w-14 h-14 mx-auto bg-surface border border-tactical-border rounded-full overflow-hidden">
              <Image src={match.teamBLogo} alt={match.teamBName} fill className="object-cover" sizes="56px" />
            </div>
            <h4 className="font-display font-black text-sm text-white uppercase truncate">{match.teamBName}</h4>
            <div className="text-2xl font-display font-black text-orange">{match.scoreB}</div>
            {showAdminControls && onSimulateWin && (
              <button
                onClick={() => onSimulateWin('teamB')}
                className="px-2.5 py-1 bg-orange text-black font-mono text-[10px] font-black uppercase hover:bg-orange/90 transition-colors"
              >
                SIM WIN (+13)
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-card border border-tactical-border space-y-1.5">
            <span className="text-secondaryText text-[10px] uppercase tracking-wider block">COMBAT THEATER</span>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-5 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                <Image src={getMapImage(match.map)} alt={match.map} fill className="object-cover" sizes="32px" />
              </div>
              <span className="text-white font-bold text-xs">
                {match.map} (MR12)
              </span>
            </div>
          </div>
          <div className="p-3 bg-card border border-tactical-border space-y-1">
            <span className="text-secondaryText text-[10px] uppercase tracking-wider block">TOURNAMENT VENUE</span>
            <span className="text-white font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-orange" /> Main Auditorium LAN
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            href={`/scoreboard/live?matchId=${match.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan hover:text-white uppercase transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>OPEN AUDITORIUM PROJECTOR HUD</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Button variant="outline" size="sm" onClick={onClose}>
            CLOSE DOSSIER
          </Button>
        </div>
      </div>
    </div>
  );
}
