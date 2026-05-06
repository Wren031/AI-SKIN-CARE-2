import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { COLORS } = THEMES.DERMA_AI;

const getRoutineDetails = (usage: string = "") => {
  const value = usage.toLowerCase();
  if (value.includes('both')) return { label: 'AM & PM', icon: 'repeat-outline' as const, color: '#6366f1' };
  if (value.includes('evening')) return { label: 'Evening', icon: 'moon-outline' as const, color: '#4f46e5' };
  return { label: 'Morning', icon: 'sunny-outline' as const, color: '#f59e0b' };
};

export const ProductCard = ({ item }: { item: any }) => {
  const [expanded, setExpanded] = useState(false);
  
  // FIX: Accessing directly from item because parent passes 'item.product'
  const routine = getRoutineDetails(item?.usage);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={toggleExpand} 
      style={styles.regimenCard}
    >
      <View style={styles.regimenMain}>
        <Image 
          source={{ uri: item?.image_url || 'https://via.placeholder.com/150' }} 
          style={styles.regimenImg} 
        />
        
        <View style={{ flex: 1 }}>
          <Text style={styles.regimenName} numberOfLines={1}>
            {item?.product_name || 'Unnamed Product'}
          </Text>

          <View style={styles.regimenMeta}>
            <View style={[styles.tag, { backgroundColor: `${routine.color}10` }]}>
              <Ionicons name={routine.icon} size={10} color={routine.color} />
              <Text style={[styles.tagText, { color: routine.color }]}>{routine.label}</Text>
            </View>

            {expanded && (
              <Text style={styles.regimenPrice}>₱{item?.price || 0}</Text>
            )}
          </View>
        </View>

        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#CBD5E1" 
        />
      </View>

      {expanded && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionHeader}>How to use:</Text>
          <Text style={styles.instructionText}>{item?.instructions || 'No instructions provided.'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  regimenCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  regimenMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regimenImg: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#F8FAFC' },
  regimenName: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  regimenMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  regimenPrice: { fontSize: 13, fontWeight: '700', color: '#059669' },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 3 },
  tagText: { fontSize: 10, fontWeight: '700' },
  instructionBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  instructionHeader: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  instructionText: { fontSize: 13, color: '#475569', lineHeight: 18 },
});