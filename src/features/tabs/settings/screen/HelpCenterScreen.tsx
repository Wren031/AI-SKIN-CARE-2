import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Unified Skincare Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';
const SOFT_CORAL = '#E67E6E';

export default function HelpCenterScreen() {
  const router = useRouter();

  const HelpCard = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.helpCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={SAGE} />
      </View>
      <View style={styles.textStack}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={DEEP_SAGE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skin Concierge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>How can we assist your glow?</Text>
          <Text style={styles.heroSub}>
            Our experts are here to help you navigate your skincare journey and app preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <HelpCard 
            icon="chatbubbles-outline" 
            title="Live Guidance" 
            subtitle="Speak with our wellness team" 
            onPress={() => {}} 
          />
          <HelpCard 
            icon="mail-outline" 
            title="Message Oasis" 
            subtitle="Response within one business day" 
            onPress={() => Linking.openURL('mailto:concierge@oasis-skin.com')} 
          />
          <HelpCard 
            icon="journal-outline" 
            title="Knowledge Base" 
            subtitle="Common questions & skin tips" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>Concierge Available: 9 AM - 6 PM</Text>
        </View>
      </ScrollView>
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
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: '300', color: DEEP_SAGE, letterSpacing: 0.5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  scrollPadding: { padding: 24 },
  
  heroSection: { marginBottom: 35, marginTop: 10 },
  heroTitle: { 
    fontSize: 28, 
    fontWeight: '300', 
    color: DEEP_SAGE, 
    marginBottom: 12,
    lineHeight: 34 
  },
  heroSub: { 
    fontSize: 15, 
    color: '#828282', 
    lineHeight: 24,
    fontStyle: 'italic' 
  },
  
  section: { gap: 16 },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: SAGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  iconBox: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    backgroundColor: '#F0F4F0', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  textStack: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: DEEP_SAGE },
  cardSub: { fontSize: 13, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
  
  footer: { 
    marginTop: 50, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SAGE,
    marginRight: 10
  },
  footerText: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }
});