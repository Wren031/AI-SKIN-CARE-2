import { THEMES } from '@/src/constants/themes';
import { Activity, ChevronRight, RefreshCcw, ShieldCheck, Sparkles, X, Zap } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSkinAnalysis } from '../hooks/useSkinAnalysis';
import { SkinDetection } from '../types/analysis';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width } = Dimensions.get('window');

const ImpactCircle = ({ percentage, color }: { percentage: number, color: string }) => {
  const size = 50;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
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

export default function ResultScreen() {

  const { analysis, isSaving, getSeverityStyles, handleExit, handleShowRecommendations } = useSkinAnalysis();
  const sevStyle = getSeverityStyles(analysis.severity);


  const MOCK_USER_ID = "user_123_abc"; 

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.closeBtn}>
          <X color={COLORS.TEXT_PRIMARY} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DIAGNOSTIC REPORT</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {analysis.imageUri && (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: analysis.imageUri }} style={styles.mainImage} />
          <View style={[styles.severityBadge, { borderColor: sevStyle.color }]}>
            <View style={[styles.pulseDot, { backgroundColor: sevStyle.color }]} />
            <Text style={[styles.severityBadgeText, { color: sevStyle.color }]}>{sevStyle.status}</Text>
          </View>
        </View>
      )}

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Activity size={16} color={COLORS.PRIMARY} />
          <Text style={styles.metricLabel}>SKIN HEALTH SCORE</Text>
          <Text style={styles.metricValue}>{analysis.score}<Text style={styles.unit}>%</Text></Text>
        </View>
        <View style={styles.metricCard}>
          <ShieldCheck size={16} color={COLORS.ACCENT} />
          <Text style={styles.metricLabel}>SYSTEM CONFIDENCE</Text>
          <Text style={styles.metricValue}>{analysis.confidence}<Text style={styles.unit}>%</Text></Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoRowLabel}>DERMAL CLASSIFICATION</Text>
            <Text style={styles.infoRowValue}>{analysis.skinType.toUpperCase()}</Text>
          </View>
          <Zap size={18} color={COLORS.ACCENT} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>TISSUE ANALYTICS</Text>
      
      {analysis.detections.length > 0 ? (
        analysis.detections.map((item: SkinDetection, index: number) => {
          const itemStyle = getSeverityStyles(item.severity);
          return (
            <TouchableOpacity key={index} style={styles.detectionItem} activeOpacity={0.9}>
              <View style={styles.detectionMain}>
                <ImpactCircle percentage={item.impact || 0} color={itemStyle.color} />
                <View style={styles.detectionMeta}>
                  <Text style={styles.detectionLabel}>{item.label.toUpperCase()}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusIndicator, { backgroundColor: itemStyle.color }]} />
                    <Text style={[styles.statusText, { color: itemStyle.color }]}>{itemStyle.status} PHASE</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detectionAction}>
                <Text style={styles.dataTag}>REF: AI-{index + 104}</Text>
                <ChevronRight size={18} color={COLORS.BORDER} />
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Sparkles color={COLORS.SUCCESS} size={32} />
          <Text style={styles.emptyText}>Dermal surface clear. No conditions detected.</Text>
        </View>
      )}

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity 
          style={styles.scanAgainBtn} 
          onPress={handleExit}
          disabled={isSaving} // Disable interaction while saving
        >
          <RefreshCcw size={18} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.scanAgainBtnText}>RESCAN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.recommendationBtn, isSaving && { opacity: 0.8 }]} 
          onPress={handleShowRecommendations} // No need to pass ID here anymore!
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.WHITE} size="small" />
          ) : (
            <>
              <Zap size={18} color={COLORS.WHITE} fill={COLORS.WHITE} />
              <Text style={styles.recommendationBtnText}>VIEW PROTOCOL</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, paddingHorizontal: 20 },
  header: { paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { width: 42, height: 42, borderRadius: RADIUS.S, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  headerTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: COLORS.TEXT_SECONDARY },
  imageWrapper: { borderRadius: RADIUS.L, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  mainImage: { width: '100%', height: width * 0.85, backgroundColor: COLORS.TEXT_PRIMARY },
  severityBadge: { position: 'absolute', top: 15, right: 15, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.S, flexDirection: 'row', alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.95)', ...SHADOWS.SOFT },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  severityBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: { flex: 1, backgroundColor: COLORS.WHITE, padding: 16, borderRadius: RADIUS.M, borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  metricLabel: { fontSize: 8, fontWeight: '900', color: COLORS.TEXT_SECONDARY, marginTop: 8, marginBottom: 2, letterSpacing: 0.5 },
  metricValue: { fontSize: 28, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -1 },
  unit: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  infoBox: { padding: 20, backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, borderWidth: 1, borderColor: COLORS.BORDER, marginBottom: 25, ...SHADOWS.SOFT },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRowLabel: { fontSize: 9, fontWeight: '900', color: COLORS.TEXT_SECONDARY, marginBottom: 2, letterSpacing: 1 },
  infoRowValue: { fontSize: 16, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 0 },
  sectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 15, color: COLORS.TEXT_SECONDARY, letterSpacing: 2 },
  detectionItem: { padding: 16, backgroundColor: COLORS.WHITE, marginBottom: 12, borderRadius: RADIUS.M, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  detectionMain: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  percentageInside: { position: 'absolute' },
  percentageText: { fontSize: 10, fontWeight: '900' },
  detectionMeta: { gap: 2 },
  detectionLabel: { fontWeight: '900', color: COLORS.TEXT_PRIMARY, fontSize: 14, letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusIndicator: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  detectionAction: { alignItems: 'flex-end', gap: 4 },
  dataTag: { fontSize: 8, fontWeight: '700', color: COLORS.BORDER, letterSpacing: 0.5 },
  emptyState: { padding: 40, alignItems: 'center', gap: 10 },
  emptyText: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  scanAgainBtn: { flex: 1, backgroundColor: COLORS.WHITE, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: RADIUS.M, gap: 8, borderWidth: 1, borderColor: COLORS.BORDER },
  scanAgainBtnText: { color: COLORS.TEXT_PRIMARY, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  recommendationBtn: { flex: 2, backgroundColor: COLORS.PRIMARY, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: RADIUS.M, gap: 8, ...SHADOWS.GLOW },
  recommendationBtnText: { color: COLORS.WHITE, fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});