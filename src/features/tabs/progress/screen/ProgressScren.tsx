import { THEME } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
// Oasis Palette
const SAGE = THEME.SAGE;
const SAND = THEME.SAND;
const DEEP_SAGE = THEME.DEEP_SAGE;
const SOFT_CORAL = THEME.SOFT_CORAL;
const MIST = '#F0F4F0';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Glow Journey</Text>
          <Text style={styles.subtitle}>7-day routine consistency</Text>
        </View>

        {/* Main Progress Ring (Consistency) */}
        <View style={styles.mainProgressCard}>
          <View style={styles.progressRingBase}>
            {/* Simulated Progress Ring */}
            <View style={styles.progressRingActive} />
            <View style={styles.progressTextContainer}>
              <Text style={styles.percentageText}>85%</Text>
              <Text style={styles.goalText}>Routine Match</Text>
            </View>
          </View>
          <View style={styles.insightBox}>
             <Ionicons name="sparkles-outline" size={16} color={SAGE} />
             <Text style={styles.insightText}>You've been consistent for 5 days!</Text>
          </View>
        </View>

        {/* Detailed Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FDF2F0' }]}>
              <Ionicons name="water-outline" size={20} color={SOFT_CORAL} />
            </View>
            <Text style={styles.statValue}>Optimal</Text>
            <Text style={styles.statLabel}>Hydration</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0F4F0' }]}>
              <Ionicons name="sunny-outline" size={20} color={SAGE} />
            </View>
            <Text style={styles.statValue}>12 Days</Text>
            <Text style={styles.statLabel}>SPF Streak</Text>
          </View>
        </View>

        {/* Activity Bar Chart (Weekly Routine Breakdown) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Weekly Dedication</Text>
          <Text style={styles.sectionLink}>View History</Text>
        </View>
        
        <View style={styles.chartContainer}>
          {[40, 70, 45, 90, 65, 80, 50].map((height, index) => (
            <View key={index} style={styles.barWrapper}>
              {/* Dynamic height bars with rounded Oasis styling */}
              <View style={[styles.bar, { height: height, backgroundColor: height > 70 ? SAGE : '#CBD5E1' }]} />
              <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>

        {/* Simple Tip Card */}
        <View style={styles.tipCard}>
           <Ionicons name="bulb-outline" size={24} color={DEEP_SAGE} />
           <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipSub}>Consistency is better than intensity. Stick to your night serum tonight!</Text>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAND,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40, 
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '300', // Light weighted for Oasis brand
    color: DEEP_SAGE,
  },
  subtitle: {
    fontSize: 15,
    color: '#828282',
    marginTop: 6,
    fontStyle: 'italic',
  },
  mainProgressCard: {
    backgroundColor: '#fff',
    borderRadius: 35,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: SAGE,
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  progressRingBase: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 14,
    borderColor: MIST,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingActive: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 14,
    borderColor: SAGE,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '30deg' }], // Simulated 85% fill
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 34,
    fontWeight: '300',
    color: DEEP_SAGE,
  },
  goalText: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    backgroundColor: MIST,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  insightText: {
    fontSize: 13,
    color: DEEP_SAGE,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: DEEP_SAGE,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '300',
    color: DEEP_SAGE,
  },
  sectionLink: {
    fontSize: 13,
    color: SAGE,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    width: 14,
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 10,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
  tipCard: {
    marginTop: 25,
    backgroundColor: DEEP_SAGE,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipSub: {
    color: '#F0F4F0',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  }
});