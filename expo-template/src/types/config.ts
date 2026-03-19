// ============================================================
// CONFIG TYPES — Single source of truth for the entire app
// All components read from these types. Zero hardcoding.
// ============================================================

export interface EventConfig {
  name: string;
  tagline: string;
  dates: string;
  venue: string;
  logo_url?: string;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  radius: number;
  fontFamily: string;
}

export interface StallsModule {
  enabled: boolean;
  sub_features: string[];
}

export interface MusicModule {
  enabled: boolean;
  sub_features: string[];
}

export interface ModulesConfig {
  registration: boolean;
  stalls: StallsModule | boolean;
  announcements: boolean;
  music: MusicModule | boolean;
  leaderboard: boolean;
  live_scores: boolean;
  speakers: boolean;
  voting: boolean;
  lost_and_found: boolean;
  event_info: boolean;
}

export interface SponsorSlot {
  placement: string;
  type: 'banner' | 'card' | 'popup';
  priority: 'high' | 'medium' | 'low';
}

export interface MonetizationConfig {
  enabled: boolean;
  sponsors: boolean;
  coupons: boolean;
  featured_listings: boolean;
  vip_upgrades: boolean;
  sponsor_slots: SponsorSlot[];
}

export interface AppConfig {
  event: EventConfig;
  theme: ThemeConfig;
  modules: ModulesConfig;
  monetization: MonetizationConfig;
  demo_mode: boolean;
}

// Helper — checks if a module is enabled regardless of shape (boolean | {enabled: bool})
export function isModuleEnabled(
  mod: boolean | { enabled: boolean } | undefined
): boolean {
  if (mod === undefined || mod === null) return false;
  if (typeof mod === 'boolean') return mod;
  return mod.enabled ?? false;
}
