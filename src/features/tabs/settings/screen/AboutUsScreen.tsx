import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Skincare Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={DEEP_SAGE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Philosophy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            {/* The signature Oasis Leaf Icon */}
            <Ionicons name="leaf-outline" size={60} color={SAGE} />
          </View>
          <Text style={styles.appName}>Skincare Oasis</Text>
          <Text style={styles.version}>VERSION 1.0.4 (BUILD 102)</Text>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            At Oasis, we believe skincare is more than a routine—it's a moment of mindfulness. 
            {"\n\n"}
            Our mission is to help you understand your skin's unique language through data-driven insights and gentle, intentional care. We simplify the complex world of ingredients so you can focus on your glow.
          </Text>
        </View>

        <View style={styles.linkSection}>
          <Text style={styles.sectionLabel}>Transparency</Text>
          <View style={styles.linkCard}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.6}>
              <Text style={styles.linkText}>Terms of Service</Text>
              <Ionicons name="arrow-forward-outline" size={16} color={SAGE} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.6}>
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Ionicons name="arrow-forward-outline" size={16} color={SAGE} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>© 2026 Skincare Oasis Inc.{"\n"}Handcrafted for your glow.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SAND },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '300', 
    color: DEEP_SAGE, 
    letterSpacing: 0.5 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  content: { padding: 24, alignItems: 'center' },
  
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  logoPlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 45, // Botanical Squircle
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: SAGE, 
    shadowOpacity: 0.1, 
    shadowRadius: 15,
    elevation: 3 
  },
  appName: { 
    fontSize: 26, 
    fontWeight: '300', 
    color: DEEP_SAGE, 
    marginTop: 24,
    letterSpacing: 1
  },
  version: { 
    fontSize: 10, 
    color: '#94A3B8', 
    fontWeight: '800', 
    marginTop: 8,
    letterSpacing: 2
  },
  
  descriptionBox: { 
    backgroundColor: '#FFF', 
    padding: 28, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    shadowColor: SAGE,
    shadowOpacity: 0.03,
    shadowRadius: 10
  },
  descriptionText: { 
    fontSize: 15, 
    color: '#64748B', 
    lineHeight: 26, 
    textAlign: 'center',
    fontStyle: 'italic'
  },
  
  linkSection: { width: '100%', marginTop: 40 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: SAGE, 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4
  },
  linkCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  linkRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18 
  },
  linkText: { fontSize: 15, fontWeight: '600', color: DEEP_SAGE },
  divider: { height: 1, backgroundColor: '#F8FAF9' },
  
  copyright: { 
    marginTop: 60, 
    marginBottom: 20, 
    color: '#CBD5E1', 
    fontSize: 11, 
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5
  }
});