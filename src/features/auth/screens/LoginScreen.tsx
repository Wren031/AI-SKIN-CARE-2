import { Ionicons } from '@expo/vector-icons';
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

// Consistent Skincare Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signInWithGoogle, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      Alert.alert('Welcome Back', 'Please enter your details to continue your routine.');
      return;
    }
    try {
      const success = await login({ email: form.email.trim(), password: form.password });
      if (success) router.replace('/home');
    } catch (error) {
      Alert.alert('Error', 'We couldn’t find your profile. Please check your credentials.');
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
              <Ionicons name="leaf-outline" size={32} color="#FFF" />
            </View>
            <Text style={styles.title}>Glow Again</Text>
            <Text style={styles.subtitle}>Sign in to your personalized oasis</Text>
          </View>

          <View style={styles.formCard}>
            {/* Email Input */}
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputGroup, focusedField === 'email' && styles.inputFocused]}>
              <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? SAGE : '#94A3B8'} />
              <TextInput
                placeholder="yourname@glow.com"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputGroup, focusedField === 'password' && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? SAGE : '#94A3B8'} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={form.password}
                onChangeText={(v) => updateForm('password', v)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.disabledBtn]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginBtnText}>Return to Oasis</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR CONTINUE WITH</Text>
            <View style={styles.line} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => signInWithGoogle()}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={20} color={DEEP_SAGE} />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.footer} onPress={() => router.push('/signup')}>
            <Text style={styles.footerText}>New here? <Text style={styles.signupLink}>Begin Journey</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAND },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  
  header: { alignItems: 'center', marginBottom: 40 },
  logoMark: { 
    width: 64, height: 64, borderRadius: 24, 
    backgroundColor: SAGE, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: SAGE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12,
    elevation: 5
  },
  title: { fontSize: 32, fontWeight: '300', color: DEEP_SAGE, marginTop: 20, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: '#828282', marginTop: 4, fontStyle: 'italic' },

  formCard: { 
    backgroundColor: '#FFF', padding: 20, borderRadius: 32, 
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: SAGE, shadowOpacity: 0.05, shadowRadius: 15 
  },
  inputLabel: { fontSize: 11, fontWeight: '800', color: DEEP_SAGE, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4 },
  inputGroup: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: SAND, paddingHorizontal: 16, 
    height: 60, borderRadius: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  inputFocused: { borderColor: SAGE, backgroundColor: '#FFF' },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: DEEP_SAGE, fontWeight: '500' },
  
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: SAGE, fontWeight: '700', fontSize: 13 },

  loginBtn: { 
    backgroundColor: SAGE, height: 64, borderRadius: 32, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: SAGE, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15,
    elevation: 4
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { marginHorizontal: 15, color: '#94A3B8', fontWeight: '800', fontSize: 10, letterSpacing: 1.5 },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { 
    flex: 1, flexDirection: 'row', height: 56, borderRadius: 20, 
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', gap: 8 
  },
  socialBtnText: { fontWeight: '700', color: DEEP_SAGE },

  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: '#94A3B8', fontWeight: '600' },
  signupLink: { color: SAGE, fontWeight: '800' }
});