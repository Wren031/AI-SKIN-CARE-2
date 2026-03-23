import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Skincare Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';
const SOFT_CORAL = '#E67E6E';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdate = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return Alert.alert("Hold on", "Please fill in all the steps of your security update.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return Alert.alert("Mismatch", "The new passwords do not quite match.");
    }

    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Your profile is now secured with a new password.", [
        { text: "Return", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.reqRow}>
      <Ionicons 
        name={met ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={met ? SAGE : "#CBD5E1"} 
      />
      <Text style={[styles.reqText, met && styles.reqTextMet]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={DEEP_SAGE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Secure your profile</Text>
            <Text style={styles.infoSub}>A strong password ensures your skin history and personal data stay private.</Text>
          </View>

          <View style={styles.formCard}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.currentPassword}
                  onChangeText={(v) => setForm({ ...form, currentPassword: v })}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={SAGE} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.newPassword}
                  onChangeText={(v) => setForm({ ...form, newPassword: v })}
                  placeholder="Create new password"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.confirmPassword}
                  onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                  placeholder="Repeat new password"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Requirements Checklist */}
            <View style={styles.requirementsContainer}>
              <RequirementItem label="At least 8 characters" met={form.newPassword.length >= 8} />
              <RequirementItem label="Includes a number or symbol" met={/[0-9!@#$%^&*]/.test(form.newPassword)} />
              <RequirementItem label="Passwords match" met={form.newPassword === form.confirmPassword && form.newPassword !== ''} />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && styles.disabledBtn]} 
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save New Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '300', color: DEEP_SAGE, letterSpacing: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { padding: 24 },
  
  infoBox: { marginBottom: 32 },
  infoTitle: { fontSize: 26, fontWeight: '300', color: DEEP_SAGE, marginBottom: 8 },
  infoSub: { fontSize: 15, color: '#828282', lineHeight: 22, fontStyle: 'italic' },
  
  formCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 30, 
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: SAGE,
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: SAGE, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAND,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: { flex: 1, height: 56, fontSize: 16, color: DEEP_SAGE, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  requirementsContainer: { marginTop: 15, paddingHorizontal: 4 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqText: { fontSize: 13, color: '#94A3B8', marginLeft: 10, fontWeight: '500' },
  reqTextMet: { color: DEEP_SAGE },
  
  saveBtn: {
    backgroundColor: SOFT_CORAL,
    height: 62,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: SOFT_CORAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledBtn: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});