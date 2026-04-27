import { THEMES } from '@/src/constants/themes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FlaskConical,
  LucideIcon,
  ShieldAlert,
  Zap
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '../types/Product';

const { width } = Dimensions.get('window');
const COLORS = THEMES.DERMA_AI.COLORS;

const StatBox = ({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) => (
  <View style={styles.statBox}>
    <View style={styles.statIconContainer}>
      <Icon size={18} color={COLORS.PRIMARY} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const product = useMemo<Product | null>(() => {
    try {
      return params.data ? JSON.parse(params.data as string) : null;
    } catch (e) {
      return null;
    }
  }, [params.data]);

  if (!product) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroCircle} />
        <Image 
          source={{ uri: product.image_url }} 
          style={styles.heroImage} 
          resizeMode="contain" 
        />
        <SafeAreaView style={styles.headerOverlay} edges={['top']}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#1E293B" />
          </TouchableOpacity>

        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.contentScroll} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentPadding}>
          {/* Header Identity */}
          <View style={styles.brandRow}>
            <Text style={styles.brandTag}>Advanced Dermatology</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>#{product.id?.toString().padStart(3, '0') || '000'}</Text>
            </View>
          </View>
          
          <Text style={styles.productName}>{product.product_name}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.clinicalBadge}>
              <FlaskConical size={14} color={COLORS.PRIMARY} />
              <Text style={styles.clinicalBadgeText}>Medical Grade</Text>
            </View>
            <View style={[styles.clinicalBadge, { backgroundColor: '#F0FDF4' }]}>
              <CheckCircle2 size={14} color="#166534" />
              <Text style={[styles.clinicalBadgeText, { color: '#166534' }]}>Verified</Text>
            </View>
          </View>

          {/* Key Stats Grid */}
          <View style={styles.statsGrid}>
            <StatBox Icon={Clock} label="Usage Routine" value={product.usage || 'Daily'} />
            <StatBox Icon={Zap} label="Product Brand" value={product.type || 'Topical'} />
          </View>

          {/* Instructional Card */}
          <View style={styles.section}>
            <Text style={styles.sectionHeaderTitle}>USAGE INSTRUCTIONS</Text>
            <View style={styles.instructionCard}>
              <View style={styles.stepIndicator}>
                <View style={styles.stepDot} />
                <View style={styles.stepLine} />
              </View>
              <Text style={styles.stepText}>
                {product.instructions || "Dispense a pea-sized amount onto fingertips. Apply to clean, dry skin using upward circular motions."}
              </Text>
            </View>
          </View>

          {/* Safety Warnings */}
          <View style={styles.safetyBox}>
            <View style={styles.safetyHeader}>
              <ShieldAlert size={18} color="#B91C1C" />
              <Text style={styles.safetyTitle}>CLINICAL NOTES</Text>
            </View>
            <Text style={styles.safetyDescription}>
              Avoid direct contact with eyes. Perform a patch test before full application. Discontinue use if redness or peeling occurs.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  heroSection: { 
    height: width * 0.9, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  heroCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  heroImage: { width: '80%', height: '80%', zIndex: 1, marginBottom: -100 },
  headerOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
  backButton: { 
    width: 44, height: 44, borderRadius: 15, 
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 }
    })
  },

  contentScroll: { 
    marginTop: -40, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40 
  },
  scrollContent: { paddingBottom: 40 },
  contentPadding: { paddingHorizontal: 28, paddingTop: 40 },

  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brandTag: { fontSize: 11, fontWeight: '900', color: COLORS.PRIMARY, letterSpacing: 1.5, textTransform: 'uppercase' },
  idBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#F1F5F9', borderRadius: 8 },
  idText: { fontSize: 10, color: '#64748B', fontWeight: '800', letterSpacing: 0.5 },

  productName: { fontSize: 30, fontWeight: '800', color: '#0F172A', letterSpacing: -1, lineHeight: 36 },
  
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  clinicalBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    paddingHorizontal: 12, paddingVertical: 8, 
    backgroundColor: '#F0F9FF', borderRadius: 12
  },
  clinicalBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.PRIMARY },

  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 32 },
  statBox: { 
    flex: 1, padding: 16, backgroundColor: '#F8FAFC', 
    borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' 
  },
  statIconContainer: { 
    width: 36, height: 36, borderRadius: 12, 
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 
  },
  statInfo: { gap: 2 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '800', letterSpacing: 0.5 },
  statValue: { fontSize: 14, color: '#1E293B', fontWeight: '700' },

  section: { marginTop: 40 },
  sectionHeaderTitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16 },
  instructionCard: { 
    flexDirection: 'row', padding: 24, backgroundColor: '#F8FAFC', 
    borderRadius: 24, borderLeftWidth: 4, borderLeftColor: COLORS.PRIMARY 
  },
  stepIndicator: { alignItems: 'center', marginRight: 16, paddingTop: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.PRIMARY },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: 4, borderRadius: 1 },
  stepText: { fontSize: 15, color: '#334155', flex: 1, lineHeight: 24, fontWeight: '500' },

  safetyBox: { marginTop: 32, padding: 20, backgroundColor: '#FFF1F2', borderRadius: 24 },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  safetyTitle: { fontSize: 11, fontWeight: '900', color: '#B91C1C', letterSpacing: 1 },
  safetyDescription: { fontSize: 13, color: '#991B1B', lineHeight: 20, fontWeight: '500' },
});