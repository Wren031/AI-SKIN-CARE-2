import { useLocalSearchParams, useRouter } from 'expo-router'; // Added useLocalSearchParams
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

export default function VerifyOTPScreen() {
  const router = useRouter();
  
  const { email } = useLocalSearchParams(); 
  
  const { verifyEmail, loading } = useAuth();
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {

    if (!otp || otp.length < 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    const result = await verifyEmail(email as string, otp);
    
    if (result) {
      router.replace('/home'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {"\n"}
            <Text style={{ fontWeight: 'bold', color: '#000' }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="000000"
            placeholderTextColor="#999"
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            editable={!loading} // Disable input while loading
          />

          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendContainer}
            disabled={loading}
          >
            <Text style={styles.resendText}>
              Didn't receive the code? <Text style={styles.link}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Sign Up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  otpInput: { 
    backgroundColor: '#f5f5f5', 
    padding: 20, 
    borderRadius: 12, 
    fontSize: 32, 
    fontWeight: 'bold',
    letterSpacing: 10,
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#e8e8e8',
    color: '#000'
  },
  primaryButton: { 
    backgroundColor: '#000', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    minHeight: 60, // Keep height consistent when showing loader
    justifyContent: 'center'
  },
  disabledButton: {
    backgroundColor: '#666'
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resendContainer: { marginTop: 25, alignItems: 'center' },
  resendText: { color: '#666', fontSize: 14 },
  link: { color: '#007AFF', fontWeight: 'bold' },
  backButton: { marginTop: 40, alignItems: 'center' },
  backButtonText: { color: '#999', fontSize: 14, fontWeight: '600' }
});