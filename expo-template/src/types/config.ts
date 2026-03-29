// ============================================================
// CONFIG TYPES — Aligned with configTransformer.ts output
// This is the schema that config.json must follow.
// Single source of truth for the Expo mobile app.
// ============================================================

export interface EventConfig {
  name: string;
  tagline?: string;
  dates?: string;       // Computed display string, e.g. "Mar 29 - Mar 30, 2026"
  date_start?: string;  // ISO string
  date_end?: string;    // ISO string
  venue?: string;
  logo_url?: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  dark_mode_enabled: boolean;
  // Alias fields — required by ThemeProvider, derived from primary/secondary
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  radius: number;
  preset?: string;
}

export interface CommerceSubfeatures {
  menu_enabled: boolean;
  whatsapp_ordering: boolean;
  featured_stalls: boolean;
}

export interface SpeakerProfileSubfeatures {
  swipeable_cards: boolean;
  links_enabled: boolean;
}

export interface ModulesConfig {
  registration: boolean;
  commerce: {
    enabled: boolean;
    sub_features: CommerceSubfeatures;
  };
  announcements: boolean;
  /**
   * Song Queue module.
   * Key is `music` (not `songs`) — the web builder sends `songs` but the
   * configTransformer maps it to this shape before building.
   */
  music?: {
    enabled: boolean;
    sub_features: string[]; // e.g. ["queue", "upvote"]
  };
  live_scores: boolean;
  leaderboard: boolean;
  voting: boolean;
  lost_and_found: boolean;
  coupons: boolean;
  event_info: boolean;
  speakers: {
    enabled: boolean;
    sub_features: SpeakerProfileSubfeatures;
  };
}

export interface SponsorSlot {
  id: string;
  placement: "home_banner" | "stalls_inline" | "leaderboard_top" | "notifications";
  type: "banner" | "logo" | "text";
  priority: "low" | "medium" | "high";
  sponsor_name?: string;
  image_url?: string;
  target_url?: string;
}

export interface MonetizationConfig {
  enabled: boolean;
  slots: SponsorSlot[];
}

export interface AppConfig {
  /**
   * project_id is the Supabase `projects` table row UUID.
   * This links the mobile app to its specific event data.
   * Injected by configTransformer.ts at build time.
   */
  project_id: string;
  /** Legacy alias — same value as project_id for backwards compat */
  id?: string;
  app_state: "DRAFT" | "PREVIEW" | "GENERATED" | "LIVE" | "ARCHIVED";
  demo_mode: boolean;
  event: EventConfig;
  theme: ThemeConfig;
  modules: ModulesConfig;
  monetization: MonetizationConfig;
  labels?: Record<string, string>;
}

// Helper — checks if a module is enabled regardless of shape (boolean | {enabled: bool})
export function isModuleEnabled(mod: any): boolean {
  if (mod === undefined || mod === null) return false;
  if (typeof mod === 'boolean') return mod;
  return mod.enabled ?? false;
}
