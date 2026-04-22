import { THEMES } from '@/src/constants/themes';
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

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const handlePasswordChange = () => {
    router.push('/change-password'); 
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "DELETE CLINICAL PROFILE",
      "Are you sure? This will permanently remove your skin analysis history and medical protocols. This action cannot be undone.",
      [
        { text: "KEEP PROFILE", style: "cancel" },
        { 
          text: "DELETE FOREVER", 
          style: "destructive", 
          onPress: () => console.log("Account Deleted") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Clinical Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRIVACY & SECURITY</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        
        {/* Security Section */}
        <Text style={styles.sectionLabel}>ACCESS SECURITY</Text>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={handlePasswordChange}
          activeOpacity={0.8}
        >
          <View style={styles.iconBox}>
            <Ionicons name="key-outline" size={22} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.textStack}>
            <Text style={styles.actionTitle}>Update Password</Text>
            <Text style={styles.actionSub}>Secure your clinical data access</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.BORDER} />
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { marginTop: 40 }]}>DATA MANAGEMENT</Text>
        <TouchableOpacity 
          style={[styles.actionCard, styles.dangerCard]} 
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <View style={styles.dangerIconBox}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </View>
          <View style={styles.textStack}>
            <Text style={[styles.actionTitle, { color: "#FF3B30" }]}>Delete Account</Text>
            <Text style={styles.actionSub}>Remove analysis history & protocols</Text>
          </View>
        </TouchableOpacity>

        {/* Clinical Info Note */}
        <View style={styles.infoBox}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.infoNote}>
            Your medical privacy is our priority. All skin analysis data is encrypted and stored according to secure clinical standards.
          </Text>
        </View>
      </View>
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
    ...SHADOWS.SOFT
  },
  headerTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    letterSpacing: 2 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.S,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },

  content: { padding: 20 },
  sectionLabel: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5, 
    marginBottom: 12,
    marginLeft: 4
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 18,
    borderRadius: RADIUS.L,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  dangerCard: {
    borderColor: '#FF3B3030',
    backgroundColor: '#FF3B3005',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.M,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  dangerIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.M,
    backgroundColor: '#FF3B3010',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  textStack: { flex: 1 },
  actionTitle: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    marginBottom: 2 
  },
  actionSub: { 
    fontSize: 12, 
    color: COLORS.TEXT_SECONDARY, 
    fontWeight: '600' 
  },

  infoBox: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    padding: 24,
    borderRadius: RADIUS.L,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed'
  },
  shieldIcon: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 12,
    borderRadius: 50,
    marginBottom: 15
  },
  infoNote: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    fontWeight: '600'
  }
});