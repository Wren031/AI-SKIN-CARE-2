import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const THEME = {
  // Colors

SAGE: '#8FA08E',

SAND: '#F8F9F8', // background

DEEP_SAGE: '#2C362B', // deep 

SOFT_CORAL: '#E67E6E',

  primary: '#2C362B',   // Deep Forest
  accent: '#8FA08E',    // Oasis Sage
  highlight: '#E67E6E',  // Soft Coral
  background: '#F8F9F8', // Medical Off-white
  surface: '#FFFFFF',
  textMain: '#1A1D1A',
  textSub: '#6B7280',
  border: '#F1F3F1',
  overlay: 'rgba(26,29,26,0.5)',
  
  // Status Colors
  success: '#10B981',
  successLight: '#EFFFF4',
  warning: '#D4A373',
  warningLight: '#FDF7F0',
  infoLight: '#F0F4F0',
  infoBorder: '#E0E8E0',

  // Layout
  screen: {
    width,
    height,
    isIOS: Platform.OS === 'ios',
  }
};