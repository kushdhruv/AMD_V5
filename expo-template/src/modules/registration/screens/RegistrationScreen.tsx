// ============================================================
// REGISTRATION MODULE — Form → Confirmation → QR Ticket
// Flow: RegistrationForm → Success → QR Ticket View
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useEventConfig, useDemoMode } from '../../../store/configStore';
import { ThemeText, ThemeButton, ThemeCard, ThemeBadge } from '../../../components/UIKit';

// ── Types ──────────────────────────────────────────────────
interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  college: string;
  category: 'individual' | 'team';
  teamName?: string;
  teamSize?: string;
}

type RegistrationStep = 'form' | 'confirmation' | 'ticket';

const EVENT_CATEGORIES: any[] = []; // Admin needs to configure these


// ── Form Field ─────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, keyboardType = 'default',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <ThemeText variant="label" secondary style={{ marginBottom: 6 }}>{label}</ThemeText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary + '80'}
        keyboardType={keyboardType}
        style={[styles.input, {
          backgroundColor: theme.surface,
          borderColor: theme.textSecondary + '33',
          borderRadius: theme.radius / 1.5,
          color: theme.textPrimary,
        }]}
      />
    </View>
  );
}

// ── QR Ticket View ─────────────────────────────────────────
function TicketView({ data, eventName, ticketId }: { data: RegistrationData; eventName: string; ticketId: string }) {
  const theme = useTheme();
  return (
    <View style={styles.ticketContainer}>
      <ThemeCard elevated style={styles.ticket}>
        {/* Header ribbon */}
        <View style={[styles.ticketHeader, { backgroundColor: theme.primary }]}>
          <ThemeText variant="subheading" style={{ color: '#FFF' }}>{eventName}</ThemeText>
          <ThemeBadge label="CONFIRMED ✓" color="#22C55E" />
        </View>

        {/* QR Code placeholder (would integrate a real QR lib in prod) */}
        <View style={[styles.qrPlaceholder, { borderColor: theme.primary + '44' }]}>
          <Text style={{ fontSize: 72, lineHeight: 80 }}>▦</Text>
          <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
            Ticket ID: {ticketId}
          </ThemeText>
        </View>

        {/* Attendee info */}
        <View style={styles.attendeeInfo}>
          <View style={styles.infoRow}>
            <ThemeText variant="caption" secondary>Name</ThemeText>
            <ThemeText variant="body">{data.name}</ThemeText>
          </View>
          <View style={styles.infoRow}>
            <ThemeText variant="caption" secondary>Email</ThemeText>
            <ThemeText variant="body">{data.email}</ThemeText>
          </View>
          <View style={styles.infoRow}>
            <ThemeText variant="caption" secondary>College</ThemeText>
            <ThemeText variant="body">{data.college}</ThemeText>
          </View>
          {data.teamName && (
            <View style={styles.infoRow}>
              <ThemeText variant="caption" secondary>Team</ThemeText>
              <ThemeText variant="body">{data.teamName} ({data.teamSize} members)</ThemeText>
            </View>
          )}
        </View>

        {/* Dashed divider (ticket tear line) */}
        <View style={[styles.tearLine, { borderColor: theme.textSecondary + '33' }]}>
          <View style={[styles.tearDot, { backgroundColor: theme.background, left: -16 }]} />
          <View style={[styles.tearDot, { backgroundColor: theme.background, right: -16 }]} />
        </View>

        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 8 }}>
          Show this QR code at the entrance. Valid once.
        </ThemeText>
      </ThemeCard>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
