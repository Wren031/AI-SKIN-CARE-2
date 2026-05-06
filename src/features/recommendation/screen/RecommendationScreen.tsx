import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Home,
  Info,
  Leaf,
  ShieldCheck,
  Star,
  Zap
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEMES } from "@/src/constants/themes";
import { supabase } from "../../lib/supabase"; // Ensure you have access to supabase auth
import { useRecommendations } from "../hooks/useRecommendations";

import { useUserSkinResult } from "../services/userSkinResultService";
import { LifestyleTip, Product } from "../types/Product";
import { Severity, UsersSkinResult } from "../types/UsersSkinResult";

const { width } = Dimensions.get("window");
const COLORS = THEMES.DERMA_AI.COLORS;

const parseJSON = (value?: string) => {
  try {
    return value ? JSON.parse(value) : [];
  } catch (err) {
    console.error("JSON parse error:", err);
    return [];
  }
};

export default function RecommendationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const detections = useMemo(
    () => parseJSON(params.detections as string),
    [params.detections]
  );
  
  // Hooks
  const { advice, loading, saveUsersRecommendations } = useRecommendations(detections);


  const { createReport, isSaving: isSavingResult } = useUserSkinResult();
  
  const hasSaved = React.useRef(false); 

  const goBack = () => router.back();
  const goHome = () => router.replace("/(tabs)/home");

  const saveUserResult = async () => {
    if (hasSaved.current || loading || isSavingResult) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Authentication Required", "Please sign in to save your journey.");
        return;
      }

      const payload: UsersSkinResult = {
        score: parseInt(params.score as string, 10) || 0,
        confidence: parseInt(params.confidence as string, 10) || 0,
        skinType: (params.skinType as string) || 'Unknown',
        severity: (params.severity as string)?.toUpperCase() as Severity || 'MILD',
        imageUri: (params.imageUri as string) || '',
        detections: detections, 
      };

      console.log("📦 Saving Skin Result...");
      const savedResult = await createReport(payload);

      if (savedResult?.id && advice && advice.length > 0) {
        console.log("📦 Saving Recommendations...");

      const savePromises = advice.map((item: any) => {
        const productId = item.tbl_recommendation_products?.[0]?.tbl_products?.id ?? null;
        const lifestyleTipId = item.tbl_recommendation_lifestyle_tips?.[0]?.tbl_lifestyle_tips?.id ?? null;

        console.log(`🔗 Linking Product: ${productId}, Tip: ${lifestyleTipId}`);

        return saveUsersRecommendations(
          item.id,          
          productId,
          lifestyleTipId,
          user.id,          
          savedResult.id    
        );
      });

        await Promise.all(savePromises);
        
        hasSaved.current = true;
        console.log("✅ SUCCESS: Full Journey Saved.");
        Alert.alert("Journey Started!", "Your skin analysis and regimen have been saved to your profile.");
        router.replace("/(tabs)/home");
      }

    } catch (error) {
      console.error("❌ SAVE FAILED:", error);
      Alert.alert("Error", "We couldn't save your journey. Please try again.");
    }
  };

  if (loading || isSavingResult) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>
          {isSavingResult ? "SYNCING YOUR REGIMEN..." : "ANALYZING SKIN DATA..."}
        </Text>
      </View>
    );
  }

  return (
   <SafeAreaView style={styles.container} edges={["top"]}>
      <Header onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Derma Recommendation</Text>
          <Text style={styles.heroSubtitle}>Based on your recent scan, here is your personalized dermatological plan.</Text>
        </View>

        {advice?.map((item: any, index: number) => (
          <View key={item.id ?? index} style={styles.card}>
            <ConditionHeader item={item} />
            <ContentSection item={item} />
            <ProductSection 
              item={item} 
              onPress={(p: Product) => router.push({ pathname: "/product-detail", params: { data: JSON.stringify(p) } })} 
            />
            <LifestyleSection 
              item={item} 
              onPress={(l: LifestyleTip) => router.push({ pathname: "/lifestyle-detail", params: { tipData: JSON.stringify(l) } })} 
            />
          </View>
        ))}
      </ScrollView>

      <BottomDock onHome={goHome} onStartJourney={saveUserResult} />
    </SafeAreaView>
  );
}

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.appBar}>
    <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
      <ArrowLeft size={20} color="#1E293B" />
    </TouchableOpacity>

    <View style={{ alignItems: "center" }}>
      <Text style={styles.headerTitle}>DERMA AI™ REPORT</Text>
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.headerSub}>Analysis Verified</Text>
      </View>
    </View>

    <TouchableOpacity style={styles.iconBtn}>
      <Star size={20} color="#64748B" />
    </TouchableOpacity>
  </View>
);

const ConditionHeader = ({ item }: any) => {
  const isHigh = item.severity === "high";
  return (
    <View style={styles.cardHeader}>
      <View style={{ flex: 1 }}>
        <View style={styles.badgeContainer}>
           <Text style={styles.conditionName}>{item.tbl_condition?.name ?? "Skin Condition"}</Text>
           <View style={[styles.badge, { backgroundColor: isHigh ? "#FEE2E2" : "#E0F2FE" }]}>
             <Text style={[styles.badgeText, { color: isHigh ? "#B91C1C" : "#0369A1" }]}>
               {item.severity?.toUpperCase()}
             </Text>
           </View>
        </View>
      </View>
      <View style={styles.circleIcon}>
        <ShieldCheck size={22} color={COLORS.PRIMARY} />
      </View>
    </View>
  );
};

