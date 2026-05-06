import { THEMES } from '@/src/constants/themes';
import {
  Camera,
  CheckCircle2
} from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;
const { width } = Dimensions.get('window');

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ScanCaptureGuide = ({ onConfirm, onCancel }: Props) => {
  const checklistItems = [
    { id: 1, text: "Remove glasses or face masks"},
    { id: 2, text: "Ensure even, natural lighting"},
    { id: 3, text: "Maintain a neutral expression"},
    { id: 4, text: "Keep lens 30cm from skin"},
    { id: 5, text: "Ensure skin is clean (no makeup)"},
  ];

  return (
    <View style={styles.dialogCard}>
      {/* Icon Section */}
      <View style={styles.iconCircle}>
        <View style={styles.iconInner}>
          <Camera size={26} color={COLORS.PRIMARY} strokeWidth={2.5} />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.guideTitle}>Capture Protocol</Text>
        <Text style={styles.subHeader}>Optimizing for Dermal Analysis</Text>
      </View>

      {/* Checklist Section */}
      <View style={styles.checklistContainer}>
        {checklistItems.map((item, index) => (
          <View 
            key={item.id} 
            style={[
                styles.checkRow, 
                index === checklistItems.length - 1 && { marginBottom: 0 }
            ]}
          >
            <CheckCircle2 size={16} color={COLORS.PRIMARY} />
            <Text style={styles.checkText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>ABORT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmBtnText}>INITIALIZE SCAN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dialogCard: {
    width: width * 0.9,
    backgroundColor: '#0A0C0B', // Slightly lighter than deep black for contrast
    borderRadius: RADIUS.L,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.SOFT,
  },
  iconCircle: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconInner: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.S,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '30',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  guideTitle: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subHeader: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  checklistContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.M,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 28,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: RADIUS.M,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.GLOW,
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 56,
    borderRadius: RADIUS.M,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtnText: {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});