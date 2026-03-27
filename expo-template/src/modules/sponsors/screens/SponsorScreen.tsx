import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSponsors } from '../../../hooks/useLocalData';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText } from '../../../components/UIKit';
import { SponsorHero, SponsorGrid, SponsorRow } from '../components/SponsorDisplays';
import { Award } from 'lucide-react-native';

export function SponsorScreen() {
  const { data: sponsors, loading, refetch } = useLocalSponsors();
  const { theme } = useTheme();

  const platinum = sponsors.filter(s => s.tier === 'Platinum');
  const gold = sponsors.filter(s => s.tier === 'Gold');
  const silver = sponsors.filter(s => s.tier === 'Silver');

  if (loading && sponsors.length === 0) {
    return (
      <View style={styles.center}>
        <ThemeText variant="caption">Loading partners...</ThemeText>
      </View>
    );
  }

  if (sponsors.length === 0) {
    return (
      <View style={styles.center}>
        <Award size={48} color={theme.textSecondary + '40'} />
        <ThemeText variant="subheading" style={{ marginTop: 16 }}>No Active Partners</ThemeText>
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
           Sponsorship opportunities are currently closed or pending.
        </ThemeText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={theme.primaryColor} />}
    >
      {/* Platinum Section */}
      {platinum.length > 0 && (
        <View style={styles.section}>
          {platinum.map(s => <SponsorHero key={s.id} sponsor={s} />)}
        </View>
      )}

      {/* Gold Section */}
      {gold.length > 0 && (
        <View style={styles.section}>
          <ThemeText variant="subheading" style={styles.sectionTitle}>GOLD PARTNERS</ThemeText>
          <SponsorGrid sponsors={gold} />
        </View>
      )}

      {/* Silver Section */}
      {silver.length > 0 && (
        <View style={styles.section}>
          <ThemeText variant="subheading" style={styles.sectionTitle}>SUPPORTING PARTNERS</ThemeText>
          <SponsorRow sponsors={silver} />
        </View>
      )}

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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.6,
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
