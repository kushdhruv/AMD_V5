// ============================================================
// CONFIG TRANSFORMER
// Converts web AppConfig (Zod/Builder schema) → ExpoAppConfig
// (the shape that expo-template/src/config/config.json must have).
//
// This is the SINGLE source of truth for the schema mapping.
// Called by /api/build-expo before sending config to GitHub Actions.
// ============================================================

import { AppConfig } from './configSchema';

/**
 * ExpoAppConfig — the exact shape that the Expo mobile app reads from config.json.
 * Defined here so the transformer is self-documenting.
 */
export interface ExpoModulesConfig {
  registration: boolean;
  registration_fields: Array<{
    id: string;
    label: string;
    placeholder?: string;
    type: "text" | "number" | "email";
    required: boolean;
  }>;
  commerce: {
    enabled: boolean;
    sub_features: {
      menu_enabled: boolean;
      whatsapp_ordering: boolean;
      featured_stalls: boolean;
    };
  };
  announcements: boolean;
  music: {
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
    sub_features: {
      swipeable_cards: boolean;
      links_enabled: boolean;
    };
  };
}

export interface ExpoThemeConfig {
  primary_color: string;
  secondary_color: string;
  // Aliases — required by the Expo ThemeProvider
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  radius: number;
  font_family: string;
  dark_mode_enabled: boolean;
  preset?: string;
}

export interface ExpoAppConfig {
  project_id: string;     // ← The Supabase row UUID. This links the APK to its data.
  app_state: string;
  demo_mode: boolean;
  event: {
    name: string;
    tagline?: string;
    dates?: string;
    date_start?: string;
    date_end?: string;
    venue?: string;
    logo_url?: string;
  };
  theme: ExpoThemeConfig;
  modules: ExpoModulesConfig;
  monetization: {
    enabled: boolean;
    slots: any[];
  };
  labels?: Record<string, string>;
}

/**
 * Transforms a web AppConfig into an ExpoAppConfig ready for injection
 * into expo-template/src/config/config.json.
 *
 * @param webConfig - The AppConfig object from the web builder (Zod schema).
 * @param appId     - The Supabase project row ID for this specific app.
 * @returns         - ExpoAppConfig ready to be base64-encoded and sent to EAS.
 */
export function transformToExpoConfig(webConfig: AppConfig, appId: string): ExpoAppConfig {
  const theme = webConfig.theme;
  const isDark = theme.dark_mode_enabled;

  // Expo ThemeProvider needs explicit alias fields alongside the base color fields
  const expoTheme: ExpoThemeConfig = {
    primary_color: theme.primary_color,
    secondary_color: theme.secondary_color,
    primary: theme.primary_color,         // alias
    secondary: theme.secondary_color,     // alias
    accent: theme.accent ?? theme.primary_color,
    // If explicit background colors were provided (from theme presets), use them.
    // Otherwise fall back to light/dark defaults.
    background: theme.background ?? (isDark ? '#0A0A0A' : '#F8FAFC'),
    surface: theme.surface ?? (isDark ? '#161616' : '#FFFFFF'),
    textPrimary: theme.textPrimary ?? (isDark ? '#FFFFFF' : '#0F172A'),
    textSecondary: theme.textSecondary ?? (isDark ? '#A1A1AA' : '#64748B'),
    radius: theme.radius ?? 16,
    font_family: theme.font_family ?? 'Inter',
    dark_mode_enabled: isDark,
    preset: theme.preset,
  };

  const mods = webConfig.modules;

  // ── KEY MAPPING ──────────────────────────────────────────
  // Web: modules.songs (boolean)
  // Expo: modules.music { enabled, sub_features: string[] }
  const musicEnabled = mods.songs ?? false;

  const expoModules: ExpoModulesConfig = {
    registration: mods.registration ?? true,
    registration_fields: mods.registration_fields || [],
    commerce: {
      enabled: mods.commerce?.enabled ?? false,
      sub_features: {
        menu_enabled: mods.commerce?.sub_features?.menu_enabled ?? true,
        whatsapp_ordering: mods.commerce?.sub_features?.whatsapp_ordering ?? true,
        featured_stalls: mods.commerce?.sub_features?.featured_stalls ?? false,
      },
    },
    announcements: mods.announcements ?? true,
    // songs (web) → music (expo)
    music: {
      enabled: musicEnabled,
      sub_features: musicEnabled ? ['queue', 'upvote'] : [],
    },
    live_scores: mods.live_scores ?? false,
    leaderboard: mods.leaderboard ?? false,
    voting: mods.voting ?? false,
    lost_and_found: mods.lost_and_found ?? false,
    coupons: mods.coupons ?? false,
    event_info: mods.event_info ?? true,
    speakers: {
      enabled: mods.speakers?.enabled ?? false,
      sub_features: {
        swipeable_cards: mods.speakers?.sub_features?.swipeable_cards ?? true,
        links_enabled: mods.speakers?.sub_features?.links_enabled ?? true,
      },
    },
  };

  return {
    project_id: appId,    // The Supabase row UUID — links this APK to its data
    app_state: webConfig.app_state ?? 'GENERATED',
    demo_mode: false,
    event: {
      name: webConfig.event?.name ?? 'My Event',
      tagline: webConfig.event?.tagline,
      date_start: webConfig.event?.date_start,
      date_end: webConfig.event?.date_end,
      venue: webConfig.event?.venue,
      logo_url: webConfig.event?.logo_url,
    },
    theme: expoTheme,
    modules: expoModules,
    monetization: {
      enabled: webConfig.monetization?.enabled ?? false,
      slots: webConfig.monetization?.slots ?? [],
    },
    labels: webConfig.labels ?? {},
  };
}
