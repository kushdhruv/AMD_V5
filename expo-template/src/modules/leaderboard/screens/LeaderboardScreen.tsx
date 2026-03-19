// ============================================================
// LEADERBOARD MODULE — Ranked teams with live score updates
// Visual: rank badges, score bars, sponsor slot, team details
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useDemoMode, useEventConfig } from '../../../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../../../components/UIKit';
import { AdSlot } from '../../../monetization/AdSlot';

// ── Types ──────────────────────────────────────────────────
interface TeamEntry {
  rank: number;
  teamName: string;
  college: string;
  members: number;
  score: number;
  maxScore: number;
  track: string;
  badge: string;
  trend: 'up' | 'down' | 'same';
  trendVal: number;
}

const DEMO_LEADERBOARD: TeamEntry[] = [
  { rank: 1, teamName: 'HabitatAI', college: 'VJTI Mumbai', members: 4, score: 2450, maxScore: 3000, track: 'AI/ML', badge: '🥇', trend: 'same', trendVal: 0 },
  { rank: 2, teamName: 'HealthBot', college: 'SPIT Mumbai', members: 3, score: 2210, maxScore: 3000, track: 'Healthcare Tech', badge: '🥈', trend: 'up', trendVal: 2 },
  { rank: 3, teamName: 'Edumate', college: 'ICT Mumbai', members: 4, score: 1980, maxScore: 3000, track: 'EdTech', badge: '🥉', trend: 'down', trendVal: 1 },
  { rank: 4, teamName: 'DevStorm', college: 'TSEC', members: 2, score: 1740, maxScore: 3000, track: 'Web Dev', badge: '4️⃣', trend: 'up', trendVal: 3 },
  { rank: 5, teamName: 'ByteForce', college: 'Thadomal', members: 3, score: 1520, maxScore: 3000, track: 'CyberSec', badge: '5️⃣', trend: 'same', trendVal: 0 },
  { rank: 6, teamName: 'Phoenix Rising', college: 'DJ Sanghvi', members: 4, score: 1380, maxScore: 3000, track: 'FinTech', badge: '6️⃣', trend: 'up', trendVal: 1 },
];

const TRACKS = ['All Tracks', 'AI/ML', 'Healthcare Tech', 'EdTech', 'Web Dev', 'CyberSec', 'FinTech'];

