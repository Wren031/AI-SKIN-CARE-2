import { THEMES } from '@/src/constants/themes';
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    ClipboardList,
    Home,
    Info,
    ShieldAlert,
    ShoppingBag,
    Stethoscope,
    Zap
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecommendations } from "../hooks/useRecommendations";

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

// --- Interfaces ---
interface Product {
  tbl_products: {
    product_name: string;
    brand: string;
    image_url: string;
  };
}

interface RecommendationItem {
  id: string;
  severity: 'Low' | 'Medium' | 'High';
  treatment: string;
  precautions: string;
  tbl_condition?: { name: string };
  tbl_recommendation_products?: Product[];
}

const ClinicalSection = ({ icon, label, content, isWarning = false }: any) => (
  <View style={[styles.section, isWarning && styles.warningSection]}>
    <View style={styles.labelRow}>
      {icon}
      <Text style={[styles.sectionLabel, isWarning && { color: "#FF3B30" }]}>
        {label}
      </Text>
    </View>
    <Text style={styles.sectionBody}>{content}</Text>
  </View>
);

export default function RecommendationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const parsedDetections = useMemo(() => {
    try {
      return params.detections ? JSON.parse(params.detections as string) : [];
    } catch (e) {
      console.error("[Clinical] Parse Error:", e);
      return [];
    }
  }, [params.detections]);

  const { advice, loading } = useRecommendations(parsedDetections);

  // Updated Severity Mapping: Mild, Moderate, Severe
  const getSeverityStyle = (severity: string) => {
    const s = String(severity || '').toLowerCase();
    
    // Severe / High
    if (s === 'high' || s === 'severe') {
      return { bg: "#FF3B3015", text: "#FF3B30", label: 'SEVERE' };
    }
    // Moderate / Medium
    if (s === 'medium' || s === 'moderate') {
      return { bg: "#FF950015", text: "#FF9500", label: 'MODERATE' };
    }
    // Mild / Low
    return { bg: COLORS.SUCCESS + '15', text: COLORS.SUCCESS, label: 'MILD' };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingLabel}>GENERATING CLINICAL PROTOCOL...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.titleMain}>TREATMENT PLAN</Text>
          <Text style={styles.titleSub}>Verified AI Guidance</Text>
        </View>
        
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {advice.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Info size={40} color={COLORS.BORDER} />
            <Text style={styles.emptyText}>No clinical findings identified.</Text>
          </View>
        ) : (
          advice.map((item: RecommendationItem, index: number) => {
            const sev = getSeverityStyle(item.severity);
            
            return (
              <View key={item.id || index.toString()} style={styles.assessmentCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.conditionTitle}>
                      {item.tbl_condition?.name || "Skin Analysis"}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: sev.bg, borderColor: sev.text }]}>
                      <Text style={[styles.badgeText, { color: sev.text }]}>
                         {sev.label} CONDITION
                      </Text>
                    </View>
                  </View>
                  <ClipboardList size={22} color={COLORS.PRIMARY} />
                </View>

                <ClinicalSection 
                  icon={<Stethoscope size={14} color={COLORS.PRIMARY} />} 
                  label="TREATMENT PLAN" 
                  content={item.treatment} 
                />

                <ClinicalSection 
                  icon={<ShieldAlert size={14} color="#FF3B30" />} 
                  label="SAFETY PRECAUTIONS" 
                  content={item.precautions}
                  isWarning
                />

                {item.tbl_recommendation_products && item.tbl_recommendation_products.length > 0 && (
                  <View style={styles.productWrapper}>
                    <View style={styles.labelRow}>
                      <ShoppingBag size={14} color={COLORS.TEXT_PRIMARY} />
                      <Text style={styles.sectionLabel}>SUPPORTIVE CARE PRODUCTS</Text>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
                      {item.tbl_recommendation_products.map((p, i) => (
                        <TouchableOpacity key={i} style={styles.productCard} activeOpacity={0.8}>
                          <View style={styles.imageContainer}>
                            <Image 
                              source={{ uri: p.tbl_products.image_url }} 
                              style={styles.productImage} 
                              resizeMode="contain" 
                            />
                          </View>
                          <Text style={styles.pName} numberOfLines={1}>{p.tbl_products.product_name}</Text>
                          <Text style={styles.pBrand}>{p.tbl_products.brand}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.btnSecondary} 
          onPress={() => router.replace("/(tabs)/home" as any)}
        >
          <Home size={18} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.btnTextSecondary}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btnPrimary} 
          onPress={() => router.push("/chat-boot" as any)}
          activeOpacity={0.9}
        >
          <Zap size={18} color="#FFF" fill="#FFF" />
          <Text style={styles.btnTextPrimary}>DERMA AI CHAT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND },
  loadingLabel: { marginTop: 16, color: COLORS.TEXT_SECONDARY, fontWeight: '800', fontSize: 10, letterSpacing: 1.5 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, ...SHADOWS.SOFT
  },
  iconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.WHITE, borderRadius: RADIUS.S, borderWidth: 1, borderColor: COLORS.BORDER },
  titleWrapper: { alignItems: 'center' },
  titleMain: { fontSize: 13, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: 1 },
  titleSub: { fontSize: 9, color: COLORS.TEXT_SECONDARY, marginTop: 2, fontWeight: '700', textTransform: 'uppercase' },
  scrollContent: { paddingBottom: 140 },
  assessmentCard: { backgroundColor: COLORS.WHITE, marginHorizontal: 16, marginTop: 16, borderRadius: RADIUS.L, padding: 20, borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BACKGROUND, paddingBottom: 16 },
  conditionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.S, marginTop: 8, alignSelf: 'flex-start', borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  warningSection: { backgroundColor: '#FF3B3008', padding: 14, borderRadius: RADIUS.M, borderLeftWidth: 4, borderLeftColor: '#FF3B30' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: COLORS.TEXT_SECONDARY, letterSpacing: 1 },
  sectionBody: { fontSize: 15, color: COLORS.TEXT_PRIMARY, lineHeight: 22, fontWeight: '500' },
  productWrapper: { marginTop: 10 },
  productScroll: { paddingVertical: 12 },
  productCard: { width: 140, marginRight: 16 },
  imageContainer: { backgroundColor: COLORS.WHITE, borderRadius: RADIUS.M, padding: 12, marginBottom: 10, height: 140, justifyContent: 'center', borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  productImage: { width: '100%', height: '100%' },
  pName: { fontSize: 13, fontWeight: '900', color: COLORS.TEXT_PRIMARY },
  pBrand: { fontSize: 9, color: COLORS.TEXT_SECONDARY, textTransform: 'uppercase', marginTop: 3, fontWeight: '800' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: COLORS.WHITE, borderTopWidth: 1, borderTopColor: COLORS.BORDER, gap: 12, paddingBottom: 34 },
  btnSecondary: { flex: 1, flexDirection: 'row', height: 56, borderRadius: RADIUS.M, borderWidth: 1, borderColor: COLORS.BORDER, justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnTextSecondary: { fontWeight: '900', color: COLORS.TEXT_PRIMARY, fontSize: 13, letterSpacing: 1 },
  btnPrimary: { flex: 2, flexDirection: 'row', height: 56, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.M, justifyContent: 'center', alignItems: 'center', gap: 8, ...SHADOWS.GLOW },
  btnTextPrimary: { fontWeight: '900', color: '#FFF', fontSize: 13, letterSpacing: 1 },
  emptyContainer: { padding: 80, alignItems: 'center', gap: 16 },
  emptyText: { color: COLORS.TEXT_SECONDARY, fontSize: 15, fontWeight: '600' }
});