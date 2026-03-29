import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ScrollView, KeyboardAvoidingView, 
  Platform, ActivityIndicator 
} from 'react-native';
import { useConfigStore } from '../store/configStore';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeText } from '../components/UIKit';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabaseClient';

export default function CompleteProfileScreen({ onComplete }: { onComplete: () => void }) {
  const theme = useTheme();
  const { config } = useConfigStore();
  const fields = config.modules.registration_fields || [];
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        alert(`${field.label} is required`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session found");

      const appId = config.project_id || config.event.name;
      
      const nameField = fields.find(f => f.label.toLowerCase().includes('name'));
      const registrationData = {
        ...formData,
        email: user.email,
        full_name: user.user_metadata?.full_name || (nameField ? formData[nameField.id] : '') || user.email?.split('@')[0],
        appId: appId,
        registered_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('app_registrations')
        .insert({
          app_name: appId,
          data: registrationData
        });

      if (error) throw error;

      onComplete();
    } catch (err: any) {
      console.error('Registration Error:', err.message);
      alert('Failed to save details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[theme.background, '#0a0a1a']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemeText variant="heading" style={styles.title}>
            COMPLETE <Text style={{ color: theme.primary }}>PROFILE</Text>
          </ThemeText>
          <ThemeText variant="body" secondary style={styles.subtitle}>
            One more step! Please provide these details to access {config.event.name}.
          </ThemeText>
        </View>

        <View style={styles.form}>
          {fields.map((field: any) => (
            <View key={field.id} style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{field.label}{field.required ? ' *' : ''}</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.textSecondary + '20', color: theme.textPrimary, backgroundColor: theme.textPrimary + '05' }]}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textSecondary + '50'}
                value={formData[field.id] || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [field.id]: text }))}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>GET STARTED</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