export function RegistrationScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const isDemoMode = useDemoMode();

  const [step, setStep] = useState<RegistrationStep>('form');
  const [selectedCategory, setSelectedCategory] = useState(EVENT_CATEGORIES[0].id);
  const [isTeam, setIsTeam] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    college: '',
    category: 'individual',
    teamName: '',
    teamSize: '',
  });
  const [ticketId] = useState(`TF2026-${Math.floor(1000 + Math.random() * 9000)}`);

  const update = (key: keyof RegistrationData, val: string) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.college) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }
    setStep('confirmation');
  };

  if (step === 'ticket') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <ThemeText variant="heading">Your Ticket 🎫</ThemeText>
        </View>
        <TicketView data={formData} eventName={event.name} ticketId={ticketId} />
        <View style={{ padding: 16, marginTop: 8 }}>
          <ThemeButton onPress={() => setStep('form')} variant="ghost" fullWidth>
            Register for Another Event
          </ThemeButton>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    );
  }

  if (step === 'confirmation') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <ThemeText variant="heading">Confirm Registration</ThemeText>
        </View>
        <View style={{ padding: 16 }}>
          <ThemeCard elevated style={{ marginBottom: 16 }}>
            <ThemeText variant="subheading" style={{ marginBottom: 12 }}>Summary</ThemeText>
            <View style={styles.infoRow}>
              <ThemeText variant="caption" secondary>Event</ThemeText>
              <ThemeText variant="body">{event.name}</ThemeText>
            </View>
            <View style={styles.infoRow}>
              <ThemeText variant="caption" secondary>Category</ThemeText>
              <ThemeText variant="body">{EVENT_CATEGORIES.find(c => c.id === selectedCategory)?.label}</ThemeText>
            </View>
            <View style={styles.infoRow}>
              <ThemeText variant="caption" secondary>Name</ThemeText>
              <ThemeText variant="body">{formData.name}</ThemeText>
            </View>
            <View style={styles.infoRow}>
              <ThemeText variant="caption" secondary>College</ThemeText>
              <ThemeText variant="body">{formData.college}</ThemeText>
            </View>
            {formData.teamName && (
              <View style={styles.infoRow}>
                <ThemeText variant="caption" secondary>Team</ThemeText>
                <ThemeText variant="body">{formData.teamName}</ThemeText>
              </View>
            )}
          </ThemeCard>

          <ThemeButton onPress={() => setStep('ticket')} fullWidth>
            ✅ Confirm & Get Ticket
          </ThemeButton>
          <View style={{ height: 12 }} />
          <ThemeButton onPress={() => setStep('form')} variant="ghost" fullWidth>
            Edit Details
          </ThemeButton>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Register</ThemeText>
        <ThemeText variant="caption" secondary>{event.name || 'Event Registration'}</ThemeText>
      </View>


      <View style={{ padding: 16 }}>
        {/* Category selection */}
        {EVENT_CATEGORIES.length > 0 ? (
          <>
            <ThemeText variant="label" secondary style={{ marginBottom: 10 }}>SELECT CATEGORY</ThemeText>
            <View style={{ gap: 8, marginBottom: 24 }}>
              {EVENT_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setIsTeam(cat.type === 'team');
                      setFormData(p => ({ ...p, category: cat.type }));
                    }}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isActive ? theme.primary + '18' : theme.surface,
                        borderColor: isActive ? theme.primary : theme.textSecondary + '22',
                        borderRadius: theme.radius / 1.5,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{cat.label.split(' ')[0]}</Text>
                    <ThemeText variant="body" style={{ flex: 1, marginLeft: 8 }}>
                      {cat.label.split(' ').slice(1).join(' ')}
                    </ThemeText>
                    {cat.price > 0 ? (
                      <ThemeBadge label={`₹${cat.price}`} color={theme.primary} />
                    ) : (
                      <ThemeBadge label="FREE" color="#22C55E" />
                    ) }
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <ThemeCard style={{ marginBottom: 24, padding: 20, alignItems: 'center' }}>
            <ThemeText variant="body" secondary>Registration options are not available yet.</ThemeText>
          </ThemeCard>
        )}

        {/* Personal info */}
        <Field label="Full Name *" value={formData.name} onChange={(v) => update('name', v)} placeholder="Dhruv Patel" />
        <Field label="Email Address *" value={formData.email} onChange={(v) => update('email', v)} placeholder="you@college.ac.in" keyboardType="email-address" />
        <Field label="Phone Number *" value={formData.phone} onChange={(v) => update('phone', v)} placeholder="+91 98765 43210" keyboardType="phone-pad" />
        <Field label="College / Institution *" value={formData.college} onChange={(v) => update('college', v)} placeholder="VJTI Mumbai" />

        {/* Team details (conditional) */}
        {isTeam && (
          <>
            <ThemeText variant="label" secondary style={{ marginBottom: 10, marginTop: 8 }}>TEAM DETAILS</ThemeText>
            <Field label="Team Name" value={formData.teamName ?? ''} onChange={(v) => update('teamName', v)} placeholder="Phoenix Rising" />
            <Field label="Team Size" value={formData.teamSize ?? ''} onChange={(v) => update('teamSize', v)} placeholder="2-4 members" keyboardType="phone-pad" />
          </>
        )}

        <ThemeButton onPress={handleSubmit} fullWidth style={{ marginTop: 8 }}>
          Continue to Review →
        </ThemeButton>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  input: { padding: 14, borderWidth: 1.5, fontSize: 14 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.5 },
  ticketContainer: { padding: 16 },
  ticket: { overflow: 'hidden', padding: 0 },
  ticketHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qrPlaceholder: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 },
  attendeeInfo: { padding: 16, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tearLine: { borderTopWidth: 1.5, borderStyle: 'dashed', marginHorizontal: 16, marginTop: 12, position: 'relative', height: 1 },
  tearDot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, top: -10 },
});
