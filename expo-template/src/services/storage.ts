// ============================================================
// OFFLINE-FIRST DATA SERVICE
// SQLite-backed local storage with a sync queue.
// All write ops go local first, then sync to Supabase.
// ============================================================
import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('event_app.db');
  }
  return dbInstance;
}
/** Initialize all local tables */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
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
      type TEXT,
      is_pinned INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS songs (
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
      description TEXT,
      emoji TEXT,
      tags TEXT,
      rating REAL,
      review_count INTEGER DEFAULT 0,
      price_range TEXT,
      is_featured INTEGER DEFAULT 0,
      is_open INTEGER DEFAULT 0,
      is_sponsored INTEGER DEFAULT 0,
      phone TEXT,
      whatsapp TEXT,
      upi TEXT,
      location TEXT,
      timings TEXT,
      menu TEXT
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      name TEXT,
      score INTEGER DEFAULT 0,
      avatar TEXT,
      rank INTEGER
    );

    CREATE TABLE IF NOT EXISTS sponsors (
      id TEXT PRIMARY KEY,
      name TEXT,
      logo_url TEXT,
      description TEXT,
      website_url TEXT,
      tier TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      start_time TEXT,
      end_time TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS speakers (
      id TEXT PRIMARY KEY,
      name TEXT,
      title TEXT,
      bio TEXT,
      logo_url TEXT,
      website_url TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS event_tickets (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      price REAL,
      currency TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      ticket_id TEXT,
      payment_id TEXT,
      status TEXT,
      qr_code TEXT,
      created_at TEXT
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
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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
    const [stallsRes, announcementsRes, songsRes, leaderboardRes, registrationsRes, sponsorsRes, speakersRes, eventTicketsRes, userTicketsRes] = await Promise.all([
      supabase.from('stalls').select('*').eq('event_id', appId),
      supabase.from('announcements').select('*').eq('event_id', appId),
      supabase.from('song_requests').select('*').eq('event_id', appId),
      supabase.from('event_leaderboard').select('*').eq('event_id', appId),
      supabase.from('app_registrations').select('*').eq('app_name', appId),
      supabase.from('sponsors').select('*').eq('event_id', appId),
      supabase.from('speakers').select('*').eq('event_id', appId),
      supabase.from('event_tickets').select('*').eq('event_id', appId).eq('is_active', true),
      // We purposefully do NOT filter user_tickets here by event_id for the app globally, 
      // wait actually, user_tickets is private via RLS, so selecting with eq event_id is fine and gets only the current user's tickets to cache.
      supabase.from('user_tickets').select('*').eq('event_id', appId),
    ]);

    if (stallsRes.error) throw stallsRes.error;
    if (announcementsRes.error) throw announcementsRes.error;
    if (songsRes.error) throw songsRes.error;
    if (leaderboardRes.error) throw leaderboardRes.error;
    if (registrationsRes.error) throw registrationsRes.error;
    if (sponsorsRes.error) throw sponsorsRes.error;
    if (speakersRes.error) throw speakersRes.error;
    if (eventTicketsRes.error) throw eventTicketsRes.error;
    if (userTicketsRes.error) throw userTicketsRes.error;

    const stalls = stallsRes.data || [];
    const announcements = announcementsRes.data || [];
    const songs = songsRes.data || [];
    const leaderboard = leaderboardRes.data || [];
    const registrations = registrationsRes.data || [];
    const sponsors = sponsorsRes.data || [];
    const speakers = speakersRes.data || [];
    const eventTickets = eventTicketsRes.data || [];
    const userTickets = userTicketsRes.data || [];

    // 2. Overwrite local SQLite cache entirely within a unified transaction
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      // Safely clear old cache
      await db.runAsync('DELETE FROM stalls');
      await db.runAsync('DELETE FROM announcements');
      await db.runAsync('DELETE FROM songs');
      await db.runAsync('DELETE FROM leaderboard');
      await db.runAsync('DELETE FROM registrations');
      await db.runAsync('DELETE FROM sponsors');
      await db.runAsync('DELETE FROM speakers');
      await db.runAsync('DELETE FROM event_tickets');
      await db.runAsync('DELETE FROM user_tickets');

      // Re-seed registrations
      for (const r of registrations) {
        await db.runAsync(
          'INSERT INTO registrations (id, user_id, event_name, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [r.id, r.user_id, r.app_name, r.data?.category || 'Attendee', r.status || 'Confirmed', r.created_at]
        );
      }

      // Re-seed stalls 
      for (const s of stalls) {
        await db.runAsync(
          `INSERT INTO stalls (
            id, name, category, description, emoji, tags, rating, review_count, 
            price_range, is_featured, is_open, phone, whatsapp, upi, 
            location, timings, menu
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id, 
            s.name, 
            s.category, 
            s.description, 
            s.emoji, 
            JSON.stringify(s.tags || []), 
            s.rating, 
            s.review_count || 0,
            s.price_range, 
            s.is_featured ? 1 : 0, 
            s.is_open ? 1 : 0,
            s.contact?.phone || null,
            s.contact?.whatsapp || null,
            s.contact?.upi || null,
            s.location, 
            s.timings, 
            JSON.stringify(s.menu || [])
          ]
        );
      }

      // Re-seed announcements
      for (const a of announcements) {
        await db.runAsync(
          'INSERT INTO announcements (id, title, body, type, is_pinned, scheduled_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [a.id, a.title, a.body, a.type, a.is_pinned ? 1 : 0, a.created_at || a.scheduled_at, a.created_at]
        );
      }

      // Re-seed songs (mapped from song_requests)
      for (const s of songs) {
        await db.runAsync(
          'INSERT INTO songs (id, title, artist, votes, now_playing) VALUES (?, ?, ?, ?, ?)',
          [s.id, s.title, s.artist, s.votes || 0, s.status === 'playing' ? 1 : 0]
        );
      }

      // Re-seed leaderboard (mapped from event_leaderboard)
      for (const l of leaderboard) {
        await db.runAsync(
          'INSERT INTO leaderboard (id, name, score, avatar) VALUES (?, ?, ?, ?)',
          [l.id, l.team_name, l.score || 0, l.organization]
        );
      }

      // Re-seed sponsors
      for (const s of sponsors) {
        await db.runAsync(
          `INSERT INTO sponsors (
            id, name, logo_url, description, website_url, tier, 
            order_index, is_active, start_time, end_time, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id, s.name, s.logo_url, s.description, s.website_url, s.tier,
            s.order_index || 0, s.is_active ? 1 : 0, s.start_time, s.end_time, s.created_at
          ]
        );
      }

      // Re-seed speakers
      for (const s of speakers) {
        await db.runAsync(
          `INSERT INTO speakers (
            id, name, title, bio, logo_url, website_url, order_index, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.name, s.title, s.bio, s.logo_url, s.website_url, s.order_index || 0, s.is_active ? 1 : 0, s.created_at]
        );
      }

      // Re-seed event_tickets
      for (const t of eventTickets) {
        await db.runAsync(
          `INSERT INTO event_tickets (id, name, description, price, currency, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.name, t.description, t.price || 0, t.currency || 'INR', t.is_active ? 1 : 0, t.created_at]
        );
      }

      // Re-seed user_tickets
      for (const ut of userTickets) {
        await db.runAsync(
          `INSERT INTO user_tickets (id, user_id, user_email, ticket_id, payment_id, status, qr_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [ut.id, ut.user_id, ut.user_email, ut.ticket_id, ut.payment_id, ut.status, ut.qr_code, ut.created_at]
        );
      }
    });

    console.log('[Sync Engine] Successfully synced live data.');
  } catch (error: any) {
    if (error.code === 'PGRST205') {
      console.info(`[Sync Engine] Remote schema notice: One or more tables (likely "stalls") not found in remote database. Using offline data.`);
    } else {
      console.warn('[Sync Engine] Failed to sync down from remote. App will use offline SQLite data.', error);
    }
  }
}

