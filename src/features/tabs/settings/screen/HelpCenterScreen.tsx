import { THEMES } from '@/src/constants/themes';
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

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function HelpCenterScreen() {
  const router = useRouter();

  const HelpCard = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.helpCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.textStack}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.BORDER} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SUPPORT CENTER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Clinical Support</Text>
          <Text style={styles.heroSub}>
            Need assistance with your analysis or treatment protocol? Our technical team is ready to assist.
          </Text>
        </View>

        <View style={styles.section}>
          <HelpCard 
            icon="chatbubbles-outline" 
            title="AI Technical Support" 
            subtitle="Chat with a system specialist" 
            onPress={() => {}} 
          />
          <HelpCard 
            icon="mail-outline" 
            title="Email Medical Desk" 
            subtitle="Response within 24 clinical hours" 
            onPress={() => Linking.openURL('mailto:support@derma-ai.com')} 
          />
          <HelpCard 
            icon="document-text-outline" 
            title="Documentation" 
            subtitle="App guides & clinical FAQs" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.statusDot} />
          <Text style={styles.footerText}>SYSTEM STATUS: OPERATIONAL</Text>
        </View>
      </ScrollView>
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
  
  scrollPadding: { padding: 20 },
  
  heroSection: { marginBottom: 30, marginTop: 10 },
  heroTitle: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    marginBottom: 10,
    letterSpacing: -1
  },
  heroSub: { 
    fontSize: 14, 
    color: COLORS.TEXT_SECONDARY, 
    lineHeight: 22,
    fontWeight: '600'
  },
  
  section: { gap: 16 },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderRadius: RADIUS.L,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  iconBox: { 
    width: 52, 
    height: 52, 
    borderRadius: RADIUS.M, 
    backgroundColor: COLORS.BACKGROUND, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  textStack: { flex: 1 },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY 
  },
  cardSub: { 
    fontSize: 12, 
    color: COLORS.TEXT_SECONDARY, 
    marginTop: 2, 
    fontWeight: '700' 
  },
  
  footer: { 
    marginTop: 50, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.M,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.SUCCESS, // Green dot for operational
    marginRight: 10
  },
  footerText: { 
    color: COLORS.TEXT_SECONDARY, 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1 
  }
});