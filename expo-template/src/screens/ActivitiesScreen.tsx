// ============================================================
// ACTIVITIES SCREEN — Dynamic top-tabs: Song Queue, Leaderboard, Voting
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, FlatList,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useModulesConfig, useDemoMode } from '../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../components/UIKit';
import { AdSlot } from '../monetization/AdSlot';
import { isModuleEnabled } from '../types/config';

// ── Demo Data ──────────────────────────────────────────────
const DEMO_QUEUE = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', votes: 42, nowPlaying: true },
  { id: '2', title: 'Kesariya', artist: 'Arijit Singh', votes: 38, nowPlaying: false },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', votes: 27, nowPlaying: false },
];

const DEMO_LEADERBOARD = [
  { rank: 1, team: 'Team Phoenix', score: 2450, badge: '🥇' },
  { rank: 2, team: 'Code Ninjas', score: 2210, badge: '🥈' },
  { rank: 3, team: 'ByteForce', score: 1980, badge: '🥉' },
  { rank: 4, team: 'DevStorm', score: 1740, badge: '4️⃣' },
];

const DEMO_POLLS = [
  { id: '1', question: 'Best project in Web track?', options: ['HabitatAI', 'HealthBot', 'Edumate'], votes: [34, 21, 18] },
];
import { TopTabBar } from './components/TopTabBar';

// ── Song Queue ────────────────────────────────────────────
function SongQueueTab() {
  const theme = useTheme();
  const isDemoMode = useDemoMode();
  const songs = isDemoMode ? DEMO_QUEUE : [];

  return (
    <ScrollView>
      {songs.map((song) => (
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
      ))}
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
  const entries = isDemoMode ? DEMO_LEADERBOARD : [];

  return (
    <ScrollView>
      <AdSlot placement="leaderboard_top" />
      {entries.map((entry) => (
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
      ))}
    </ScrollView>
  );
}

// ── Voting ────────────────────────────────────────────────
function VotingTab() {
  const theme = useTheme();
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <ScrollView>
      {DEMO_POLLS.map((poll) => {
        const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
        return (
          <ThemeCard key={poll.id} style={styles.pollCard}>
            <ThemeText variant="subheading">{poll.question}</ThemeText>
            <View style={{ marginTop: 12, gap: 8 }}>
              {poll.options.map((option, idx) => {
                const pct = Math.round((poll.votes[idx] / totalVotes) * 100);
                const isSelected = voted === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setVoted(option)}
                    style={[styles.pollOption, {
                      borderColor: isSelected ? theme.primary : theme.textSecondary + '33',
                      borderRadius: theme.radius / 2,
                    }]}
                  >
                    <View style={[styles.pollBar, { width: `${pct}%`, backgroundColor: theme.primary + '33', borderRadius: theme.radius / 2 }]} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 }}>
                      <ThemeText variant="body">{option}</ThemeText>
                      <ThemeText variant="caption" secondary>{pct}%</ThemeText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ThemeCard>
        );
      })}
    </ScrollView>
  );
}

// ── Screen ─────────────────────────────────────────────────
export default function ActivitiesScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();

  const tabs: string[] = [];
  if (isModuleEnabled(modules.music)) tabs.push('Song Queue');
  if (modules.leaderboard) tabs.push('Leaderboard');
  if (modules.voting) tabs.push('Voting');

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Leaderboard');

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Activities</ThemeText>
      </View>
      {tabs.length > 1 && <TopTabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />}

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
