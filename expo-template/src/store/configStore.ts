// ============================================================
// ZUSTAND STORE — Global config payload distribution.
// Selective subscriptions prevent unnecessary re-renders.
// ============================================================
import { create } from 'zustand';
import { AppConfig, isModuleEnabled, ThemeConfig } from '../types/config';
import defaultConfig from '../config/config.json';

interface ConfigStore {
  config: AppConfig;
  isLoaded: boolean;
  demoMode: boolean;

  // Actions
  setConfig: (config: AppConfig) => void;
  patchConfig: (partial: Partial<AppConfig>) => void;
  toggleDemoMode: (val: boolean) => void;

  // Selectors (derived state for performance)
  getEnabledModules: () => string[];
}

// Deep merge utility for config patches from AI system
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(
        (target[key] as Record<string, unknown>) ?? {},
        source[key] as Record<string, unknown>
      );
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// ── Theme Mapping Engine ──────────────────────────────────
// Ensures all alias fields are populated (primary, secondary, background, etc.)
// IMPORTANT: If the config already has these fields (injected by configTransformer),
// we respect them. We only fill in missing values as a fallback.
const resolveTheme = (theme: ThemeConfig): ThemeConfig => {
  const isDark = theme.dark_mode_enabled;
  return {
    // Spread first — preserves all injected values from the transformer
    ...theme,
    // Only set aliases if missing (alias fields are injected by transformer)
    primary: theme.primary ?? theme.primary_color,
    secondary: theme.secondary ?? theme.secondary_color,
    accent: theme.accent ?? theme.primary_color,
    // Only fall back to defaults if the transformer didn't inject explicit values
    background: theme.background ?? (isDark ? '#0A0A0A' : '#F8FAFC'),
    surface: theme.surface ?? (isDark ? '#161616' : '#FFFFFF'),
    textPrimary: theme.textPrimary ?? (isDark ? '#FFFFFF' : '#0F172A'),
    textSecondary: (() => {
      if (!theme.textSecondary) return isDark ? '#A1A1AA' : '#64748B';
      
      // Robust check for "too dark" text in dark mode
      // If it's pure black or very close to it (e.g. #000000, #111111, #0a0a0a)
      const hex = theme.textSecondary.toLowerCase().replace('#', '');
      const isTooDark = isDark && (
        hex === '000000' || 
        hex === '0a0a0a' || 
        hex === '111111' ||
        hex.startsWith('000') // handle 3-char hex
      );

      return isTooDark ? '#A1A1AA' : theme.textSecondary;
    })(),
    radius: theme.radius ?? 16,
  };
};

// ── Fallback Config Guard ──────────────────────────────────
// Ensures the App Shell NEVER crashes, even if AI hallucinated a corrupt JSON
const getSafeConfig = (raw: any): AppConfig => {
  const merged = deepMerge(defaultConfig as unknown as Record<string, unknown>, raw || {}) as unknown as AppConfig;
  // Map the theme to granular values
  merged.theme = resolveTheme(merged.theme);

  // Compute event.dates if missing
  if (!merged.event.dates && merged.event.date_start) {
    const formatDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };
    
    const startStr = formatDate(merged.event.date_start);
    const endStr = merged.event.date_end ? formatDate(merged.event.date_end) : null;
    merged.event.dates = endStr && startStr !== endStr ? `${startStr} - ${endStr}` : startStr;
  }

  return merged;
};

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: getSafeConfig(defaultConfig),
  isLoaded: true,
  demoMode: false, // Internal state for builder updates

  setConfig: (config) => set({ config: getSafeConfig(config), isLoaded: true }),

  patchConfig: (partial) =>
    set((state) => {
      const newConfig = deepMerge(state.config as unknown as Record<string, unknown>, partial as unknown as Record<string, unknown>) as unknown as AppConfig;
      return { config: getSafeConfig(newConfig) };
    }),

  toggleDemoMode: (val) =>
    set((state) => ({
      demoMode: val,
      config: { ...state.config, demo_mode: val },
    })),

  getEnabledModules: () => {
    const { modules } = get().config;
    return Object.entries(modules || {})
      .filter(([, value]) => isModuleEnabled(value as any))
      .map(([key]) => key);
  },
}));

// Scoped hooks — use these instead of the full store for performance
export const useThemeConfig = () => useConfigStore((s) => s.config.theme);
export const useEventConfig = () => useConfigStore((s) => s.config.event);
export const useModulesConfig = () => useConfigStore((s) => s.config.modules);
export const useMonetizationConfig = () => useConfigStore((s) => s.config.monetization);
export const useDemoMode = () => useConfigStore((s) => s.demoMode);
export const useEnabledModules = () => useConfigStore((s) => s.getEnabledModules());
