import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { COLORS } = THEMES.DERMA_AI;

interface LifestyleCardProps {
  item: any;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  index: number;
}

export const LifestyleCardRoutine = React.memo(({ item, isCompleted, onToggle, index }: LifestyleCardProps) => {
  const lifeId = `life-${item.lifestyle?.id || index}`;

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onToggle(lifeId)}
      style={[styles.lifestyleCard, isCompleted && styles.cardCompleted]}
    >
      <View style={[styles.lifestyleIcon, isCompleted && { backgroundColor: '#E2E8F0' }]}>
        <Ionicons 
          name="sparkles" 
          size={18} 
          color={isCompleted ? "#94A3B8" : COLORS.PRIMARY} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.lifestyleTitle, isCompleted && styles.textCompleted]}>
          {item.lifestyle?.title}
        </Text>
        <Text style={styles.lifestyleDesc} numberOfLines={2}>
          {item.lifestyle?.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  lifestyleCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  cardCompleted: { opacity: 0.6, backgroundColor: '#F1F5F9' },
  lifestyleIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: `${COLORS.PRIMARY}15`, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  lifestyleTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  lifestyleDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  textCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
});