import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Metrics</Text>
          <Text style={styles.subtitle}>Analyzing 7-day dermal consistency</Text>
        </View>

        {/* Main Progress Ring (Consistency) */}
        <View style={styles.mainProgressCard}>
          <View style={styles.progressRingBase}>
            {/* Simulated Progress Ring */}
            <View style={styles.progressRingActive} />
            <View style={styles.progressTextContainer}>
              <Text style={styles.percentageText}>85%</Text>
              <Text style={styles.goalText}>HEALTH TARGET</Text>
            </View>
          </View>
          
          <View style={styles.insightBox}>
              <Ionicons name="sparkles" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.insightText}>Skin stability up by 12% this week</Text>
          </View>
        </View>

        {/* Detailed Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.PRIMARY + '15' }]}>
              <Ionicons name="water" size={20} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.statValue}>Optimal</Text>
            <Text style={styles.statLabel}>Hydration</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.ACCENT + '15' }]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.ACCENT} />
            </View>
            <Text style={styles.statValue}>12 Days</Text>
            <Text style={styles.statLabel}>Barrier Streak</Text>
          </View>
        </View>

        {/* Activity Bar Chart (Weekly Routine Breakdown) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Diagnostic Dedication</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Full History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          {[40, 70, 45, 90, 65, 80, 50].map((height, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={[
                styles.bar, 
                { height: height, backgroundColor: height > 70 ? COLORS.ACCENT : COLORS.BORDER }
              ]} />
              <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tip Card */}
        <View style={styles.tipCard}>
           <View style={styles.tipIconBg}>
              <Ionicons name="flash" size={20} color={COLORS.WHITE} />
           </View>
           <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.tipTitle}>Clinical Protocol</Text>
              <Text style={styles.tipSub}>Consistency triggers cellular repair. Apply your antioxidant serum before 11:00 PM.</Text>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, 
  },
  header: {
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: '500',
  },
  mainProgressCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.L,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  progressRingBase: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 12,
    borderColor: COLORS.INPUT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingActive: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 12,
    borderColor: COLORS.PRIMARY,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '35deg' }],
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.TEXT_PRIMARY,
  },
  goalText: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: COLORS.SUCCESS + '10',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.ROUND,
  },
  insightText: {
    fontSize: 13,
    color: COLORS.SUCCESS,
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderRadius: RADIUS.M,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.S,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.ACCENT,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 25,
    borderRadius: RADIUS.M,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  barLabel: {
    marginTop: 10,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '800',
  },
  tipCard: {
    marginTop: 25,
    backgroundColor: COLORS.TEXT_PRIMARY,
    padding: 20,
    borderRadius: RADIUS.M,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.SOFT,
  },
  tipIconBg: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.S,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: '500',
  }
});