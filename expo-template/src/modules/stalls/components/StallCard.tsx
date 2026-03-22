// ============================================================
// STALL CARD COMPONENT — Used in list and featured contexts
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText, ThemeBadge } from '../../../components/UIKit';
import { Stall } from '../services/stallTypes';

interface StallCardProps {
  stall: Stall;
  onPress: () => void;
  variant?: 'default' | 'featured';
}

export function StallCard({ stall, onPress, variant = 'default' }: StallCardProps) {
  const theme = useTheme();

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.featuredCard,
          {
            backgroundColor: theme.primary + '14',
            borderColor: theme.primary + '44',
            borderRadius: theme.radius,
          },
        ]}
      >
        <View style={styles.featuredTop}>
          <Text style={{ fontSize: 36 }}>{stall.emoji}</Text>
          <View style={styles.featuredBadges}>
            {stall.isSponsored && <ThemeBadge label="SPONSORED" color={theme.accent} />}
            <ThemeBadge label="FEATURED" color={theme.primary} />
          </View>
        </View>
        <ThemeText variant="subheading">{stall.name}</ThemeText>
        <Text numberOfLines={2} style={{fontSize: 12, color: theme.textSecondary}}>{stall.description}</Text>
        <View style={styles.meta}>
          <ThemeText variant="caption" style={{ color: '#F59E0B' }}>⭐ {stall.rating}</ThemeText>
          <ThemeText variant="caption" secondary>{stall.priceRange}</ThemeText>
          <ThemeText variant="caption" secondary>📍 {stall.location.split('—')[0].trim()}</ThemeText>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.surface, borderRadius: theme.radius }]}
    >
      <View style={styles.cardRow}>
        {/* Emoji Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.primary + '18', borderRadius: theme.radius / 1.5 }]}>
          <Text style={{ fontSize: 28 }}>{stall.emoji}</Text>
        </View>

        {/* Main Info */}
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <ThemeText variant="subheading">{stall.name}</ThemeText>
            {stall.isSponsored && <ThemeBadge label="AD" color={theme.accent} />}
          </View>
          <Text numberOfLines={1} style={{fontSize: 12, color: theme.textSecondary}}>{stall.description}</Text>

          {/* Tags */}
          <View style={[styles.tagRow]}>
            {stall.tags.slice(0, 2).map((tag) => (
              <ThemeBadge key={tag} label={tag} color={theme.textSecondary} />
            ))}
          </View>

          {/* Rating + Price */}
          <View style={styles.metaRow}>
            <ThemeText variant="caption" style={{ color: '#F59E0B' }}>⭐ {stall.rating}</ThemeText>
            <ThemeText variant="caption" secondary> · ({stall.reviewCount} reviews)</ThemeText>
            <ThemeText variant="caption" secondary> · {stall.priceRange}</ThemeText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: theme.primary + '66', borderRadius: theme.radius / 2 }]}
          onPress={onPress}
        >
          <ThemeText variant="caption" style={{ color: theme.primary }}>View Menu</ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtnFill, { backgroundColor: theme.primary, borderRadius: theme.radius / 2 }]}
          onPress={onPress}
        >
          <ThemeText variant="caption">Order Now →</ThemeText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardRow: { flexDirection: 'row', gap: 12 },
  avatar: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  actionBtnFill: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  featuredCard: { padding: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1.5 },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  featuredBadges: { gap: 4, alignItems: 'flex-end' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
