import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { LifestyleCard } from '../components/LifestyleCard';
import { ProductCard } from '../components/ProductCard';
import { user_recommendation_service } from '../services/user_recommendation_service';

const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

export default function ViewRecommendationDetails() {
  const { ida } = useLocalSearchParams();
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SEVERITY COLOR MAPPING HELPER
  const getSeverityColor = (severity: string) => {
    const s = severity?.toLowerCase();
    if (s === 'high' || s === 'severe') return { main: '#F43F5E', bg: '#FFF1F2' }; 
    if (s === 'moderate' || s === 'medium') return { main: '#F59E0B', bg: '#FFFBEB' }; 
    if (s === 'low' || s === 'normal') return { main: '#10B981', bg: '#ECFDF5' }; 
    return { main: COLORS.PRIMARY, bg: '#F8FAFC' }; 
  };

  useEffect(() => {
    async function getDetails() {
      if (!ida) return;
      try {
        setLoading(true);
        const data = await user_recommendation_service.get_recommendation_by_id(ida as string);
        if (data) setDetail(data);
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setLoading(false);
      }
    }
    getDetails();
  }, [ida]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="small" color={COLORS.PRIMARY} /></View>
  );

  const overallColors = getSeverityColor(detail?.skin_result?.overall_severity);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Report</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.mainCard}>
          {/* 1. CAPTURED SCAN IMAGE */}
          {detail?.skin_result?.image_url ? (
            <Image 
              source={{ uri: detail.skin_result.image_url }} 
              style={styles.scanImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={COLORS.BORDER} />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.reportLabel}>DIAGNOSIS DATE</Text>
              <Text style={styles.reportDate}>{formatDate(detail?.created_at)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: overallColors.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: overallColors.main }]} />
              <Text style={[styles.statusText, { color: overallColors.main }]}>
                {detail?.skin_result?.overall_severity || 'Normal'}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Health Score</Text>
              <Text style={styles.statValue}>{detail?.skin_result?.score || 0}<Text style={styles.statUnit}>%</Text></Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Skin Type</Text>
              <Text style={styles.statValueType}>{detail?.skin_result?.skin_type || '--'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 2. TREATMENT & PRECAUTIONS SECTION */}
          <View style={styles.medicalInfoContainer}>
            <View style={styles.infoSection}>
              <View style={styles.infoTitleRow}>
                <Ionicons name="medkit" size={14} color={COLORS.PRIMARY} />
                <Text style={styles.infoLabel}>CLINICAL TREATMENT</Text>
              </View>
              <Text style={styles.infoText}>
                {detail?.recommendation?.treatment || "Maintain a consistent skincare routine and monitor for changes."}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoTitleRow}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text style={[styles.infoLabel, { color: '#F59E0B' }]}>PRECAUTIONS</Text>
              </View>
              <Text style={styles.infoText}>
                {detail?.recommendation?.precautions || "Avoid excessive sun exposure and harsh chemical exfoliants."}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 3. CONDITION GAUGES */}
          <Text style={styles.sectionSubtitle}>DETECTION BREAKDOWN</Text>
          <View style={styles.circularContainer}>
            {detail?.skin_result?.conditions?.length > 0 ? (
              detail.skin_result.conditions.map((cond: any, index: number) => {
                const impact = cond.impact || 0;
                const condColors = getSeverityColor(cond.severity);
                return (
                  <View key={index} style={styles.gaugeWrapper}>
                    <View style={styles.gaugeContainer}>
                      <View style={styles.gaugeBase} />
                      <View style={[styles.gaugeProgress, { borderColor: condColors.main, borderTopColor: 'transparent', borderLeftColor: impact > 25 ? condColors.main : 'transparent', borderBottomColor: impact > 50 ? condColors.main : 'transparent', borderRightColor: impact > 75 ? condColors.main : 'transparent', transform: [{ rotate: '45deg' }] }]} />
                      <View style={styles.gaugeLabelContainer}>
                        <Text style={styles.gaugePercent}>{impact}%</Text>
                      </View>
                    </View>
                    <Text style={styles.gaugeLabel} numberOfLines={1}>{cond.label}</Text>
                    <Text style={[styles.gaugeStatus, { color: condColors.main }]}>{cond.severity}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No clinical concerns detected.</Text>
            )}
          </View>
        </View>

        {/* PRODUCTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>Recommended Products</Text>
          </View>
{detail?.recommendation?.recommendation_products?.map((item: any, index: number) => (
  <ProductCard key={index} item={item.product} /> 
))}
        </View>

        {/* LIFESTYLE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>Daily Lifestyle Tips</Text>
          </View>
{detail?.recommendation?.recommendation_lifestyle_tips?.map((item: any, index: number) => (
  <LifestyleCard key={index} item={item.lifestyle} />
))}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Ionicons name="home-outline" size={22} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => router.push({ pathname: '/start-my-journey', params: { ida: detail?.skin_result_id }})}
        >
          <Text style={styles.primaryBtnText}>Start Journey</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  backBtn: { width: 40 },
  shareBtn: { width: 40, alignItems: 'flex-end' },
  mainCard: { margin: 16, padding: 20, borderRadius: 28, backgroundColor: '#FFF', ...SHADOWS.SOFT, borderWidth: 1, borderColor: '#F1F5F9' },
  
  scanImage: { width: '100%', height: 220, borderRadius: 20, marginBottom: 20 },
  imagePlaceholder: { width: '100%', height: 220, borderRadius: 20, marginBottom: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  placeholderText: { marginTop: 8, fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  reportLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  reportDate: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 4, fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  statUnit: { fontSize: 14, color: '#94A3B8' },
  statValueType: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },

  medicalInfoContainer: { gap: 12 },
  infoSection: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: COLORS.PRIMARY, letterSpacing: 0.5 },
  infoText: { fontSize: 13, color: '#475569', lineHeight: 18, fontWeight: '500' },

  sectionSubtitle: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, textAlign: 'center', marginBottom: 15 },
  circularContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  gaugeWrapper: { width: '28%', alignItems: 'center' },
  gaugeContainer: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  gaugeBase: { position: 'absolute', width: 54, height: 54, borderRadius: 27, borderWidth: 3, borderColor: '#F1F5F9' },
  gaugeProgress: { position: 'absolute', width: 54, height: 54, borderRadius: 27, borderWidth: 3 },
  gaugeLabelContainer: { alignItems: 'center' },
  gaugePercent: { fontSize: 11, fontWeight: '900', color: '#1E293B' },
  gaugeLabel: { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center' },
  gaugeStatus: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', marginTop: 2 },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  
  footer: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10, paddingBottom: 30 },
  secondaryBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 12 }
});