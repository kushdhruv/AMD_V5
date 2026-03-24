// ============================================================
// SONG QUEUE MODULE — Full interactive song request & voting
// Flow: Queue View → Request Song Modal → Upvote System
// ============================================================
import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, TextInput,
  StyleSheet, Modal, Animated,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useDemoMode, useConfigStore } from '../../../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge, ThemeButton } from '../../../components/UIKit';
import { activityService } from '../../../services/activityService';

// ── Types ──────────────────────────────────────────────────
interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  votes: number;
  hasVoted: boolean;
  nowPlaying: boolean;
  status: 'playing' | 'queued' | 'played';
}

// ── Initial demo queue ─────────────────────────────────────
const INITIAL_QUEUE: SongRequest[] = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', requestedBy: 'Dhruv P.', votes: 42, hasVoted: false, nowPlaying: true, status: 'playing' },
  { id: '2', title: 'Kesariya', artist: 'Arijit Singh', requestedBy: 'Priya M.', votes: 38, hasVoted: false, nowPlaying: false, status: 'queued' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', requestedBy: 'Rahul S.', votes: 27, hasVoted: true, nowPlaying: false, status: 'queued' },
  { id: '4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman', requestedBy: 'Anjali K.', votes: 19, hasVoted: false, nowPlaying: false, status: 'queued' },
];

// ── Now Playing Card (hero) ────────────────────────────────
function NowPlayingCard({ song }: { song: SongRequest }) {
  const theme = useTheme();
  return (
    <View style={[styles.nowPlayingCard, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '44' }]}>
      <View style={[styles.visualizerBar, { backgroundColor: theme.primary }]} />
      <View style={{ flex: 1, paddingLeft: 16 }}>
        <ThemeBadge label="▶ NOW PLAYING" color={theme.primary} />
        <ThemeText variant="heading" style={{ marginTop: 6 }}>{song.title}</ThemeText>
        <ThemeText variant="body" secondary>{song.artist}</ThemeText>
        <ThemeText variant="caption" secondary style={{ marginTop: 4 }}>
          Requested by {song.requestedBy}
        </ThemeText>
      </View>
      <Text style={{ fontSize: 36 }}>🎵</Text>
    </View>
  );
}

// ── Queue Item ─────────────────────────────────────────────
function QueueItem({
  song,
  rank,
  onVote,
}: {
  song: SongRequest;
  rank: number;
  onVote: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <ThemeCard style={styles.queueItem}>
      <View style={styles.queueRow}>
        {/* Rank */}
        <View style={[styles.rankBadge, { backgroundColor: theme.surface }]}>
          <ThemeText variant="caption" secondary>#{rank}</ThemeText>
        </View>

        {/* Song info */}
        <View style={{ flex: 1 }}>
          <ThemeText variant="body">{song.title}</ThemeText>
          <ThemeText variant="caption" secondary>{song.artist} · by {song.requestedBy}</ThemeText>
        </View>

        {/* Vote button */}
        <TouchableOpacity
          onPress={() => !song.hasVoted && onVote(song.id)}
          style={[
            styles.voteBtn,
            {
              backgroundColor: song.hasVoted ? theme.primary : theme.primary + '18',
              borderRadius: theme.radius / 2,
            },
          ]}
        >
          <Text style={{ fontSize: 14 }}>{song.hasVoted ? '👍' : '👍'}</Text>
          <ThemeText
            variant="label"
            style={{ color: song.hasVoted ? '#FFF' : theme.primary, marginLeft: 4 }}
          >
            {song.votes}
          </ThemeText>
        </TouchableOpacity>
      </View>
    </ThemeCard>
  );
}

