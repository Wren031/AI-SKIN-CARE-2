import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const SAGE = '#8FA08E';
const DEEP_SLATE = '#2D312E';
const CREAM = '#FCFAF7';
const BORDER = '#E2E8E2';

interface NotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
}

export default function Notification({ visible, message, type = 'success', onHide }: NotificationProps) {

  const [shouldRender, setShouldRender] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-120)).current; 

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.spring(slideAnim, {
        toValue: 60, 
        useNativeDriver: true,
        bounciness: 4,
      }).start();

      const timer = setTimeout(() => {
        handleHide();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      handleHide();
    }
  }, [visible]);

  const handleHide = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShouldRender(false);
      onHide();
    });
  };


  if (!shouldRender) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color={SAGE} />;
      case 'error': return <AlertCircle size={18} color="#C38E8E" />;
      default: return <Info size={18} color="#64748B" />;
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          {getIcon()}
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>{type.toUpperCase()}_LOG</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={styles.pulseContainer}>
          <View style={[styles.pulse, { backgroundColor: type === 'success' ? SAGE : '#64748B' }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  container: {
    width: width - 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 4, 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  iconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CREAM,
    borderRadius: 4,
    marginRight: 12,
  },
  content: { flex: 1 },
  label: {
    fontSize: 8,
    fontWeight: '800',
    color: '#A0A0A0',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: DEEP_SLATE,
  },
  pulseContainer: { paddingLeft: 10 },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  }
});