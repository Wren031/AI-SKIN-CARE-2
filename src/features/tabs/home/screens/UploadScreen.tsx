import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Cpu, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function UploadScreen() {
  const router = useRouter();
  const [status, setStatus] = useState('AWAITING_SELECTION...');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const triggerPicker = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      handlePickImage();
    };
    
    triggerPicker();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      startScanningEffect();
    } else {
      // If user cancels picking, go back to Home
      router.back();
    }
  };

  const startScanningEffect = () => {
    setStatus('ANALYZING_DERMAL_LAYERS...');
    
    // Loop the scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Transition to results after 4 seconds
    setTimeout(() => {
      setStatus('ANALYSIS_COMPLETE');
      // router.push('/result-scan'); 
    }, 4000);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 1.0], 
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <X size={20} color="#1A1D1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SECURE_SCAN_PROCESSOR</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageFrame}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            </>
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#8FA08E" />
              <Text style={styles.subText}>Opening Gallery...</Text>
            </View>
          )}
        </View>

        <View style={styles.statusBox}>
          {selectedImage && <Cpu size={22} color="#8FA08E" style={{ marginBottom: 10 }} />}
          <Text style={styles.statusText}>{status}</Text>
          <Text style={styles.subText}>
            {selectedImage 
              ? "Scanning epidermal layers for hydration and purity..." 
              : "Please select a high-resolution photo."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F8' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#F1F3F1' },
  headerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#8FA08E' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  imageFrame: {
    width: width * 0.8,
    height: width * 1.0,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E2E8E2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  image: { width: '100%', height: '100%', opacity: 0.9 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#8FA08E',
    shadowColor: '#8FA08E',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  statusBox: { marginTop: 40, alignItems: 'center', paddingHorizontal: 40 },
  statusText: { fontSize: 14, fontWeight: '800', color: '#1A1D1A', marginTop: 5 },
  subText: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 }
});