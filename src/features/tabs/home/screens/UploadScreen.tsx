import { useProfileData } from "@/src/features/auth/hooks/useProfileData";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, CheckCircle2, Info, RefreshCcw, ShieldCheck, Sparkles, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated, Dimensions,
  Easing,
  Image, Modal,
  ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSkinScanner } from "../hooks/useSkinScanner";

const { width } = Dimensions.get("window");

const STATUS_MESSAGES = {
  IDLE: { title: "READY FOR SCAN", sub: "Please select a high-resolution photo." },
  SCANNING: { title: "PROCESSING DATA", sub: "AI is analyzing multiple layers..." },
  SUCCESS: { title: "ANALYSIS COMPLETE", sub: "Results finalized professionally." },
  ERROR: { title: "SCAN FAILED", sub: "Try natural light or closer zoom." },
};

export default function UploadScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const { profile } = useProfileData();
  const { status, predictions, errorMessage, scanAnim, runScan } = useSkinScanner(profile?.id);

  // Animation Loop Logic
  useEffect(() => {
    if (status === "SCANNING") {
      // Create a repeating up-and-down animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [status]);

  const handlePickImage = async () => {
    setShowGuide(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].uri);
        await runScan(result.assets[0].base64);
      }
    } catch (err) {
      console.log("Image pick error:", err);
    }
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === "HIGH") return { bg: styles.bgHigh, text: "#991B1B" };
    if (sev === "MODERATE") return { bg: { backgroundColor: "#FEF3C7" }, text: "#92400E" };
    return { bg: styles.bgLow, text: "#065F46" };
  };

  // Interpolate the scanning line position
  // Adjust outputRange based on the image container height (width * 1.15)
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 1.15],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Upload Guide Modal */}
      <Modal visible={showGuide} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Camera size={24} color="#1A1D1A" />
              <Text style={styles.modalTitle}>Upload Guide</Text>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionLabel}>BEST RESULTS</Text>
              <View style={styles.tipRow}>
                <CheckCircle2 size={16} color="#065F46" />
                <Text style={styles.tipText}>Use bright natural light.</Text>
              </View>
              <View style={styles.tipRow}>
                <CheckCircle2 size={16} color="#065F46" />
                <Text style={styles.tipText}>Focus directly on the area of concern.</Text>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalBtn} onPress={handlePickImage}>
              <Text style={styles.modalBtnText}>START UPLOAD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <X size={22} color="#1A1D1A" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ShieldCheck size={14} color="#8FA08E" />
          <Text style={styles.headerTitle}>AI CLINICAL SCAN</Text>
        </View>
        <TouchableOpacity onPress={() => setShowGuide(true)} style={styles.iconBtn}>
          <Info size={22} color="#1A1D1A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <View style={styles.imageFrame}>
            {selectedImage ? (
              <>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                
                {/* SCANNING ANIMATION LAYER */}
                {status === "SCANNING" && (
                  <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
                    <View style={styles.scanGlow} />
                  </Animated.View>
                )}
              </>
            ) : (
              <TouchableOpacity onPress={handlePickImage} style={styles.placeholderBox}>
                <Camera color="#8FA08E" size={32} />
                <Text style={styles.placeholderText}>Tap to select image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.statusTitle}>{STATUS_MESSAGES[status].title}</Text>
          <Text style={styles.statusSub}>{STATUS_MESSAGES[status].sub}</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        {/* RESULTS SECTION */}
        {status === "SUCCESS" && predictions.map((p) => {
          if (p.confidence < 0.01) return null;
          const isNormal = p.class === "NORMAL SKIN CONDITION";
          const sevStyle = getSeverityStyle(p.severity);

          return (
            <View key={p.id} style={[styles.resultCard, isNormal && styles.cardNormal]}>
              <View style={styles.resultMain}>
                <Text style={[styles.resultValue, isNormal && { color: "#065F46" }]}>{p.class}</Text>
                {!isNormal && (
                  <View style={[styles.severityTag, sevStyle.bg]}>
                    <Text style={[styles.severityText, { color: sevStyle.text }]}>{p.severity}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.confidenceBadge, isNormal && { backgroundColor: "#065F46" }]}>
                <Text style={styles.confidenceText}>
                  {isNormal ? "HEALTHY" : `${(p.confidence * 100).toFixed(0)}%`}
                </Text>
              </View>
            </View>
          );
        })}

        {(status === "SUCCESS" || status === "ERROR") && (
          <TouchableOpacity style={styles.retryBtn} onPress={handlePickImage}>
            <RefreshCcw size={18} color="#6B7280" />
            <Text style={styles.retryBtnText}>NEW SCAN</Text>
          </TouchableOpacity>
        )}

        {status === "SUCCESS" && predictions[0]?.class !== "NORMAL SKIN CONDITION" && (
          <TouchableOpacity
            style={styles.recommendationBtn}
            onPress={() =>
              router.push({
                pathname: "/recommendation" as any,
                params: { data: JSON.stringify(predictions) },
              })
            }
          >
            <Sparkles size={18} color="#FFF" />
            <Text style={styles.recommendationBtnText}>VIEW RECOMMENDATIONS</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  iconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 22 },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 2, color: "#6B7280" },
  content: { alignItems: "center", paddingBottom: 60 },
  imageContainer: { width: width * 0.88, height: width * 1.15, marginTop: 20 },
  imageFrame: { width: "100%", height: "100%", borderRadius: 24, backgroundColor: "#F9FAFB", overflow: "hidden", elevation: 2 },
  image: { width: "100%", height: "100%" },
  placeholderBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  placeholderText: { color: "#9CA3AF", fontWeight: "600" },
  
  // SCANNING ANIMATION STYLES
  scanLine: { 
    position: "absolute", 
    width: "100%", 
    height: 4, 
    backgroundColor: "#10B981", // Bright Green laser
    zIndex: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5
  },
  scanGlow: { 
    height: 100, 
    width: "100%", 
    backgroundColor: "rgba(16, 185, 129, 0.2)", 
    position: "absolute", 
    top: -100 // Puts the glow above the line as it moves down
  },

  infoSection: { marginTop: 20, alignItems: "center", paddingHorizontal: 20, marginBottom: 15 },
  statusTitle: { fontSize: 18, fontWeight: "800", color: "#1A1D1A" },
  statusSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 4 },
  errorText: { color: "#EF4444", marginTop: 10, fontWeight: "600", textAlign: "center" },
  resultCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "#F9FAFB", borderRadius: 16, marginBottom: 12, width: width * 0.88, borderWidth: 1, borderColor: "#EEE" },
  cardNormal: { borderColor: "#065F46", backgroundColor: "#F0FDF4" },
  resultMain: { flex: 1, gap: 4 },
  resultValue: { fontSize: 16, fontWeight: "800", color: "#1A1D1A" },
  severityTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  severityText: { fontSize: 9, fontWeight: "900" },
  bgHigh: { backgroundColor: "#FEE2E2" },
  bgLow: { backgroundColor: "#D1FAE5" },
  confidenceBadge: { backgroundColor: "#8FA08E", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  confidenceText: { fontWeight: "800", color: "#FFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: width * 0.85, backgroundColor: "#FFF", borderRadius: 28, padding: 24 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1A1D1A" },
  modalBody: { marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, color: "#065F46", marginBottom: 12 },
  tipRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tipText: { fontSize: 14, color: "#4B5563", flex: 1 },
  modalBtn: { backgroundColor: "#1A1D1A", padding: 18, borderRadius: 16, alignItems: "center" },
  modalBtnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  recommendationBtn: { flexDirection: "row", backgroundColor: "#1A1D1A", padding: 18, borderRadius: 16, width: width * 0.88, justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10 },
  recommendationBtnText: { fontWeight: "800", fontSize: 13, color: "#FFF" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  retryBtnText: { color: "#6B7280", fontWeight: "700", fontSize: 12 },
});