import { THEMES } from '@/src/constants/themes';
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

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

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
      return Alert.alert("Required Fields", "Please complete all security validation steps.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return Alert.alert("Validation Error", "The new credentials do not match.");
    }

    setLoading(true);
    // Simulate Clinical API Call
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Registry Updated", "Your security credentials have been successfully reset.", [
        { text: "FINISH", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.reqRow}>
      <Ionicons 
        name={met ? "shield-checkmark" : "shield-outline"} 
        size={14} 
        color={met ? COLORS.SUCCESS : COLORS.BORDER} 
      />
      <Text style={[styles.reqText, met && styles.reqTextMet]}>{label.toUpperCase()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SECURITY ACCESS</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Update Credentials</Text>
            <Text style={styles.infoSub}>
              Ensure your diagnostic history and patient records remain protected with a high-entropy password.
            </Text>
          </View>

          <View style={styles.formCard}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Security Key</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.currentPassword}
                  onChangeText={(v) => setForm({ ...form, currentPassword: v })}
                  placeholder="EXISTING PASSWORD"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Security Key</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.newPassword}
                  onChangeText={(v) => setForm({ ...form, newPassword: v })}
                  placeholder="CREATE NEW KEY"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Key</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={form.confirmPassword}
                  onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                  placeholder="RE-TYPE NEW KEY"
                  placeholderTextColor={COLORS.TEXT_SECONDARY}
                />
              </View>
            </View>

            {/* Clinical Requirements Checklist */}
            <View style={styles.requirementsContainer}>
              <RequirementItem label="8+ Characters" met={form.newPassword.length >= 8} />
              <RequirementItem label="Alphanumeric/Symbol" met={/[0-9!@#$%^&*]/.test(form.newPassword)} />
              <RequirementItem label="Registry Match" met={form.newPassword === form.confirmPassword && form.newPassword !== ''} />
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
              <Text style={styles.saveBtnText}>UPDATE SYSTEM ACCESS</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  headerTitle: { fontSize: 12, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 2 },
  backBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: RADIUS.S,
    borderWidth: 1,
    borderColor: COLORS.BORDER 
  },
  
  scrollContent: { padding: 20 },
  
  infoBox: { marginBottom: 30, marginTop: 10 },
  infoTitle: { fontSize: 32, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 8, letterSpacing: -1 },
  infoSub: { fontSize: 14, color: COLORS.TEXT_SECONDARY, lineHeight: 22, fontWeight: '600' },
  
  formCard: { 
    backgroundColor: COLORS.WHITE, 
    borderRadius: RADIUS.M, 
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '900', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: RADIUS.S,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  input: { flex: 1, height: 56, fontSize: 15, color: COLORS.TEXT_PRIMARY, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.BORDER, marginVertical: 10 },
  
  requirementsContainer: { marginTop: 15, paddingHorizontal: 4 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reqText: { fontSize: 10, color: COLORS.TEXT_SECONDARY, marginLeft: 10, fontWeight: '900', letterSpacing: 0.5 },
  reqTextMet: { color: COLORS.SUCCESS },
  
  saveBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 60,
    borderRadius: RADIUS.M,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    ...SHADOWS.SOFT,
  },
  disabledBtn: { backgroundColor: COLORS.BORDER, shadowOpacity: 0 },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});