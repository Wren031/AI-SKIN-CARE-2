import {
  Activity,
  ChevronRight,
  Home as HomeIcon,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Internal Imports
import { THEMES } from '@/src/constants/themes';
import { useSkinAnalysis } from '../hooks/useSkinAnalysis'; // Your hook location
import { SkinDetection } from '../types/analysis';

const { width } = Dimensions.get('window');
const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

const SCREEN_PADDING = 20;
const OVAL_WIDTH = width - SCREEN_PADDING * 2;
const OVAL_HEIGHT = OVAL_WIDTH * 1.25;

export default function ResultScreen() {
  const { 
    analysis, 
    isSaving, 
    getSeverityStyles, 
    handleExit, 
    handleShowRecommendations 
  } = useSkinAnalysis();

  if (!analysis) return null;

  /**
   * Triggers the "Print" log and navigates to the medical protocol
   */
  const onProtocolPress = () => {
    console.log("--- START DERMA_AI DIAGNOSTIC PRINT ---");
    console.log(JSON.stringify(analysis, null, 2));
    console.log("--- END DERMA_AI DIAGNOSTIC PRINT ---");
    
    handleShowRecommendations();
  };

  const sevStyle = getSeverityStyles(analysis.severity);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
          <X color={COLORS.TEXT_PRIMARY} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ANALYSIS REPORT</Text>
        <View style={styles.placeholder} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CLINICAL OVAL VIEW */}
        {analysis.imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: analysis.imageUri }} style={styles.mainImage} />
            <View style={[styles.severityBadge, { borderColor: sevStyle.color }]}>
              <View style={[styles.pulseDot, { backgroundColor: sevStyle.color }]} />
              <Text style={[styles.severityBadgeText, { color: sevStyle.color }]}>
                {sevStyle.status.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* METRICS */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            icon={<Activity size={16} color={COLORS.PRIMARY} />}
            label="HEALTH SCORE"
            value={analysis.score}
            unit="%"
          />
          <MetricCard 
            icon={<ShieldCheck size={16} color={COLORS.ACCENT} />}
            label="CONFIDENCE"
            value={analysis.confidence}
            unit="%"
          />
        </View>

        {/* CLASSIFICATION */}
        <View style={styles.classificationCard}>
          <View>
            <Text style={styles.labelMicro}>DERMATOLOGICAL TYPE</Text>
            <Text style={styles.valueLarge}>{analysis.skinType.toUpperCase()}</Text>
          </View>
          <Zap size={22} color={COLORS.ACCENT} fill={COLORS.ACCENT} />
        </View>

        <Text style={styles.sectionHeader}>DETECTION ANALYTICS</Text>
        
        {analysis.detections.length > 0 ? (
          analysis.detections.map((item: SkinDetection, index: number) => {
            const itemStyle = getSeverityStyles(item.severity);
            return (
              <TouchableOpacity key={index} style={styles.detectionCard} activeOpacity={0.7}>
                <View style={styles.detectionLayout}>
                  <ImpactCircle percentage={item.impact || 0} color={itemStyle.color} />
                  <View style={styles.detectionInfo}>
                    <Text style={styles.detectionTitle}>{item.label.toUpperCase()}</Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: itemStyle.color }]} />
                      <Text style={[styles.statusText, { color: itemStyle.color }]}>{itemStyle.status} STAGE</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.BORDER} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Sparkles color={COLORS.SUCCESS} size={32} />
            <Text style={styles.emptyText}>Dermal scan complete. No irregularities found.</Text>
          </View>
        )}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeActionBtn} 
          onPress={handleExit}
          disabled={isSaving}
        >
          <HomeIcon color={COLORS.TEXT_PRIMARY} size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryActionBtn, isSaving && styles.btnDisabled]} 
          onPress={onProtocolPress} 
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Zap size={20} color="#FFF" fill="#FFF" />
              <Text style={styles.primaryActionText}>VIEW PROTOCOL</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** * Sub-components for cleaner hierarchy 
 */
const MetricCard = ({ icon, label, value, unit }: any) => (
  <View style={styles.metricCard}>
    {icon}
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}<Text style={styles.metricUnit}>{unit}</Text></Text>
  </View>
);

const ImpactCircle = ({ percentage, color }: { percentage: number; color: string }) => {
  const size = 48;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.impactWrapper}>
      <Svg width={size} height={size} style={styles.svgRotate}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={COLORS.BORDER} strokeWidth={strokeWidth} fill="transparent" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset} strokeLinecap="round" fill="transparent"
        />
      </Svg>
      <View style={styles.percentageInside}>
        <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: SCREEN_PADDING, paddingBottom: 110 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 2.5, color: COLORS.TEXT_SECONDARY },
  iconButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: '#F8FAFC', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  placeholder: { width: 44 },
  imageContainer: { 
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    overflow: 'hidden', 
    alignSelf: 'center',
    marginVertical: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    ...SHADOWS.SOFT 
  },
  mainImage: { width: '100%', height: '100%', backgroundColor: '#F1F5F9' },
  severityBadge: { 
    position: 'absolute', 
    bottom: 40, 
    alignSelf: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1.5,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  severityBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    borderRadius: RADIUS.L, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    ...SHADOWS.SOFT 
  },
  metricLabel: { fontSize: 9, fontWeight: '800', color: COLORS.TEXT_SECONDARY, marginTop: 10, letterSpacing: 0.5 },
  metricValue: { fontSize: 26, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  metricUnit: { fontSize: 14, color: COLORS.TEXT_SECONDARY },
  classificationCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20, 
    backgroundColor: '#F8FAFC', 
    borderRadius: RADIUS.L, 
    marginBottom: 25 
  },
  labelMicro: { fontSize: 9, fontWeight: '800', color: COLORS.TEXT_SECONDARY, marginBottom: 4 },
  valueLarge: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  sectionHeader: { fontSize: 11, fontWeight: '800', marginBottom: 16, color: COLORS.TEXT_SECONDARY, letterSpacing: 1.5 },
  detectionCard: { 
    padding: 14, 
    backgroundColor: '#FFF', 
    marginBottom: 12, 
    borderRadius: RADIUS.L, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    ...SHADOWS.SOFT 
  },
  detectionLayout: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  impactWrapper: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  svgRotate: { transform: [{ rotate: '-90deg' }] },
  percentageInside: { position: 'absolute' },
  percentageText: { fontSize: 11, fontWeight: '900' },
  detectionInfo: { gap: 2 },
  detectionTitle: { fontWeight: '800', color: COLORS.TEXT_PRIMARY, fontSize: 15 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { padding: 50, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.TEXT_SECONDARY, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: width, 
    padding: SCREEN_PADDING, 
    flexDirection: 'row', 
    gap: 12, 
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderColor: '#F1F5F9'
  },
  homeActionBtn: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0', 
    ...SHADOWS.SOFT 
  },
  primaryActionBtn: { 
    flex: 1, 
    backgroundColor: COLORS.PRIMARY, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 20, 
    gap: 12, 
    ...SHADOWS.GLOW 
  },
  primaryActionText: { color: '#FFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  btnDisabled: { opacity: 0.7 },
});