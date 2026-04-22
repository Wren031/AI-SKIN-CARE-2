import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function MyRecommendation() {
  const router = useRouter();

  const recommendations = [
    {
      category: 'Product Regimen',
      icon: 'beaker-outline',
      items: [
        { title: 'Gentle Hydrating Cleanser', desc: 'Use twice daily to maintain pH balance.' },
        { title: 'Niacinamide Serum', desc: 'Apply at night to reduce redness and inflammation.' },
      ],
      color: '#5856D6',
    },
    {
      category: 'Clinical Actions',
      icon: 'medical-outline',
      items: [
        { title: 'Dermatologist Consult', desc: 'Recommended within 14 days for a formal biopsy.' },
        { title: 'Weekly Monitoring', desc: 'Take a photo scan every Sunday to track changes.' },
      ],
      color: '#FF3B30',
    },
    {
      category: 'Lifestyle & Habits',
      icon: 'leaf-outline',
      items: [
        { title: 'Increase Water Intake', desc: 'Aim for 2.5L daily to improve skin elasticity.' },
        { title: 'UV Protection', desc: 'Re-apply SPF 50 every 2 hours when outdoors.' },
      ],
      color: '#34C759',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ backgroundColor: COLORS.WHITE }} />

      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personalized Plan</Text>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- Summary Intro --- */}
        <View style={styles.introSection}>
          <Text style={styles.welcomeText}>Your Clinical Strategy</Text>
          <Text style={styles.descText}>
            Based on your recent AI analysis, our specialists recommend the following steps to optimize your skin recovery.
          </Text>
        </View>

        {/* --- Dynamic Recommendation Cards --- */}
        {recommendations.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconBox, { backgroundColor: section.color + '15' }]}>
                <Ionicons name={section.icon as any} size={20} color={section.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: section.color }]}>{section.category}</Text>
            </View>

            {section.items.map((item, i) => (
              <View key={i} style={styles.recItem}>
                <View style={styles.bullet} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* --- Support Action --- */}
        <TouchableOpacity
        onPress={() => router.push('/start-my-journey')} 
        style={styles.consultButton} activeOpacity={0.8}>
          <Text style={styles.consultButtonText}>Start My Skin Care Routine</Text>

        </TouchableOpacity>

        <View style={styles.legalNotice}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.legalText}>
            Recommendations are AI-assisted clinical suggestions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.WHITE,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  backBtn: { padding: 5 },
  saveBtn: { 
    backgroundColor: '#F2F2F7', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  saveText: { fontSize: 12, fontWeight: '700', color: COLORS.PRIMARY },
  
  scrollContent: { padding: 20 },
  
  introSection: { marginBottom: 25 },
  welcomeText: { fontSize: 24, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  descText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, lineHeight: 22 },

  sectionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.SOFT,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  recItem: { flexDirection: 'row', gap: 15, marginBottom: 16 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D1D6', marginTop: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  itemDesc: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18 },

  consultButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    ...SHADOWS.SOFT,
  },
  consultButtonText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },

  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 6,
    marginBottom: 40
  },
  legalText: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '500' },
});