// ── Request Song Modal ─────────────────────────────────────
function RequestSongModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, artist: string) => void;
}) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), artist.trim() || 'Unknown Artist');
    setTitle('');
    setArtist('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          <View style={styles.sheetHandle} />
          <ThemeText variant="subheading" style={{ marginBottom: 20 }}>🎵 Request a Song</ThemeText>

          <ThemeText variant="label" secondary style={{ marginBottom: 6 }}>SONG TITLE *</ThemeText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Tum Hi Ho"
            placeholderTextColor={theme.textSecondary + '80'}
            style={[styles.input, {
              backgroundColor: theme.background,
              borderColor: theme.textSecondary + '33',
              borderRadius: theme.radius / 1.5,
              color: theme.textPrimary,
              marginBottom: 16,
            }]}
          />

          <ThemeText variant="label" secondary style={{ marginBottom: 6 }}>ARTIST (OPTIONAL)</ThemeText>
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder="e.g. Arijit Singh"
            placeholderTextColor={theme.textSecondary + '80'}
            style={[styles.input, {
              backgroundColor: theme.background,
              borderColor: theme.textSecondary + '33',
              borderRadius: theme.radius / 1.5,
              color: theme.textPrimary,
              marginBottom: 24,
            }]}
          />

          <ThemeButton onPress={handleSubmit} fullWidth disabled={!title.trim()}>
            Submit Request ✓
          </ThemeButton>
          <View style={{ height: 10 }} />
          <ThemeButton onPress={onClose} variant="ghost" fullWidth>Cancel</ThemeButton>
        </View>
      </View>
    </Modal>
  );
}

import { useLocalSongs } from '../../../hooks/useLocalData';

// ── Main Screen ────────────────────────────────────────────
export function SongQueueScreen() {
  const theme = useTheme();
  const isDemoMode = useDemoMode();
  const { data: localSongs, refetch } = useLocalSongs();
  const eventId = useConfigStore((s) => s.config.id);

  const [queue, setQueue] = useState<SongRequest[]>(
    isDemoMode ? INITIAL_QUEUE : []
  );
  const [showModal, setShowModal] = useState(false);

  // Hydrate from SQLite if present
  React.useEffect(() => {
    if (localSongs && localSongs.length > 0) {
      const mapped = (localSongs as any[]).map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        requestedBy: 'Guest',
        votes: s.votes,
        hasVoted: false,
        nowPlaying: s.now_playing === 1,
        status: s.now_playing === 1 ? 'playing' : 'queued'
      })) as SongRequest[];
      setQueue(mapped);
    }
  }, [localSongs]);

  const nowPlaying = queue.find((s) => s.status === 'playing');
  const queued = queue
    .filter((s) => s.status === 'queued')
    .sort((a, b) => b.votes - a.votes);

  const handleVote = (id: string) => {
    const song = queue.find(s => s.id === id);
    if (!song) return;

    activityService.logActivity('upvote_song', 'music', eventId, { 
        songId: id, 
        songTitle: song.title,
    });

    setQueue((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, votes: s.votes + 1, hasVoted: true } : s
      )
    );
  };

  const handleAddRequest = (title: string, artist: string) => {
    const newSong: SongRequest = {
      id: Date.now().toString(),
      title,
      artist,
      requestedBy: 'You',
      votes: 1,
      hasVoted: true,
      nowPlaying: false,
      status: 'queued',
    };

    activityService.logActivity('request_song', 'music', eventId, { 
        songTitle: title, 
        artist,
    });

    setQueue((prev) => [...prev, newSong]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Now Playing */}
        {nowPlaying && (
          <View style={{ padding: 16 }}>
            <NowPlayingCard song={nowPlaying} />
          </View>
        )}

        {/* Queue */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={styles.sectionHeader}>
            <ThemeText variant="subheading">Up Next ({queued.length})</ThemeText>
            <ThemeText variant="caption" secondary>Vote to push songs up ↑</ThemeText>
          </View>

          {queued.map((song, index) => (
            <QueueItem
              key={song.id}
              song={song}
              rank={index + 1}
              onVote={handleVote}
            />
          ))}

          {queued.length === 0 && !isDemoMode && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🎶</Text>
              <ThemeText variant="body" secondary style={{ marginTop: 12, textAlign: 'center' }}>
                No songs in queue. Request the first one!
              </ThemeText>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>+ Request Song</Text>
      </TouchableOpacity>

      <RequestSongModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  visualizerBar: { width: 4, height: '100%', borderRadius: 2, minHeight: 60 },
  queueItem: { marginBottom: 8 },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  voteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  fab: { position: 'absolute', bottom: 24, alignSelf: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, elevation: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#555', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  input: { padding: 14, borderWidth: 1.5, fontSize: 14 },
});
