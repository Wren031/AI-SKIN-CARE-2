import { THEMES } from '@/src/constants/themes';
import { useTabVisibility } from '@/src/context/TabVisibilityContext';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { HelpCircle, Info, RefreshCcw, RotateCw, ScanFace, ShieldCheck, X, Zap } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
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
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      setShowGuide(true); 
      
      return () => {
        setTabBarVisible(true);
      };
    }, [setTabBarVisible])
  );

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const runScanAnimation = () => {
    setScanning(true);
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
        resolve();
      });
    });
  };

  // const handleCapture = async () => {
  //   if (!cameraRef.current || isLocked.current || showGuide) return;
    
  //   isLocked.current = true;
  //   setProcessing(true);

  //   try {
  //     const photo = await cameraRef.current.takePictureAsync({
  //       quality: 0.5,
  //       base64: true,
  //     });

  //     setCapturedImage(photo.uri);
  //     await runScanAnimation();

  //     const fakeData = {
  //       health_percent: 85,
  //       confidence: 98,
  //       skin_type: 'Combination',
  //       overall_severity: 'Mild',
  //       detections: [{ label: 'acne vulgaris', severity: 'Mild', impact: 12 }
  //         ,{ label: 'rosacea', severity: 'Moderate', impact: 25 }
  //         ,{ label: 'hyperpigmentation', severity: 'Mild', impact: 10 }
  //       ]
  //     };

  //     setTimeout(() => {
  //       router.push({
  //         pathname: '/result-scan' as any,
  //         params: {
  //           score: fakeData.health_percent,
  //           confidence: fakeData.confidence,
  //           skinType: fakeData.skin_type,
  //           severity: fakeData.overall_severity,
  //           detections: JSON.stringify(fakeData.detections),
  //           imageUri: photo.uri 
  //         },
  //       });
  //       setProcessing(false);
  //       isLocked.current = false;
  //     }, 1500);

  //   } catch (err) {
  //     Alert.alert('Error', 'Capture failed.');
  //     reset();
  //   }
  // };


  const handleCapture = async () => {
    if (!cameraRef.current || isLocked.current || showGuide) return;
    
    isLocked.current = true;
    setProcessing(true);

    try {
      // 1. Capture the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true, // Required for the backend
      });

      setCapturedImage(photo.uri);

      // 2. Start the "Scanning" UI animation
      await runScanAnimation();

      // 3. Call your Backend API
      // Replace YOUR_LOCAL_IP with your machine's actual IP address (e.g., 192.168.1.5)
      // Android Emulator uses 10.0.2.2 to refer to your computer's localhost
      const response = await fetch('http://192.168.8.38:5001/detect', {
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
        // 4. Navigate to results with real data
        router.push({
          pathname: '/result-scan' as any,
          params: {
            score: result.health_percent,
            confidence: result.confidence,
            skinType: result.skin_type,
            severity: result.overall_severity,
            detections: JSON.stringify(result.detections),
            imageUri: photo.uri 
          },
        });
      } else {
        // Handle specific AI errors (like no face detected)
        Alert.alert('Analysis Failed', result.error === 'no_face_detected' 
          ? 'Please ensure your face is clearly visible in the frame.' 
          : 'Could not analyze skin.');
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
              facing === 'front' ? { transform: [{ scaleX: -1 }] } : {} 
            ]} 
          />
        )}

        <View style={styles.targetingContainer}>
            <View style={styles.scannerFrame}>
              <View style={[styles.bracket, styles.topLeft]} />
              <View style={[styles.bracket, styles.topRight]} />
              <View style={[styles.bracket, styles.bottomLeft]} />
              <View style={[styles.bracket, styles.bottomRight]} />
              
              {scanning && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, height * 0.4],
                        })
                      }]
                    }
                  ]}
                />
              )}
            </View>
        </View>
      </View>

      <View style={styles.uiLayer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.glassBtn}>
            <X color={COLORS.WHITE} size={22} />
          </TouchableOpacity>
          
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>{facing === 'front' ? 'FRONTAL_ARRAY' : 'MACRO_LENS'}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setShowGuide(true)} style={styles.glassBtn}>
                <HelpCircle color={COLORS.WHITE} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.glassBtn}>
                <Zap color={torch ? COLORS.PRIMARY : COLORS.WHITE} size={20} fill={torch ? COLORS.PRIMARY : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.hintBox}>
            <Info color={COLORS.PRIMARY} size={14} />
            <Text style={styles.instructionText}>
              {processing ? 'ANALYZING DERMAL LAYERS...' : 'ALIGN SKIN AREA WITHIN TARGET'}
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
                {processing ? (
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND, padding: 40 },
  
  guideOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: 'rgba(5, 7, 6, 0.98)', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  targetingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.75,
    height: height * 0.4,
    borderRadius: RADIUS.L,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', 
  },
  bracket: { position: 'absolute', width: 40, height: 40, borderColor: COLORS.PRIMARY },
  topLeft: { top: -2, left: -2, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: RADIUS.M },
  topRight: { top: -2, right: -2, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: RADIUS.M },
  bottomLeft: { bottom: -2, left: -2, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: RADIUS.M },
  bottomRight: { bottom: -2, right: -2, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: RADIUS.M },
  scanLine: {
    height: 3,
    width: '100%',
    backgroundColor: COLORS.PRIMARY,
    ...SHADOWS.GLOW,
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
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.PRIMARY, marginRight: 8 },
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
  controlsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
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
  infoText: { color: COLORS.TEXT_SECONDARY, marginBottom: 20, textAlign: 'center', fontWeight: '500' },
  permissionBtn: { paddingVertical: 16, paddingHorizontal: 32, backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.M, ...SHADOWS.GLOW },
  permissionBtnText: { color: COLORS.WHITE, fontWeight: '900', letterSpacing: 1 },
});