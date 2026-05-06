import { THEMES } from '@/src/constants/themes';
import { useTabVisibility } from '@/src/context/TabVisibilityContext';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { HelpCircle, Info, RefreshCcw, RotateCw, ScanFace, ShieldCheck, X, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ScanCaptureGuide } from '../components/ScanCaptureGuide';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width, height } = Dimensions.get('window');

// Oval dimensions sized to fit a face comfortably
const OVAL_WIDTH = width * 0.72;
const OVAL_HEIGHT = height * 0.48;

export default function CameraScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useTabVisibility();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);
  const isLocked = useRef(false);

  const [processing, setProcessing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [scanning, setScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [showGuide, setShowGuide] = useState(true);

  // Scan line animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Percentage counter state
  const [scanPercent, setScanPercent] = useState(0);
  const percentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for the oval border
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setShowGuide(true);

      // Idle pulse on oval
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.012, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();

      return () => {
        setTabBarVisible(true);
        pulse.stop();
      };
    }, [setTabBarVisible])
  );

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (percentIntervalRef.current) clearInterval(percentIntervalRef.current);
    };
  }, []);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const runScanAnimation = () => {
    setScanning(true);
    setScanPercent(0);

    // Animate percentage from 0 → 100 over ~6 seconds (matches 2 loop iterations of scanLine)
    let current = 0;
    percentIntervalRef.current = setInterval(() => {
      current += 1;
      setScanPercent(current);
      if (current >= 100) {
        if (percentIntervalRef.current) clearInterval(percentIntervalRef.current);
      }
    }, 60); // 60ms × 100 steps = 6000ms

    return new Promise<void>((resolve) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start(() => {
        setScanning(false);
        setScanPercent(100);
        if (percentIntervalRef.current) clearInterval(percentIntervalRef.current);
        resolve();
      });
    });
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isLocked.current || showGuide) return;

    isLocked.current = true;
    setProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      setCapturedImage(photo.uri);

      await runScanAnimation();

      const response = await fetch('http://192.168.8.40:5001/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: photo.base64,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push({
          pathname: '/result-scan' as any,
          params: {
            score: result.health_percent,
            confidence: result.confidence,
            skinType: result.skin_type,
            severity: result.overall_severity,
            detections: JSON.stringify(result.detections),
            imageUri: photo.uri,
          },
        });
      } else {
        Alert.alert(
          'Analysis Failed',
          result.error === 'no_face_detected'
            ? 'Please ensure your face is clearly visible in the frame.'
            : 'Could not analyze skin.'
        );
        reset();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network Error', 'Could not connect to the AI server.');
      reset();
    } finally {
      setProcessing(false);
      isLocked.current = false;
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setScanning(false);
    setProcessing(false);
    setScanPercent(0);
    if (percentIntervalRef.current) clearInterval(percentIntervalRef.current);
    isLocked.current = false;
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <ShieldCheck color={COLORS.PRIMARY} size={48} style={{ marginBottom: 20 }} />
        <Text style={styles.infoText}>Biometric access required for analysis.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>AUTHORIZE CAMERA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera / Captured Image */}
      <View style={styles.cameraViewWrapper}>
        {!capturedImage ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            enableTorch={torch}
          />
        ) : (
          <Image
            source={{ uri: capturedImage }}
            style={[
              StyleSheet.absoluteFill,
              facing === 'front' ? { transform: [{ scaleX: -1 }] } : {},
            ]}
          />
        )}

        {/* Dark vignette overlay outside oval */}
        <View style={styles.vignetteOverlay} pointerEvents="none" />

        {/* Oval face frame */}
        <View style={styles.ovalContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.ovalFrame,
              scanning && { borderColor: COLORS.PRIMARY },
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {/* Corner accent marks */}
            <View style={[styles.ovalAccent, styles.accentTop]} />
            <View style={[styles.ovalAccent, styles.accentBottom]} />
            <View style={[styles.ovalAccent, styles.accentLeft]} />
            <View style={[styles.ovalAccent, styles.accentRight]} />

            {/* Scan line (clips inside oval via overflow: hidden on parent) */}
            {scanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-OVAL_HEIGHT / 2, OVAL_HEIGHT / 2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </Animated.View>

          {/* Percentage readout below the oval */}
          {scanning && (
            <View style={styles.percentContainer}>
              <Text style={styles.percentText}>{scanPercent}</Text>
              <Text style={styles.percentSymbol}>%</Text>
            </View>
          )}
          {scanning && (
            <Text style={styles.analyzingLabel}>ANALYZING DERMAL LAYERS</Text>
          )}
        </View>
      </View>

      {/* UI Controls Layer */}
      <View style={styles.uiLayer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.glassBtn}>
            <X color={COLORS.WHITE} size={22} />
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <View style={[styles.pulseDot, scanning && styles.pulseDotActive]} />
            <Text style={styles.headerTitle}>
              {scanning ? 'SCANNING...' : facing === 'front' ? 'FRONTAL_ARRAY' : 'MACRO_LENS'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setShowGuide(true)} style={styles.glassBtn}>
              <HelpCircle color={COLORS.WHITE} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.glassBtn}>
              <Zap
                color={torch ? COLORS.PRIMARY : COLORS.WHITE}
                size={20}
                fill={torch ? COLORS.PRIMARY : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.hintBox}>
            <Info color={COLORS.PRIMARY} size={14} />
            <Text style={styles.instructionText}>
              {processing && !scanning
                ? 'SENDING TO SERVER...'
                : scanning
                ? `SCANNING ${scanPercent}% COMPLETE`
                : 'FIT YOUR FACE WITHIN THE OVAL'}
            </Text>
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.sideSlot}>
              {!capturedImage && (
                <TouchableOpacity onPress={toggleCameraFacing} style={styles.utilityBtn}>
                  <RotateCw color={COLORS.WHITE} size={20} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={handleCapture}
              disabled={processing || showGuide}
              style={[styles.captureOuter, (processing || showGuide) && { opacity: 0.3 }]}
            >
              <View style={styles.captureInner}>
                {processing && !scanning ? (
                  <ActivityIndicator color={COLORS.WHITE} />
                ) : (
                  <ScanFace color={COLORS.WHITE} size={32} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.sideSlot}>
              {capturedImage && (
                <TouchableOpacity onPress={reset} style={styles.utilityBtn}>
                  <RefreshCcw color={COLORS.WHITE} size={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Guide overlay */}
      {showGuide && (
        <View style={styles.guideOverlayContainer}>
          <ScanCaptureGuide
            onConfirm={() => setShowGuide(false)}
            onCancel={() => router.back()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraViewWrapper: { ...StyleSheet.absoluteFillObject },

  // Dark radial-style vignette to emphasise the oval cutout
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // ── Oval Frame ──────────────────────────────────────────────
  ovalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalFrame: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,          // Full ellipse via border radius
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',                    // Clip scan line inside oval
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle inner glow
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },

  // Accent tick marks at cardinal points of oval
  ovalAccent: {
    position: 'absolute',
    backgroundColor: COLORS.PRIMARY,
  },
  accentTop: { top: 0, width: 28, height: 3, borderRadius: 2, alignSelf: 'center' },
  accentBottom: { bottom: 0, width: 28, height: 3, borderRadius: 2, alignSelf: 'center' },
  accentLeft: { left: 0, height: 28, width: 3, borderRadius: 2, top: '50%', marginTop: -14 },
  accentRight: { right: 0, height: 28, width: 3, borderRadius: 2, top: '50%', marginTop: -14 },

  // Horizontal scan line that sweeps inside the oval
  scanLine: {
    position: 'absolute',
    height: 2.5,
    width: '100%',
    backgroundColor: COLORS.PRIMARY,
    opacity: 0.85,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },

  // ── Percentage Counter ───────────────────────────────────────
  percentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  percentText: {
    color: COLORS.PRIMARY,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 52,
  },
  percentSymbol: {
    color: COLORS.PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    marginLeft: 2,
  },
  analyzingLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 4,
  },

  // ── UI Layer ─────────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: 40,
  },
  guideOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: 'rgba(5, 7, 6, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uiLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.ROUND,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginRight: 8,
  },
  pulseDotActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  footer: { paddingBottom: 50, alignItems: 'center' },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.S,
    marginBottom: 30,
    gap: 8,
  },
  instructionText: { color: COLORS.WHITE, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  sideSlot: { width: 60, alignItems: 'center' },
  captureOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  captureInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.GLOW,
  },
  utilityBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoText: {
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.M,
    ...SHADOWS.GLOW,
  },
  permissionBtnText: { color: COLORS.WHITE, fontWeight: '900', letterSpacing: 1 },
});