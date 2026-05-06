import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  Bell,
  Camera,
  Image as ImageIcon,
  ScanFace,
  Sparkles,
  X
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
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

// Constants
const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfileData();
  
  // REAL-TIME DATA
  const { 
    currentScore, 
    scoreDiff, 
    loading: progressLoading,
    total: totalAssessments
  } = useSkinProgress();

  const [tasks, setTasks] = useState([
    { id: '1', title: "Purifying Cleanser", step: "STEP 01", isDone: true, day: 'Mon', category: 'protocol' },
    { id: '2', title: "Vitamin C Serum", step: "STEP 02", isDone: false, day: 'Mon', category: 'protocol' },
    { id: 'l1', title: "Drink 2L Water", step: "HYDRATION", isDone: false, day: 'Mon', category: 'lifestyle' },
  ]);

  const [showOptions, setShowOptions] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || 'Mon');

  // NEW USER LOGIC
  const isNewUser = totalAssessments === 0;

  // CIRCULAR PROGRESS CALCULATIONS
  const size = 100;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (currentScore / 100) * circumference;

  const getStatusText = (score: number) => {
    if (score >= 75) return 'OPTIMAL';
    if (score >= 40) return 'STABLE';
    return 'AT RISK';
  };

  const fullName = useMemo(() => 
    `${profile?.first_name ?? 'User'} ${profile?.last_name ?? ''}`.trim(), 
  [profile]);

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
      <Modal visible={showOptions} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>ANALYSIS SOURCE</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}><X size={20} color="#64748B" /></TouchableOpacity>
            </View>
            <View style={styles.sheetOptions}>
              <SourceOption icon={<Camera size={26} color={COLORS.ACCENT} />} title="Live Scan" subtitle="Real-time AI" themeColor={COLORS.ACCENT} onPress={() => { setShowOptions(false); router.push('/camera-scan'); }} />
              <SourceOption icon={<ImageIcon size={26} color={COLORS.PRIMARY} />} title="Upload" subtitle="Static Analysis" themeColor={COLORS.PRIMARY} onPress={() => { setShowOptions(false); router.push('/upload-image'); }} />
            </View>
          </View>
        </Pressable>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* APP BAR */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.profileTrigger} onPress={() => router.push('/personal-info')}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=6366F1&color=fff` }} style={styles.avatar} />
            </View>
            <View>
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
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
              <Text style={styles.cardTag}>Biometric Grade</Text>
              <Text style={styles.cardTitle}>Skin Health Score</Text>
            </View>
            {!isNewUser && scoreDiff !== 0 && (
              <View style={[styles.trendBadge, { backgroundColor: scoreDiff > 0 ? '#10B98115' : '#EF444415' }]}>
                <ArrowUpRight size={14} color={scoreDiff > 0 ? '#10B981' : '#EF4444'} />
                <Text style={[styles.trendText, { color: scoreDiff > 0 ? '#10B981' : '#EF4444' }]}>{scoreDiff > 0 ? '+' : ''}{scoreDiff}%</Text>
              </View>
            )}
          </View>
          
          <View style={styles.scoreRow}>
            {isNewUser ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.welcomeIconCircle}>
                   <Sparkles size={30} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.welcomeTextContainer}>
                   <Text style={styles.welcomeTitle}>Good day, {profile?.first_name || 'User'}!</Text>
                   <Text style={styles.welcomeSubtitle}>Please scan your face to see your skin health analysis.</Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.circularContainer}>
                  <Svg width={size} height={size}>
                    <SvgCircle stroke="#F1F5F9" fill="none" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
                    <SvgCircle 
                      stroke={currentScore >= 75 ? '#10B981' : COLORS.PRIMARY} 
                      fill="none" cx={center} cy={center} r={radius} 
                      strokeWidth={strokeWidth} strokeDasharray={circumference} 
                      strokeDashoffset={progressOffset} strokeLinecap="round" 
                      rotation="-90" origin={`${center}, ${center}`} 
                    />
                  </Svg>
                  <View style={styles.scoreTextOverlay}>
                    <Text style={styles.scoreValue}>{currentScore}</Text>
                    <Text style={styles.scoreLabel}>{getStatusText(currentScore)}</Text>
                  </View>
                </View>

                <Text style={styles.scoreDetails}>
                  {scoreDiff > 0 
                    ? `Impressed! Your health score improved by ${scoreDiff}% since your last assessment.`
                    : `Your skin is currently ${getStatusText(currentScore).toLowerCase()}. Maintain your daily routine.`}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowOptions(true)}>
            <ScanFace size={22} color="#FFF" />
            <Text style={styles.primaryBtnText}>
              {isNewUser ? "Get My First Analysis" : "Start New Analysis"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* WEEKLY SCHEDULE */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Weekly Schedule</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {DAYS.map((day) => (
              <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={[styles.dayCard, selectedDay === day && styles.dayCardActive]}>
                <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI INSIGHT */}
        <View style={styles.insightBox}>
          <Sparkles size={18} color={COLORS.PRIMARY} />
          <Text style={styles.insightText}>
            <Text style={styles.boldPrimary}>AI_NOTE:</Text> {isNewUser ? "Unlock personalized insights by completing your first scan." : "Your hydration levels are peaking. Keep using your cleanser at night."}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
const SourceOption = ({ icon, title, subtitle, onPress, themeColor }: any) => (
  <TouchableOpacity style={styles.optionBtn} onPress={onPress}>
    <View style={[styles.optionIcon, { backgroundColor: `${themeColor}15` }]}>{icon}</View>
    <Text style={styles.optionText}>{title}</Text>
    <Text style={styles.optionSub}>{subtitle}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12 },
  
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  profileTrigger: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { padding: 2, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#F1F5F9' },
  dateLabel: { fontSize: 10, color: '#64748B', fontWeight: '800', letterSpacing: 1 },
  greeting: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  iconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', ...SHADOWS.SOFT },
  dotIndicator: { position: 'absolute', top: 12, right: 12, width: 7, height: 7, borderRadius: 4, backgroundColor: '#FB7185', borderWidth: 1.5, borderColor: '#FFF' },

  mainCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 24, ...SHADOWS.SOFT },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTag: { fontSize: 10, fontWeight: '900', color: COLORS.ACCENT, letterSpacing: 1.2 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  trendText: { fontSize: 12, fontWeight: '800', marginLeft: 4 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  circularContainer: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  scoreTextOverlay: { position: 'absolute', alignItems: 'center' },
  scoreValue: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  scoreLabel: { fontSize: 8, fontWeight: '800', color: '#94A3B8', marginTop: -2 },
  scoreDetails: { flex: 1, marginLeft: 20, fontSize: 14, color: '#64748B', lineHeight: 20 },

  // EMPTY STATE STYLES
  emptyStateContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 16 },
  welcomeIconCircle: { width: 55, height: 55, borderRadius: 18, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
  welcomeTextContainer: { flex: 1 },
  welcomeTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  welcomeSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 18, marginTop: 2 },

  primaryBtn: { backgroundColor: COLORS.PRIMARY, flexDirection: 'row', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  dayCard: { width: 55, height: 65, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  dayCardActive: { borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}08` },
  dayText: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  dayTextActive: { color: COLORS.PRIMARY },

  section: { marginTop: 30 },
  sectionHeader: { fontSize: 12, fontWeight: '900', color: '#64748B', letterSpacing: 1, marginBottom: 15 },
  
  insightBox: { marginTop: 30, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', padding: 20, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  insightText: { flex: 1, fontSize: 13, color: '#0369A1', lineHeight: 20 },
  boldPrimary: { fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  sheetTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', letterSpacing: 1 },
  sheetOptions: { flexDirection: 'row', gap: 15 },
  optionBtn: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  optionIcon: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  optionText: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  optionSub: { fontSize: 10, color: '#94A3B8' },
});