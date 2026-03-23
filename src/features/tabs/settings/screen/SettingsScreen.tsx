import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

// Skincare Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#2C362B';
const SOFT_CORAL = '#E67E6E'; // For destructive actions like Sign Out

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
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const { profile, loading } = useProfileData();
  const { logout, loading: authLoading } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to pause your skincare journey and log out?",
      [
        { text: "Stay here", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const SETTINGS_DATA: SectionData[] = [
    {
      section: "Your Profile",
      data: [
        { id: 'personal', icon: "person-outline", title: "Personal Info", color: SAGE, type: 'arrow' },
        { 
          id: 'notif', 
          icon: "notifications-outline", 
          title: "Routine Reminders", 
          type: "switch", 
          value: notifications, 
          onValueChange: (val: boolean) => setNotifications(val), 
          color: SAGE 
        },
        { id: 'privacy', icon: "shield-checkmark-outline", title: "Privacy & Security", color: SAGE, type: 'arrow' },
      ]
    },
    {
      section: "Experience",
      data: [
        { id: 'lang', icon: "earth-outline", title: "Language", type: "text", value: "English", color: SAGE },
        { 
          id: 'dark', 
          icon: "moon-outline", 
          title: "Evening Mode", 
          type: "switch", 
          value: darkMode, 
          onValueChange: (val: boolean) => setDarkMode(val), 
          color: DEEP_SAGE 
        },
      ]
    },
    {
      section: "Oasis Support",
      data: [
        { id: 'help', icon: "help-buoy-outline", title: "Help Center", color: SAGE, type: 'arrow' },
        { id: 'about', icon: "leaf-outline", title: "Our Philosophy", color: SAGE, type: 'arrow' },
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
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={SAGE} />
      </SafeAreaView>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Skin Enthusiast';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Oasis Settings</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search your preferences..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Card */}
          {!searchQuery && (
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.profileCard} 
              onPress={() => router.push('/setup-profile')}
            >
              <Image
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=8FA08E&color=fff` }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{profile?.email || 'View skin profile'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={SAGE} />
            </TouchableOpacity>
          )}

          {/* Dynamic Sections */}
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
                      if (item.id === 'privacy') router.push('/privacy-security');
                      if (item.id === 'help') router.push('/help-center');
                      if (item.id === 'about') router.push('/about-us');
                    }}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Sign Out Section */}
          {!searchQuery && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.sectionLabel}>Session</Text>
              <View style={styles.group}>
                <TouchableOpacity 
                  style={styles.logoutRow} 
                  activeOpacity={0.7}
                  onPress={handleSignOut}
                >
                  <View style={styles.logoutIconContainer}>
                    <Ionicons name="log-out-outline" size={20} color={SOFT_CORAL} />
                  </View>
                  <Text style={styles.logoutText}>End Session</Text>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.versionText}>OASIS VERSION 1.0.4</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAND },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 30, fontWeight: '300', color: DEEP_SAGE, marginBottom: 16, letterSpacing: 0.5 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    height: 54, 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: '#f1f5f9',
    shadowColor: SAGE, shadowOpacity: 0.05, shadowRadius: 10
  },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 10, color: DEEP_SAGE },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 28, 
    marginBottom: 30,
    shadowColor: SAGE, shadowOpacity: 0.08, shadowRadius: 15, elevation: 3
  },
  avatar: { width: 64, height: 64, borderRadius: 24, backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: SAND },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: '700', color: DEEP_SAGE },
  profileEmail: { fontSize: 14, color: '#828282', marginTop: 2, fontStyle: 'italic' },
  
  sectionLabel: { 
    fontSize: 11, fontWeight: '800', color: SAGE, textTransform: 'uppercase', 
    marginBottom: 12, marginLeft: 4, letterSpacing: 1.5 
  },
  group: { 
    backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 16, 
    marginBottom: 28, borderWidth: 1, borderColor: '#f1f5f9'
  },
  
  logoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  logoutIconContainer: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF5F4',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  logoutText: { flex: 1, fontSize: 16, fontWeight: '600', color: SOFT_CORAL },
  
  versionText: { 
    textAlign: 'center', color: '#cbd5e1', fontSize: 10, 
    marginTop: 10, fontWeight: '800', letterSpacing: 2 
  }
});