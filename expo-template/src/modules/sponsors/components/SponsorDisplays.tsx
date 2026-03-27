import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { ExternalLink, Award, Shield, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  description?: string;
  website_url?: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
}

export function SponsorHero({ sponsor }: { sponsor: Sponsor }) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (sponsor.website_url) Linking.openURL(sponsor.website_url);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.accent + '30' }]}
    >
      <View style={[styles.glow, { backgroundColor: theme.primaryColor + '10' }]} />
      
      <View style={styles.heroContent}>
        <View style={styles.tierBadge}>
           <Award size={12} color={theme.accent} />
           <Text style={[styles.tierText, { color: theme.accent }]}>PLATINUM PARTNER</Text>
        </View>

        <View style={styles.heroMain}>
           <View style={[styles.logoContainer, { backgroundColor: theme.background }]}>
              {sponsor.logo_url ? (
                <Image source={{ uri: sponsor.logo_url }} style={styles.heroLogo} resizeMode="contain" />
              ) : (
                <Award size={40} color={theme.textSecondary} />
              ) }
           </View>
           
           <View style={styles.heroText}>
              <Text style={[styles.heroName, { color: theme.textPrimary }]}>{sponsor.name}</Text>
              <Text style={[styles.heroDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {sponsor.description || "Official Platinum Partner"}
              </Text>
           </View>
        </View>

        <View style={[styles.cta, { backgroundColor: theme.primaryColor }]}>
           <Text style={[styles.ctaText, { color: '#FFF' }]}>VISIT WEBSITE</Text>
           <ExternalLink size={14} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function SponsorGrid({ sponsors }: { sponsors: Sponsor[] }) {
  const { theme } = useTheme();

  return (
    <View style={styles.gridContainer}>
      {sponsors.map((sponsor) => (
        <TouchableOpacity 
          key={sponsor.id}
          activeOpacity={0.8}
          onPress={() => sponsor.website_url && Linking.openURL(sponsor.website_url)}
          style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.background }]}
        >
          <View style={styles.gridLogoContainer}>
             {sponsor.logo_url ? (
                <Image source={{ uri: sponsor.logo_url }} style={styles.gridLogo} resizeMode="contain" />
              ) : (
                <Shield size={24} color={theme.textSecondary} />
              )}
          </View>
          <Text style={[styles.gridName, { color: theme.textPrimary }]} numberOfLines={1}>{sponsor.name}</Text>
          <View style={styles.goldBadge}>
             <Star size={8} color="#FFD700" fill="#FFD700" />
             <Text style={styles.goldText}>GOLD</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SponsorRow({ sponsors }: { sponsors: Sponsor[] }) {
  const { theme } = useTheme();

  return (
    <View style={styles.rowContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {sponsors.map((sponsor) => (
          <TouchableOpacity 
            key={sponsor.id}
            onPress={() => sponsor.website_url && Linking.openURL(sponsor.website_url)}
            style={[styles.rowItem, { backgroundColor: theme.surface, borderLeftColor: theme.secondaryColor }]}
          >
            <View style={styles.rowLogoContainer}>
               {sponsor.logo_url ? (
                  <Image source={{ uri: sponsor.logo_url }} style={styles.rowLogo} resizeMode="contain" />
                ) : (
                  <Text style={[styles.rowInitial, { color: theme.textSecondary }]}>{sponsor.name[0]}</Text>
                )}
            </View>
            <Text style={[styles.rowName, { color: theme.textSecondary }]} numberOfLines={1}>{sponsor.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    blurRadius: 50,
  },
  heroContent: {
    padding: 24,
    gap: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '900',
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: (width - 60) / 2,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  gridLogoContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLogo: {
    width: '100%',
    height: '100%',
  },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  goldText: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: '900',
  },
  // Row Styles
  rowContainer: {
    marginHorizontal: -20,
  },
  rowScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    gap: 10,
  },
  rowLogoContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLogo: {
    width: '100%',
    height: '100%',
  },
  rowInitial: {
    fontSize: 14,
    fontWeight: '900',
  },
  rowName: {
    fontSize: 13,
    fontWeight: '600',
  },
});
