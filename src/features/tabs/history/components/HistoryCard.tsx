import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { format, isValid } from 'date-fns';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { users_skin_result } from '../types/users_skin_result';


const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

interface HistoryCardProps {
  item: users_skin_result;
  onDelete: (id: number) => void;
  onPress?: (item: users_skin_result) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onDelete, onPress }) => {
  const dateFormatted = useMemo(() => {
    const dateObj = item.created_at ? new Date(item.created_at) : new Date();
    return isValid(dateObj) ? format(dateObj, 'MMM dd • h:mm a') : 'Recent Analysis';
  }, [item.created_at]);

  const statusConfig = useMemo(() => {
    const val = item.severity?.toLowerCase();
    if (val === 'severe' || val === 'high') return { color: COLORS.PRIMARY, label: 'Attention' };
    if (val === 'moderate' || val === 'medium') return { color: COLORS.ACCENT, label: 'Monitor' };
    return { color: COLORS.SUCCESS, label: 'Healthy' };
  }, [item.severity]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageWrapper}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="sparkles-outline" size={20} color={COLORS.ACCENT} />
            </View>
          )}
          <View style={[styles.miniBadge, { backgroundColor: COLORS.PRIMARY }]}>
            <Text style={styles.miniBadgeText}>{Math.round(item.confidence * 100)}%</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.dateLabel}>{dateFormatted}</Text>
          <Text style={styles.skinTypeTitle} numberOfLines={1}>
            {item.skin_type} Analysis
          </Text>
          
          <View style={styles.footerRow}>
            <View style={styles.scoreTag}>
              <Ionicons name="heart" size={12} color={COLORS.PRIMARY} />
              <Text style={styles.scoreText}>{item.score}% Health</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Right Section: Delete Action */}
        <TouchableOpacity 
          onPress={() => onDelete(item.id)}
          style={styles.deleteAction}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="trash-outline" size={18} color="#FDA4AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(HistoryCard);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.M,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.ROUND,
    backgroundColor: COLORS.INPUT_BG,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.S,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    ...SHADOWS.GLOW,
  },
  miniBadgeText: {
    color: COLORS.WHITE,
    fontSize: 8,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  skinTypeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.S,
    marginRight: 10,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deleteAction: {
    padding: 8,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF1F2', // Very soft red tint
    borderRadius: RADIUS.S,
  },
});