// ── Podium (top 3 visual) ──────────────────────────────────
function Podium({ top3 }: { top3: TeamEntry[] }) {
  const theme = useTheme();
  const heights = [80, 60, 40]; // visual heights for 1st, 2nd, 3rd
  const order = [top3[1], top3[0], top3[2]]; // 2nd | 1st | 3rd visual order

  return (
    <View style={styles.podium}>
      {order.map((team, idx) => {
        if (!team) return null;
        const podiumHeight = [heights[1], heights[0], heights[2]][idx];
        return (
          <View key={team.rank} style={styles.podiumItem}>
            <Text style={{ fontSize: 28, marginBottom: 4 }}>{team.badge}</Text>
            <ThemeText variant="caption" style={{ textAlign: 'center', fontWeight: '700' }}>
              {team.teamName}
            </ThemeText>
            <ThemeText variant="caption" secondary style={{ fontSize: 10 }}>
              {team.college.split(' ')[0]}
            </ThemeText>
            <View
              style={[
                styles.podiumBar,
                {
                  height: podiumHeight,
                  backgroundColor: [theme.secondary, theme.primary, theme.accent][idx] + '66',
                  borderTopColor: [theme.secondary, theme.primary, theme.accent][idx],
                  borderTopWidth: 2,
                  borderRadius: 4,
                },
              ]}
            >
              <ThemeText variant="label" style={{ color: [theme.secondary, theme.primary, theme.accent][idx] }}>
                {team.score}
              </ThemeText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Team Row ───────────────────────────────────────────────
function TeamRow({ team }: { team: TeamEntry }) {
  const theme = useTheme();
  const pct = Math.round((team.score / team.maxScore) * 100);
  const trendColor = team.trend === 'up' ? '#22C55E' : team.trend === 'down' ? '#EF4444' : theme.textSecondary;
  const trendIcon = team.trend === 'up' ? '↑' : team.trend === 'down' ? '↓' : '—';

  return (
    <ThemeCard style={[styles.teamRow, team.rank <= 3 && { borderLeftWidth: 3, borderLeftColor: theme.primary + '88' }]}>
      <View style={styles.teamMain}>
        <Text style={{ fontSize: 20, marginRight: 4 }}>{team.badge}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ThemeText variant="body" style={{ fontWeight: '700' }}>{team.teamName}</ThemeText>
            <ThemeBadge label={team.track} color={theme.accent} />
          </View>
          <ThemeText variant="caption" secondary>{team.college} · {team.members} members</ThemeText>

          {/* Score bar */}
          <View style={styles.scoreBartrack}>
            <View style={[styles.scoreBar, { width: `${pct}%`, backgroundColor: theme.primary }]} />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemeText variant="subheading" style={{ color: theme.primary }}>{team.score}</ThemeText>
          <Text style={{ color: trendColor, fontSize: 12, fontWeight: '700' }}>
            {trendIcon}{team.trendVal > 0 ? team.trendVal : ''}
          </Text>
        </View>
      </View>
    </ThemeCard>
  );
}

import { useLocalLeaderboard } from '../../../hooks/useLocalData';

// ── Main Screen ────────────────────────────────────────────
export function LeaderboardScreen() {
  const theme = useTheme();
  const isDemoMode = useDemoMode();
  const event = useEventConfig();
  const { data: localLeaderboard } = useLocalLeaderboard();

  const [activeTrack, setActiveTrack] = useState('All Tracks');
  const [allEntries, setAllEntries] = useState<TeamEntry[]>(
    isDemoMode ? DEMO_LEADERBOARD : []
  );

  React.useEffect(() => {
    if (localLeaderboard && localLeaderboard.length > 0) {
      // Stub mapping in case we have actual SQL data
      const mapped = (localLeaderboard as any[]).map((t, idx) => ({
        rank: idx + 1,
        teamName: t.name,
        college: 'Unknown',
        members: 4,
        score: t.score,
        maxScore: 3000,
        track: 'All Tracks',
        badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅',
        trend: 'same' as const,
        trendVal: 0
      }));
      setAllEntries(mapped);
    }
  }, [localLeaderboard]);

  const filtered = activeTrack === 'All Tracks'
    ? allEntries
    : allEntries.filter((t) => t.track === activeTrack);

  const top3 = allEntries.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Sponsored banner */}
        <AdSlot placement="leaderboard_top" />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <ThemeText variant="heading">🏆 Leaderboard</ThemeText>
          <ThemeText variant="caption" secondary>{event.name}</ThemeText>
          <ThemeBadge label="LIVE SCORES" color="#EF4444" />
        </View>

        {/* Podium */}
        {top3.length === 3 && <Podium top3={top3} />}

        {/* Track filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {TRACKS.map((track) => {
            const isActive = activeTrack === track;
            return (
              <TouchableOpacity
                key={track}
                onPress={() => setActiveTrack(track)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderRadius: theme.radius / 1.5,
                  },
                ]}
              >
                <Text style={{ color: isActive ? '#FFF' : theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  {track}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Rankings */}
        <View style={{ padding: 16 }}>
          <ThemeText variant="label" secondary style={{ marginBottom: 10 }}>
            {filtered.length} TEAM{filtered.length !== 1 ? 'S' : ''} · {activeTrack.toUpperCase()}
          </ThemeText>
          {filtered.map((team) => (
            <TeamRow key={team.rank} team={team} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🏁</Text>
              <ThemeText variant="body" secondary style={{ marginTop: 12 }}>
                No scores for this track yet.
              </ThemeText>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 16, gap: 4 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24, gap: 8 },
  podiumItem: { flex: 1, alignItems: 'center' },
  podiumBar: { width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 8, minHeight: 40 },
  chipRow: { maxHeight: 52, marginVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  teamRow: { marginBottom: 8 },
  teamMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBartrack: { height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 6 },
  scoreBar: { height: 4, borderRadius: 2 },
  empty: { alignItems: 'center', paddingVertical: 40 },
});
