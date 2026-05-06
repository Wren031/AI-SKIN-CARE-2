import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Product {
  id: string;
  product_name: string;
  image_url?: string;
  instructions?: string;
}

interface ProductCardProps {
  item: { product: Product };
  type: 'am' | 'pm';
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export const ProductCardRoutine = React.memo(({ item, type, isCompleted, onToggle }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { product } = item;
  const uniqueId = `${type}-${product?.id}`;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={[styles.card, isCompleted && styles.cardCompleted]} 
      onPress={toggleExpand}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          onPress={() => onToggle(uniqueId)} 
          style={styles.checkboxWrapper}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
            size={26} 
            color={isCompleted ? "#10B981" : "#CBD5E1"} 
          />
        </TouchableOpacity>

        <Image 
          source={{ uri: product?.image_url || 'https://via.placeholder.com/150' }} 
          style={[styles.productImg, isCompleted && { opacity: 0.5 }]} 
        />

        <View style={styles.productInfo}>
          <Text style={[styles.productName, isCompleted && styles.textCompleted]}>
            {product?.product_name}
          </Text>
          <Text style={styles.productTypeLabel}>
            {type === 'am' ? 'Morning Step' : 'Evening Step'}
          </Text>
        </View>
        
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#94A3B8" />
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.instructionHeader}>Instructions</Text>
          <Text style={styles.instructionText}>
            {product?.instructions || "Apply as part of your tailored skincare routine."}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, padding: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  cardCompleted: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  checkboxWrapper: { paddingRight: 12 },
  productImg: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F8FAFC' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  productTypeLabel: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  textCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
  expandedContent: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  instructionHeader: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  instructionText: { fontSize: 14, color: '#475569', lineHeight: 20 },
});