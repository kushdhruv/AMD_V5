import { z } from "zod";

// Base Event Details
export const EventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  tagline: z.string().optional(),
  date_start: z.string().optional(), // ISO string expected
  date_end: z.string().optional(),
  venue: z.string().optional(),
  logo_url: z.string().optional(),
});

// Sponsor Slot Definitions (Centralized Monetization)
export const SponsorSlotSchema = z.object({
  id: z.string().uuid(),
  placement: z.enum(["home_banner", "stalls_inline", "leaderboard_top", "notifications"]),
  type: z.enum(["banner", "logo", "text"]),
  priority: z.enum(["low", "medium", "high"]),
  sponsor_name: z.string().optional(),
  image_url: z.string().url().optional(),
  target_url: z.string().url().optional(),
});

export const MonetizationSchema = z.object({
  enabled: z.boolean().default(false),
  slots: z.array(SponsorSlotSchema).max(10, "Maximum of 10 sponsor slots allowed").default([]),
});

// App Theme
export const ThemeSchema = z.object({
  primary_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color").default("#000000"),
  secondary_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid Hex Color").default("#ffffff"),
  font_family: z.enum(["Inter", "Roboto", "Outfit", "Space Grotesk"]).default("Inter"),
  dark_mode_enabled: z.boolean().default(true),
});

// Sub-feature options for complex modules
export const CommerceSubfeatures = z.object({
  menu_enabled: z.boolean().default(true),
  whatsapp_ordering: z.boolean().default(true),
  featured_stalls: z.boolean().default(false),
});

export const SpeakerProfileSubfeatures = z.object({
  swipeable_cards: z.boolean().default(true),
  links_enabled: z.boolean().default(true),
});

// Module Toggles
export const ModulesSchema = z.object({
  registration: z.boolean().default(true),
  commerce: z.object({
    enabled: z.boolean().default(false),
    sub_features: CommerceSubfeatures.default({ menu_enabled: true, whatsapp_ordering: true, featured_stalls: false }),
  }).default({ enabled: false, sub_features: { menu_enabled: true, whatsapp_ordering: true, featured_stalls: false } }),
  announcements: z.boolean().default(true),
  live_scores: z.boolean().default(false),
  leaderboard: z.boolean().default(false),
  voting: z.boolean().default(false),
  lost_and_found: z.boolean().default(false),
  coupons: z.boolean().default(false),
  event_info: z.boolean().default(true),
  speakers: z.object({
    enabled: z.boolean().default(false),
    sub_features: SpeakerProfileSubfeatures.default({ swipeable_cards: true, links_enabled: true }),
  }).default({ enabled: false, sub_features: { swipeable_cards: true, links_enabled: true } }),
});

// The absolute source of truth payload
export const AppConfigSchema = z.object({
  id: z.string().uuid().optional(), // Provided by DB
  app_state: z.enum(["DRAFT", "PREVIEW", "GENERATED", "LIVE", "ARCHIVED"]).default("DRAFT"),
  event: EventSchema,
  theme: ThemeSchema.default({ primary_color: "#000000", secondary_color: "#ffffff", font_family: "Inter", dark_mode_enabled: true }),
  modules: ModulesSchema.default({
    registration: true, commerce: { enabled: false, sub_features: { menu_enabled: true, whatsapp_ordering: true, featured_stalls: false } },
    announcements: true, live_scores: false, leaderboard: false, voting: false, lost_and_found: false, coupons: false, event_info: true, 
    speakers: { enabled: false, sub_features: { swipeable_cards: true, links_enabled: true } }
  }),
  monetization: MonetizationSchema.default({ enabled: false, slots: [] }),
  labels: z.record(z.string(), z.string()).optional().default({}), // Dynamic string overrides (e.g. "Stalls" -> "Food Court")
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
