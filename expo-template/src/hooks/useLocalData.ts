import { useEffect, useState, useCallback } from 'react';
import { useEventConfig, useConfigStore } from '../store/configStore';
import { localRead, syncRemoteDown } from '../services/storage';
import { supabase } from '../services/supabaseClient';

const VALID_TABLES = ['stalls', 'announcements', 'leaderboard', 'songs', 'votes', 'registrations', 'sync_queue', 'sponsors'];

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
  const config = useConfigStore(s => s.config);
  const appId = config.project_id || eventConfig.name || 'default_app_id';
  
  useEffect(() => {
    console.log(`[useLocalData] Using appId for ${tableName}:`, appId);
  }, [appId, tableName]);

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
      'sponsors': 'sponsors',
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

export function useLocalSponsors() {
  const { data, loading, refetch } = useLocalData<any>('sponsors', 'ORDER BY tier ASC, order_index ASC');
  
  const now = new Date();
  
  // Filter by is_active and timing
  const activeSponsors = data.filter(s => {
    // sqlite stores boolean as 1/0
    if (s.is_active !== 1 && s.is_active !== true) return false;
    
    if (s.start_time && s.start_time !== 'null') {
      const start = new Date(s.start_time);
      if (isValidDate(start) && now < start) return false;
    }
    
    if (s.end_time && s.end_time !== 'null') {
      const end = new Date(s.end_time);
      if (isValidDate(end) && now > end) return false;
    }
    
    return true;
  });

  return { data: activeSponsors, loading, refetch };
}

// Helper to check valid dates
function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function useLocalSpeakers() {
  const { data, loading, refetch } = useLocalData<any>('speakers', 'ORDER BY order_index ASC, created_at DESC');
  const activeSpeakers = data.filter(s => s.is_active === 1 || s.is_active === true);
  return { data: activeSpeakers, loading, refetch };
}

export function useLocalEventTickets() {
  const { data, loading, refetch } = useLocalData<any>('event_tickets', 'ORDER BY created_at DESC');
  const activeTickets = data.filter(t => t.is_active === 1 || t.is_active === true);
  return { data: activeTickets, loading, refetch };
}

export function useLocalUserTickets() {
  return useLocalData<any>('user_tickets', 'ORDER BY created_at DESC');
}