const ContentSection = ({ item }: any) => (
  <View style={styles.content}>
    <View style={styles.sectionHeadingRow}>
        <ClipboardList size={14} color="#64748B" />
        <Text style={styles.sectionTitle}>TREATMENT PROTOCOL</Text>
    </View>
    <Text style={styles.text}>{item.treatment}</Text>

    <View style={styles.warningBox}>
      <Text style={styles.warningTitle}>SAFETY PRECAUTIONS</Text>
      <Text style={styles.warningText}>{item.precautions}</Text>
    </View>
  </View>
);

const ProductSection = ({ item, onPress }: any) =>
  item.tbl_recommendation_products?.length > 0 && (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Recommendation Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{overflow: 'visible'}}>
        {item.tbl_recommendation_products.map((p: any, i: number) => (
          <TouchableOpacity key={i} style={styles.productCard} onPress={() => onPress(p.tbl_products)}>
            <Image source={{ uri: p.tbl_products.image_url }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{p.tbl_products.product_name}</Text>
                <ChevronRight size={14} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

const LifestyleSection = ({ item, onPress }: any) =>
  item.tbl_recommendation_lifestyle_tips?.length > 0 && (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: "#166534" }]}>LIFESTYLE OPTIMIZATION</Text>
      {item.tbl_recommendation_lifestyle_tips.map((l: any, i: number) => (
          <TouchableOpacity key={i} style={styles.tipCard} onPress={() => onPress(l.tbl_lifestyle_tips)}>
            <View style={styles.tipIconContainer}>
                <Leaf size={16} color="#166534" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{l.tbl_lifestyle_tips.title}</Text>
              <Text style={styles.tipDesc} numberOfLines={1}>{l.tbl_lifestyle_tips.description}</Text>
            </View>
            <Info size={16} color="#CBD5E1" />
          </TouchableOpacity>
        )
      )}
    </View>
  );

const BottomDock = ({ onHome, onStartJourney }: any) => (
  <View style={styles.bottomDockContainer}>
    <View style={styles.bottomDock}>
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
        <Home size={22} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={onStartJourney}>
        <Text style={styles.primaryText}>Start My Journey</Text>
        <Zap size={18} color="#fff" fill="#fff" />
        </TouchableOpacity>
    </View>
  </View>
);

/* ================= REFINED STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontSize: 12, fontWeight: "800", color: "#64748B", letterSpacing: 1 },

  scrollContainer: { paddingBottom: 140 },

  /* HEADER */
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 12, fontWeight: "900", color: "#0F172A", letterSpacing: 1 },
  headerSub: { fontSize: 10, color: "#64748B", fontWeight: '600' },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  /* HERO */
  heroSection: { padding: 24, paddingBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#1E293B" },
  heroSubtitle: { fontSize: 15, color: "#64748B", marginTop: 4, lineHeight: 22 },

  /* CARD */
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 28,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  cardHeader: { flexDirection: "row", padding: 24, paddingBottom: 16, alignItems: 'center' },
  badgeContainer: { flex: 1 },
  conditionName: { fontSize: 24, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, alignSelf: "flex-start" },
  badgeText: { fontSize: 10, fontWeight: "800" },
  circleIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },

  /* CONTENT */
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: "800", color: "#94A3B8", letterSpacing: 1 },
  text: { fontSize: 15, color: "#334155", lineHeight: 24 },
  warningBox: { marginTop: 20, padding: 16, backgroundColor: "#FFF1F2", borderRadius: 20, borderLeftWidth: 4, borderLeftColor: "#F43F5E" },
  warningTitle: { fontSize: 11, fontWeight: "900", color: "#991B1B", marginBottom: 4 },
  warningText: { color: "#B91C1C", fontSize: 13, lineHeight: 18, fontWeight: '500' },

  /* PRODUCTS */
  section: { padding: 24, paddingTop: 0 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: '#64748B', marginBottom: 16, letterSpacing: 1 },
  productCard: { width: 150, marginRight: 16, backgroundColor: '#F8FAFC', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  productImage: { width: "100%", height: 140, borderRadius: 18, backgroundColor: "#fff" },
  productInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingBottom: 4 },
  productName: { fontSize: 13, fontWeight: "700", color: '#1E293B', flex: 1, marginRight: 4 },

  /* LIFESTYLE */
  tipCard: { flexDirection: "row", alignItems: 'center', gap: 12, padding: 16, backgroundColor: "#F0FDF4", borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#DCFCE7' },
  tipIconContainer: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontWeight: "700", color: "#064E3B", fontSize: 14 },
  tipDesc: { fontSize: 12, color: "#166534", marginTop: 2 },

  /* BOTTOM DOCK */
  bottomDockContainer: { position: "absolute", bottom: 0, width: "100%", paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
  bottomDock: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  homeBtn: { width: 56, height: 56, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  primaryBtn: { flex: 1, backgroundColor: COLORS.PRIMARY, borderRadius: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, height: 56 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});