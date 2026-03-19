// ============================================================
// APP.TSX — THE MASTER APP SHELL
// The heart of the system. Reads config.json, resolves
// which tabs to show via FeatureRegistry, wraps everything
// in ThemeProvider. Modules plug into this — shell stays clean.
// ============================================================
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Store & Theme
import { useConfigStore, useThemeConfig, useModulesConfig } from './src/store/configStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

// Feature Registry
import { resolveNavigation } from './src/navigation/FeatureRegistry';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// ── Inner navigator — has access to ThemeProvider context ──
function AppNavigator() {
  const theme = useTheme();
  const modules = useModulesConfig();
  const nav = resolveNavigation(modules);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.textSecondary + '22',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 64,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      {/* HOME — always visible */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" active={focused} color={color} />
          ),
        }}
      />

      {/* EXPLORE — shown only if stalls or speakers are enabled */}
      {nav.showExploreTab && (
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="🔍" active={focused} color={color} />
            ),
          }}
        />
      )}

      {/* ACTIVITIES — shown only if music, leaderboard, or voting are enabled */}
      {nav.showActivitiesTab && (
        <Tab.Screen
          name="Activities"
          component={ActivitiesScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="⚡" active={focused} color={color} />
            ),
          }}
        />
      )}

      {/* PROFILE — always visible */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" active={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Tab Icon (emoji-based, replaces vector icon dependency for template) ──
function TabIcon({ emoji, active, color }: { emoji: string; active: boolean; color: string }) {
  return (
    <React.Fragment>
      {/* Simple emoji icons — swap with @expo/vector-icons in production */}
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <React.Fragment>
        {/* @ts-ignore */}
        {emoji}
      </React.Fragment>
    </React.Fragment>
  );
}

// ── Root App — theme wraps everything ─────────────────────
export default function App() {
  const themeConfig = useThemeConfig();

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={themeConfig}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style={themeConfig.background === '#F8FAFC' ? 'dark' : 'light'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
