import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isValid } from 'date-fns';
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
  // 1. DATE FORMATTING
  const dateFormatted = useMemo(() => {
    const dateObj = item.created_at ? new Date(item.created_at) : new Date();
    if (!isValid(dateObj)) return 'Recent Analysis';
    const prefix = isToday(dateObj) ? 'Today' : format(dateObj, 'MMM dd, yyyy');
    return `${prefix} • ${format(dateObj, 'h:mm a')}`;
  }, [item.created_at]);

  // 2. STATUS UI CONFIG
  const statusConfig = useMemo(() => {
    const val = item.severity?.toLowerCase() || item.severity?.toLowerCase();
    if (val === 'severe' || val === 'high') {
      return { color: COLORS.PRIMARY, bg: '#FFF1F2', label: 'Priority' };
    }
    if (val === 'moderate' || val === 'medium') {
      return { color: COLORS.ACCENT, bg: '#EEF2FF', label: 'Monitor' };
    }
    return { color: COLORS.SUCCESS, bg: '#ECFDF5', label: 'Healthy' };
  }, [item.severity, item.severity]);

  // 3. IMAGE HANDLER (Fix for loading issues)
  const renderImage = () => {
    // Check if it's a valid remote URL or a local file path
    if (item.image_url && typeof item.image_url === 'string') {
      return (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
      );
    }
    return (
      <View style={[styles.image, styles.placeholder]}>
        <Ionicons name="image-outline" size={20} color={COLORS.BORDER} />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{dateFormatted}</Text>
        <TouchableOpacity 
          onPress={() => onDelete(item.id)}
          style={styles.deleteBtn}
          hitSlop={15}
        >
          <Ionicons name="trash-outline" size={16} color="#FDA4AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.imageContainer}>
          {renderImage()}
          
          <View style={[styles.confidenceBadge, SHADOWS.GLOW]}>
            {/* Logic: If confidence is 0.95 -> 95%, if it's 95 -> 95% */}
            <Text style={styles.confidenceText}>
              {item.confidence > 1 ? Math.round(item.confidence) : Math.round(item.confidence * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.infoBody}>
          <Text style={styles.title} numberOfLines={1}>
            {item.skin_type || 'General'} Analysis
          </Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <View style={[styles.dot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.scoreText}>{item.score}% Health</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward-outline" size={18} color={COLORS.BORDER} />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(HistoryCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.M,
    padding: 18,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  deleteBtn: { padding: 4 },
  mainContent: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  image: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.S,
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#F8FAFC',
  },
  confidenceBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  infoBody: { flex: 1, marginLeft: 16 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
});