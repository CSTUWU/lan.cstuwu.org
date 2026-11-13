'use client';

import { useState, useEffect } from 'react';
import { getStoredMatches, getStored16Matches, getLiveBroadcastChannel } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match } from '@/lib/types';

// Shared in-memory cache to guarantee ONE network request across all components
let globalLiveMatch: Match | null = null;
let lastFetchTime = 0;
let ongoingPromise: Promise<Match | null> | null = null;
const listeners = new Set<(match: Match | null) => void>();

function notifyListeners(match: Match | null) {
  globalLiveMatch = match;
  listeners.forEach((listener) => listener(match));
}

export async function fetchLiveMatchShared(): Promise<Match | null> {
  const now = Date.now();
  // Throttle network calls: if fetched less than 3 seconds ago, return cached match
  if (now - lastFetchTime < 3000 && ongoingPromise === null) {
    return globalLiveMatch;
  }

  if (ongoingPromise) {
    return ongoingPromise;
  }

  ongoingPromise = (async () => {
    try {
      const res = await api.public.getMatches({ status: 'LIVE' });
      lastFetchTime = Date.now();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const transformed = transformBackendMatch(res.data[0]);
        notifyListeners(transformed);
        return transformed;
      } else {
        // Fallback to local storage if API returns empty
        const stored = getStoredMatches();
        const stored16 = getStored16Matches();
        const local = stored.find((m) => m.status === 'live') || stored16.find((m) => m.status === 'live') || null;
        notifyListeners(local);
        return local;
      }
    } catch {
      // Offline fallback
      try {
        const stored = getStoredMatches();
        const stored16 = getStored16Matches();
        const local = stored.find((m) => m.status === 'live') || stored16.find((m) => m.status === 'live') || null;
        notifyListeners(local);
        return local;
      } catch {
        return null;
      }
    } finally {
      ongoingPromise = null;
    }
  })();

  return ongoingPromise;
}

// Single singleton interval runner for the whole application
let pollerActive = false;
let pollerInterval: NodeJS.Timeout | null = null;

function ensurePoller() {
  if (pollerActive || typeof window === 'undefined') return;
  pollerActive = true;

  fetchLiveMatchShared();

  pollerInterval = setInterval(() => {
    if (listeners.size > 0) {
      fetchLiveMatchShared();
    }
  }, 4000);

  const handleUpdate = () => fetchLiveMatchShared();
  window.addEventListener('cst_matches_updated', handleUpdate);
  window.addEventListener('cst_16_matches_updated', handleUpdate);

  const channel = getLiveBroadcastChannel();
  const handleBroadcast = (event: MessageEvent) => {
    if (
      event.data?.type === 'CST_LIVE_MATCH_UPDATE' ||
      event.data?.type === 'CST_16_MATCHES_UPDATE'
    ) {
      fetchLiveMatchShared();
    }
  };
  channel?.addEventListener('message', handleBroadcast);
}

export function useLiveMatch() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(globalLiveMatch);

  useEffect(() => {
    ensurePoller();

    // Sync initial state
    if (globalLiveMatch) {
      setLiveMatch(globalLiveMatch);
    } else {
      try {
        const stored = getStoredMatches();
        const local = stored.find((m) => m.status === 'live') || null;
        if (local) setLiveMatch(local);
      } catch {}
    }

    const listener = (match: Match | null) => {
      setLiveMatch(match);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    liveMatch,
    hasLiveMatch: Boolean(liveMatch),
    refetch: fetchLiveMatchShared,
  };
}

