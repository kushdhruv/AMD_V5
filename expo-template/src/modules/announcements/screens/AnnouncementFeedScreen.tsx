// ============================================================
// ANNOUNCEMENT FEED SCREEN — Main announcements list with filtering
// ============================================================
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { ThemeText, ThemeBadge } from '../../../components/UIKit';
import { useLocalAnnouncements } from '../../../hooks/useLocalData';

const TYPE_CONFIG = {
  update: { label: 'UPDATE', color: '#3B82F6' },
  important: { label: 'IMPORTANT', color: '#EF4444' },
  event: { label: 'EVENT', color: '#8B5CF6' },
  food: { label: 'FOOD', color: '#F59E0B' },
};

export default function AnnouncementFeedScreen() {
  const theme = useTheme();
  const { data: announcements, loading, refetch } = useLocalAnnouncements();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (selectedFilter === 'all') return announcements;
    return (announcements as any[]).filter((ann: any) => ann.type === selectedFilter);
  }, [announcements, selectedFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAnnouncementPress = (ann: any) => {
    // Handle announcement press
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filters}>
          {['all', 'update', 'important', 'event', 'food'].map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterTab,
                selectedFilter === filter && { backgroundColor: theme.primary + '20' }
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: selectedFilter === filter ? theme.primary : theme.textSecondary }
              ]}>
                {filter === 'all' ? 'All' : filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements List */}
        {filtered.map((ann: any) => {
          const typeConf = TYPE_CONFIG[(ann.type || 'update') as keyof typeof TYPE_CONFIG] || TYPE_CONFIG['update'];
          return (
            <TouchableOpacity
              key={ann.id}
              onPress={() => handleAnnouncementPress(ann)}
              activeOpacity={0.8}
              style={[
                styles.announcementCard,
                ann.is_pinned ? { borderLeftWidth: 3, borderLeftColor: typeConf.color } : {},
                { backgroundColor: theme.surface }
              ]}
            >
              <View style={styles.cardTop}>
                <ThemeBadge label={typeConf.label} color={typeConf.color} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {ann.is_pinned && <ThemeBadge label="PINNED" color={theme.textSecondary} />}
                  <ThemeText variant="caption" secondary>{ann.created_at || 'Just Now'}</ThemeText>
                </View>
              </View>
              <ThemeText variant="subheading" style={{ marginTop: 6 }}>{ann.title}</ThemeText>
              <ThemeText variant="body" secondary style={{ marginTop: 4 }}>
                {ann.body}
              </ThemeText>
              {ann.eventDetail && (
                <ThemeText variant="caption" style={{ color: theme.primary, marginTop: 8 }}>
                  View Details →
                </ThemeText>
              )}
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <ThemeText variant="subheading" style={{ marginTop: 12 }}>No Announcements Yet</ThemeText>
            <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              Organizers will post updates here. Pull to refresh.
            </ThemeText>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row' as const,
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  announcementCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  cardTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  empty: {
    alignItems: 'center' as const,
    padding: 40,
  },
};
