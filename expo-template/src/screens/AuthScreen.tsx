"use client";
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Image, Dimensions, 
  Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../services/supabaseClient';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeText } from '../components/UIKit';
import { LinearGradient } from 'expo-linear-gradient';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Safe configuration for Google Auth
  const googleConfig = {
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  };

  // Only initialize if at least one ID exists for the current platform
  const isConfigured = Platform.select({
    android: !!googleConfig.androidClientId,
    ios: !!googleConfig.iosClientId,
    default: !!googleConfig.webClientId
  });

  const [request, response, promptAsync] = Google.useAuthRequest(
    isConfigured ? googleConfig : { androidClientId: 'INVALID', iosClientId: 'INVALID', webClientId: 'INVALID' }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      console.log('[Auth] Login successful');
    } catch (err: any) {
      console.error('Login Error:', err.message);
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={['#050505', '#0a0a1a', '#050505']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Orbs */}
      <View style={[styles.orb, { top: -100, right: -100, backgroundColor: theme.primary + '33' }]} />
      <View style={[styles.orb, { bottom: -150, left: -100, backgroundColor: '#4f46e533' }]} />

      <View style={styles.content}>
        <View style={styles.logoArea}>
          <LinearGradient
            colors={[theme.primary, '#4f46e5']}
            style={styles.logoIcon}
          >
            <Text style={{ fontSize: 40 }}>✨</Text>
          </LinearGradient>
          
          <ThemeText variant="heading" style={styles.title}>
            EVENT<Text style={{ color: theme.primary }}>OS</Text>
          </ThemeText>
          <Text style={styles.tagline}>PRECISION MEETS PERFORMANCE</Text>
          
          <View style={styles.divider} />
          
          <ThemeText variant="body" secondary style={styles.description}>
            The command center for premium events. Experience real-time synchronization and ultimate control.
          </ThemeText>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity 
            style={[
              styles.googleButton,
              !isConfigured && { opacity: 0.6, backgroundColor: '#f5f5f5' }
            ]}
            onPress={() => isConfigured && promptAsync ? promptAsync() : alert('Google Sign-In is not configured for this app yet.')}
            disabled={loading || (isConfigured && !request)}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View style={styles.googleIconBg}>
                  <Image 
                    source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }} 
                    style={styles.googleIcon} 
                  />
                </View>
                <Text style={styles.googleButtonText}>
                  {isConfigured ? 'Continue with Google' : 'Google Unavailable'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.statusDot} />
            <Text style={styles.footerText}>Secure Cloud Infrastructure Active</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  content: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#FFF',
  },
  tagline: {
    color: '#666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 4,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginVertical: 24,
  },
  description: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#AAA',
    paddingHorizontal: 10,
  },
  actionArea: {
    width: '100%',
  },
  googleButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  googleIconBg: {
    width: 32,
    height: 32,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  footerText: {
    color: '#444',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
