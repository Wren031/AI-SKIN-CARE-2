import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Internal Imports
import { THEMES } from '@/src/constants/themes';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import SettingItem from '../components/SettingItem';

const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

// --- Interfaces ---
interface SettingData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  type?: 'arrow' | 'switch' | 'text';
  value?: string | boolean;
  onValueChange?: (val: boolean) => void;
}

interface SectionData {
  section: string;
  data: SettingData[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const { profile, loading } = useProfileData();
  const { logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "End Clinical Session",
      "Are you sure you want to sign out? Your analysis history is securely saved.",
      [
        { text: "Stay", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => await logout() 
        }
      ]
    );
  };

  const SETTINGS_DATA: SectionData[] = [
    {
      section: "Clinical Identity",
      data: [
        { id: 'personal', icon: "person-outline", title: "Personal Information", color: COLORS.PRIMARY, type: 'arrow' },
        { 
          id: 'notif', 
          icon: "notifications-outline", 
          title: "Treatment Alerts", 
          type: "switch", 
          value: notifications, 
          onValueChange: (val: boolean) => setNotifications(val), 
          color: COLORS.PRIMARY 
        },
        { id: 'privacy', icon: "shield-checkmark-outline", title: "Data Protection", color: COLORS.PRIMARY, type: 'arrow' },
      ]
    },
    {
      section: "System Preferences",
      data: [
        { id: 'lang', icon: "language-outline", title: "Interface Language", type: "text", value: "English", color: COLORS.PRIMARY },
        { 
          id: 'dark', 
          icon: "moon-outline", 
          title: "High Contrast Mode", 
          type: "switch", 
          value: darkMode, 
          onValueChange: (val: boolean) => setDarkMode(val), 
          color: COLORS.TEXT_PRIMARY 
        },
      ]
    },
    {
      section: "Support & Research",
      data: [
        { id: 'help', icon: "help-circle-outline", title: "Clinical Support", color: COLORS.PRIMARY, type: 'arrow' },
        { id: 'about', icon: "information-circle-outline", title: "AI Methodology", color: COLORS.PRIMARY, type: 'arrow' },
      ]
    }
  ];

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_DATA;
    return SETTINGS_DATA.map(section => ({
      ...section,
      data: section.data.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.data.length > 0);
  }, [searchQuery, notifications, darkMode]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Clinical User';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* HEADER - Aligned with other screens */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.subtitle}>SYSTEM CONFIGURATION</Text>
              <Text style={styles.title}>Settings</Text>
            </View>
          </View>

          {/* Search Bar - Unified Surface Style */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.TEXT_SECONDARY} />
            <TextInput
              placeholder="Search preferences..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
              selectionColor={COLORS.PRIMARY}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Summary Card */}
          {!searchQuery && (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.profileCard} 
              onPress={() => router.push('/setup-profile')}
            >
              <Image
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=FF7A6D&color=fff` }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{profile?.email || 'Verified Account'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          )}

          {/* Settings Groups */}
          {filteredSettings.map((section) => (
            <View key={section.section}>
              <Text style={styles.sectionLabel}>{section.section}</Text>
              <View style={styles.group}>
                {section.data.map((item, index) => (
                  <SettingItem
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    color={item.color}
                    type={item.type}
                    value={item.value}
                    onValueChange={item.onValueChange}
                    isLast={index === section.data.length - 1}
                    onPress={() => {
                      if (item.id === 'personal') router.push('/personal-info');
                      if (item.id === 'help') router.push('/help-center');
                      if (item.id === 'privacy') router.push('/change-password');
                    }}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Logout Action */}
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.logoutBtn} 
              activeOpacity={0.8}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>TERMINATE SESSION</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.versionText}>DERMA AI SYSTEM v1.0.4 • SECURE PROTOCOL</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND },
  
  // Header matching App Theme
  header: { paddingHorizontal: 20, paddingTop: 12, marginBottom: 15 },
  headerContent: { marginBottom: 20 },
  subtitle: { fontSize: 10, color: COLORS.TEXT_SECONDARY, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5, marginTop: 2 },

  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.WHITE, 
    paddingHorizontal: 16, 
    height: 52, 
    borderRadius: RADIUS.S, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  searchInput: { flex: 1, fontSize: 15, marginLeft: 10, color: COLORS.TEXT_PRIMARY, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 },
  
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.WHITE, 
    padding: 20, 
    borderRadius: RADIUS.M, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.INPUT_BG, borderWidth: 1, borderColor: COLORS.BORDER },
  profileInfo: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  profileEmail: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginTop: 2, fontWeight: '600' },
  
  sectionLabel: { 
    fontSize: 10, fontWeight: '800', color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1 
  },
  group: { 
    backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, 
    paddingHorizontal: 16, marginBottom: 25, borderWidth: 1, borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    padding: 18, 
    borderRadius: RADIUS.M,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    gap: 12,
    marginTop: 10
  },
  logoutText: { fontSize: 13, fontWeight: '800', color: '#FF3B30', letterSpacing: 1 },
  
  versionText: { 
    textAlign: 'center', color: COLORS.TEXT_SECONDARY, fontSize: 10, 
    marginTop: 30, fontWeight: '700', letterSpacing: 0.5 
  }
});