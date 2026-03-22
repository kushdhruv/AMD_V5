// ============================================================
// TAB ICON COMPONENT
// ============================================================
import React from 'react';
import { Text } from 'react-native';

interface TabIconProps {
  emoji: string;
  active: boolean;
  color: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ emoji, active, color }) => {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
};