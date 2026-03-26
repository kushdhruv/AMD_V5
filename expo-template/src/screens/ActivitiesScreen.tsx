// ============================================================
// ACTIVITIES SCREEN — Dynamic top-tabs: Song Queue, Leaderboard, Voting
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, FlatList,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useModulesConfig, useDemoMode, useConfigStore } from '../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../components/UIKit';
import { AdSlot } from '../monetization/AdSlot';
import { isModuleEnabled } from '../types/config';
import { activityService } from '../services/activityService';

// No hardcoded demo data

import { TopTabBar } from './components/TopTabBar';
import { useLocalSongs, useLocalLeaderboard } from '../hooks/useLocalData';

// ── Song Queue ────────────────────────────────────────────
function SongQueueTab() {
  const theme = useTheme();
  const isDemoMode = useDemoMode();
  const { data: liveSongs } = useLocalSongs();
  const songs = (liveSongs as any[] || []).map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        votes: s.votes,
        nowPlaying: !!s.now_playing
      }));

  return (
    <ScrollView>
      {songs.length > 0 ? (
        songs.map((song) => (
          <ThemeCard
            key={song.id}
            style={[styles.songCard, song.nowPlaying ? { borderColor: theme.primary, borderWidth: 1.5 } : {}]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.songIcon, { backgroundColor: song.nowPlaying ? theme.primary : theme.surface, borderRadius: theme.radius / 2 }]}>
                <Text style={{ fontSize: 20 }}>{song.nowPlaying ? '▶️' : '🎵'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <ThemeText variant="subheading">{song.title}</ThemeText>
                <ThemeText variant="caption" secondary>{song.artist}</ThemeText>
                {song.nowPlaying && <ThemeBadge label="NOW PLAYING" color={theme.primary} />}
              </View>
              <TouchableOpacity style={[styles.upvoteBtn, { borderColor: theme.primary, borderRadius: theme.radius / 2 }]}>
                <Text>👍 {song.votes}</Text>
              </TouchableOpacity>
            </View>
          </ThemeCard>
        ))
      ) : (
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 40 }}>
          The song queue is currently empty.
        </ThemeText>
      )}
      {/* FAB: Request Song */}
      <View style={styles.fabArea}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>+ Request Song</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Leaderboard ───────────────────────────────────────────
function LeaderboardTab() {
  const theme = useTheme();
  const isDemoMode = useDemoMode();
  const { data: liveLeaderboard } = useLocalLeaderboard();
  const entries = (liveLeaderboard as any[] || []).map((l, idx) => ({
        rank: idx + 1,
        team: l.name,
        score: l.score,
        badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}️⃣`
      }));

  return (
    <ScrollView>
      <AdSlot placement="leaderboard_top" />
      {entries.length > 0 ? (
        entries.map((entry) => (
          <ThemeCard key={entry.rank} style={styles.leaderCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 26 }}>{entry.badge}</Text>
              <View style={{ flex: 1 }}>
                <ThemeText variant="subheading">{entry.team}</ThemeText>
              </View>
              <View style={[styles.scoreChip, { backgroundColor: theme.primary + '22', borderRadius: theme.radius / 2 }]}>
                <ThemeText variant="label" style={{ color: theme.primary }}>{entry.score} pts</ThemeText>
              </View>
            </View>
          </ThemeCard>
        ))
      ) : (
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 40 }}>
          Leaderboard will appear once scores are updated.
        </ThemeText>
      )}
    </ScrollView>
  );
}

// ── Voting ────────────────────────────────────────────────
function VotingTab() {
  const theme = useTheme();
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <ScrollView>
      <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 40 }}>
        No active polls at this time.
      </ThemeText>
    </ScrollView>
  );
}

// ── Screen ─────────────────────────────────────────────────
export default function ActivitiesScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();
  const eventId = useConfigStore((s) => s.config.id);

  const tabs: string[] = [];
  if (isModuleEnabled(modules.music)) tabs.push('Song Queue');
  if (isModuleEnabled(modules.leaderboard)) tabs.push('Leaderboard');
  if (isModuleEnabled(modules.voting)) tabs.push('Voting');

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Leaderboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    activityService.logActivity('view_tab', 'activities', eventId, { tab });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Activities</ThemeText>
      </View>
      {tabs.length > 1 && <TopTabBar tabs={tabs} active={activeTab} onSelect={handleTabChange} />}

      {activeTab === 'Song Queue' && <SongQueueTab />}
      {activeTab === 'Leaderboard' && <LeaderboardTab />}
      {activeTab === 'Voting' && <VotingTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  topTabBar: { flexDirection: 'row', paddingHorizontal: 8 },
  topTab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  songCard: { marginHorizontal: 16, marginBottom: 8 },
  songIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  upvoteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  fabArea: { padding: 20, alignItems: 'center' },
  fab: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, elevation: 8 },
  leaderCard: { marginHorizontal: 16, marginBottom: 8 },
  scoreChip: { paddingHorizontal: 12, paddingVertical: 6 },
  pollCard: { marginHorizontal: 16, marginBottom: 12 },
  pollOption: { borderWidth: 1.5, padding: 12, position: 'relative', overflow: 'hidden' },
  pollBar: { position: 'absolute', left: 0, top: 0, bottom: 0 },
});
