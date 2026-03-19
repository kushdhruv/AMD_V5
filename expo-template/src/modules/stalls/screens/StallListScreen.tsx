// ============================================================
// STALL LIST SCREEN — Offline-first local data feed
// Integrates with AdSlot and dynamic app Theme.
// ============================================================
import React, { useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { useEventConfig } from '../../../store/configStore';
import { ThemeText, ThemeCard, ThemeBadge } from '../../../components/UIKit';
import { AdSlot } from '../../../monetization/AdSlot';
import { StallCard } from '../components/StallCard';
import { Stall } from '../services/stallTypes';
import { useLocalStalls } from '../../../hooks/useLocalData';

interface Props {
  onSelectStall: (stall: Stall) => void;
}

const CATEGORIES = ['All', 'Food', 'Merchandise', 'Games', 'Tech', 'Other'];

export function StallListScreen({ onSelectStall }: Props) {
  const theme = useTheme();
  const event = useEventConfig();
  
  const { data: stalls, loading, refetch } = useLocalStalls();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredStalls = stalls.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) as Stall[];

  const featuredStall = stalls.find((s) => s.is_featured) as Stall | undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ── Search bar ─────────────────────────────── */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderRadius: theme.radius }]}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search stalls, food, merch..."
          placeholderTextColor={theme.textSecondary}
          style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: theme.textSecondary, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category filter chips ───────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.primary : theme.surface,
                  borderRadius: theme.radius / 1.5,
                },
              ]}
            >
              <Text style={{ color: isActive ? '#FFF' : theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredStalls}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            {/* Sponsored AdSlot */}
            <AdSlot placement="stalls_featured" />

            {/* Featured stall hero card */}
            {featuredStall && activeCategory === 'All' && search === '' && (
              <View style={{ marginBottom: 4 }}>
                <ThemeText variant="label" secondary style={{ marginBottom: 8 }}>⭐ FEATURED</ThemeText>
                <StallCard
                  stall={featuredStall}
                  variant="featured"
                  onPress={() => onSelectStall(featuredStall)}
                />
              </View>
            )}

            <ThemeText variant="label" secondary style={{ marginBottom: 12 }}>
              {filteredStalls.length} STALL{filteredStalls.length !== 1 ? 'S' : ''} FOUND
            </ThemeText>
          </>
        }
        renderItem={({ item }) => (
          <StallCard stall={item} onPress={() => onSelectStall(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🏪</Text>
            <ThemeText variant="subheading" style={{ marginTop: 12 }}>No Stalls Found</ThemeText>
            <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              Try a different search term or category.
            </ThemeText>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  chipRow: { maxHeight: 52, marginBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
});
