// ============================================================
// ZUSTAND STORE — Global config payload distribution.
// Selective subscriptions prevent unnecessary re-renders.
// ============================================================
import { create } from 'zustand';
import { AppConfig, isModuleEnabled } from '../types/config';
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

// ── Fallback Config Guard ──────────────────────────────────
// Ensures the App Shell NEVER crashes, even if AI hallucinated a corrupt JSON
const getSafeConfig = (raw: any): AppConfig => {
  return deepMerge(defaultConfig as unknown as Record<string, unknown>, raw || {}) as AppConfig;
};

export const useConfigStore = create<ConfigStore>((set, get) => ({
  config: defaultConfig as AppConfig,
  isLoaded: true,
  demoMode: defaultConfig.demo_mode,

  setConfig: (config) => set({ config, isLoaded: true }),

  patchConfig: (partial) =>
    set((state) => {
      // 🚨 BUILD FREEZE RULE 🚨
      // Structural App config (colors, modules, layout) MUST NOT mutate at runtime in Production.
      if (!state.demoMode) {
        throw new Error('[Build Freeze] Cannot mutate configuration at runtime in Production Mode.');
      }
      return { config: deepMerge(state.config, partial) as AppConfig };
    }),

  toggleDemoMode: (val) =>
    set((state) => ({
      demoMode: val,
      config: { ...state.config, demo_mode: val },
    })),

  getEnabledModules: () => {
    const { modules } = get().config;
    return Object.entries(modules)
      .filter(([, value]) => isModuleEnabled(value as boolean | { enabled: boolean }))
      .map(([key]) => key);
  },
}));

// Scoped hooks — use these instead of the full store for performance
// By using `getSafeConfig`, we guarantee `config.theme` or `config.modules` is NEVER undefined
export const useThemeConfig = () => useConfigStore((s) => getSafeConfig(s.config).theme);
export const useEventConfig = () => useConfigStore((s) => getSafeConfig(s.config).event);
export const useModulesConfig = () => useConfigStore((s) => getSafeConfig(s.config).modules);
export const useMonetizationConfig = () => useConfigStore((s) => getSafeConfig(s.config).monetization);
export const useDemoMode = () => useConfigStore((s) => s.demoMode);
export const useEnabledModules = () => useConfigStore((s) => s.getEnabledModules());
