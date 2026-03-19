// ============================================================
// HOME SCREEN — Structure-driven layout.
// All content binds to theme. AdSlots inject contextually.
// ============================================================
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useEventConfig, useModulesConfig, useDemoMode } from '../../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../../components/UIKit';
import { AdSlot } from '../../monetization/AdSlot';
import { isModuleEnabled } from '../../types/config';

// ── Demo Data ──────────────────────────────────────────────
const DEMO_ANNOUNCEMENTS = [
  { id: '1', title: '🎤 Opening Ceremony starts in 30 min', time: '10:00 AM' },
  { id: '2', title: '🚀 Hackathon submissions open now!', time: '11:00 AM' },
  { id: '3', title: '📢 Food stalls now open at Gate 2', time: '12:00 PM' },
];

const DEMO_QUICK_ACTIONS = [
  { label: 'My Ticket', icon: '🎫' },
  { label: 'Schedule', icon: '📅' },
  { label: 'Map', icon: '🗺️' },
  { label: 'Leaderboard', icon: '🏆' },
];

// ── Screen ─────────────────────────────────────────────────
export default function HomeScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const modules = useModulesConfig();
  const isDemoMode = useDemoMode();

  const announcements = isDemoMode ? DEMO_ANNOUNCEMENTS : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View>
          <ThemeText variant="caption" secondary>LIVE NOW</ThemeText>
          <ThemeText variant="heading">{event.name}</ThemeText>
          <ThemeText variant="caption" secondary>{event.dates} • {event.venue}</ThemeText>
        </View>
        <TouchableOpacity
          style={[styles.notifButton, { backgroundColor: theme.primary + '22', borderRadius: theme.radius / 2 }]}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Monetization: Home Banner ───────────────── */}
        <AdSlot placement="home_banner" />

        {/* ── Hero Card ──────────────────────────────── */}
        <ThemeCard style={{ margin: 16 }} elevated>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeBadge label="HAPPENING NOW" color={theme.accent} />
          </View>
          <ThemeText variant="subheading" style={{ marginTop: 8 }}>
            {isDemoMode ? '🚀 Hackathon Kickoff — Main Stage' : event.tagline}
          </ThemeText>
          <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
            {isDemoMode ? 'Starts in 15 minutes · Hall A' : 'Get started with the event'}
          </ThemeText>
        </ThemeCard>

        {/* ── Quick Actions ──────────────────────────── */}
        <View style={styles.quickActionsRow}>
          {DEMO_QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.quickAction,
                { backgroundColor: theme.surface, borderRadius: theme.radius / 1.5 },
              ]}
            >
              <Text style={{ fontSize: 22 }}>{action.icon}</Text>
              <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
                {action.label}
              </ThemeText>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Announcements ──────────────────────────── */}
        {isModuleEnabled(modules.announcements) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemeText variant="subheading">📢 Announcements</ThemeText>
              <TouchableOpacity>
                <ThemeText variant="caption" style={{ color: theme.primary }}>See All</ThemeText>
              </TouchableOpacity>
            </View>
            {announcements.map((a) => (
              <ThemeCard key={a.id} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <ThemeText variant="body" style={{ flex: 1, marginRight: 8 }}>{a.title}</ThemeText>
                  <ThemeText variant="caption" secondary>{a.time}</ThemeText>
                </View>
              </ThemeCard>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  notifButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
