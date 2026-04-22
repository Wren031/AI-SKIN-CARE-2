import { THEMES } from '@/src/constants/themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
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

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

const SECURE_AUTH_KEY = 'user_credentials_oasis';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signInWithGoogle, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedData = await SecureStore.getItemAsync(SECURE_AUTH_KEY);
      if (savedData) {
        const { email, password } = JSON.parse(savedData);
        setForm({ email, password });
        setRememberMe(true);
      }
    } catch (error) {
      console.error("Failed to load credentials:", error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        const data = JSON.stringify({ 
          email: form.email.trim(), 
          password: form.password 
        });
        await SecureStore.setItemAsync(SECURE_AUTH_KEY, data);
      } else {
        await SecureStore.deleteItemAsync(SECURE_AUTH_KEY);
      }
    } catch (error) {
      console.error("Failed to update secure storage:", error);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Consultation', 'Please enter your credentials to access your regimen.');
      return;
    }

    try {
      await saveCredentials();
      const success = await login({ 
        email: form.email.trim(), 
        password: form.password 
      });
      if (success) router.replace('/home');
    } catch (error) {
      Alert.alert('Analysis Failed', 'We couldn’t verify your profile. Please try again.');
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
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <MaterialCommunityIcons name="face-recognition" size={32} color={COLORS.WHITE} />
            </View>
            <Text style={styles.title}>Derma<Text style={{color: COLORS.ACCENT}}>AI</Text></Text>
            <Text style={styles.subtitle}>Precision Skincare Analysis</Text>
          </View>

          <View style={styles.formCard}>
            {/* Email Input */}
            <Text style={styles.inputLabel}>Patient Email</Text>
            <View style={[styles.inputGroup, focusedField === 'email' && styles.inputFocused]}>
              <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.ACCENT : COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                placeholder="email@derma.ai"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                style={styles.input}
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
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
              <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? COLORS.ACCENT : COLORS.TEXT_SECONDARY} style={styles.inputIcon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={form.password}
                onChangeText={(v) => updateForm('password', v)}
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

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color={COLORS.WHITE} />}
                </View>
                <Text style={styles.rememberMeText}>Stay Signed In</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>Recovery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.disabledBtn]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <View style={styles.btnContent}>
                   <Text style={styles.loginBtnText}>Begin Skin Analysis</Text>
                   <Ionicons name="arrow-forward" size={18} color={COLORS.WHITE} style={{marginLeft: 8}} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Login */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>SECURE ACCESS</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => signInWithGoogle()}>
              <Ionicons name="logo-google" size={22} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.footer} onPress={() => router.push('/signup')}>
            <Text style={styles.footerText}>
              New Patient? <Text style={styles.signupLink}>Create Profile</Text>
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
    backgroundColor: COLORS.PRIMARY, 
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.GLOW,
  },
  title: { 
    fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY, 
    marginTop: 20, letterSpacing: -1 
  },
  subtitle: { 
    fontSize: 15, color: COLORS.TEXT_SECONDARY, 
    marginTop: 6, fontWeight: '500', opacity: 0.8
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
  inputIcon: { marginRight: 12 },
  inputFocused: { 
    borderColor: COLORS.ACCENT + '40', // 40% opacity accent border
    backgroundColor: COLORS.WHITE,
  },
  input: { flex: 1, fontSize: 16, color: COLORS.TEXT_PRIMARY, fontWeight: '500' },
  
  actionRow: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', marginBottom: 32 
  },
  rememberMeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { 
    width: 22, height: 22, borderRadius: 8, 
    borderWidth: 2, borderColor: COLORS.BORDER,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.WHITE
  },
  checkboxActive: { backgroundColor: COLORS.ACCENT, borderColor: COLORS.ACCENT },
  rememberMeText: { color: COLORS.TEXT_SECONDARY, fontSize: 14, fontWeight: '500' },
  forgotText: { color: COLORS.ACCENT, fontWeight: '700', fontSize: 14 },

  loginBtn: { 
    backgroundColor: COLORS.PRIMARY, height: 64, borderRadius: RADIUS.M, 
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.GLOW,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: COLORS.WHITE, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 36 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.BORDER },
  orText: { 
    marginHorizontal: 16, color: COLORS.TEXT_SECONDARY, 
    fontWeight: '800', fontSize: 11, letterSpacing: 1.5, opacity: 0.6
  },

  socialRow: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
  socialBtn: { 
    width: 64, height: 64, borderRadius: RADIUS.M, 
    borderWidth: 1, borderColor: COLORS.BORDER, backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.SOFT
  },

  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: COLORS.TEXT_SECONDARY, fontSize: 15, fontWeight: '500' },
  signupLink: { color: COLORS.PRIMARY, fontWeight: '800' }
});