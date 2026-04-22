import { THEMES } from '@/src/constants/themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

// Apply DermaAI Theme
const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignUp = async () => {
    const { email, password } = form;

    if (!email.trim() || !password.trim()) {
      Alert.alert('Analysis', 'Please provide your details to generate your skin profile.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Security', 'Your security key must be at least 6 characters.');
      return;
    }

    try {
      const result = await signUp({ email: email.trim(), password });
      if (result) {
        router.push({
          pathname: '/verify',
          params: { email: email.trim() },
        });
      }
    } catch (error) {
      Alert.alert('Registration Failed', 'We could not initialize your profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <MaterialCommunityIcons name="shield-check-outline" size={32} color={COLORS.WHITE} />
            </View>
            <Text style={styles.title}>New Profile</Text>
            <Text style={styles.subtitle}>Initialize your personalized skin regimen</Text>
          </View>

          <View style={styles.formCard}>
            {/* Email Input */}
            <Text style={styles.inputLabel}>Patient Email</Text>
            <View style={[styles.inputGroup, focusedField === 'email' && styles.inputFocused]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={focusedField === 'email' ? COLORS.ACCENT : COLORS.TEXT_SECONDARY} 
              />
              <TextInput
                placeholder="email@derma.ai"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                style={styles.input}
                value={form.email}
                onChangeText={(text) => updateForm('email', text)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Security Key</Text>
            <View style={[styles.inputGroup, focusedField === 'password' && styles.inputFocused]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={focusedField === 'password' ? COLORS.ACCENT : COLORS.TEXT_SECONDARY} 
              />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={form.password}
                onChangeText={(text) => updateForm('password', text)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={COLORS.TEXT_SECONDARY} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.buttonText}>Begin Journey</Text>
                  <Ionicons name="sparkles" size={18} color={COLORS.WHITE} style={{marginLeft: 8}} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>SECURE PROTOCOL</Text>
            <View style={styles.line} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => {}}>
              <Ionicons name="logo-google" size={22} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => {}}>
              <Ionicons name="logo-apple" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footer}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.footerText}>
              Existing Profile? <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoMark: { 
    width: 72, height: 72, borderRadius: RADIUS.M, 
    backgroundColor: COLORS.ACCENT, // Using accent here to differentiate from Login
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.GLOW,
    shadowColor: COLORS.ACCENT, 
  },
  title: { 
    fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY, 
    marginTop: 20, letterSpacing: -1 
  },
  subtitle: { 
    fontSize: 15, color: COLORS.TEXT_SECONDARY, 
    marginTop: 6, fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 
  },

  formCard: { 
    backgroundColor: COLORS.SURFACE, 
    padding: 28, 
    borderRadius: RADIUS.L, 
    ...SHADOWS.SOFT,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  inputLabel: { 
    fontSize: 11, fontWeight: '700', color: COLORS.TEXT_SECONDARY, 
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4 
  },
  inputGroup: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: COLORS.INPUT_BG, paddingHorizontal: 16, 
    height: 60, borderRadius: RADIUS.S, marginBottom: 20,
    borderWidth: 1.5, borderColor: 'transparent'
  },
  inputFocused: { 
    borderColor: COLORS.ACCENT + '40', 
    backgroundColor: COLORS.WHITE 
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: COLORS.TEXT_PRIMARY, fontWeight: '500' },
  
  primaryButton: { 
    backgroundColor: COLORS.PRIMARY, 
    height: 64, 
    borderRadius: RADIUS.M, 
    justifyContent: 'center', alignItems: 'center', 
    marginTop: 10,
    ...SHADOWS.GLOW,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: COLORS.WHITE, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 36 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.BORDER },
  orText: { 
    marginHorizontal: 16, color: COLORS.TEXT_SECONDARY, 
    fontWeight: '800', fontSize: 11, letterSpacing: 1.5, opacity: 0.6 
  },

  socialRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  socialBtn: { 
    width: 64, height: 64, borderRadius: RADIUS.M, 
    borderWidth: 1, borderColor: COLORS.BORDER, backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.SOFT
  },

  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: COLORS.TEXT_SECONDARY, fontSize: 15, fontWeight: '500' },
  link: { color: COLORS.PRIMARY, fontWeight: '800' }
});