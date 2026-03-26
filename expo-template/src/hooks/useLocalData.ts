import { useEffect, useState, useCallback } from 'react';
import { useEventConfig } from '../store/configStore';
import { localRead, syncRemoteDown } from '../services/storage';
import { supabase } from '../services/supabaseClient';

const VALID_TABLES = ['stalls', 'announcements', 'leaderboard', 'songs', 'votes', 'registrations', 'sync_queue'];

// ── Generic Hook for SQLite Reads ──────────────────────────
export function useLocalData<T>(
  tableName: string,
  queryOffset: string = '',
  dependencies: any[] = []
) {
  if (!VALID_TABLES.includes(tableName)) {
    throw new Error(`[useLocalData] Invalid table name: ${tableName}`);
  }

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const eventConfig = useEventConfig();
  const appId = eventConfig.name || 'default_app_id';

  const fetchData = useCallback(async () => {
    try {
      const result = await localRead<T>(`SELECT * FROM ${tableName} ${queryOffset}`);
      setData(result);
    } catch (e) {
      console.error(`[useLocalData] failed reading ${tableName}`, e);
    } finally {
      setLoading(false);
    }
  }, [tableName, queryOffset, ...dependencies]);

  useEffect(() => {
    // 1. Immediately load local data (offline-first)
    fetchData();

    // 2. Trigger initial background sync
    syncRemoteDown(appId).then(() => fetchData());

    // Mapping: Local Table -> Remote Supabase Table
    const remoteTableMap: Record<string, string> = {
      'stalls': 'stalls',
      'announcements': 'announcements',
      'leaderboard': 'event_leaderboard',
      'songs': 'song_requests',
      'registrations': 'app_registrations',
    };

    const remoteTable = remoteTableMap[tableName] || tableName;
    const filterKey = tableName === 'registrations' ? 'app_name' : 'event_id';

    // 3. Setup Realtime Subscription for live updates
    const channel = supabase
      .channel(`sync_${tableName}_${appId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: remoteTable,
          filter: `${filterKey}=eq.${appId}` 
        }, 
        async (payload) => {
          console.log(`[Realtime] ${remoteTable} changed, re-syncing local ${tableName}...`);
          await syncRemoteDown(appId);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, appId, tableName]);

  return { data, loading, refetch: fetchData };
}

// ── Specific Hooks ──────────────────────────────────────────

import { DEMO_STALLS } from '../modules/stalls/services/stallTypes';

export function useLocalStalls() {
  const { data, loading, refetch } = useLocalData<any>('stalls', 'ORDER BY is_featured DESC, name ASC');

  // Map SQLite results back to Stall interface
  const mappedData = data.map(s => ({
    ...s,
    tags: JSON.parse(s.tags || '[]'),
    menu: JSON.parse(s.menu || '[]'),
    isFeatured: !!s.is_featured,
    isSponsored: !!s.is_sponsored,
    reviewCount: s.review_count || 0,
    priceRange: s.price_range,
    contact: {
      phone: s.phone || null,
      whatsapp: s.whatsapp || null,
      upi: s.upi || null
    }
  }));

  if (!loading && data.length === 0) {
    return { data: DEMO_STALLS, loading: false, refetch };
  }
  
  return { data: mappedData, loading, refetch };
}

export function useLocalAnnouncements() {
  return useLocalData('announcements', 'ORDER BY is_pinned DESC, created_at DESC');
}

export function useLocalLeaderboard() {
  return useLocalData('leaderboard', 'ORDER BY score DESC');
}

export function useLocalSongs() {
  return useLocalData('songs', 'ORDER BY votes DESC');
}

export function useLocalRegistrations() {
  return useLocalData('registrations', 'ORDER BY created_at DESC');
}
