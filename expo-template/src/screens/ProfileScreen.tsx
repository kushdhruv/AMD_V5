// ============================================================
// PROFILE SCREEN — User Identity, QR Ticket, Registrations, Stats
// ============================================================
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useEventConfig, useDemoMode } from '../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge, ThemeDivider, ThemeButton } from '../components/UIKit';
import { supabase } from '../services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useLocalRegistrations, useLocalUserTickets } from '../hooks/useLocalData';
import QRCode from 'react-native-qrcode-svg';

export default function ProfileScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const isDemoMode = useDemoMode();
  const [user, setUser] = useState<User | null>(null);
  const { data: allRegistrations } = useLocalRegistrations();
  const { data: userTickets } = useLocalUserTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
    });
  }, []);

  const myRegistrations = !isDemoMode && user 
    ? (allRegistrations as any[]).filter(r => r.user_id === user.id)
    : [];

  const myTickets = !isDemoMode && user
    ? (userTickets as any[]).filter(t => t.user_id === user.id)
    : [];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
            {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Guest User'}
          </ThemeText>
          <ThemeText variant="caption" secondary>{user?.email ?? 'Sign in to access your profile'}</ThemeText>
          <ThemeBadge label={`Attendee · ${event.name}`} color={theme.primary} />
        </ThemeCard>

        {/* ── Sign Out Button ────────────────────────── */}
        {user && (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <ThemeButton 
                    onPress={handleSignOut} 
                    variant="ghost" 
                    fullWidth
                    style={{ borderColor: '#FF444433', borderWidth: 1 }}
                >
                    <Text style={{ color: '#FF4444' }}>Sign Out</Text>
                </ThemeButton>
            </View>
        )}

        {/* ── QR Tickets ────────────────────────────── */}
        {user && myTickets.length > 0 ? (
          <View style={[styles.section, { marginTop: 0, marginBottom: 16 }]}>
            <ThemeText variant="subheading" style={{ marginBottom: 12 }}>My Tickets</ThemeText>
            {myTickets.map((ticket, idx) => (
              <ThemeCard key={idx} style={styles.ticketCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <ThemeText variant="label" secondary>TICKET ID: {ticket.id.slice(0, 8).toUpperCase()}</ThemeText>
                    
                    {ticket.status === 'successful' ? (
                      <>
                        <ThemeText variant="subheading" style={{ fontSize: 16 }}>{ticket.qr_code || 'VALID PASS'}</ThemeText>
                        <ThemeText variant="caption" style={{ color: '#10B981', marginTop: 4 }}>✅ VERIFIED & ACTIVE</ThemeText>
                      </>
                    ) : ticket.status === 'pending' ? (
                      <>
                        <ThemeText variant="subheading" style={{ fontSize: 16, color: '#F59E0B' }}>⏳ APPROVAL PENDING</ThemeText>
                        <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
                          UTR: {ticket.proof_utr?.toUpperCase() ?? 'WAITING'}
                        </ThemeText>
                      </>
                    ) : (
                      <>
                        <ThemeText variant="subheading" style={{ fontSize: 16, color: '#EF4444' }}>❌ PAYMENT REJECTED</ThemeText>
                        <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>Contact support for help.</ThemeText>
                      </>
                    )}
                  </View>

                  {ticket.status === 'successful' ? (
                    <TouchableOpacity
                      onPress={() => setSelectedTicket(ticket)}
                      style={[styles.qrBox, { backgroundColor: '#FFF', padding: 8, borderRadius: 12 }]}
                    >
                      <QRCode
                        value={ticket.qr_code || ticket.id}
                        size={64}
                        color="#000"
                        backgroundColor="#FFF"
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.qrBox, { backgroundColor: theme.primary + '11', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.primary + '33' }]}>
                       <Text style={{ fontSize: 24 }}>⏳</Text>
                    </View>
                  )}
                </View>
                {ticket.status === 'successful' && (
                  <>
                    <ThemeDivider />
                    <ThemeText variant="caption" secondary>Show this QR at the venue entry</ThemeText>
                  </>
                )}
              </ThemeCard>
            ))}
          </View>
        ) : (
          user && (
          <View style={[styles.section, { marginTop: 0, marginBottom: 16 }]}>
            <ThemeCard style={{ alignItems: 'center', padding: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.primary + '50' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎟️</Text>
              <ThemeText variant="subheading" style={{ textAlign: 'center' }}>No Tickets Yet</ThemeText>
              <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
                Purchase tickets from the Explore tab.
              </ThemeText>
            </ThemeCard>
          </View>
        )
      )}

        {/* ── Activity Stats ────────────────────────── */}
        {user && (
          <View style={styles.statsRow}>
            {[
              { label: 'Tickets', value: myTickets.length },
              { label: 'Registrations', value: myRegistrations.length },
              { label: 'Events', value: 1 },
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
            {myRegistrations.map((reg, idx) => (
              <ThemeCard key={idx} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <ThemeText variant="body">{reg.event || reg.event_name}</ThemeText>
                  <ThemeText variant="caption" secondary>{reg.category}</ThemeText>
                </View>
                <ThemeBadge label={reg.status} color="#10B981" />
              </ThemeCard>
            ))}
          </View>
        )}

        {!user && !isDemoMode && (
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

      {/* Ticket Modal for full screen QR scanning can be added here if needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  userCard: { margin: 16, alignItems: 'center' },
  avatarCircle: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  ticketCard: { marginHorizontal: 16, marginBottom: 8 },
  qrBox: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, alignItems: 'center' },
  section: { paddingHorizontal: 16, marginTop: 8 },
  signInPrompt: { alignItems: 'center', padding: 40 },
});
