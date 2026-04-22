import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { THEMES } from '@/src/constants/themes';

/**
 * TYPES & INTERFACES
 */
interface SkinCondition {
  label: string;
  severity: string;
  impact: number;
}

interface SkinAnalysis {
  id?: string;
  created_at?: string;
  skin_type?: string;
  image_url?: string;
  score?: number;
  overall_severity?: 'Low' | 'Medium' | 'High' | 'Severe';
  tbl_skin_conditions?: SkinCondition[];
}

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function ViewResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ analysis: string }>();

  /**
   * DATA PARSING
   */
  const analysis = useMemo<SkinAnalysis | null>(() => {
    if (!params.analysis) return null;
    try {
      return JSON.parse(params.analysis);
    } catch (e) {
      console.error("[ViewResult] Parse Error", e);
      return null;
    }
  }, [params.analysis]);

  /**
   * UI CONFIGURATION BASED ON RISK
   */
  const severityConfig = useMemo(() => {
    const level = analysis?.overall_severity?.toLowerCase() || 'low';
    if (['high', 'severe'].includes(level)) {
      return { color: '#FF3B30', label: 'High Risk', icon: 'shield-alert' };
    }
    if (level === 'medium') {
      return { color: '#FFCC00', label: 'Moderate', icon: 'alert-circle' };
    }
    return { color: '#34C759', label: 'Low Risk', icon: 'checkmark-circle' };
  }, [analysis]);

  if (!analysis) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.ACCENT} />
        <Text style={styles.errorTitle}>Analysis Unavailable</Text>
        <Text style={styles.errorText}>We couldn't load your report. Please try scanning again.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ backgroundColor: COLORS.WHITE }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Ionicons name="arrow-back" size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostic Report</Text>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="share-outline" size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- Top Meta Info --- */}
        <View style={styles.reportMeta}>
          <View>
            <Text style={styles.reportId}>REPORT #{analysis.id?.slice(0, 8).toUpperCase() || 'TEMP-01'}</Text>
            <Text style={styles.mainTitle}>{analysis.skin_type || 'Dermatology'} Scan</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {analysis.created_at ? format(new Date(analysis.created_at), 'MMM dd') : 'Today'}
            </Text>
          </View>
        </View>

        {/* --- Specimen Preview --- */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: analysis.image_url }} style={styles.heroImage} />
          <View style={styles.imageTag}>
            <View style={[styles.dot, { backgroundColor: severityConfig.color }]} />
            <Text style={styles.imageTagText}>AI ANALYSIS ACTIVE</Text>
          </View>
        </View>

        {/* --- Key Metrics Section --- */}
        <View style={styles.metricsRow}>
          <View style={styles.scoreMetric}>
            <Text style={styles.metricLabel}>Health Score</Text>
            <View style={styles.scoreValueContainer}>
               <Text style={[styles.scoreValue, { color: severityConfig.color }]}>
                 {Math.round(analysis.score || 0)}
               </Text>
               <Text style={styles.scorePercent}>%</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.statusMetric}>
            <Text style={styles.metricLabel}>Condition Status</Text>
            <View style={[styles.statusPill, { backgroundColor: severityConfig.color + '15' }]}>
              <Ionicons name={severityConfig.icon as any} size={14} color={severityConfig.color} />
              <Text style={[styles.statusText, { color: severityConfig.color }]}>
                {severityConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* --- Condition Findings --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Primary Findings</Text>
          {(analysis.tbl_skin_conditions || []).length > 0 ? (
            (analysis.tbl_skin_conditions || []).map((item, i) => (
              <View key={i} style={styles.findingRow}>
                <View style={styles.findingInfo}>
                  <Text style={styles.findingName}>{item.label}</Text>
                  <Text style={styles.findingSubtext}>Severity: {item.severity}</Text>
                </View>
                <View style={styles.findingGraph}>
                  <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${item.impact}%`, backgroundColor: severityConfig.color }]} />
                  </View>
                  <Text style={styles.findingValue}>{item.impact}%</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.SUCCESS} />
              <Text style={styles.emptyText}>No anomalies detected in this scan.</Text>
            </View>
          )}
        </View>

        {/* --- AI Insight Preview --- */}
        <View style={[styles.card, styles.insightCard]}>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.insightTitle}>Neural Insight</Text>
          </View>
          <Text style={styles.insightText} numberOfLines={2}>
            Based on the biometric scan, our neural network has prepared a personalized action plan...
          </Text>
        </View>

        {/* --- MAIN ACTION BUTTON --- */}
        <TouchableOpacity 
          style={styles.primaryActionBtn}
          onPress={() => router.push('/my-recommendation')} 
          activeOpacity={0.9}
        >
          <View style={styles.btnContent}>
            <Text style={styles.primaryActionBtnText}>View My Recommendations</Text>
            <View style={styles.btnIconCircle}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.PRIMARY} />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerDisclaimer}>
          Generated by DermaAI Clinical Suite • v2.4.0
        </Text>
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
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 20 },
  
  reportMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  reportId: { fontSize: 10, fontWeight: '800', color: COLORS.TEXT_SECONDARY, letterSpacing: 1, marginBottom: 2 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.6 },
  dateBadge: { backgroundColor: COLORS.WHITE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, ...SHADOWS.SOFT },
  dateText: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_PRIMARY },

  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.SOFT,
  },
  heroImage: { width: '100%', height: '100%' },
  imageTag: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  imageTagText: { color: COLORS.WHITE, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  metricsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...SHADOWS.SOFT,
  },
  scoreMetric: { flex: 1, alignItems: 'center' },
  statusMetric: { flex: 1.2, alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: '#E5E5EA' },
  metricLabel: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginBottom: 6, textTransform: 'uppercase' },
  scoreValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 36, fontWeight: '800' },
  scorePercent: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginLeft: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: { fontSize: 13, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.SOFT,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 16 },
  findingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  findingInfo: { flex: 1 },
  findingName: { fontSize: 15, fontWeight: '600', color: COLORS.TEXT_PRIMARY },
  findingSubtext: { fontSize: 11, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  findingGraph: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { width: 60, height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  findingValue: { fontSize: 14, fontWeight: '700', width: 35, textAlign: 'right' },

  insightCard: { backgroundColor: '#F0F4FF', borderWidth: 0, marginBottom: 16 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: COLORS.PRIMARY, textTransform: 'uppercase' },
  insightText: { fontSize: 14, color: '#4A4A68', lineHeight: 20 },

  primaryActionBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    ...SHADOWS.SOFT,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.35,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryActionBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
  btnIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.WHITE, alignItems: 'center', justifyContent: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 10 },
  emptyText: { color: COLORS.TEXT_SECONDARY, fontSize: 14, marginTop: 8 },
  footerDisclaimer: { textAlign: 'center', fontSize: 11, color: COLORS.TEXT_SECONDARY, marginTop: 25, marginBottom: 40 },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorTitle: { fontSize: 20, fontWeight: '700', marginTop: 15 },
  errorText: { textAlign: 'center', color: COLORS.TEXT_SECONDARY, marginVertical: 10 },
  retryBtn: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12, backgroundColor: COLORS.PRIMARY, borderRadius: 12 },
  retryText: { color: COLORS.WHITE, fontWeight: '600' },
});