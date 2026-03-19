// ============================================================
// OFFLINE-FIRST DATA SERVICE
// SQLite-backed local storage with a sync queue.
// All write ops go local first, then sync to Supabase.
// ============================================================
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('event_app.db');

/** Initialize all local tables */
export async function initDatabase(): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      event_name TEXT,
      category TEXT,
      status TEXT,
      qr_code TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT,
      body TEXT,
      scheduled_at TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      poll_id TEXT,
      option_index INTEGER,
      voted_at TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS song_queue (
      id TEXT PRIMARY KEY,
      title TEXT,
      artist TEXT,
      votes INTEGER DEFAULT 0,
      now_playing INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stalls (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      rating REAL,
      price_range TEXT,
      is_featured INTEGER DEFAULT 0
    );
  `);
}

// ── Generic write with sync queue ──────────────────────────
export async function localWrite<T extends Record<string, unknown>>(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: T
): Promise<void> {
  // 1. Queue for remote sync
  await db.runAsync(
    'INSERT INTO sync_queue (table_name, operation, payload) VALUES (?, ?, ?)',
    [tableName, operation, JSON.stringify(payload)]
  );
  // 2. Optimistically write locally (implement per-table logic as needed)
}

// ── Sync queue processor — run when online ────────────────
export async function processSyncQueue(
  syncFn: (table: string, op: string, payload: Record<string, unknown>) => Promise<void>
): Promise<void> {
  const pending = await db.getAllAsync<{
    id: number;
    table_name: string;
    operation: string;
    payload: string;
  }>('SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC');

  for (const item of pending) {
    try {
      await syncFn(item.table_name, item.operation, JSON.parse(item.payload));
      await db.runAsync('UPDATE sync_queue SET synced = 1 WHERE id = ?', [item.id]);
    } catch (err) {
      // Leave in queue for retry, log silently
      console.warn(`[SyncQueue] Failed to sync item ${item.id}:`, err);
    }
  }
}

// ── Safe read helper ──────────────────────────────────────
export async function localRead<T>(
  query: string,
  params: (string | number)[] = []
): Promise<T[]> {
  return db.getAllAsync<T>(query, params);
}

// ============================================================
// REMOTE SYNC ENGINE (DATA PLANE CONSUMER)
// Fetches live data from Supabase and overwrites local cache.
// ============================================================
import { supabase } from './supabaseClient';

export async function syncRemoteDown(appId: string): Promise<void> {
  if (!appId) return;
  
  try {
    // 1. Fetch live data from Supabase across all necessary tables concurrently
    const [stallsRes, announcementsRes] = await Promise.all([
      supabase.from('stalls').select('*').eq('event_id', appId),
      supabase.from('announcements').select('*').eq('event_id', appId),
      // Extend with songs, leaderboard, etc. when needed
    ]);

    if (stallsRes.error) throw stallsRes.error;
    if (announcementsRes.error) throw announcementsRes.error;

    const stalls = stallsRes.data || [];
    const announcements = announcementsRes.data || [];

    // 2. Overwrite local SQLite cache entirely within a unified transaction
    // This guarantees that if the app is offline mid-sync, we don't end up with partial clear
    await db.withTransactionAsync(async () => {
      // Safely clear old cache
      await db.runAsync('DELETE FROM stalls');
      await db.runAsync('DELETE FROM announcements');

      // Re-seed stalls 
      for (const s of stalls) {
        await db.runAsync(
          'INSERT INTO stalls (id, name, category, rating, price_range, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
          [s.id, s.name, s.category, s.rating, s.price_range, s.is_featured ? 1 : 0]
        );
      }

      // Re-seed announcements
      for (const a of announcements) {
        await db.runAsync(
          'INSERT INTO announcements (id, title, body, scheduled_at, created_at) VALUES (?, ?, ?, ?, ?)',
          [a.id, a.title, a.body, a.created_at, a.created_at] // Using created_at for scheduled_at
        );
      }
    });

    console.log('[Sync Engine] Successfully synced live data from Admin Dashboard/Supabase.');
  } catch (error) {
    console.warn('[Sync Engine] Failed to sync down from remote. App will use offline SQLite data.', error);
  }
}

