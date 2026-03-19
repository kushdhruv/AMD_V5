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

// Pre-built theme presets
export const THEME_PRESETS: Record<string, Omit<ThemeConfig, 'fontFamily'>> = {
  tech_fest: {
    primary: '#7C3AED',
    secondary: '#4F46E5',
    accent: '#06B6D4',
    background: '#0A0A0A',
    surface: '#141414',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    radius: 16,
  },
  cultural_fest: {
    primary: '#D97706',
    secondary: '#DC2626',
    accent: '#F59E0B',
    background: '#1C0A00',
    surface: '#2D1B00',
    textPrimary: '#FFFBEB',
    textSecondary: '#D6B980',
    radius: 20,
  },
  corporate: {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#0EA5E9',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    radius: 8,
  },
  hackathon: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    background: '#020617',
    surface: '#0F172A',
    textPrimary: '#F0FDF4',
    textSecondary: '#6EE7B7',
    radius: 12,
  },
};
