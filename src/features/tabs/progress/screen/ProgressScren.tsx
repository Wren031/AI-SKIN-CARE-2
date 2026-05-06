import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
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

// Internal Imports
import { THEMES } from '@/src/constants/themes';
import { FilterType, useSkinProgress } from '../hooks/useSkinProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { COLORS, SHADOWS, RADIUS } = THEMES.DERMA_AI;

// --- Constants ---
const CHART_PADDING = 40;
const VISIBLE_BARS = 5;
const CHART_CONTENT_WIDTH = SCREEN_WIDTH - CHART_PADDING - 40;
const BAR_WIDTH = 28;

const CHART_COLORS = {
  low: '#FDA4AF',    // Rose 300
  medium: COLORS.PRIMARY, // Theme Primary
  high: COLORS.SUCCESS,   // Success Teal
  empty: COLORS.INPUT_BG
};

// --- Sub-Components ---

interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  color: string;
  bgColor: string;
}

const ActionCard = ({ icon, title, value, color, bgColor }: ActionCardProps) => (
  <View style={styles.actionCard}>
    <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSub}>{value}</Text>
    </View>
  </View>
);

export default function ProgressScreen() {
  const {
    loading, currentScore, scoreDiff, total, raw,
    chartData, filter, setFilter, refresh
  } = useSkinProgress();

  const scrollRef = useRef<ScrollView>(null);
  const isNewUser = total === 0;

  // Chart Spacing Logic
  const spacing = (CHART_CONTENT_WIDTH - (BAR_WIDTH * VISIBLE_BARS)) / (VISIBLE_BARS - 1);
  const totalInternalWidth = chartData.length * (BAR_WIDTH + spacing);

  const getNextScanDate = () => {
    if (isNewUser || !raw.length) return "Start Now";
    const lastEntry = [...raw].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const date = new Date(lastEntry.created_at);
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLastScanDate = () => {
    if (isNewUser || !raw.length) return "N/A";
    const lastEntry = [...raw].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return new Date(lastEntry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    if (!loading && chartData.length > 0) {
      const scrollToX = filter === 'Monthly' 
        ? (BAR_WIDTH + spacing) * (new Date().getMonth() - 2) 
        : totalInternalWidth;
      
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: Math.max(0, scrollToX), animated: true });
      }, 600);
    }
  }, [loading, filter, chartData.length]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER - Aligned with HomeScreen */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitle}>PERSONAL ANALYTICS</Text>
            <Text style={styles.title}>Skin Health</Text>
          </View>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={refresh}>
            <Ionicons name="refresh" size={20} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>Overall Vitality Score</Text>
            <View style={styles.rowCenter}>
              <Text style={styles.heroValue}>{isNewUser ? '--' : currentScore}</Text>
              {!isNewUser && <Text style={styles.heroUnit}>%</Text>}
              {!isNewUser && scoreDiff !== 0 && (
                <View style={[styles.varianceBadge, { backgroundColor: scoreDiff > 0 ? '#ECFDF5' : '#FFF1F2' }]}>
                  <Text style={[styles.varianceText, { color: scoreDiff > 0 ? COLORS.SUCCESS : COLORS.PRIMARY }]}>
                    {scoreDiff > 0 ? '▲' : '▼'} {Math.abs(scoreDiff)}%
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isNewUser ? COLORS.BORDER : (currentScore >= 75 ? COLORS.SUCCESS : COLORS.PRIMARY) }]} />
              <Text style={styles.statusText}>
                {isNewUser ? "Waiting for scan" : currentScore >= 75 ? "Optimal Condition" : "Improving Status"}
              </Text>
            </View>
          </View>
          
          <View style={styles.heroSecondary}>
            <View style={styles.scanCountCircle}>
               <Text style={styles.heroSubValue}>{total}</Text>
               <Text style={styles.heroSubLabel}>Scans</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <ActionCard 
            icon="calendar-outline" 
            title="Next Due" 
            value={getNextScanDate()} 
            color={COLORS.ACCENT} 
            bgColor={`${COLORS.ACCENT}15`} 
          />
          <ActionCard 
            icon="time-outline" 
            title="Last Entry" 
            value={getLastScanDate()} 
            color={COLORS.PRIMARY} 
            bgColor={`${COLORS.PRIMARY}15`} 
          />
        </View>

        {/* CHART SECTION */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Progress Timeline</Text>
            {!isNewUser && (
              <View style={styles.toggleContainer}>
                {(['Monthly', 'Yearly'] as FilterType[]).map((t) => (
                  <TouchableOpacity 
                    key={t} 
                    onPress={() => setFilter(t)} 
                    style={[styles.toggleBtn, filter === t && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleText, filter === t && styles.toggleTextActive]}>
                      {t === 'Monthly' ? 'Months' : 'Logs'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.chartWrapper}>
            {isNewUser ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={40} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyTitle}>No Data Recorded</Text>
                <Text style={styles.emptySubtitle}>Complete your first AI scan to see your progress trends.</Text>
              </View>
            ) : (
              <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ paddingRight: 20 }}>
                  <BarChart
                    data={chartData.map(item => ({
                      ...item,
                      frontColor: item.value >= 75 ? CHART_COLORS.high : item.value >= 40 ? CHART_COLORS.medium : CHART_COLORS.low,
                      topLabelComponent: () => (
                        <Text style={styles.barTopLabel}>{item.value > 0 ? item.value : ''}</Text>
                      ),
                    }))}
                    barWidth={BAR_WIDTH}
                    spacing={spacing}
                    initialSpacing={10}
                    width={totalInternalWidth}
                    roundedTop
                    hideRules
                    hideYAxisText
                    xAxisThickness={0}
                    yAxisThickness={0}
                    height={180}
                    maxValue={100}
                    isAnimated
                    xAxisLabelTextStyle={styles.axisLabelText}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  
  // Header Style - EXACT MATCH to HomeScreen
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  subtitle: { fontSize: 10, color: COLORS.TEXT_SECONDARY, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5, marginTop: 2 },
  iconCircleBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center', ...SHADOWS.SOFT },
  
  // Hero Card
  heroCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, padding: 24, marginBottom: 20, flexDirection: 'row', alignItems: 'center', ...SHADOWS.GLOW },
  heroInfo: { flex: 1 },
  heroLabel: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  heroValue: { color: COLORS.TEXT_PRIMARY, fontSize: 48, fontWeight: '800' },
  heroUnit: { color: COLORS.TEXT_SECONDARY, fontSize: 20, fontWeight: '600', marginLeft: 2, marginTop: 10 },
  varianceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
  varianceText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  
  heroSecondary: { justifyContent: 'center', alignItems: 'center' },
  scanCountCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.INPUT_BG },
  heroSubLabel: { color: COLORS.TEXT_SECONDARY, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  heroSubValue: { color: COLORS.PRIMARY, fontSize: 24, fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionCard: { flex: 1, backgroundColor: COLORS.WHITE, padding: 16, borderRadius: RADIUS.S, flexDirection: 'row', alignItems: 'center', gap: 12, ...SHADOWS.SOFT },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 11, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  actionSub: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT_PRIMARY },

  // Chart
  chartContainer: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, padding: 20, ...SHADOWS.SOFT },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.INPUT_BG, padding: 4, borderRadius: 12 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: COLORS.WHITE, ...SHADOWS.SOFT },
  toggleText: { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  toggleTextActive: { color: COLORS.ACCENT },
  
  chartWrapper: { minHeight: 200, justifyContent: 'center' },
  barTopLabel: { fontSize: 10, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 4 },
  axisLabelText: { color: COLORS.TEXT_SECONDARY, fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  emptySubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});