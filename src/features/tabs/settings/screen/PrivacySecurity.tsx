import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Skincare Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';
const SOFT_CORAL = '#E67E6E';

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const handlePasswordChange = () => {
    router.push('/change-password'); 
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure? This will permanently remove your skin history and routines. This action cannot be undone.",
      [
        { text: "Keep My Profile", style: "cancel" },
        { 
          text: "Delete Forever", 
          style: "destructive", 
          onPress: () => console.log("Account Deleted") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Oasis Minimal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={DEEP_SAGE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* Security Section */}
        <Text style={styles.sectionLabel}>Access Security</Text>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={handlePasswordChange}
          activeOpacity={0.7}
        >
          <View style={styles.iconBox}>
            <Ionicons name="key-outline" size={22} color={SAGE} />
          </View>
          <View style={styles.textStack}>
            <Text style={styles.actionTitle}>Update Password</Text>
            <Text style={styles.actionSub}>Keep your profile access secure</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { marginTop: 40 }]}>Data Management</Text>
        <TouchableOpacity 
          style={[styles.actionCard, styles.dangerCard]} 
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <View style={styles.dangerIconBox}>
            <Ionicons name="trash-outline" size={22} color={SOFT_CORAL} />
          </View>
          <View style={styles.textStack}>
            <Text style={[styles.actionTitle, { color: SOFT_CORAL }]}>Delete Account</Text>
            <Text style={styles.actionSub}>Remove all routine and skin data</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={SAGE} style={{ marginBottom: 10 }} />
          <Text style={styles.infoNote}>
            Your privacy is our priority. We encrypt your personal data to ensure your skincare journey remains private and secure.
          </Text>
        </View>
      </View>
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

  content: { padding: 24 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: SAGE, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5, 
    marginBottom: 12,
    marginLeft: 4
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 28, // Rounded "Pebble" style
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: SAGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dangerCard: {
    borderColor: '#FFF5F4',
    backgroundColor: '#FFF9F8',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#F0F4F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dangerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#FFF5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  textStack: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: DEEP_SAGE, marginBottom: 2 },
  actionSub: { fontSize: 13, color: '#828282', fontWeight: '500', fontStyle: 'italic' },

  infoBox: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    fontWeight: '500'
  }
});