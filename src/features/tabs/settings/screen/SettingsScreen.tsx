import { THEMES } from '@/src/constants/themes';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import SettingItem from '../components/SettingItem';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

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
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Clinical User';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header - Matching Recommendation Screen Style */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.TEXT_SECONDARY} />
            <TextInput
              placeholder="Search preferences..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
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
                <Text style={styles.profileEmail}>{profile?.email || 'Verified Patient'}</Text>
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
          
          <Text style={styles.versionText}>DERMA AI SYSTEM v1.0.4 • ENCRYPTED</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND },
  
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20, 
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  headerTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    letterSpacing: 3, 
    textAlign: 'center',
    marginBottom: 15
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.BACKGROUND, 
    paddingHorizontal: 15, 
    height: 50, 
    borderRadius: RADIUS.M, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER 
  },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 10, color: COLORS.TEXT_PRIMARY, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 60 },
  
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.WHITE, 
    padding: 20, 
    borderRadius: RADIUS.L, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  avatar: { width: 60, height: 60, borderRadius: RADIUS.M, backgroundColor: COLORS.BACKGROUND, borderWidth: 2, borderColor: COLORS.PRIMARY },
  profileInfo: { flex: 1, marginLeft: 15 },
  profileName: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  profileEmail: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2, fontWeight: '700' },
  
  sectionLabel: { 
    fontSize: 10, fontWeight: '900', color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1.5 
  },
  group: { 
    backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, 
    paddingHorizontal: 15, marginBottom: 25, borderWidth: 1, borderColor: COLORS.BORDER
  },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 18, 
    borderRadius: RADIUS.M,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 12,
    marginTop: 10
  },
  logoutText: { fontSize: 13, fontWeight: '900', color: '#FF3B30', letterSpacing: 1 },
  
  versionText: { 
    textAlign: 'center', color: COLORS.TEXT_SECONDARY, fontSize: 9, 
    marginTop: 30, fontWeight: '800', letterSpacing: 1 
  }
});