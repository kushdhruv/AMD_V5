// ============================================================
// CONFIG TYPES — Aligned with Frontend ConfigSchema.ts
// Single source of truth. Aligned with Zod schema from frontend.
// ============================================================

export interface EventConfig {
  name: string;
  tagline?: string;
  date_start?: string;
  date_end?: string;
  /** Computed field: derived from date_start/date_end in configStore.  Screens should read this. */
  dates?: string;
  venue?: string;
  logo_url?: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  dark_mode_enabled: boolean;
  // Derived / Utility colors (for UI components)
  primary: string; // Alias for primary_color
  secondary: string; // Alias for secondary_color
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  radius: number;
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
  music?: {
    enabled: boolean;
    sub_features: string[];
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
  id?: string;
  app_state: "DRAFT" | "PREVIEW" | "GENERATED" | "LIVE" | "ARCHIVED";
  event: EventConfig;
  theme: ThemeConfig;
  modules: ModulesConfig;
  monetization: MonetizationConfig;
  labels?: Record<string, string>;
  demo_mode?: boolean;
}

// Helper — checks if a module is enabled regardless of shape (boolean | {enabled: bool})
export function isModuleEnabled(
  mod: any
): boolean {
  if (mod === undefined || mod === null) return false;
  if (typeof mod === 'boolean') return mod;
  return mod.enabled ?? false;
}
