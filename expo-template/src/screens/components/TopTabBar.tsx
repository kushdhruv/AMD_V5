// ============================================================
// SHARED TOP TAB BAR — Reusable across Explore & Activities
// ============================================================
import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemeText } from '../../../components/UIKit';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

export function TopTabBar({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: theme.surface, borderBottomColor: theme.textSecondary + '1A' }]}>
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onSelect(tab)}
            style={[styles.tab, isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          >
            <ThemeText
              variant="label"
              style={{ color: isActive ? theme.primary : theme.textSecondary }}
            >
              {tab.toUpperCase()}
            </ThemeText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 13 },
});
