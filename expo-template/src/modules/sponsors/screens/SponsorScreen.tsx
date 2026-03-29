import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSponsors } from '../../../hooks/useLocalData';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText } from '../../../components/UIKit';
import { useMonetizationConfig } from '../../../store/configStore';
import { SponsorHero, SponsorGrid, SponsorRow } from '../components/SponsorDisplays';
import { Award } from 'lucide-react-native';

export function SponsorScreen() {
  const { data: sponsors, loading, refetch } = useLocalSponsors();
  const theme = useTheme();

  // Tier mapping (case-insensitive)
  const platinum = sponsors.filter((s: any) => s.tier?.toLowerCase() === 'platinum');
  const gold = sponsors.filter((s: any) => s.tier?.toLowerCase() === 'gold');
  const silver = sponsors.filter((s: any) => s.tier?.toLowerCase() === 'silver');

  // Fallback: If no sponsors in DB, check Monetization Config from App Builder
  const monetization = useMonetizationConfig();
  const configSponsors = (monetization.slots || [])
    .filter((slot: any) => slot.sponsor_name && slot.image_url)
    .map((slot: any) => ({
      id: slot.id,
      name: slot.sponsor_name,
      logo_url: slot.image_url,
      website_url: slot.target_url,
      tier: slot.priority === 'high' ? 'Platinum' : (slot.priority === 'medium' ? 'Gold' : 'Silver'),
      description: `Official ${slot.priority} Priority Partner`
    }));

  const allPlatinum = [...platinum, ...configSponsors.filter((s: any) => s.tier === 'Platinum')];
  const allGold = [...gold, ...configSponsors.filter((s: any) => s.tier === 'Gold')];
  const allSilver = [...silver, ...configSponsors.filter((s: any) => s.tier === 'Silver')];

  if (loading && sponsors.length === 0) {
    return (
      <View style={styles.center}>
        <ThemeText variant="caption">Loading partners...</ThemeText>
      </View>
    );
  }

  if (sponsors.length === 0 && configSponsors.length === 0) {
    return (
      <View style={styles.center}>
        <Award size={48} color={theme.textSecondary + '40'} />
        <ThemeText variant="subheading" style={{ marginTop: 16 }}>No Active Partners</ThemeText>
        <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
           Sponsorship opportunities are currently open. Check back soon or contact event organizers.
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
      {/* Platinum Section */}
      {allPlatinum.length > 0 && (
        <View style={styles.section}>
          {allPlatinum.map((s: any) => <SponsorHero key={s.id} sponsor={s} />)}
        </View>
      )}

      {/* Gold Section */}
      {allGold.length > 0 && (
        <View style={styles.section}>
          <ThemeText variant="subheading" style={styles.sectionTitle}>GOLD PARTNERS</ThemeText>
          <SponsorGrid sponsors={allGold} />
        </View>
      )}

      {/* Silver Section */}
      {allSilver.length > 0 && (
        <View style={styles.section}>
          <ThemeText variant="subheading" style={styles.sectionTitle}>SUPPORTING PARTNERS</ThemeText>
          <SponsorRow sponsors={allSilver} />
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
