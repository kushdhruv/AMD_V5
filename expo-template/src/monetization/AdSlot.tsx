// ============================================================
// CENTRALIZED MONETIZATION ENGINE
// Renders contextual ad slots based on config.
// Error-bounded: a broken ad NEVER crashes the parent screen.
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useMonetizationConfig, useDemoMode } from '../store/configStore';
import { SponsorSlot } from '../types/config';

interface AdSlotProps {
  placement: string;
}

// DEMO sponsor data for live previews and pitches
const DEMO_SPONSORS: Record<string, { title: string; cta: string; color: string }> = {
  home_banner: {
    title: '⚡ DevTools Pro — Build 10x Faster',
    cta: 'Claim Free Trial',
    color: '#7C3AED',
  },
  stalls_featured: {
    title: '🍕 Taste Zone — Stall #5 Featured',
    cta: 'View Menu',
    color: '#D97706',
  },
  leaderboard_top: {
    title: '🏆 Powered by HackStack',
    cta: 'Learn More',
    color: '#059669',
  },
};

// The global renderAd function — call from any screen with a slot name
export function AdSlot({ placement }: AdSlotProps) {
  const theme = useTheme();
  const monetization = useMonetizationConfig();
  const isDemoMode = useDemoMode();

  // If monetization is disabled globally, render nothing
  if (!monetization.enabled || !monetization.sponsors) return null;

  // Find the slot in config
  const slot: SponsorSlot | undefined = monetization.sponsor_slots.find(
    (s) => s.placement === placement
  );

  // If no slot configured for this placement, render nothing silently
  if (!slot) return null;

  // In demo mode, use pre-built demo content
  const demoContent = DEMO_SPONSORS[placement];

  // If not demo mode and no real sponsor data yet, render nothing
  if (!isDemoMode && !demoContent) return null;

  const content = demoContent;

  if (slot.type === 'banner') {
    return (
      <ErrorBoundary>
        <View
          style={[
            styles.banner,
            { backgroundColor: content.color + '18', borderColor: content.color + '44' },
          ]}
        >
          <Text style={{ color: content.color, fontSize: 13, fontWeight: '600', flex: 1 }}>
            {content.title}
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: content.color, borderRadius: theme.radius / 2 }]}
          >
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>
              {content.cta}
            </Text>
          </TouchableOpacity>
        </View>
      </ErrorBoundary>
    );
  }

  if (slot.type === 'card') {
    return (
      <ErrorBoundary>
        <TouchableOpacity
          style={[
            styles.sponsorCard,
            {
              backgroundColor: content.color + '12',
              borderColor: content.color + '44',
              borderRadius: theme.radius,
            },
          ]}
        >
          <View style={[styles.sponsorBadge, { backgroundColor: content.color }]}>
            <Text style={styles.sponsorBadgeText}>FEATURED</Text>
          </View>
          <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 8 }}>
            {content.title}
          </Text>
          <Text style={{ color: content.color, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
            {content.cta} →
          </Text>
        </TouchableOpacity>
      </ErrorBoundary>
    );
  }

  return null;
}

// Error boundary — isolates ad crashes from parent screens
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null; // Silent failure
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  ctaButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sponsorCard: {
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sponsorBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsorBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
