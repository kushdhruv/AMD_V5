import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { useLocalSpeakers } from '../../../hooks/useLocalData';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText } from '../../../components/UIKit';
import { UsersRound, Briefcase } from 'lucide-react-native';

export function SpeakersScreen() {
  const { data: speakers, loading, refetch } = useLocalSpeakers();
  const theme = useTheme();

  if (loading && speakers.length === 0) {
    return (
      <View style={styles.center}>
        <ThemeText variant="caption">Loading speakers...</ThemeText>
      </View>
    );
  }

  if (speakers.length === 0) {
    return (
      <View style={styles.center}>
        <UsersRound size={48} color={theme.textSecondary + '40'} />
        <ThemeText variant="subheading" style={{ marginTop: 16 }}>No Speakers Announced</ThemeText>
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
           The lineup for this event hasn't been announced yet. Check back soon.
        </ThemeText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <ThemeText variant="heading" style={{ fontSize: 32 }}>FEATURED</ThemeText>
        <ThemeText variant="heading" style={{ fontSize: 32, color: theme.primary }}>SPEAKERS</ThemeText>
      </View>

      <View style={styles.grid}>
        {speakers.map(speaker => (
          <View key={speaker.id} style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.avatarContainer, { borderColor: theme.primary + '30' }]}>
              {speaker.logo_url ? (
                <Image source={{ uri: speaker.logo_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '10' }]}>
                  <UsersRound size={40} color={theme.primary} />
                </View>
              )}
            </View>
            
            <ThemeText variant="subheading" style={styles.name}>{speaker.name}</ThemeText>
            
            {speaker.title && (
              <View style={styles.titleBadge}>
                <Briefcase size={12} color={theme.primary} style={{ marginRight: 6 }} />
                <ThemeText variant="caption" style={{ color: theme.primary, fontWeight: '700' }}>
                  {speaker.title}
                </ThemeText>
              </View>
            )}

            {speaker.bio && (
              <ThemeText variant="body" secondary style={styles.bio}>
                {speaker.bio}
              </ThemeText>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
    paddingVertical: 20,
  },
  grid: {
    gap: 24,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  avatarPlaceholder: {
    width: 116,
    height: 116,
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff05',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  bio: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  footer: {
    height: 100,
  }
});
