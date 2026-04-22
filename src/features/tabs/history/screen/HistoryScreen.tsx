import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Ensure this is imported
import { format } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSkinHistory } from '../hooks/useSkinHistory';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

export default function HistoryScreen() {
  const { history, isLoading, stats, refresh } = useSkinHistory();
  const navigation = useNavigation<any>();

  const getStatusColor = (severity: string) => {
    const sev = severity?.toLowerCase() || 'low';
    if (['severe', 'high'].includes(sev)) return COLORS.ACCENT;
    if (['moderate', 'medium'].includes(sev)) return COLORS.PRIMARY;
    return COLORS.SUCCESS;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refresh} 
            tintColor={COLORS.PRIMARY} 
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dermal Archive</Text>
            <Text style={styles.subText}>Historical analysis & tracking</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.TEXT_PRIMARY} />
            {stats.alerts > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>

        {/* Stats Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
             <Ionicons name="stats-chart" size={14} color={COLORS.PRIMARY} />
             <Text style={styles.cardTitle}>CLINICAL DIAGNOSTIC SUMMARY</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.scans}</Text>
              <Text style={styles.statLabel}>Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.avgHealth}%</Text>
              <Text style={styles.statLabel}>Health Avg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={stats.alerts > 0 ? [styles.statNumber, {color: COLORS.ACCENT}] : styles.statNumber}>
                {stats.alerts.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={refresh}>
            <Ionicons name="refresh-outline" size={14} color={COLORS.ACCENT} />
            <Text style={styles.filterLink}>Sync</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading && history.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 50 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="cloud-offline-outline" size={48} color={COLORS.BORDER} />
             <Text style={styles.emptyText}>No analysis history found.</Text>
          </View>
        ) : (
          history.map((item) => {
            const statusColor = getStatusColor(item.overall_severity);

            return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemWrapper}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/view-details-result',
                params: { analysis: JSON.stringify(item) }
              })}
            >
              <View style={styles.historyItem}>
                <View style={[styles.iconContainer, { backgroundColor: statusColor + '15' }]}>
                  <Ionicons name="barcode-outline" size={20} color={statusColor} />
                </View>
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.skin_type} Analysis</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemDate}>
                      {format(new Date(item.created_at), 'MMM dd • h:mm a')}
                    </Text>
                    <View style={styles.dotSeparator} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.overall_severity}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.scoreTag}>
                  <Text style={styles.scoreText}>{Math.round(item.score)}%</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.BORDER} />
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 10 },
  greeting: { fontSize: 24, fontWeight: '900', color: COLORS.TEXT_PRIMARY, letterSpacing: -0.5 },
  subText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginTop: 2, fontWeight: '500' },
  notificationBtn: { backgroundColor: COLORS.WHITE, width: 42, height: 42, borderRadius: RADIUS.S, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER, ...SHADOWS.SOFT },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.PRIMARY, borderWidth: 1.5, borderColor: COLORS.WHITE },
  summaryCard: { backgroundColor: COLORS.TEXT_PRIMARY, borderRadius: RADIUS.L, padding: 20, marginBottom: 30, ...SHADOWS.SOFT },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
  cardTitle: { color: COLORS.WHITE, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, opacity: 0.7 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: COLORS.WHITE, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.WHITE, fontSize: 11, marginTop: 4, opacity: 0.6, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.WHITE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.S, borderWidth: 1, borderColor: COLORS.BORDER },
  filterLink: { fontSize: 12, color: COLORS.ACCENT, fontWeight: '700' },
  itemWrapper: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.M,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.SOFT,
  },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconContainer: { width: 46, height: 46, borderRadius: RADIUS.S, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 2 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDate: { fontSize: 12, color: COLORS.TEXT_SECONDARY, fontWeight: '500' },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.BORDER },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  scoreTag: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.S, marginRight: 8 },
  scoreText: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  emptyState: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { marginTop: 10, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
});