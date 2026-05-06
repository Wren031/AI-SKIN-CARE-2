import { useRouter } from 'expo-router';
import {
  Bell,
  Camera,
  ChevronRight,
  Image as ImageIcon,
  ScanFace,
  Sparkles,
  X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

// Internal Imports
import { THEMES } from '@/src/constants/themes';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { useSkinProgress } from '../../progress/hooks/useSkinProgress';

// --- Types & Constants ---
const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

interface SourceOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  themeColor: string;
}

// --- Sub-Components ---

const ScoreProgress = ({ score }: { score: number }) => {
  const size = 110;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const { offset, status } = useMemo(() => {
    const progressOffset = circumference - (score / 100) * circumference;
    let label = 'AT RISK';
    if (score >= 75) label = 'OPTIMAL';
    else if (score >= 40) label = 'STABLE';
    
    return { offset: progressOffset, status: label };
  }, [score, circumference]);

  const strokeColor = score >= 75 ? COLORS.SUCCESS : COLORS.PRIMARY;

  return (
    <View style={styles.circularContainer}>
      <Svg width={size} height={size}>
        <SvgCircle stroke={COLORS.INPUT_BG} fill="none" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
        <SvgCircle
          stroke={strokeColor}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.scoreTextOverlay}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>{status}</Text>
      </View>
    </View>
  );
};

const SourceOption = ({ icon, title, subtitle, onPress, themeColor }: SourceOptionProps) => (
  <TouchableOpacity 
    style={styles.optionBtn} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.optionIcon, { backgroundColor: `${themeColor}15` }]}>
      {icon}
    </View>
    <Text style={styles.optionText}>{title}</Text>
    <Text style={styles.optionSub}>{subtitle}</Text>
  </TouchableOpacity>
);

// --- Main Screen ---

