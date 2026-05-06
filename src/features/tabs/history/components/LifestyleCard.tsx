import { THEMES } from '@/src/constants/themes';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const { COLORS } = THEMES.DERMA_AI;

export const LifestyleCard = ({ item }: { item: any }) => (
  <View style={styles.lifestyleCard}>
    <View style={styles.lifestyleContent}>
      <View style={styles.lifestyleHeaderRow}>
        {/* FIX: Accessing properties directly from item */}
        <Text style={styles.lifestyleCategory}>{item?.category || 'TIP'}</Text>
        <View style={styles.dotSeparator} />
        <Text style={styles.lifestyleTitle}>{item?.title || 'Daily Tip'}</Text>
      </View>
      <Text style={styles.lifestyleDesc}>{item?.description || 'No description available.'}</Text>
    </View>
  </View>
);
const styles = StyleSheet.create({
  lifestyleCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  lifestyleContent: { flex: 1 },
  lifestyleHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  lifestyleCategory: { fontSize: 10, fontWeight: '800', color: COLORS.PRIMARY, textTransform: 'uppercase' },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  lifestyleTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  lifestyleDesc: { fontSize: 13, color: '#64748B', lineHeight: 19 },
});