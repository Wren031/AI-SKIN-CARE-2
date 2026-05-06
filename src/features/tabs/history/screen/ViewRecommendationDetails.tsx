import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

const { COLORS } = THEMES.DERMA_AI;

export default function ViewRecommendationDetails() {
  const { ida } = useLocalSearchParams();
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SEVERITY COLOR MAPPING HELPER
  const getSeverityColor = (severity: string) => {
    const s = severity?.toLowerCase();
    if (s === 'high' || s === 'severe') return { main: '#F43F5E', bg: '#FFF1F2' }; // Rose
    if (s === 'moderate') return { main: '#F59E0B', bg: '#FFFBEB' }; // Amber
    if (s === 'low' || s === 'normal') return { main: '#10B981', bg: '#ECFDF5' }; // Emerald
    return { main: COLORS.PRIMARY, bg: '#F8FAFC' }; // Default
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
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clinical Analysis Report</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.reportLabel}>DIAGNOSIS DATE</Text>
              <Text style={styles.reportDate}>{formatDate(detail?.created_at)}</Text>
            </View>
            {/* Dynamic Overall Severity Badge */}
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

          <Text style={styles.sectionSubtitle}>CONDITION BREAKDOWN</Text>
          <View style={styles.circularContainer}>
            {detail?.skin_result?.conditions?.length > 0 ? (
              detail.skin_result.conditions.map((cond: any, index: number) => {
                const impact = cond.impact || 0;
                const condColors = getSeverityColor(cond.severity);
                
                return (
                  <View key={index} style={styles.gaugeWrapper}>
                    <View style={styles.gaugeContainer}>
                      <View style={styles.gaugeBase} />
                      <View 
                        style={[
                          styles.gaugeProgress, 
                          { 
                            borderColor: condColors.main,
                            borderTopColor: 'transparent',
                            borderLeftColor: impact > 25 ? condColors.main : 'transparent',
                            borderBottomColor: impact > 50 ? condColors.main : 'transparent',
                            borderRightColor: impact > 75 ? condColors.main : 'transparent',
                            transform: [{ rotate: '45deg' }]
                          }
                        ]} 
                      />
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>Prescribed Regimen</Text>
          </View>
          {detail?.recommendation?.recommendation_products?.map((item: any, index: number) => (
            <ProductCard key={index} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.sectionTitle}>Lifestyle Modifications</Text>
          </View>
          {detail?.recommendation?.recommendation_lifestyle_tips?.map((item: any, index: number) => (
            <LifestyleCard key={index} item={item} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Ionicons name="home-outline" size={22} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => router.push({ pathname: '/start-my-journey', params: { ida: detail?.skin_result_id }})}
        >
          <Text style={styles.primaryBtnText}>Initiate Regimen</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 120, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 64, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', letterSpacing: -0.5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  shareBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  mainCard: { margin: 16, padding: 24, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  reportLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  reportDate: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', paddingVertical: 10 },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 8, fontWeight: '600' },
  statValue: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  statUnit: { fontSize: 16, color: '#94A3B8' },
  statValueType: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  verticalDivider: { width: 1, backgroundColor: '#F1F5F9' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  sectionSubtitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, textAlign: 'center', marginBottom: 20 },
  circularContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gaugeWrapper: { width: '30%', alignItems: 'center', marginBottom: 20 },
  gaugeContainer: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gaugeBase: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#F1F5F9' },
  gaugeProgress: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 4 },
  gaugeLabelContainer: { alignItems: 'center', justifyContent: 'center' },
  gaugePercent: { fontSize: 12, fontWeight: '900', color: '#1E293B' },
  gaugeLabel: { fontSize: 11, fontWeight: '700', color: '#475569', textAlign: 'center', textTransform: 'capitalize' },
  gaugeStatus: { fontSize: 9, fontWeight: '800', marginTop: 3, textTransform: 'uppercase' },
  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  footer: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 12 },
  secondaryBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptyText: { flex: 1, textAlign: 'center', color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }
});