import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Image, Dimensions 
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../services/supabaseClient';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeText } from '../components/UIKit';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Note: For production, you'd put these in .env
  // For now, Supabase OAuth handles the client ID if configured in the dashboard
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: makeRedirectUri({
            scheme: 'expotemplate',
          }),
        },
      });

      if (error) throw error;

      // In Expo, signInWithOAuth returns a URL to open
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, makeRedirectUri({
          scheme: 'expotemplate',
        }));

        if (result.type === 'success') {
          const { url } = result;
          // Extract tokens from URL and set session
          // (Supabase auto-handles this if detectSessionInUrl is true, 
          // but we might need to manually call it for some Expo versions)
          const params = new URLSearchParams(url.split('#')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    } catch (err) {
      console.error('Login Error:', err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#050505' }]}>
      {/* Background Glow */}
      <View style={[styles.glow, { backgroundColor: theme.primary + '22' }]} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
                <Text style={{ fontSize: 32 }}>⚡</Text>
            </View>
            <ThemeText variant="heading" style={styles.title}>AI Event OS</ThemeText>
            <ThemeText variant="body" secondary style={styles.subtitle}>
                Your personalized gateway to excellence.
            </ThemeText>
        </View>

        <View style={styles.formContainer}>
            <TouchableOpacity 
                style={[styles.googleBtn, { borderColor: theme.textSecondary + '33' }]}
                onPress={handleGoogleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={theme.primary} />
                ) : (
                    <>
                        <Image 
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                            style={styles.googleIcon} 
                        />
                        <Text style={[styles.googleText, { color: '#FFF' }]}>Continue with Google</Text>
                    </>
                )}
            </TouchableOpacity>

            <ThemeText variant="caption" secondary style={styles.footerText}>
                Secure login powered by Supabase Auth
            </ThemeText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glow: {
    position: 'absolute',
    top: -100,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 999,
    opacity: 0.5,
  },
  content: { width: '85%', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { textAlign: 'center', marginTop: 10, opacity: 0.7 },
  formContainer: { width: '100%', alignItems: 'center' },
  googleBtn: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  googleIcon: { width: 24, height: 24 },
  googleText: { fontSize: 16, fontWeight: '600' },
  footerText: { marginTop: 20, opacity: 0.5 },
});
