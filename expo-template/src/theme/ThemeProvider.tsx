// ============================================================
// THEME PROVIDER — Zero hardcoded styles. Ever.
// All components consume this context for colors & typography.
// ============================================================
import React, { createContext, useContext } from 'react';
import { ThemeConfig } from '../types/config';

const ThemeContext = createContext<ThemeConfig | null>(null);

interface ThemeProviderProps {
  theme: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook — throws if used outside provider (safety guard)
export function useTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

// Pre-built theme presets — Aligned with new ThemeConfig
export const THEME_PRESETS: Record<string, ThemeConfig> = {
  neon_horizon: {
    primary_color: '#D946EF', // Fuchsia
    secondary_color: '#8B5CF6', // Violet
    primary: '#D946EF',
    secondary: '#8B5CF6',
    font_family: 'Space Grotesk',
    dark_mode_enabled: true,
    accent: '#22D3EE', // Cyan
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    radius: 20,
  },
  silk_ink: {
    primary_color: '#111827', // Charcoal
    secondary_color: '#F59E0B', // Amber
    primary: '#111827',
    secondary: '#F59E0B',
    font_family: 'Outfit',
    dark_mode_enabled: false,
    accent: '#B45309',
    background: '#FFFBEB', // Amber 50
    surface: '#FEF3C7', // Amber 100
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    radius: 4,
  },
  royal_velvet: {
    primary_color: '#FACC15', // Yellow 400 (Gold)
    secondary_color: '#1E1B4B', // Navy 950
    primary: '#FACC15',
    secondary: '#1E1B4B',
    font_family: 'Inter',
    dark_mode_enabled: true,
    accent: '#EAB308',
    background: '#020617', // Navy 1000
    surface: '#0F172A',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    radius: 12,
  },
  forest_mist: {
    primary_color: '#10B981', // Emerald
    secondary_color: '#064E3B', // Emerald 950
    primary: '#10B981',
    secondary: '#064E3B',
    font_family: 'Inter',
    dark_mode_enabled: true,
    accent: '#34D399',
    background: '#022C22', // Teal 1000
    surface: '#064E3B',
    textPrimary: '#F0FDF4',
    textSecondary: '#A7F3D0',
    radius: 16,
  },
  midnight_mono: {
    primary_color: '#FFFFFF',
    secondary_color: '#18181B',
    primary: '#FFFFFF',
    secondary: '#18181B',
    font_family: 'Space Grotesk',
    dark_mode_enabled: true,
    accent: '#3F3F46',
    background: '#000000',
    surface: '#09090B',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    radius: 4,
  },
  glacier_light: {
    primary_color: '#2563EB',
    secondary_color: '#EFF6FF',
    primary: '#2563EB',
    secondary: '#EFF6FF',
    font_family: 'Inter',
    dark_mode_enabled: false,
    accent: '#60A5FA',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    radius: 12,
  },
  oceanic_deep: {
    primary_color: '#0D9488',
    secondary_color: '#0F172A',
    primary: '#0D9488',
    secondary: '#0F172A',
    font_family: 'Outfit',
    dark_mode_enabled: true,
    accent: '#2DD4BF',
    background: '#020617',
    surface: '#010B13',
    textPrimary: '#E0F2F1',
    textSecondary: '#94A3B8',
    radius: 16,
  },
  sunset_glow: {
    primary_color: '#F97316',
    secondary_color: '#FB923C',
    primary: '#F97316',
    secondary: '#FB923C',
    font_family: 'Outfit',
    dark_mode_enabled: true,
    accent: '#7C3AED',
    background: '#1E1B4B',
    surface: '#2D1B4B',
    textPrimary: '#FFF7ED',
    textSecondary: '#FED7AA',
    radius: 20,
  },
  lavender_dream: {
    primary_color: '#8B5CF6',
    secondary_color: '#F5F3FF',
    primary: '#8B5CF6',
    secondary: '#F5F3FF',
    font_family: 'Outfit',
    dark_mode_enabled: false,
    accent: '#DDD6FE',
    background: '#FDFCFE',
    surface: '#F9F5FF',
    textPrimary: '#4C1D95',
    textSecondary: '#7C3AED',
    radius: 24,
  },
  royal_noir: {
    primary_color: '#EAB308',
    secondary_color: '#171717',
    primary: '#EAB308',
    secondary: '#171717',
    font_family: 'Outfit',
    dark_mode_enabled: true,
    accent: '#FDE047',
    background: '#0A0A0A',
    surface: '#111111',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    radius: 8,
  },
  cyber_pulse: {
    primary_color: '#FF2D55',
    secondary_color: '#000000',
    primary: '#FF2D55',
    secondary: '#000000',
    font_family: 'Space Grotesk',
    dark_mode_enabled: true,
    accent: '#00F2FF',
    background: '#050505',
    surface: '#0D0D0D',
    textPrimary: '#FAFAFA',
    textSecondary: '#71717A',
    radius: 0,
  },
  arctic_cloud: {
    primary_color: '#0F172A',
    secondary_color: '#F8FAFC',
    primary: '#0F172A',
    secondary: '#F8FAFC',
    font_family: 'Inter',
    dark_mode_enabled: false,
    accent: '#38BDF8',
    background: '#FFFFFF',
    surface: '#F1F5F9',
    textPrimary: '#020617',
    textSecondary: '#64748B',
    radius: 20,
  },
  deep_sea_teal: {
    primary_color: '#1E6F6B',
    secondary_color: '#020617',
    primary: '#1E6F6B',
    secondary: '#020617',
    font_family: 'Outfit',
    dark_mode_enabled: true,
    accent: '#5EEAD4',
    background: '#010409',
    surface: '#0D1117',
    textPrimary: '#E6EDF3',
    textSecondary: '#7D8590',
    radius: 12,
  },
  desert_stone: {
    primary_color: '#D97706',
    secondary_color: '#F5F5F4',
    primary: '#D97706',
    secondary: '#F5F5F4',
    font_family: 'Outfit',
    dark_mode_enabled: false,
    accent: '#FCD34D',
    background: '#FAF9F6',
    surface: '#F5F5F4',
    textPrimary: '#1C1917',
    textSecondary: '#57534E',
    radius: 14,
  },
};
