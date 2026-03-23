import { CameraType } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router'; // Added useFocusEffect
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Microscope,
  RefreshCcw,
  X,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTabVisibility } from '@/src/context/TabVisibilityContext';

const { width } = Dimensions.get('window');

const COLORS = {
  BG: '#FCFAF7',
  TEXT: '#2D312E',
  SAGE: '#8FA08E',
  ACCENT: '#64748B',
  BORDER: '#E2E8E2',
  GOLD: '#D4A017'
};

export default function CameraScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [flash, setFlash] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');

  const { setTabBarVisible } = useTabVisibility();
  const router = useRouter();

  // --- TAB BAR VISIBILITY LOGIC ---
  useFocusEffect(
    useCallback(() => {
      // Hide tab bar when entering camera
      setTabBarVisible(false);
      
      return () => {
        // Show tab bar when leaving camera
        setTabBarVisible(true);
      };
    }, [setTabBarVisible])
  );

  // SCAN LINE ANIMATION
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isAligned || isProcessing) {
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ).start();
    } else {
      scanLineAnim.stopAnimation();
      scanLineAnim.setValue(0);
    }
  }, [isAligned, isProcessing]);

  const handleCapture = async () => {
    if (isProcessing || !isAligned) return;
    setIsProcessing(true);
    
    // Simulate API Analysis Delay
    setTimeout(() => {
        setIsProcessing(false);
        router.push('/result-scan'); 
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navIcon}>
          <X color={COLORS.TEXT} size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.moduleID}>OS-V3 // SKIN_DIAGNOSTIC</Text>
          <Text
            style={[
              styles.statusLive,
              { color: isAligned ? COLORS.SAGE : COLORS.ACCENT }
            ]}
          >
            {isAligned ? '● TARGET_LOCKED' : '● ACQUIRING_FACE'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setFacing(f => (f === 'front' ? 'back' : 'front'))}
          style={styles.navIcon}
        >
          <RefreshCcw color={COLORS.ACCENT} size={20} />
        </TouchableOpacity>
      </View>

      {/* CAMERA VIEWPORT */}
      <View style={styles.viewportArea}>
        {/* Mocking the Camera alignment - Tap this to toggle "Aligned" state */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setIsAligned(!isAligned)} 
          style={[styles.portalContainer, isAligned && styles.portalActive]}
        >
          {/* Imagine the <Camera> component is here as the background */}
          
          <View style={styles.portalOverlay} pointerEvents="none">
            <View
              style={[
                styles.ovalMask,
                isAligned && styles.ovalActive
              ]}
            />

            {(isProcessing || isAligned) && (
              <Animated.View
                style={[
                  styles.scanBar,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-180, 180]
                        })
                      }
                    ]
                  }
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
        {!isAligned && <Text style={styles.tapHint}>[ TAP PORTAL TO SIMULATE ALIGNMENT ]</Text>}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.guidanceBox}>
          <View style={styles.statusRow}>
            {isAligned ? (
              <CheckCircle2 size={16} color={COLORS.SAGE} />
            ) : (
              <AlertCircle size={16} color={COLORS.ACCENT} />
            )}
            <Text
              style={[
                styles.guideText,
                isAligned && { color: COLORS.SAGE }
              ]}
            >
              {isProcessing
                ? 'ANALYZING TISSUE...'
                : isAligned
                ? 'ALIGNMENT OPTIMAL'
                : 'CENTER FACE IN PORTAL'}
            </Text>
          </View>
        </View>

        <View style={styles.interactionRow}>
          <TouchableOpacity
            onPress={() => setFlash(!flash)}
            style={styles.sideAction}
          >
            <Zap
              color={flash ? COLORS.GOLD : COLORS.ACCENT}
              size={22}
            />
          </TouchableOpacity>

          {isProcessing ? (
            <View style={styles.mainTrigger}>
              <ActivityIndicator size="large" color={COLORS.SAGE} />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.mainTrigger,
                !isAligned && styles.triggerDisabled
              ]}
              onPress={handleCapture}
              disabled={!isAligned}
            >
              <View
                style={[
                  styles.triggerInner,
                  !isAligned && styles.innerDisabled
                ]}
              >
                <Microscope color="#FFF" size={32} />
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.sideAction}>
            <Activity
              color={isAligned ? COLORS.SAGE : COLORS.ACCENT}
              size={22}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  header: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { alignItems: 'center' },
  moduleID: { color: COLORS.ACCENT, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  statusLive: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  navIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  viewportArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  portalContainer: {
    width: width * 0.85,
    height: width * 1.15,
    borderRadius: 160, 
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#000'
  },
  portalActive: { borderColor: COLORS.SAGE, elevation: 15, shadowColor: COLORS.SAGE, shadowOpacity: 0.3, shadowRadius: 25 },
  portalOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ovalMask: { width: '85%', height: '85%', borderRadius: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
  ovalActive: { borderColor: COLORS.SAGE, borderStyle: 'solid', borderWidth: 2.5 },
  scanBar: { height: 4, width: '100%', backgroundColor: COLORS.SAGE, position: 'absolute', shadowColor: COLORS.SAGE, shadowOpacity: 1, shadowRadius: 10 },
  tapHint: { fontSize: 10, color: COLORS.ACCENT, marginTop: 15, fontWeight: '600' },
  footer: { paddingBottom: 60, paddingHorizontal: 30 },
  guidanceBox: { alignItems: 'center', marginBottom: 30 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guideText: { color: COLORS.TEXT, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  interactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sideAction: { width: 55, height: 55, backgroundColor: '#FFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
  mainTrigger: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', padding: 6, borderWidth: 1, borderColor: COLORS.BORDER, justifyContent: 'center', alignItems: 'center' },
  triggerDisabled: { opacity: 0.4 },
  triggerInner: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: COLORS.SAGE, justifyContent: 'center', alignItems: 'center' },
  innerDisabled: { backgroundColor: COLORS.ACCENT },
});