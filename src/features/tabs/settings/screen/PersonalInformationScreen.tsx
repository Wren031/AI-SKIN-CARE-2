import { THEMES } from '@/src/constants/themes';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

interface InfoRowProps {
  label: string;
  value?: any;
  icon: keyof typeof Ionicons.glyphMap;
}

// Optimized InfoRow with safety check for object values
const InfoRow = memo(({ label, value, icon }: InfoRowProps) => {
  const displayValue = useMemo(() => {
    if (value === null || value === undefined) return 'NOT SPECIFIED';
    if (typeof value === 'object') {
      return value.name || value.label || JSON.stringify(value);
    }
    return String(value).toUpperCase();
  }, [value]);

  return (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{displayValue}</Text>
      </View>
    </View>
  );
});

const SectionHeader = memo(({ title }: { title: string }) => (
  <Text style={styles.sectionHeading}>{title}</Text>
));

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { profile, loading } = useProfileData();
  const [isModalVisible, setModalVisible] = useState(false);

  const fullName = useMemo(() => {
    const parts = [
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'CLINICAL PATIENT';
  }, [profile]);

  const avatarUri = useMemo(() => {
    return profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF7A6D&color=fff`;
  }, [profile?.avatar_url, fullName]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fullscreen Medical Image Preview */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.closeModalBtn} 
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={44} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: avatarUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEDICAL PROFILE</Text>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push('/setup-profile')}
        >
          <Ionicons name="pencil" size={18} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            <View style={styles.expandHint}>
              <Ionicons name="expand" size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{fullName.toUpperCase()}</Text>
          <View style={styles.emailTag}>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>
        </View>

        {/* Clinical Data Body */}
        <View style={styles.contentBody}>
          <SectionHeader title="Patient Demographics" />
          <View style={styles.infoCard}>
            <InfoRow label="Biological Sex" value={profile?.gender} icon="person-outline" />
            <View style={styles.innerDivider} />
            <InfoRow label="Birth Registry" value={profile?.date_of_birth} icon="calendar-outline" />
          </View>

          <SectionHeader title="Secure Contact" />
          <View style={styles.infoCard}>
            <InfoRow label="Mobile Line" value={profile?.phone_number} icon="call-outline" />
            <View style={styles.innerDivider} />
            <InfoRow label="Residential Data" value={profile?.address} icon="location-outline" />
          </View>
        </View>

        {/* Footer Security Note */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.secureText}>ENCRYPTED CLINICAL DATA STORAGE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: width },
  closeModalBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
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
  headerBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: RADIUS.S,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  editBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: RADIUS.S, 
    backgroundColor: COLORS.BACKGROUND, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY 
  },

  scrollPadding: { paddingBottom: 60 },
  
  heroSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 30 },
  avatarWrapper: { 
    ...SHADOWS.SOFT,
    position: 'relative' 
  },
  avatarImg: { 
    width: 120, 
    height: 120, 
    borderRadius: RADIUS.L, 
    backgroundColor: COLORS.WHITE, 
    borderWidth: 3, 
    borderColor: COLORS.PRIMARY 
  },
  expandHint: { 
    position: 'absolute', 
    bottom: -5, 
    right: -5, 
    backgroundColor: COLORS.PRIMARY, 
    borderRadius: 8, 
    padding: 6, 
    borderWidth: 2, 
    borderColor: COLORS.WHITE 
  },
  
  userName: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    marginTop: 20,
    letterSpacing: -0.5
  },
  emailTag: { marginTop: 4 },
  userEmail: { 
    fontSize: 13, 
    color: COLORS.TEXT_SECONDARY, 
    fontWeight: '700' 
  },

  contentBody: { paddingHorizontal: 20 },
  sectionHeading: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5, 
    marginTop: 35, 
    marginBottom: 12, 
    marginLeft: 5 
  },
  infoCard: { 
    backgroundColor: COLORS.WHITE, 
    borderRadius: RADIUS.M, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER, 
    ...SHADOWS.SOFT 
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: RADIUS.M, 
    backgroundColor: COLORS.BACKGROUND, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  textContainer: { flex: 1 },
  infoLabel: { 
    fontSize: 9, 
    fontWeight: '900', 
    color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', 
    marginBottom: 3,
    letterSpacing: 1
  },
  infoValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.TEXT_PRIMARY 
  },
  innerDivider: { 
    height: 1, 
    backgroundColor: COLORS.BORDER, 
    marginLeft: 60 
  },
  
  footer: { 
    marginTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingBottom: 20
  },
  secureText: { 
    color: COLORS.TEXT_SECONDARY, 
    fontSize: 10, 
    fontWeight: '900', 
    marginLeft: 8,
    letterSpacing: 1
  }
});