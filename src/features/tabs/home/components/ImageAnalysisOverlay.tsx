import { BlurView } from 'expo-blur';
import { LucideLoader2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Match your Oasis Branding
const THEME = {
  accent: '#8FA08E',
  surface: '#FFFFFF',
  textMain: '#1A1D1A',
  textSub: '#6B7280',
  background: 'rgba(26,29,26,0.8)',
};

interface ImageAnalysisOverlayProps {
  visible: boolean;
  currentStep: string;
}

export default function ImageAnalysisOverlay({ visible, currentStep }: ImageAnalysisOverlayProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animate the progress bar based on the step changes
  useEffect(() => {
    if (visible) {
      // Map steps to percentage for the progress bar
      const steps: Record<string, number> = {
        'INITIALIZING_NEURAL_ENGINE': 0.2,
        'EXTRACTING_DERMAL_LAYERS': 0.5,
        'ANALYZING_HYDRATION_INDEX': 0.8,
        'FINALIZING_DIAGNOSIS': 1.0,
      };

      const targetValue = steps[currentStep] || 0;

      Animated.timing(progressAnim, {
        toValue: targetValue,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [currentStep, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Animated.View style={styles.spinner}>
               <LucideLoader2 size={40} color={THEME.accent} />
            </Animated.View>
          </View>
          
          <Text style={styles.title}>AI_DERMA_ANALYSIS</Text>
          
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={THEME.accent} style={{ marginRight: 10 }} />
            <Text style={styles.stepText}>{currentStep}</Text>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) 
                }
              ]} 
            />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.background,
  },
  card: {
    width: width * 0.85,
    backgroundColor: THEME.surface,
    padding: 30,
    borderRadius: 4, // Professional sharp edges
    borderWidth: 1,
    borderColor: '#E2E8E2',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 20,
    backgroundColor: '#F8F9F8',
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 2,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    height: 24,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressBarBg: {
    width: '100%',
    height: 2,
    backgroundColor: '#F1F3F1',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.accent,
  },
  spinner: {
    // Add any rotational animation here if desired
  }
});