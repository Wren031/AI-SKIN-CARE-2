import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Unified Skincare Oasis Palette
const THEME = {
  primary: '#8FA08E', // Sage Green
  background: '#FCFAF7', // Warm Sand
  surface: '#FFFFFF',
  textMain: '#3A4D39', // Deep Sage
  textSub: '#828282',
  accentLight: '#F0F4F0',
  border: '#F1F5F9',
};

interface InfoRowProps {
  label: string;
  value?: string | null;
  icon: keyof typeof Ionicons.glyphMap;
}

const InfoRow = memo(({ label, value, icon }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={20} color={THEME.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
    </View>
  </View>
));

const SectionHeader = memo(({ title }: { title: string }) => (
  <Text style={styles.sectionHeading}>{title}</Text>
));

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { profile, loading } = useProfileData();

  const fullName = useMemo(() => {
    const parts = [
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Skin Enthusiast';
  }, [profile]);

  const avatarUri = useMemo(() => {
    return profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=8FA08E&color=fff`;
  }, [profile?.avatar_url, fullName]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerBtn}
        >
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Skin Profile</Text>
        
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push('/setup-profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={18} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatarImg}
            />
          </View>
          <Text style={styles.userName}>{fullName}</Text>
          <View style={styles.emailTag}>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          <SectionHeader title="The Basics" />
          <View style={styles.infoCard}>
            <InfoRow label="Gender Identity" value={profile?.gender} icon="leaf-outline" />
            <View style={styles.innerDivider} />
            <InfoRow label="Date of Birth" value={profile?.date_of_birth} icon="calendar-clear-outline" />
          </View>

          <SectionHeader title="Contact Details" />
          <View style={styles.infoCard}>
            <InfoRow label="Phone Number" value={profile?.phone_number} icon="call-outline" />
            <View style={styles.innerDivider} />
            <InfoRow label="Shipping Address" value={profile?.address} icon="location-outline" />
          </View>
        </View>

        {/* Secure Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={THEME.primary} />
          <Text style={styles.secureText}>Your data is private and botanical-safe</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '300', 
    color: THEME.textMain, 
    letterSpacing: 0.5 
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  editBtn: { 
    width: 38, height: 38, borderRadius: 12, 
    backgroundColor: THEME.accentLight, 
    justifyContent: 'center', alignItems: 'center'
  },

  scrollPadding: { paddingBottom: 60 },

  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarWrapper: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImg: { 
    width: 110, height: 110, 
    borderRadius: 40, // Botanical Squircle
    backgroundColor: THEME.accentLight,
    borderWidth: 3,
    borderColor: '#FFF'
  },
  userName: { 
    fontSize: 24, fontWeight: '700', 
    color: THEME.textMain, marginTop: 18 
  },
  emailTag: { 
    marginTop: 6,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  userEmail: { 
    fontSize: 14, color: THEME.textSub, 
    fontStyle: 'italic', fontWeight: '500' 
  },

  contentBody: { paddingHorizontal: 24 },
  sectionHeading: { 
    fontSize: 11, fontWeight: '800', 
    color: THEME.primary, textTransform: 'uppercase', 
    letterSpacing: 1.5, marginTop: 28, marginBottom: 12, marginLeft: 4 
  },
  infoCard: { 
    backgroundColor: THEME.surface, borderRadius: 28, 
    padding: 16, borderWidth: 1, borderColor: THEME.border,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10
  },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconContainer: { 
    width: 44, height: 44, borderRadius: 16, 
    backgroundColor: THEME.accentLight, 
    alignItems: 'center', justifyContent: 'center', marginRight: 16 
  },
  textContainer: { flex: 1 },
  infoLabel: { 
    fontSize: 11, fontWeight: '700', 
    color: THEME.textSub, textTransform: 'uppercase', 
    marginBottom: 2 
  },
  infoValue: { 
    fontSize: 15, fontWeight: '600', 
    color: THEME.textMain 
  },
  innerDivider: { height: 1, backgroundColor: THEME.border, marginLeft: 60 },

  footer: { 
    marginTop: 50, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'center',
    opacity: 0.6
  },
  secureText: { 
    color: THEME.textSub, fontSize: 12, 
    fontWeight: '600', marginLeft: 8 
  }
});