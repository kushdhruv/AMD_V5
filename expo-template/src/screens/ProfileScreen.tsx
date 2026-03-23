// ============================================================
// PROFILE SCREEN — User Identity, QR Ticket, Registrations, Stats
// ============================================================
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useEventConfig, useDemoMode } from '../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge, ThemeDivider } from '../components/UIKit';

const DEMO_USER = {
  name: 'Alex Developer',
  email: 'alex@example.com',
  ticketId: 'TF2026-0042',
  registrations: [
    { event: 'Hackathon', category: 'Individual', status: 'Confirmed' },
    { event: 'Speaker Sessions', category: 'Pass', status: 'Confirmed' },
  ],
  stats: { eventsAttended: 5, votesCast: 3, stallViews: 12 },
};

export default function ProfileScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const isDemoMode = useDemoMode();
  const user = isDemoMode ? DEMO_USER : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">My Profile</ThemeText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── User Card ────────────────────────────── */}
        <ThemeCard style={styles.userCard} elevated>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary + '33', borderRadius: 999 }]}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <ThemeText variant="subheading" style={{ marginTop: 12 }}>
            {user?.name ?? 'Guest User'}
          </ThemeText>
          <ThemeText variant="caption" secondary>{user?.email ?? 'Sign in to access your profile'}</ThemeText>
          <ThemeBadge label={`Attendee · ${event.name}`} color={theme.primary} />
        </ThemeCard>

        {/* ── QR Ticket ────────────────────────────── */}
        {user && (
          <ThemeCard style={styles.ticketCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <ThemeText variant="label" secondary>YOUR TICKET</ThemeText>
                <ThemeText variant="subheading">{user.ticketId}</ThemeText>
              </View>
              <TouchableOpacity
                style={[styles.qrBox, { backgroundColor: theme.surface, borderRadius: theme.radius / 2 }]}
              >
                <Text style={{ fontSize: 48 }}>▦</Text>
              </TouchableOpacity>
            </View>
            <ThemeDivider />
            <ThemeText variant="caption" secondary>Tap QR code to expand for scanning</ThemeText>
          </ThemeCard>
        )}

        {/* ── Activity Stats ────────────────────────── */}
        {user && (
          <View style={styles.statsRow}>
            {[
              { label: 'Events', value: user.stats.eventsAttended },
              { label: 'Votes', value: user.stats.votesCast },
              { label: 'Stalls Seen', value: user.stats.stallViews },
            ].map((stat) => (
              <ThemeCard key={stat.label} style={styles.statCard}>
                <ThemeText variant="heading" style={{ color: theme.primary }}>{stat.value}</ThemeText>
                <ThemeText variant="caption" secondary>{stat.label}</ThemeText>
              </ThemeCard>
            ))}
          </View>
        )}

        {/* ── Registrations ─────────────────────────── */}
        {user && (
          <View style={[styles.section]}>
            <ThemeText variant="subheading" style={{ marginBottom: 12 }}>My Registrations</ThemeText>
            {user.registrations.map((reg, idx) => (
              <ThemeCard key={idx} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <ThemeText variant="body">{reg.event}</ThemeText>
                  <ThemeText variant="caption" secondary>{reg.category}</ThemeText>
                </View>
                <ThemeBadge label={reg.status} color="#10B981" />
              </ThemeCard>
            ))}
          </View>
        )}

        {!user && (
          <View style={styles.signInPrompt}>
            <Text style={{ fontSize: 48 }}>🔐</Text>
            <ThemeText variant="subheading" style={{ marginTop: 12 }}>Sign In Required</ThemeText>
            <ThemeText variant="body" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              Register or sign in to access your ticket, registrations, and stats.
            </ThemeText>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  userCard: { margin: 16, alignItems: 'center' },
  avatarCircle: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  ticketCard: { marginHorizontal: 16, marginBottom: 8 },
  qrBox: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, alignItems: 'center' },
  section: { paddingHorizontal: 16, marginTop: 8 },
  signInPrompt: { alignItems: 'center', padding: 40 },
});
