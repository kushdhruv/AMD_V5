// ============================================================
// APP.TSX — THE MASTER APP SHELL
// The heart of the system. Reads config.json, resolves
// which tabs to show via FeatureRegistry, wraps everything
// in ThemeProvider. Modules plug into this — shell stays clean.
// ============================================================
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';

// Store & Theme
import { useConfigStore } from './src/store/configStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { initDatabase } from './src/services/storage';
import { supabase } from './src/services/supabaseClient';


// Feature Registry
import { resolveNavigation } from './src/navigation/FeatureRegistry';

// Components
import { TabIcon } from './src/components/TabIcon';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';

const Tab = createBottomTabNavigator();

// ── Inner navigator — has access to ThemeProvider context ──
function AppNavigator() {
  const theme = useTheme();
  const { config } = useConfigStore();
  const nav = resolveNavigation(config.modules);

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

// ── Main App Component ──
export default function App() {
  const { config, isLoaded } = useConfigStore();
  const [dbReady, setDbReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 1. Init Database
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to init database', err);
        setDbReady(true);
      });



    // 2. Check Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    // 3. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isLoaded || !dbReady || !authChecked) {
    // Loading screen
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={config.theme}>
        <NavigationContainer>
          {session ? <AppNavigator /> : <AuthScreen />}
        </NavigationContainer>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
