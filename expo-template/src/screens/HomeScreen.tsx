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
import { useTheme } from '../theme/ThemeProvider';
import { useEventConfig, useModulesConfig, useDemoMode } from '../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../components/UIKit';
import { AdSlot } from '../monetization/AdSlot';
import { isModuleEnabled } from '../types/config';
import { useNavigation } from '@react-navigation/native';

// No hardcoded demo data here anymore.


import { useLocalAnnouncements } from '../hooks/useLocalData';

// ── Screen ─────────────────────────────────────────────────
export default function HomeScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const modules = useModulesConfig();
  const isDemoMode = useDemoMode();

  const { data: liveAnnouncements, loading } = useLocalAnnouncements();
  const announcements = (liveAnnouncements as any[]).slice(0, 3).map((a: any) => ({
        id: a.id,
        title: a.title,
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <ThemeText variant="caption" secondary style={{ opacity: 0.8, letterSpacing: 1 }}>LIVE NOW</ThemeText>
          <ThemeText variant="heading" style={{ fontSize: 28, marginVertical: 2 }}>{event.name}</ThemeText>
          {(event.tagline || event.dates || event.venue) && (
            <ThemeText variant="caption" secondary numberOfLines={1}>
              {event.tagline || `${event.dates || ''}${event.dates && event.venue ? ' • ' : ''}${event.venue || ''}`}
            </ThemeText>
          )}
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

        <ThemeCard style={{ margin: 16 }} elevated>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeBadge label="HAPPENING NOW" color={theme.accent} />
          </View>
          <ThemeText variant="subheading" style={{ marginTop: 8 }}>
            {event.tagline || 'Browse the event schedule'}
          </ThemeText>
          <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
            {event.name || 'Enjoy the show!'}
          </ThemeText>
        </ThemeCard>

        <QuickActions />


        {/* ── Announcements ──────────────────────────── */}
        {isModuleEnabled(modules.announcements) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemeText variant="subheading">📢 Announcements</ThemeText>
              <TouchableOpacity>
                <ThemeText variant="caption" style={{ color: theme.primary }}>See All</ThemeText>
              </TouchableOpacity>
            </View>
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <ThemeCard key={a.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <ThemeText variant="body" style={{ flex: 1, marginRight: 8 }}>{a.title}</ThemeText>
                    <ThemeText variant="caption" secondary>{a.time}</ThemeText>
                  </View>
                </ThemeCard>
              ))
            ) : (
                <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginVertical: 20 }}>
                    No announcements yet.
                </ThemeText>
            )}
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
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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

function QuickActions() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const modules = useModulesConfig();

  const actions = [];
  if (isModuleEnabled(modules.commerce)) {
    actions.push({ id: 'stalls', label: 'Stalls', icon: '🏪', tab: 'Explore', subTab: 'Stalls' });
  }
  if (isModuleEnabled(modules.speakers)) {
    actions.push({ id: 'speakers', label: 'Speakers', icon: '🎙️', tab: 'Explore', subTab: 'Speakers' });
  }
  if (isModuleEnabled(modules.registration)) {
    actions.push({ id: 'tickets', label: 'Tickets', icon: '🎟️', tab: 'Explore', subTab: 'Tickets' });
  }

  if (actions.length === 0) return null;

  return (
    <View style={styles.quickActionsRow}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(action.tab, { initialTab: action.subTab })}
          style={[
            styles.quickAction,
            {
              backgroundColor: theme.surface,
              borderRadius: theme.radius,
              borderWidth: 1,
              borderColor: theme.primary + '11',
            }
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + '11' }]}>
            <Text style={{ fontSize: 24 }}>{action.icon}</Text>
          </View>
          <ThemeText variant="caption" style={{ fontWeight: '700', marginTop: 8 }}>{action.label}</ThemeText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
