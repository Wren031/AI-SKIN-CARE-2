import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, ShoppingBag, Stethoscope } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Prediction {
    class: string;
    confidence: number;
    severity?: "LOW" | "MODERATE" | "HIGH"; // Optional from scanner
}

interface Advice {
    severity: "Low" | "Moderate" | "High";
    treatment: string[];
    precautions: string[];
    ingredients: string[];
}

const SKIN_ADVICE: Record<string, Advice> = {
    ACNE: {
        severity: "Moderate",
        treatment: ["Morning: Salicylic wash", "Night: Retinoid application", "Weekly: Clay mask treatment"],
        precautions: ["Do not pop pimples", "Change pillowcases frequently", "Keep hair off face"],
        ingredients: ["Salicylic Acid", "Benzoyl Peroxide", "Niacinamide"]
    },
    ECZEMA: {
        severity: "Moderate",
        treatment: ["Apply thick emollient 3x daily", "Short lukewarm showers", "Wet wrap therapy for flares"],
        precautions: ["Avoid wool clothing", "Use fragrance-free detergents", "Avoid extreme temperature changes"],
        ingredients: ["Ceramides", "Colloidal Oatmeal", "Squalane"]
    },
    ROSACEA: {
        severity: "Moderate",
        treatment: ["Daily mineral SPF 50", "Metronidazole cream (if prescribed)", "Gentle cream cleansing"],
        precautions: ["Limit spicy foods", "Avoid hot beverages", "Minimize sun exposure"],
        ingredients: ["Azelaic Acid", "Sulfur", "Green Tea Extract"]
    },
    DEFAULT: {
        severity: "Low",
        treatment: ["Basic hydration routine", "Sun protection"],
        precautions: ["Patch test new products", "Consult a dermatologist if irritation persists"],
        ingredients: ["Hyaluronic Acid", "SPF"]
    }
};

export default function RecommendationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Parse predictions passed from UploadScreen
    const predictions: Prediction[] = params.data ? JSON.parse(params.data as string) : [];

    // Helper to color-code severity UI
    const getSeverityStyle = (severity: string) => {
        const upper = severity.toUpperCase();
        if (upper === "HIGH") return { bg: "#FEF2F2", text: "#DC2626", border: "#FEE2E2" };
        if (upper === "MODERATE") return { bg: "#FFFBEB", text: "#D97706", border: "#FEF3C7" };
        return { bg: "#F0FDF4", text: "#16A34A", border: "#DCFCE7" };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1A1D1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dermal Report</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {predictions.map((p, index) => {
                    const advice = SKIN_ADVICE[p.class] || SKIN_ADVICE.DEFAULT;
                    // Use scanner-calculated severity if it exists, otherwise use DB default
                    const displaySeverity = p.severity || advice.severity;
                    const sevStyle = getSeverityStyle(displaySeverity);

                    return (
                        <View key={index} style={styles.mainCard}>
                            {/* Header Section */}
                            <View style={styles.topSection}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.conditionTitle}>{p.class}</Text>
                                    <View style={[styles.severityBadge, { backgroundColor: sevStyle.bg, borderColor: sevStyle.border }]}>
                                        <Text style={[styles.severityText, { color: sevStyle.text }]}>
                                            {displaySeverity} SEVERITY
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.confidenceCircle}>
                                    <Text style={styles.confValue}>{(p.confidence * 100).toFixed(0)}%</Text>
                                    <Text style={styles.confLabel}>MATCH</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Treatment Plan */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Stethoscope size={20} color="#1A1D1A" strokeWidth={2.5} />
                                    <Text style={styles.sectionTitle}>Treatment Plan</Text>
                                </View>
                                {advice.treatment.map((step, i) => (
                                    <View key={i} style={styles.listItem}>
                                        <CheckCircle2 size={16} color="#8FA08E" />
                                        <Text style={styles.listText}>{step}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Precautions */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <AlertTriangle size={20} color="#D97706" strokeWidth={2.5} />
                                    <Text style={styles.sectionTitle}>Medical Precautions</Text>
                                </View>
                                <View style={styles.precautionBox}>
                                    {advice.precautions.map((item, i) => (
                                        <Text key={i} style={styles.precautionText}>• {item}</Text>
                                    ))}
                                </View>
                            </View>

                            {/* Ingredients */}
                            <View style={styles.ingredientSection}>
                                <Text style={styles.smallHeader}>Active Ingredients</Text>
                                <View style={styles.badgeContainer}>
                                    {advice.ingredients.map((ing, i) => (
                                        <View key={i} style={styles.ingBadge}>
                                            <Text style={styles.ingText}>{ing}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    );
                })}

                <TouchableOpacity style={styles.shopBtn} activeOpacity={0.8}>
                    <ShoppingBag size={20} color="#FFF" />
                    <Text style={styles.shopBtnText}>Shop Care Routine</Text>
                </TouchableOpacity>

                <View style={styles.disclaimerBox}>
                    <Info size={16} color="#9CA3AF" />
                    <Text style={styles.disclaimerText}>
                        This AI-generated report is for educational purposes. Results should be verified by a board-certified dermatologist.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    backBtn: { padding: 10, backgroundColor: "#F3F4F6", borderRadius: 14 },
    headerTitle: { fontSize: 20, fontWeight: "900", marginLeft: 16, color: "#1A1D1A", letterSpacing: -0.5 },
    content: { padding: 16 },
    mainCard: { backgroundColor: "#FFF", borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: "#F1F5F9", shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 20, elevation: 2 },
    topSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    conditionTitle: { fontSize: 28, fontWeight: "900", color: "#1A1D1A", marginBottom: 6 },
    severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: "flex-start", borderWidth: 1 },
    severityText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
    confidenceCircle: { alignItems: "center", justifyContent: "center", backgroundColor: "#F0F4F0", height: 64, width: 64, borderRadius: 32, borderWidth: 1, borderColor: "#E2E8E2" },
    confValue: { fontSize: 18, fontWeight: "900", color: "#1A1D1A" },
    confLabel: { fontSize: 8, fontWeight: "800", color: "#8FA08E" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 24 },
    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1A1D1A" },
    listItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
    listText: { fontSize: 15, color: "#4B5563", lineHeight: 22, fontWeight: "500", flex: 1 },
    precautionBox: { backgroundColor: "#FFFBEB", padding: 18, borderRadius: 20, borderLeftWidth: 5, borderLeftColor: "#D97706" },
    precautionText: { fontSize: 14, color: "#92400E", marginBottom: 6, fontWeight: "600", lineHeight: 20 },
    ingredientSection: { marginTop: 8 },
    smallHeader: { fontSize: 11, fontWeight: "900", color: "#9CA3AF", textTransform: "uppercase", marginBottom: 14, letterSpacing: 1 },
    badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    ingBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
    ingText: { fontSize: 13, fontWeight: "700", color: "#334155" },
    shopBtn: { backgroundColor: "#1A1D1A", flexDirection: "row", height: 64, borderRadius: 20, justifyContent: "center", alignItems: "center", gap: 12, marginTop: 10, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
    shopBtnText: { color: "#FFF", fontWeight: "800", fontSize: 17 },
    disclaimerBox: { flexDirection: "row", gap: 10, marginTop: 30, paddingHorizontal: 12, marginBottom: 40 },
    disclaimerText: { flex: 1, fontSize: 12, color: "#9CA3AF", lineHeight: 18, fontWeight: "500" }
});