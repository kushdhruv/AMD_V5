import * as SQLite from 'expo-sqlite';
import { supabase } from './supabaseClient';
import NetInfo from '@react-native-community/netinfo';

const DB_NAME = 'user_activities.db';

export interface Activity {
  id?: number;
  user_id?: string;
  event_id?: string;
  action: string;
  module: string;
  metadata: any;
  created_at?: string;
}

class ActivityService {
  private db: any;

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT,
        action TEXT NOT NULL,
        module TEXT NOT NULL,
        metadata TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async logActivity(action: string, module: string, eventId: string | undefined, metadata: any = {}) {
    try {
      if (!this.db) await this.init();

      // Write to SQLite immediately (Offline-safe)
      await this.db.runAsync(
        'INSERT INTO activities (action, module, event_id, metadata) VALUES (?, ?, ?, ?)',
        [action, module, eventId || null, JSON.stringify(metadata)]
      );

      // Attempt to sync if online (debounced/batched)
      this.syncActivities();
    } catch (error) {
      console.error('[ActivityService] Log failed:', error);
    }
  }

  async syncActivities() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rows: any[] = await this.db.getAllAsync('SELECT * FROM activities LIMIT 50');
      if (rows.length === 0) return;

      const activitiesToSync = rows.map(row => ({
        user_id: user.id,
        event_id: row.event_id,
        action: row.action,
        module: row.module,
        metadata: JSON.parse(row.metadata),
        created_at: row.created_at
      }));

      const { error } = await supabase
        .from('user_activities')
        .insert(activitiesToSync);

      if (!error) {
        // Clear synced rows
        const lastId = rows[rows.length - 1].id;
        await this.db.runAsync('DELETE FROM activities WHERE id <= ?', [lastId]);
        console.log(`[ActivityService] Synced ${rows.length} activities.`);
      } else {
        console.error('[ActivityService] Sync error:', error);
      }
    } catch (err) {
      console.error('[ActivityService] Sync failed:', err);
    }
  }
}

export const activityService = new ActivityService();