export default function HomeScreen() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[new Date().getDay() - 1] || 'Mon');

  const { profile, loading: profileLoading } = useProfileData();
  const { 
    currentScore, 
    scoreDiff, 
    loading: progressLoading, 
    total: totalAssessments 
  } = useSkinProgress();

  const isNewUser = totalAssessments === 0;
  const fullName = `${profile?.first_name ?? 'User'} ${profile?.last_name ?? ''}`.trim();

  const handleNavigation = useCallback((path: string) => {
    setShowOptions(false);
    router.push(path as any);
  }, [router]);

  if (profileLoading || progressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ANALYSIS MODAL */}
      <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>SELECT ANALYSIS SOURCE</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <X size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetOptions}>
              <SourceOption
                icon={<Camera size={24} color={COLORS.ACCENT} />}
                title="Live Scan"
                subtitle="Real-time AI"
                themeColor={COLORS.ACCENT}
                onPress={() => handleNavigation('/camera-scan')}
              />
              <SourceOption
                icon={<ImageIcon size={24} color={COLORS.PRIMARY} />}
                title="Upload"
                subtitle="From Gallery"
                themeColor={COLORS.PRIMARY}
                onPress={() => handleNavigation('/upload-image')}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* APP BAR */}
        <View style={styles.appBar}>
          <TouchableOpacity 
            style={styles.profileTrigger} 
            onPress={() => router.push('/personal-info' as any)}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=FB7185&color=fff` }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={styles.dateLabel}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
              </Text>
              <Text style={styles.greeting}>Hello, {profile?.first_name || 'User'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Bell size={20} color={COLORS.TEXT_PRIMARY} />
            <View style={styles.dotIndicator} />
          </TouchableOpacity>
        </View>

        {/* MAIN SCORE CARD */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTag}>DERMA_AI METRICS</Text>
              <Text style={styles.cardTitle}>Vitality Score</Text>
            </View>
            {!isNewUser && scoreDiff !== 0 && (
              <View style={[styles.trendBadge, { backgroundColor: scoreDiff > 0 ? '#ECFDF5' : '#FFF1F2' }]}>
                <Text style={[styles.trendText, { color: scoreDiff > 0 ? COLORS.SUCCESS : COLORS.PRIMARY }]}>
                  {scoreDiff > 0 ? '▲' : '▼'} {Math.abs(scoreDiff)}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.scoreRow}>
            {isNewUser ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.welcomeIconCircle}>
                  <Sparkles size={28} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeTitle}>Initial Scan Required</Text>
                  <Text style={styles.welcomeSubtitle}>Initialize your profile with a high-precision skin scan.</Text>
                </View>
              </View>
            ) : (
              <>
                <ScoreProgress score={currentScore} />
                <View style={styles.scoreInfoContainer}>
                  <Text style={styles.scoreDetails}>
                    {scoreDiff > 0
                      ? `Significant progress. Your score increased by ${scoreDiff}% since last check.`
                      : `Your health status is stable. Consistent daily routine is highly recommended.`}
                  </Text>
                  <TouchableOpacity style={styles.textLink}>
                    <Text style={styles.textLinkStyle}>View Details</Text>
                    <ChevronRight size={14} color={COLORS.ACCENT} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => setShowOptions(true)}
            activeOpacity={0.8}
          >
            <ScanFace size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>
              {isNewUser ? "Begin First Analysis" : "New AI Assessment"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* WEEKLY SCHEDULE */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>WEEKLY PROTOCOL</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>Full Schedule</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[styles.dayCard, selectedDay === day && styles.dayCardActive]}
              >
                <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
                {selectedDay === day && <View style={styles.activeDayDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI INSIGHT */}
        <View style={styles.insightBox}>
          <View style={styles.insightIconBg}>
            <Sparkles size={16} color={COLORS.ACCENT} />
          </View>
          <Text style={styles.insightText}>
            <Text style={styles.boldAccent}>AI INSIGHT:</Text> {isNewUser 
              ? "Unlock personalized biometric data by completing your first analysis." 
              : "Routine adherence is at 85%. Focus on hydration steps this evening."}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  profileTrigger: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { padding: 2, borderRadius: 16, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.INPUT_BG },
  dateLabel: { fontSize: 10, color: COLORS.TEXT_SECONDARY, fontWeight: '800', letterSpacing: 0.5 },
  greeting: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center', ...SHADOWS.SOFT },
  dotIndicator: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PRIMARY, borderWidth: 2, borderColor: COLORS.WHITE },

  mainCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, padding: 24, ...SHADOWS.GLOW },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTag: { fontSize: 10, fontWeight: '800', color: COLORS.ACCENT, letterSpacing: 1 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trendText: { fontSize: 12, fontWeight: '700' },

  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  circularContainer: { width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
  scoreTextOverlay: { position: 'absolute', alignItems: 'center' },
  scoreValue: { fontSize: 32, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: COLORS.TEXT_SECONDARY, marginTop: -2 },
  scoreInfoContainer: { flex: 1, marginLeft: 20 },
  scoreDetails: { fontSize: 14, color: COLORS.TEXT_SECONDARY, lineHeight: 20 },
  textLink: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  textLinkStyle: { fontSize: 13, fontWeight: '700', color: COLORS.ACCENT, marginRight: 2 },

  emptyStateContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 15 },
  welcomeIconCircle: { width: 50, height: 50, borderRadius: 15, backgroundColor: `${COLORS.PRIMARY}10`, justifyContent: 'center', alignItems: 'center' },
  welcomeTextContainer: { flex: 1 },
  welcomeTitle: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  welcomeSubtitle: { fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18, marginTop: 2 },

  primaryBtn: { backgroundColor: COLORS.PRIMARY, flexDirection: 'row', height: 56, borderRadius: RADIUS.S, justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },

  section: { marginTop: 25 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 15 },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: COLORS.TEXT_SECONDARY, letterSpacing: 1 },
  viewAllText: { fontSize: 12, fontWeight: '700', color: COLORS.ACCENT },
  daysScroll: { gap: 10, paddingBottom: 5 },
  dayCard: { width: 50, height: 60, backgroundColor: COLORS.WHITE, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  dayCardActive: { borderColor: COLORS.PRIMARY },
  dayText: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  dayTextActive: { color: COLORS.PRIMARY },
  activeDayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.PRIMARY, marginTop: 4 },
  
  insightBox: { marginTop: 25, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.INPUT_BG, padding: 16, borderRadius: RADIUS.S, gap: 12, borderWidth: 1, borderColor: COLORS.BORDER },
  insightIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center' },
  insightText: { flex: 1, fontSize: 13, color: COLORS.TEXT_PRIMARY, lineHeight: 19 },
  boldAccent: { fontWeight: '800', color: COLORS.ACCENT },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: COLORS.WHITE, borderTopLeftRadius: RADIUS.M, borderTopRightRadius: RADIUS.M, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.BORDER, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 11, fontWeight: '800', color: COLORS.TEXT_SECONDARY, letterSpacing: 0.5 },
  sheetOptions: { flexDirection: 'row', gap: 12 },
  optionBtn: { flex: 1, backgroundColor: COLORS.INPUT_BG, padding: 20, borderRadius: RADIUS.S, alignItems: 'center' },
  optionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  optionText: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  optionSub: { fontSize: 10, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
});