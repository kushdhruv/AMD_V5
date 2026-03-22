import { useEffect, useState, useCallback } from 'react';
import { useEventConfig } from '../store/configStore';
import { localRead, syncRemoteDown } from '../services/storage';

// ── Generic Hook for SQLite Reads ──────────────────────────
export function useLocalData<T>(
  tableName: string,
  queryOffset: string = '',
  dependencies: any[] = []
) {
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

    // 2. Trigger asynchronous remote sync in the background
    syncRemoteDown(appId).then(() => {
      // 3. Re-read from SQLite once sync finishes
      fetchData();
    });
  }, [fetchData, appId]);

  return { data, loading, refetch: fetchData };
}

// ── Specific Hooks ──────────────────────────────────────────

export function useLocalStalls() {
  return useLocalData('stalls', 'ORDER BY is_featured DESC, name ASC');
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
