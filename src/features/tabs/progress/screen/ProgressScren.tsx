import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart } from "react-native-gifted-charts";

import { THEMES } from '@/src/constants/themes';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { FilterType, useSkinProgress } from '../hooks/useSkinProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 40;
const VISIBLE_BARS = 6;
const CHART_CONTENT_WIDTH = SCREEN_WIDTH - CHART_PADDING - 40;
const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, SHADOWS } = SKIN_THEME;

const CHART_COLORS = { low: '#FF3B5D', medium: '#FF7F9A', high: '#0ED383', empty: '#E2E8F0' };

// Helpers
const getScoreColor = (score: number) => {
  if (score === 0) return CHART_COLORS.empty;
  if (score < 40) return CHART_COLORS.low;
  if (score < 75) return CHART_COLORS.medium;
  return CHART_COLORS.high;
};

const getSkinStatus = (score: number) => {
  if (score === 0) return "No Data";
  if (score < 40) return "Needs Attention";
  if (score < 75) return "Improving";
  return "Healthy";
};

// Sub-components
const BarTopLabel = ({ score }: { score: number }) => (
  <Text style={[styles.barTopLabel, { color: getScoreColor(score) }]}>
    {score > 0 ? score : ''}
  </Text>
);

const ActionCard = ({ icon, title, value, color, bgColor }: any) => (
  <View style={styles.actionCard}>
    <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSub}>{value}</Text>
  </View>
);

export default function ProgressScreen() {
  const { profile } = useProfileData();
  const { 
    loading, currentScore, scoreDiff, total, daysRemaining, 
    chartData, filter, setFilter, refresh, raw 
  } = useSkinProgress();

  const isNewUser = total === 0;
  const barWidth = 28;
  const spacing = (CHART_CONTENT_WIDTH - (barWidth * VISIBLE_BARS)) / VISIBLE_BARS;

  const formattedChartData = chartData.map(item => ({
    ...item,
    frontColor: getScoreColor(item.value),
    topLabelComponent: () => <BarTopLabel score={item.value} />,
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[COLORS.BACKGROUND, '#F8FAFC']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.subtitle}>Skin Health Overview</Text>
              <Text style={styles.title}>Skin Progress Analysis</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={refresh}>
              <Ionicons name="refresh-outline" size={22} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <LinearGradient colors={[COLORS.PRIMARY, '#6366F1']} style={styles.heroGradient} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Current Skin Score</Text>

              <View style={styles.rowCenter}>
                <Text style={styles.heroValue}>{isNewUser ? '--' : currentScore}</Text>
                {!isNewUser && <Text style={styles.heroUnit}>%</Text>}
                
                {!isNewUser && scoreDiff !== 0 && (
                  <View style={[
                    styles.varianceBadge, 
                    { backgroundColor: scoreDiff > 0 ? '#0ED383' : '#FF3B5D' }
                  ]}>
                    <Ionicons 
                      name={scoreDiff > 0 ? "arrow-up" : "arrow-down"} 
                      size={12} 
                      color="#FFF" 
                    />
                    <Text style={styles.varianceText}>
                      {scoreDiff > 0 ? '+' : ''}{scoreDiff}%
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.badge}>
                <Ionicons name="analytics" size={14} color="#FFF" />
                <Text style={styles.badgeText}>
                    {isNewUser ? "Awaiting First Scan" : getSkinStatus(currentScore)}
                </Text>
              </View>
            </View>
            <View style={styles.heroSecondary}>
              <Text style={styles.heroSubValue}>{total}</Text>
              <Text style={styles.heroSubLabel}>Total Assessments</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <ActionCard 
              icon="calendar" title="Next Assessment" 
              value={daysRemaining !== null ? `${daysRemaining}d` : 'Due'} 
              color={COLORS.PRIMARY} bgColor="#EEF2FF" 
            />
            <ActionCard 
              icon="shield-checkmark" title="Skin Status" 
              value={isNewUser ? "Ready" : getSkinStatus(currentScore)} 
              color={isNewUser ? COLORS.PRIMARY : getScoreColor(currentScore)} bgColor="#ECFDF5" 
            />
          </View>

          {/* CHART / EMPTY STATE CONTAINER */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Skin Analytics</Text>
              {!isNewUser && (
                <View style={styles.toggleContainer}>
                    {(['Monthly', 'Bi-Weekly'] as FilterType[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setFilter(t)}
                        style={[styles.toggleBtn, filter === t && styles.toggleBtnActive]}
                    >
                        <Text style={[styles.toggleText, filter === t && styles.toggleTextActive]}>
                        {t === 'Monthly' ? 'M' : '2W'}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            <View style={styles.chartWrapper}>
              {isNewUser ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="sparkles" size={32} color={COLORS.PRIMARY} />
                  </View>
                  <Text style={styles.emptyTitle}>Good day, {profile?.first_name || 'User'}!</Text>
                  <Text style={styles.emptySubtitle}>Please scan your face to generate your first skin progress report.</Text>
                </View>
              ) : raw.length > 0 ? (
                <BarChart
                  data={formattedChartData}
                  barWidth={28}
                  spacing={spacing}
                  initialSpacing={10}
                  width={CHART_CONTENT_WIDTH}
                  roundedTop roundedBottom hideRules hideYAxisText
                  xAxisThickness={0} yAxisThickness={0}
                  height={200} maxValue={100} isAnimated
                  xAxisLabelTextStyle={styles.axisLabelText}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.actionTitle}>No assessment data available</Text>
                  <Text style={styles.subtitle}>Start a scan to generate insights</Text>
                </View>
              )}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  rowCenter: { flexDirection: 'row', alignItems: 'baseline' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  subtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '600', textTransform: 'uppercase' },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.WHITE,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.SOFT,
  },
  heroCard: { height: 160, borderRadius: 24, flexDirection: 'row', alignItems: 'center', padding: 24, marginBottom: 20, overflow: 'hidden' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroInfo: { flex: 1 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  heroValue: { color: COLORS.WHITE, fontSize: 52, fontWeight: '900' },
  heroUnit: { color: COLORS.WHITE, fontSize: 20, fontWeight: '600', marginLeft: 2 },
  
  varianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
    alignSelf: 'center',
    marginBottom: 8,
  },
  varianceText: { color: '#FFF', fontSize: 14, fontWeight: '800', marginLeft: 2 },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  badgeText: { color: COLORS.WHITE, fontSize: 11, fontWeight: '700' },
  heroSecondary: { alignItems: 'flex-end', justifyContent: 'center' },
  heroSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  heroSubValue: { color: COLORS.WHITE, fontSize: 32, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 15, marginBottom: 24 },
  actionCard: { flex: 1, backgroundColor: COLORS.WHITE, padding: 16, borderRadius: 20, ...SHADOWS.SOFT },
  iconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  actionSub: { fontSize: 16, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  chartContainer: { backgroundColor: COLORS.WHITE, borderRadius: 24, padding: 20, ...SHADOWS.SOFT },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  chartTitle: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: COLORS.WHITE, ...SHADOWS.SOFT },
  toggleText: { fontSize: 12, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  toggleTextActive: { color: COLORS.PRIMARY },
  chartWrapper: { alignItems: 'center', minHeight: 220, justifyContent: 'center' },
  barTopLabel: { fontSize: 10, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  axisLabelText: { color: COLORS.TEXT_SECONDARY, fontSize: 10, fontWeight: '600' },

  // EMPTY STATE
  emptyState: { alignItems: 'center', paddingHorizontal: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
});