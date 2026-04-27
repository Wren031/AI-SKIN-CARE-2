import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Info, Leaf, Sparkles, Target } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LifestyleDetailScreen() {
  const router = useRouter();
  const { tipData } = useLocalSearchParams();
  
  const tip = useMemo(() => tipData ? JSON.parse(tipData as string) : null, [tipData]);

  if (!tip) return null;

  return (
    <View style={styles.container}>
      {/* Refined Minimal Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WELLNESS PROTOCOL</Text>
        <TouchableOpacity style={styles.infoBtn}>
          <Sparkles size={18} color="#64748B" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseRing} />
            <View style={styles.iconBox}>
              <Leaf size={32} color="#10B981" fill="#10B981" fillOpacity={0.1} />
            </View>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{tip.category || 'HOLISTIC CARE'}</Text>
          </View>
          
          <Text style={styles.titleText}>{tip.title}</Text>
          <Text style={styles.subtitleText}>Optimizing your skin health through daily habits.</Text>
        </View>

        {/* Impact Insight */}
        <View style={styles.impactCard}>
          <View style={styles.impactIcon}>
            <Target size={18} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactLabel}>PRIMARY BENEFIT</Text>
            <Text style={styles.impactValue}>Accelerated Skin Recovery & Barrier Support</Text>
          </View>
        </View>

        {/* Main Guidance */}
        <View style={styles.detailsCard}>
          <View style={styles.labelRow}>
            <Info size={16} color="#64748B" />
            <Text style={styles.labelText}>CLINICAL GUIDANCE</Text>
          </View>
          <Text style={styles.descriptionText}>{tip.description}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              Consistency is key. Small changes in your environment and habits can yield significant dermatological improvements over 4-6 weeks.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFD' },
  
  /* HEADER */
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    backgroundColor: '#FFF',
    paddingBottom: 10
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  infoBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: '#94A3B8', 
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  /* CONTENT */
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },

  /* HERO */
  heroSection: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  pulseContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  pulseRing: { 
    position: 'absolute', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#D1FAE5', 
    opacity: 0.5 
  },
  iconBox: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 4 }
    })
  },
  categoryBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    backgroundColor: '#ECFDF5', 
    borderRadius: 20, 
    marginBottom: 16 
  },
  categoryText: { 
    fontSize: 10, 
    fontWeight: '800', 
    color: '#059669', 
    letterSpacing: 1 
  },
  titleText: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#0F172A', 
    textAlign: 'center', 
    lineHeight: 34,
    letterSpacing: -0.5
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500'
  },

  /* IMPACT CARD */
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 16
  },
  impactIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  impactLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  impactValue: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 },

  /* DESCRIPTION CARD */
  detailsCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 32, 
    padding: 28, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 15 },
      android: { elevation: 2 }
    }),
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  labelText: { fontSize: 11, fontWeight: '900', color: '#64748B', letterSpacing: 1 },
  descriptionText: { 
    fontSize: 16, 
    color: '#334155', 
    lineHeight: 28,
    fontWeight: '400'
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F1F5F9', 
    marginVertical: 24 
  },
  footerNote: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16
  },
  footerNoteText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});