import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Unified with Recommendation System */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OUR PHILOSOPHY</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            {/* Clinical Scan/Sparkle Icon */}
            <Ionicons name="sparkles" size={50} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.appName}>DERMA AI</Text>
          <Text style={styles.version}>CLINICAL ENGINE V1.0.4</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            DermaAI bridges the gap between complex clinical dermatology and daily skincare. 
            {"\n\n"}
            We leverage advanced computer vision to provide precise, data-backed analysis of your skin's condition. Our mission is to democratize professional dermatological insights, offering immediate guidance and safety protocols for a healthier skin barrier.
          </Text>
        </View>

        <View style={styles.linkSection}>
          <Text style={styles.sectionLabel}>LEGAL & COMPLIANCE</Text>
          <View style={styles.linkCard}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <Text style={styles.linkText}>Terms of Clinical Service</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <Text style={styles.linkText}>Medical Data Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2026 DERMA AI TECHNOLOGIES INC.{"\n"}
          ANALYSIS POWERED BY NEURAL RADIANCE.
        </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15, 
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  headerTitle: { 
    fontSize: 13, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    letterSpacing: 2 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: RADIUS.S,
    borderWidth: 1,
    borderColor: COLORS.BORDER
  },
  
  content: { padding: 24, alignItems: 'center' },
  
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  logoPlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: RADIUS.L, 
    backgroundColor: COLORS.WHITE, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  appName: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: COLORS.TEXT_PRIMARY, 
    marginTop: 20,
    letterSpacing: 3
  },
  version: { 
    fontSize: 10, 
    color: COLORS.TEXT_SECONDARY, 
    fontWeight: '800', 
    marginTop: 8,
    letterSpacing: 1.5
  },
  
  descriptionBox: { 
    backgroundColor: COLORS.WHITE, 
    padding: 24, 
    borderRadius: RADIUS.M, 
    borderWidth: 1, 
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  descriptionText: { 
    fontSize: 14, 
    color: COLORS.TEXT_PRIMARY, 
    lineHeight: 24, 
    textAlign: 'center',
    fontWeight: '500'
  },
  
  linkSection: { width: '100%', marginTop: 35 },
  sectionLabel: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: COLORS.TEXT_SECONDARY, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 5
  },
  linkCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.M,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  linkRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18 
  },
  linkText: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  divider: { height: 1, backgroundColor: COLORS.BACKGROUND },
  
  copyright: { 
    marginTop: 50, 
    marginBottom: 30, 
    color: COLORS.TEXT_SECONDARY, 
    fontSize: 9, 
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 1
  }
});