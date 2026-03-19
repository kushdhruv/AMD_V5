// ============================================================
// ANNOUNCEMENTS MODULE — Live feed + Event Detail view
// Flow: AnnouncementFeed → EventDetailScreen
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useDemoMode, useEventConfig } from '../../../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../../../components/UIKit';
import { useLocalAnnouncements } from '../../../hooks/useLocalData';

// ── Types ──────────────────────────────────────────────────
type AnnouncementType = 'alert' | 'event' | 'result' | 'update';

interface Announcement {
  id: string;
  type: string; // The type string from DB
  title: string;
  body: string;
  created_at: string;
  is_pinned?: boolean | number;
  eventDetail?: EventDetail;
}

interface EventDetail {
  venue: string;
  duration: string;
  host: string;
  description: string;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  alert: { color: '#EF4444', icon: '🔴', label: 'ALERT' },
  event: { color: '#7C3AED', icon: '🎤', label: 'EVENT' },
  result: { color: '#F59E0B', icon: '🏆', label: 'RESULT' },
  update: { color: '#10B981', icon: '📢', label: 'UPDATE' },
  Alert: { color: '#EF4444', icon: '🔴', label: 'ALERT' },
  Event: { color: '#7C3AED', icon: '🎤', label: 'EVENT' },
  Result: { color: '#F59E0B', icon: '🏆', label: 'RESULT' },
  Update: { color: '#10B981', icon: '📢', label: 'UPDATE' },
};

// ── Event Detail Screen ────────────────────────────────────
function EventDetailView({
  announcement,
  onBack,
}: {
  announcement: Announcement;
  onBack: () => void;
}) {
  const theme = useTheme();
  const typeConf = TYPE_CONFIG[announcement.type];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
          <ThemeText variant="body" style={{ color: theme.primary }}>← Back</ThemeText>
        </TouchableOpacity>
        <ThemeBadge label={typeConf.label} color={typeConf.color} />
        <ThemeText variant="heading" style={{ marginTop: 8 }}>{announcement.title}</ThemeText>
        <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>{announcement.created_at || 'Just Now'}</ThemeText>
      </View>

      <View style={{ padding: 16 }}>
        <ThemeText variant="body" style={{ lineHeight: 24, marginBottom: 16 }}>
          {announcement.body}
        </ThemeText>

        {announcement.eventDetail && (
          <ThemeCard>
            <ThemeText variant="label" secondary style={{ marginBottom: 12 }}>EVENT DETAILS</ThemeText>
            {([
              ['📍 Venue', announcement.eventDetail.venue],
              ['⏱ Duration', announcement.eventDetail.duration],
              ['👤 Host', announcement.eventDetail.host],
            ] as [string, string][]).map(([label, value]) => (
              <View key={label} style={{ marginBottom: 10 }}>
                <ThemeText variant="caption" secondary>{label}</ThemeText>
                <ThemeText variant="body">{value}</ThemeText>
              </View>
            ))}
            <View style={{ marginTop: 8 }}>
              <ThemeText variant="caption" secondary style={{ marginBottom: 4 }}>About</ThemeText>
              <ThemeText variant="body" style={{ lineHeight: 22 }}>
                {announcement.eventDetail.description}
              </ThemeText>
            </View>
          </ThemeCard>
        )}

        <View style={{ height: 80 }} />
      </View>
    </ScrollView>
  );
}

// ── Main Feed Screen ───────────────────────────────────────
export function AnnouncementFeedScreen() {
  const theme = useTheme();
  const event = useEventConfig();
  const { data: localFeed, refetch } = useLocalAnnouncements();
  
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | AnnouncementType>('all');

  const filtered = activeFilter === 'all'
    ? localFeed
    : (localFeed as Announcement[]).filter((a) => a.type === activeFilter);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (selected) {
    return <EventDetailView announcement={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Announcements</ThemeText>
        <ThemeText variant="caption" secondary>{event.name}</ThemeText>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {(['all', 'alert', 'event', 'result', 'update'] as const).map((f) => {
          const conf = f === 'all' ? null : TYPE_CONFIG[f];
          const isActive = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? (conf?.color ?? theme.primary) + '22' : theme.surface,
                  borderColor: isActive ? (conf?.color ?? theme.primary) : 'transparent',
                  borderRadius: theme.radius / 1.5,
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text style={{ color: isActive ? (conf?.color ?? theme.primary) : theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                {f === 'all' ? '📋 All' : `${conf!.icon} ${conf!.label}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Pinned items first */}
        {(filtered as Announcement[])
          .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
          .map((ann) => {
            const typeConf = TYPE_CONFIG[ann.type || 'update'] || TYPE_CONFIG['update'];
            return (
              <TouchableOpacity
                key={ann.id}
                onPress={() => ann.eventDetail ? setSelected(ann) : null}
                activeOpacity={ann.eventDetail ? 0.8 : 1}
              >
                <ThemeCard
                  style={[
                    styles.announcementCard,
                    ann.is_pinned && { borderLeftWidth: 3, borderLeftColor: typeConf.color },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <ThemeBadge label={typeConf.label} color={typeConf.color} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {ann.is_pinned && <ThemeBadge label="PINNED" color={theme.textSecondary} />}
                      <ThemeText variant="caption" secondary>{ann.created_at || 'Just Now'}</ThemeText>
                    </View>
                  </View>
                  <ThemeText variant="subheading" style={{ marginTop: 6 }}>{ann.title}</ThemeText>
                  <ThemeText variant="body" secondary style={{ marginTop: 4 }}>
                    {ann.body}
                  </ThemeText>
                  {ann.eventDetail && (
                    <ThemeText variant="caption" style={{ color: theme.primary, marginTop: 8 }}>
                      View Details →
                    </ThemeText>
                  )}
                </ThemeCard>
              </TouchableOpacity>
            );
          })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <ThemeText variant="subheading" style={{ marginTop: 12 }}>No Announcements Yet</ThemeText>
            <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              Organizers will post updates here. Pull to refresh.
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
  chipRow: { maxHeight: 52, marginVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7 },
  announcementCard: { marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
