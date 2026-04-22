import { THEMES } from '@/src/constants/themes';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  CheckCircle2,
  FileUp,
  Image as ImageIcon,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Dimensions,
  Easing,
  Image, Modal,
  ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width } = Dimensions.get("window");

const STATUS_MESSAGES = {
  IDLE: { title: "READY FOR UPLOAD", sub: "Please select a high-resolution photo." },
  SCANNING: { title: "DEEP TISSUE SCAN", sub: "AI is cross-referencing dermal layers..." },
  SUCCESS: { title: "ANALYSIS COMPLETE", sub: "Dermal profile generated." },
  ERROR: { title: "SCAN FAILED", sub: "Image quality insufficient for analysis." },
};

export default function UploadScanScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "ERROR">("IDLE");
  
  const scanAnim = useRef(new Animated.Value(0)).current;

  const uploadTips = [
    "Use bright natural lighting",
    "High-resolution (not blurry)",
    "No filters or heavy makeup",
    "Center the skin area of concern",
    "JPEG or PNG formats preferred"
  ];

  useEffect(() => {
    if (status === "SCANNING") {
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
  }, [status, scanAnim]);

  const handlePickImage = async () => {
    setShowGuide(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        startAnalysis(result.assets[0].uri);
      }
    } catch (err) {
      setStatus("ERROR");
    }
  };

  const startAnalysis = (imageUri: string) => {
    setStatus("SCANNING");
    
    // Simulating Server-side AI Analysis
    setTimeout(() => {
      const fakeData = {
        health_percent: 88,
        confidence: 96,
        skin_type: 'Oily',
        overall_severity: 'Moderate',
        detections: [{ label: 'hyper-pigmentation', severity: 'Moderate', impact: 8 }]
      };

      setStatus("SUCCESS");
      
      setTimeout(() => {
        router.push({
          pathname: "/result-scan" as any,
          params: { 
            score: fakeData.health_percent,
            confidence: fakeData.confidence,
            skinType: fakeData.skin_type,
            severity: fakeData.overall_severity,
            detections: JSON.stringify(fakeData.detections),
            imageUri: imageUri 
          },
        });
      }, 800);
    }, 3500);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 1.15],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- UPLOAD GUIDE PROTOCOL --- */}
      <Modal visible={showGuide} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.badge}>
              <Sparkles size={10} color={COLORS.PRIMARY} />
              <Text style={styles.badgeText}>QUALITY PROTOCOL</Text>
            </View>

            <View style={styles.iconInner}>
              <FileUp size={24} color={COLORS.PRIMARY} strokeWidth={2.5} />
            </View>

            <View style={styles.headerArea}>
              <Text style={styles.guideTitle}>Upload Guide</Text>
              <Text style={styles.subHeader}>Optimizing for AI analysis</Text>
            </View>

            <View style={styles.checklistContainer}>
              {uploadTips.map((tip, index) => (
                <View key={index} style={styles.checkRow}>
                  <View style={styles.iconBackground}>
                    <CheckCircle2 size={14} color={COLORS.PRIMARY} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.checkText}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelBtnText}>ABORT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowGuide(false)}>
                <Text style={styles.confirmBtnText}>INITIALIZE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <X size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ShieldCheck size={14} color={COLORS.PRIMARY} />
          <Text style={styles.headerTitle}>BIOMETRIC UPLOAD</Text>
        </View>
        <TouchableOpacity onPress={() => setShowGuide(true)} style={styles.iconBtn}>
          <Info size={20} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <View style={styles.imageFrame}>
            {selectedImage ? (
              <>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                {status === "SCANNING" && (
                  <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]}>
                    <View style={styles.scanGlow} />
                  </Animated.View>
                )}
              </>
            ) : (
              <TouchableOpacity onPress={handlePickImage} style={styles.placeholderBox}>
                <View style={styles.placeholderIconCircle}>
                    <ImageIcon color={COLORS.PRIMARY} size={32} />
                </View>
                <Text style={styles.placeholderText}>Tap to open gallery</Text>
                <Text style={styles.placeholderSub}>Select a clean, well-lit photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.statusBadge}>
             <Search size={14} color={status === "SCANNING" ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY} />
             <Text style={[styles.statusTitle, status === "SCANNING" && {color: COLORS.PRIMARY}]}>
               {STATUS_MESSAGES[status].title}
             </Text>
          </View>
          <Text style={styles.statusSub}>{STATUS_MESSAGES[status].sub}</Text>
        </View>

        {status === "IDLE" && (
           <TouchableOpacity style={styles.mainUploadBtn} onPress={handlePickImage} activeOpacity={0.8}>
              <FileUp size={20} color={COLORS.WHITE} />
              <Text style={styles.mainUploadBtnText}>SELECT SOURCE IMAGE</Text>
           </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: { height: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  iconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.WHITE, borderRadius: RADIUS.S, borderWidth: 1, borderColor: COLORS.BORDER },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: COLORS.TEXT_SECONDARY },
  content: { alignItems: "center", paddingBottom: 60 },
  imageContainer: { width: width * 0.88, height: width * 1.15, marginTop: 20 },
  imageFrame: { 
    width: "100%", 
    height: "100%", 
    borderRadius: RADIUS.L, 
    backgroundColor: COLORS.WHITE, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT 
  },
  image: { width: "100%", height: "100%", opacity: 0.9 },
  placeholderBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  placeholderIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.PRIMARY + '0D', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.PRIMARY + '1A' },
  placeholderText: { color: COLORS.TEXT_PRIMARY, fontWeight: "800", fontSize: 16 },
  placeholderSub: { color: COLORS.TEXT_SECONDARY, fontSize: 12, fontWeight: '500' },
  scanLine: { position: "absolute", width: "100%", height: 3, backgroundColor: COLORS.PRIMARY, zIndex: 10, ...SHADOWS.GLOW },
  scanGlow: { height: 120, width: "100%", backgroundColor: COLORS.PRIMARY + '20', position: "absolute", top: -120 },
  infoSection: { marginTop: 35, alignItems: "center", paddingHorizontal: 30, marginBottom: 30 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  statusTitle: { fontSize: 20, fontWeight: "900", color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  statusSub: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: "center", fontWeight: '500' },
  mainUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.PRIMARY, paddingVertical: 18, paddingHorizontal: 32, borderRadius: RADIUS.M, width: width * 0.88, justifyContent: 'center', ...SHADOWS.GLOW },
  mainUploadBtnText: { color: COLORS.WHITE, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  dialogCard: { width: width * 0.9, backgroundColor: COLORS.WHITE, borderRadius: RADIUS.L, padding: 24, alignItems: 'center', ...SHADOWS.SOFT },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.PRIMARY + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20, gap: 6 },
  badgeText: { color: COLORS.PRIMARY, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  iconInner: { width: 60, height: 60, borderRadius: RADIUS.S, backgroundColor: COLORS.INPUT_BG, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.BORDER, marginBottom: 16 },
  headerArea: { alignItems: 'center', marginBottom: 24 },
  guideTitle: { color: COLORS.TEXT_PRIMARY, fontSize: 26, fontWeight: '900', marginBottom: 6, letterSpacing: -0.5 },
  subHeader: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  checklistContainer: { width: '100%', marginBottom: 30 },
  checkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.INPUT_BG, padding: 16, borderRadius: RADIUS.M, marginBottom: 10, borderWidth: 1, borderColor: COLORS.BORDER },
  iconBackground: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.PRIMARY + '1A', justifyContent: 'center', alignItems: 'center' },
  checkText: { color: COLORS.TEXT_PRIMARY, fontSize: 13, fontWeight: '700', marginLeft: 12, flex: 1 },
  buttonContainer: { flexDirection: 'row', width: '100%', gap: 12 },
  confirmBtn: { flex: 2, backgroundColor: COLORS.PRIMARY, height: 56, borderRadius: RADIUS.M, justifyContent: 'center', alignItems: 'center', ...SHADOWS.GLOW },
  confirmBtnText: { color: COLORS.WHITE, fontWeight: '900', fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.WHITE, height: 56, borderRadius: RADIUS.M, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  cancelBtnText: { color: COLORS.TEXT_SECONDARY, fontWeight: '800', fontSize: 12 },
});