import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  Bell,
  Camera,
  CheckCircle,
  ChevronRight,
  Circle,
  Clock,
  Image as ImageIcon,
  ScanFace,
  Sparkles,
  X
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Internal Components
import { THEMES } from '@/src/constants/themes';
import ImageAnalysisOverlay from '../components/ImageAnalysisOverlay';
import Notification from '../components/Notification';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width } = Dimensions.get('window');

// 1. Initial Data for the Protocol
const INITIAL_PROTOCOL = [
  { id: '1', title: "Purifying Cleanser", step: "STEP 01", isDone: true },
  { id: '2', title: "Vitamin C Serum", step: "STEP 02", isDone: false },
  { id: '3', title: "Broad Spectrum SPF", step: "STEP 03", isDone: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading } = useProfileData();

  const [showOptions, setShowOptions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyConfig, setNotifyConfig] = useState({
    message: '',
    type: 'success' as 'success' | 'info' | 'error'
  });

  // 2. Protocol State
  const [protocol, setProtocol] = useState(INITIAL_PROTOCOL);

  const fullName = useMemo(() => 
    `${profile?.first_name || 'User'} ${profile?.last_name || ''}`, 
  [profile]);

  // 3. Toggle logic for checklist
  const toggleStep = (id: string) => {
    setProtocol(prev => prev.map(item => 
      item.id === id ? { ...item, isDone: !item.isDone } : item
    ));
  };

  const triggerNotification = (message: string, type: 'success' | 'info' | 'error') => {
    setNotifyConfig({ message, type });
    setNotifyVisible(true);
  };

  const handleCamera = () => {
    setShowOptions(false);
    router.push('/camera-scan');
  };

  const handleGalleryNavigation = () => {
    setShowOptions(false);
    setTimeout(() => {
      router.push('/upload-image');
    }, 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <Notification
        visible={notifyVisible}
        message={notifyConfig.message}
        type={notifyConfig.type}
        onHide={() => setNotifyVisible(false)}
      />

      <ImageAnalysisOverlay 
        visible={isAnalyzing} 
        currentStep={analysisStep} 
      />

      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>SOURCE_PROTOCOL</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <X size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetOptions}>
              <TouchableOpacity style={styles.optionBtn} onPress={handleCamera}>
                <View style={[styles.optionIcon, { backgroundColor: COLORS.ACCENT + '15' }]}>
                  <Camera size={26} color={COLORS.ACCENT} />
                </View>
                <Text style={styles.optionText}>Live Scan</Text>
                <Text style={styles.optionSub}>Real-time AI</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionBtn} onPress={handleGalleryNavigation}>
                <View style={[styles.optionIcon, { backgroundColor: COLORS.PRIMARY + '15' }]}>
                  <ImageIcon size={26} color={COLORS.PRIMARY} />
                </View>
                <Text style={styles.optionText}>Upload</Text>
                <Text style={styles.optionSub}>Static Analysis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* APP BAR */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.profileTrigger} onPress={() => router.push('/personal-info')}>
            <View style={styles.avatarWrapper}>
                <Image
                source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=FB7185&color=fff` }}
                style={styles.avatar}
                />
            </View>
            <View>
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
              <Text style={styles.greeting}>Hello, {profile?.first_name || 'User'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => triggerNotification("SYSTEM_LOG: ALL SENSORS ACTIVE", "info")}
          >
            <Bell size={20} color={COLORS.TEXT_PRIMARY} strokeWidth={2} />
            <View style={styles.dotIndicator} />
          </TouchableOpacity>
        </View>

        {/* MAIN SCORE CARD */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTag}>Biometric Grade</Text>
              <Text style={styles.cardTitle}>Skin Health Index</Text>
            </View>
            <View style={styles.trendBadge}>
              <ArrowUpRight size={14} color={COLORS.SUCCESS} />
              <Text style={styles.trendText}>+4%</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>78</Text>
              <Text style={styles.scoreLabel}>OPTIMAL</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={styles.detailText}>Diagnostic scan shows 12% improvement in surface hydration.</Text>
              <TouchableOpacity style={styles.actionLink}>
                <Text style={styles.actionLinkText}>View report</Text>
                <ChevronRight size={14} color={COLORS.ACCENT} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowOptions(true)}>
            <ScanFace size={20} color={COLORS.WHITE} />
            <Text style={styles.primaryBtnText}>Start Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* ANALYTICS GRID */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Surface Analytics</Text>
          <View style={styles.grid}>
            <MetricItem label="PURITY" value="92%" status="HIGH" color={COLORS.SUCCESS} />
            <MetricItem label="TEXTURE" value="SMOOTH" status="STABLE" color={COLORS.ACCENT} />
            <MetricItem label="OIL" value="MED" status="ALERT" color="#F43F5E" isAlert />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Daily Routine</Text>
            <TouchableOpacity onPress={() => router.push('/start-my-journey')}>
              <Text style={styles.viewAll}>VIEW_PLAN</Text>
            </TouchableOpacity>
          </View>
          
          {protocol.map((item) => (
            <RegimenItem 
              key={item.id}
              title={item.title} 
              step={item.step} 
              isDone={item.isDone} 
              onPress={() => toggleStep(item.id)}
            />
          ))}
        </View>

        {/* AI INSIGHT */}
        <View style={styles.insightBox}>
          <Sparkles size={18} color={COLORS.PRIMARY} />
          <Text style={styles.insightText}>
            <Text style={{fontWeight: '900', color: COLORS.PRIMARY}}>ENGINE_NOTE:</Text> High UV detected. Re-apply SPF every 4 hours.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricItem = ({ label, value, status, color, isAlert }: any) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <View style={[styles.statusBadge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.metricStatus, { color: color }]}>{status}</Text>
    </View>
  </View>
);

const RegimenItem = ({ title, step, isDone, onPress }: any) => (
  <TouchableOpacity 
    style={styles.regimenRow} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <View style={styles.checkIcon}>
      {isDone ? 
        <CheckCircle size={26} color={COLORS.SUCCESS} fill={COLORS.SUCCESS + '20'} /> : 
        <Circle size={26} color={COLORS.BORDER} />
      }
    </View>
    <View style={styles.regimenInfo}>
      <Text style={styles.regimenStep}>{step}</Text>
      <Text style={[styles.regimenTitle, isDone && styles.strikethrough]}>{title}</Text>
    </View>
    <Clock size={16} color={COLORS.TEXT_SECONDARY} opacity={0.5} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: COLORS.WHITE, borderTopLeftRadius: RADIUS.L, borderTopRightRadius: RADIUS.L, padding: 32, paddingBottom: Platform.OS === 'ios' ? 60 : 40, ...SHADOWS.SOFT },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  sheetTitle: { fontSize: 11, fontWeight: '900', color: COLORS.TEXT_SECONDARY, letterSpacing: 1.5 },
  sheetOptions: { flexDirection: 'row', gap: 16 },
  optionBtn: { flex: 1, backgroundColor: COLORS.INPUT_BG, padding: 20, borderRadius: RADIUS.M, alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  optionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  optionText: { fontSize: 15, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  optionSub: { fontSize: 10, fontWeight: '600', color: COLORS.TEXT_SECONDARY, marginTop: 2 },

  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  profileTrigger: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { padding: 3, borderRadius: 22, borderWidth: 1, borderColor: COLORS.BORDER, marginRight: 15 },
  avatar: { width: 48, height: 48, borderRadius: 18, backgroundColor: COLORS.INPUT_BG },
  dateLabel: { fontSize: 10, color: COLORS.TEXT_SECONDARY, fontWeight: '800', letterSpacing: 1 },
  greeting: { fontSize: 22, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  iconCircle: { width: 48, height: 48, borderRadius: RADIUS.S, backgroundColor: COLORS.WHITE, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  dotIndicator: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PRIMARY, borderColor: COLORS.WHITE },

  mainCard: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.L, padding: 24, borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTag: { fontSize: 10, fontWeight: '900', color: COLORS.ACCENT, textTransform: 'uppercase', letterSpacing: 1.5 },
  cardTitle: { fontSize: 24, fontWeight: '900', color: COLORS.TEXT_PRIMARY, marginTop: 2, letterSpacing: -0.5 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.SUCCESS + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  trendText: { fontSize: 12, fontWeight: '800', color: COLORS.SUCCESS, marginLeft: 4 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  scoreCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: COLORS.INPUT_BG, justifyContent: 'center', alignItems: 'center' },
  scoreValue: { fontSize: 32, fontWeight: '300', color: COLORS.TEXT_PRIMARY },
  scoreLabel: { fontSize: 9, color: COLORS.ACCENT, fontWeight: '900', marginTop: -2 },
  scoreDetails: { flex: 1, marginLeft: 20 },
  detailText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, lineHeight: 20, fontWeight: '500' },
  actionLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actionLinkText: { fontSize: 14, fontWeight: '800', color: COLORS.ACCENT, marginRight: 4 },
  primaryBtn: { backgroundColor: COLORS.PRIMARY, flexDirection: 'row', height: 64, borderRadius: RADIUS.M, justifyContent: 'center', alignItems: 'center', gap: 12, ...SHADOWS.GLOW },
  primaryBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  section: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 2 },
  viewAll: { fontSize: 11, fontWeight: '900', color: COLORS.PRIMARY },
  grid: { flexDirection: 'row', gap: 12 },
  metricItem: { flex: 1, backgroundColor: COLORS.WHITE, padding: 16, borderRadius: RADIUS.M, borderWidth: 1, borderColor: COLORS.BORDER },
  metricLabel: { fontSize: 10, fontWeight: '800', color: COLORS.TEXT_SECONDARY, marginBottom: 8 },
  metricValue: { fontSize: 17, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  metricStatus: { fontSize: 10, fontWeight: '900' },

  regimenRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.WHITE, padding: 20, borderRadius: RADIUS.M, marginBottom: 12, borderWidth: 1, borderColor: COLORS.BORDER },
  checkIcon: { marginRight: 16 },
  regimenInfo: { flex: 1 },
  regimenStep: { fontSize: 10, fontWeight: '900', color: COLORS.ACCENT, letterSpacing: 1 },
  regimenTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.4 },

  insightBox: { marginTop: 32, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.ACCENT + '08', padding: 24, borderRadius: RADIUS.M, gap: 15, borderWidth: 1, borderColor: COLORS.ACCENT + '20' },
  insightText: { flex: 1, fontSize: 14, color: COLORS.TEXT_PRIMARY, lineHeight: 22, fontWeight: '500' },
});