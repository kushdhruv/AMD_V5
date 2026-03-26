// ============================================================
// EXPLORE SCREEN — Host for Stalls, Speakers, Sponsors modules
// Each tab mounts the real deep-feature module screen.
// ============================================================
"use client";
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useModulesConfig, useDemoMode, useMonetizationConfig } from '../store/configStore';
import { isModuleEnabled } from '../types/config';

// UI Components
import { ThemeText, ThemeCard, ThemeBadge } from '../components/UIKit';
import { AdSlot } from '../monetization/AdSlot';

// Deep feature module screens
import { StallListScreen } from '../modules/stalls/screens/StallListScreen';
import { StallDetailScreen } from '../modules/stalls/screens/StallDetailScreen';
import AnnouncementFeedScreen from '../modules/announcements/screens/AnnouncementFeedScreen';
import { Stall } from '../modules/stalls/services/stallTypes';

// Top Tab Bar
import { TopTabBar } from './components/TopTabBar';

export default function ExploreScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();
  const monetization = useMonetizationConfig();
  const isDemoMode = useDemoMode();

  const tabs: string[] = [];
  if (isModuleEnabled(modules.commerce)) tabs.push('Stalls');
  if (isModuleEnabled(modules.speakers)) tabs.push('Speakers');
  if (monetization?.enabled) tabs.push('Sponsors');

  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'Stalls');
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <ThemeText variant="heading">Explore</ThemeText>
      </View>

      {/* Only show top tab bar when NOT inside stall detail */}
      {!selectedStall && tabs.length > 1 && (
        <TopTabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />
      )}

      {activeTab === 'Stalls' && !selectedStall && (
        <StallListScreen onSelectStall={(stall) => setSelectedStall(stall)} />
      )}

      {activeTab === 'Stalls' && selectedStall && (
        <StallDetailScreen
          stall={selectedStall}
          onBack={() => setSelectedStall(null)}
        />
      )}

      {activeTab === 'Speakers' && (
        <View style={styles.placeholder}>
          <AnnouncementFeedScreen />
        </View>
      )}

      {activeTab === 'Sponsors' && (
        <View style={styles.placeholder}>
          <ThemeCard elevated style={{ alignItems: 'center', padding: 24, margin: 16 }}>
            <Text style={{ fontSize: 40 }}>🏅</Text>
            <ThemeText variant="subheading" style={{ marginTop: 12 }}>Title Sponsor</ThemeText>
            <ThemeText variant="caption" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              {monetization?.enabled ? 'Sponsors will appear here' : 'Monetization not enabled'}

            </ThemeText>
          </ThemeCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  placeholder: { flex: 1 },
});
