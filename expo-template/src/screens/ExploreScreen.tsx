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
import { useRoute } from '@react-navigation/native';

// UI Components
import { ThemeText, ThemeCard, ThemeBadge } from '../components/UIKit';
import { AdSlot } from '../monetization/AdSlot';

// Deep feature module screens
import { StallListScreen } from '../modules/stalls/screens/StallListScreen';
import { StallDetailScreen } from '../modules/stalls/screens/StallDetailScreen';
import { Stall } from '../modules/stalls/services/stallTypes';
import { SpeakersScreen } from '../modules/speakers/screens/SpeakersScreen';
import { TicketsScreen } from '../modules/tickets/screens/TicketsScreen';

// Top Tab Bar
import { TopTabBar } from './components/TopTabBar';
import { SponsorScreen } from '../modules/sponsors/screens/SponsorScreen';

export default function ExploreScreen() {
  const theme = useTheme();
  const modules = useModulesConfig();
  const monetization = useMonetizationConfig();
  const isDemoMode = useDemoMode();

  const route = useRoute<any>();
  const initialTab = route.params?.initialTab;

  const tabs: string[] = [];
  if (isModuleEnabled(modules.commerce)) tabs.push('Stalls');
  if (isModuleEnabled(modules.speakers)) tabs.push('Speakers');
  if (isModuleEnabled(modules.registration)) tabs.push('Tickets');
  if (monetization?.enabled) tabs.push('Sponsors');

  // If no tabs are available, default to Tickets or Stalls as fallback so it doesn't crash
  if (tabs.length === 0) tabs.push('Tickets');

  const [activeTab, setActiveTab] = useState(tabs[0]);

  React.useEffect(() => {
    if (initialTab && tabs.includes(initialTab)) {
        setActiveTab(initialTab);
    }
  }, [initialTab]);
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
          <SpeakersScreen />
        </View>
      )}

      {activeTab === 'Tickets' && (
        <View style={styles.placeholder}>
          <TicketsScreen />
        </View>
      )}

      {activeTab === 'Sponsors' && (
        <SponsorScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  placeholder: { flex: 1 },
});
