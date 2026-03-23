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
import ImageAnalysisOverlay from '../components/ImageAnalysisOverlay';
import Notification from '../components/Notification';

const { width } = Dimensions.get('window');

const THEME = {
  primary: '#2C362B',   // Deep Forest
  accent: '#8FA08E',    // Oasis Sage
  highlight: '#E67E6E',  // Soft Coral
  background: '#F8F9F8', // Medical Off-white
  surface: '#FFFFFF',
  textMain: '#1A1D1A',
  textSub: '#6B7280',
  border: '#F1F3F1',
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading } = useProfileData();

  // --- STATES ---
  const [showOptions, setShowOptions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyConfig, setNotifyConfig] = useState({
    message: '',
    type: 'success' as 'success' | 'info' | 'error'
  });

  const fullName = useMemo(() => 
    `${profile?.first_name || 'User'} ${profile?.last_name || ''}`, 
  [profile]);

  const triggerNotification = (message: string, type: 'success' | 'info' | 'error') => {
    setNotifyConfig({ message, type });
    setNotifyVisible(true);
  };

  const handleCamera = () => {
    setShowOptions(false);
    router.push('/camera-scan');
  };

const handleGalleryNavigation = () => {
  // 1. Immediately close the modal overlay
  setShowOptions(false);

  // 2. Navigate to the upload screen
  // We use a tiny delay (100ms) to let the modal animation finish 
  // for a smoother visual transition.
  setTimeout(() => {
    router.push('/upload-image');
  }, 100);
};


  const startAnalysisFlow = (uri: string) => {
    setIsAnalyzing(true);
    const steps = [
      'INITIALIZING_NEURAL_ENGINE',
      'EXTRACTING_DERMAL_LAYERS',
      'ANALYZING_HYDRATION_INDEX',
      'FINALIZING_DIAGNOSIS'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setAnalysisStep(step);
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsAnalyzing(false);
            router.push({
              pathname: '/result-scan',
              params: { imageUri: uri, source: 'upload' }
            });
          }, 1500);
        }
      }, index * 1200);
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={THEME.primary} />
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

      {/* AI ANALYSIS OVERLAY (Visible during upload) */}
      <ImageAnalysisOverlay 
        visible={isAnalyzing} 
        currentStep={analysisStep} 
      />

      {/* --- SOURCE SELECTION MODAL --- */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>SELECT_IMAGE_SOURCE</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <X size={20} color={THEME.textSub} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetOptions}>
              <TouchableOpacity style={styles.optionBtn} onPress={handleCamera}>
                <View style={[styles.optionIcon, { backgroundColor: '#F0F4F0' }]}>
                  <Camera size={26} color={THEME.accent} />
                </View>
                <Text style={styles.optionText}>Live Scan</Text>
                <Text style={styles.optionSub}>Real-time tracking</Text>
              </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={handleGalleryNavigation}>
              <View style={[styles.optionIcon, { backgroundColor: '#FDF7F0' }]}>
                <ImageIcon size={26} color="#D4A373" />
              </View>
              <Text style={styles.optionText}>Upload</Text>
              <Text style={styles.optionSub}>From gallery</Text>
            </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* APP BAR */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.profileTrigger} onPress={() => router.push('/personal-info')}>
            <Image
              source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=8FA08E&color=fff` }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
              <Text style={styles.greeting}>Hello, {profile?.first_name || 'User'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => triggerNotification("SYSTEM_LOG: ALL SENSORS ACTIVE", "info")}
          >
            <Bell size={20} color={THEME.textMain} strokeWidth={1.5} />
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
              <ArrowUpRight size={14} color="#10B981" />
              <Text style={styles.trendText}>+4%</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>78</Text>
              <Text style={styles.scoreLabel}>OPTIMAL</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={styles.detailText}>Diagnostic scan shows 12% improvement in surface hydration levels.</Text>
              <TouchableOpacity style={styles.actionLink}>
                <Text style={styles.actionLinkText}>View report</Text>
                <ChevronRight size={14} color={THEME.accent} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowOptions(true)}>
            <ScanFace size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Start Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* ANALYTICS GRID */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Surface Analytics</Text>
          <View style={styles.grid}>
            <MetricItem label="PURITY" value="92%" status="HIGH" />
            <MetricItem label="TEXTURE" value="SMOOTH" status="STABLE" />
            <MetricItem label="OIL" value="MED" status="ALERT" isAlert />
          </View>
        </View>

        {/* PROTOCOL LIST */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Daily Protocol</Text>
            <TouchableOpacity><Text style={styles.viewAll}>PHASE_01</Text></TouchableOpacity>
          </View>
          
          <RegimenItem title="Purifying Cleanser" step="STEP 01" isDone />
          <RegimenItem title="Vitamin C Serum" step="STEP 02" />
          <RegimenItem title="Broad Spectrum SPF" step="STEP 03" />
        </View>

        {/* AI INSIGHT */}
        <View style={styles.insightBox}>
          <Sparkles size={18} color={THEME.primary} />
          <Text style={styles.insightText}>
            <Text style={{fontWeight: '800'}}>ENGINE_NOTE:</Text> High UV index detected today. Ensure SPF application is repeated every 4 hours.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB COMPONENTS ---

const MetricItem = ({ label, value, status, isAlert }: any) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={[styles.metricStatus, isAlert && { color: THEME.highlight }]}>{status}</Text>
  </View>
);

const RegimenItem = ({ title, step, isDone }: any) => (
  <View style={styles.regimenRow}>
    <TouchableOpacity style={styles.checkIcon}>
      {isDone ? <CheckCircle size={24} color={THEME.accent} fill={`${THEME.accent}15`} /> : <Circle size={24} color={THEME.border} />}
    </TouchableOpacity>
    <View style={styles.regimenInfo}>
      <Text style={styles.regimenStep}>{step}</Text>
      <Text style={[styles.regimenTitle, isDone && styles.strikethrough]}>{title}</Text>
    </View>
    <Clock size={14} color={THEME.border} />
  </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,29,26,0.5)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: THEME.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: Platform.OS === 'ios' ? 60 : 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  sheetTitle: { fontSize: 10, fontWeight: '800', color: THEME.textSub, letterSpacing: 2 },
  sheetOptions: { flexDirection: 'row', gap: 16 },
  optionBtn: { flex: 1, backgroundColor: THEME.background, padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  optionIcon: { width: 60, height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  optionText: { fontSize: 15, fontWeight: '800', color: THEME.textMain },
  optionSub: { fontSize: 10, fontWeight: '600', color: THEME.textSub, marginTop: 2 },

  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  profileTrigger: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 20, marginRight: 15, backgroundColor: THEME.border },
  dateLabel: { fontSize: 10, color: THEME.textSub, fontWeight: '800', letterSpacing: 1 },
  greeting: { fontSize: 20, fontWeight: '800', color: THEME.textMain },
  iconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  dotIndicator: { position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.highlight },

  mainCard: { backgroundColor: THEME.surface, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: THEME.border, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 20, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTag: { fontSize: 10, fontWeight: '800', color: THEME.accent, textTransform: 'uppercase', letterSpacing: 1 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: THEME.textMain, marginTop: 2 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFFFF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  trendText: { fontSize: 12, fontWeight: '800', color: '#10B981', marginLeft: 4 },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  scoreCircle: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  scoreValue: { fontSize: 28, fontWeight: '300', color: THEME.textMain },
  scoreLabel: { fontSize: 8, color: THEME.accent, fontWeight: '800', marginTop: -2 },
  scoreDetails: { flex: 1, marginLeft: 20 },
  detailText: { fontSize: 13, color: THEME.textSub, lineHeight: 18 },
  actionLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  actionLinkText: { fontSize: 13, fontWeight: '800', color: THEME.accent, marginRight: 4 },
  primaryBtn: { backgroundColor: THEME.primary, flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  section: { marginTop: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: THEME.textSub, textTransform: 'uppercase', letterSpacing: 2 },
  viewAll: { fontSize: 11, fontWeight: '800', color: THEME.accent },
  grid: { flexDirection: 'row', gap: 12 },
  metricItem: { flex: 1, backgroundColor: THEME.surface, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: THEME.border },
  metricLabel: { fontSize: 9, fontWeight: '800', color: THEME.textSub, marginBottom: 8 },
  metricValue: { fontSize: 16, fontWeight: '800', color: THEME.textMain },
  metricStatus: { fontSize: 9, fontWeight: '800', color: '#10B981', marginTop: 4 },

  regimenRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  checkIcon: { marginRight: 16 },
  regimenInfo: { flex: 1 },
  regimenStep: { fontSize: 9, fontWeight: '800', color: THEME.accent, letterSpacing: 1 },
  regimenTitle: { fontSize: 15, fontWeight: '700', color: THEME.textMain, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.4 },

  insightBox: { marginTop: 32, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F0', padding: 24, borderRadius: 28, gap: 15, borderWidth: 1, borderColor: '#E0E8E0' },
  insightText: { flex: 1, fontSize: 14, color: THEME.textMain, lineHeight: 22 },
});