import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Oasis Palette
const SAGE = '#8FA08E';
const SAND = '#FCFAF7';
const DEEP_SAGE = '#3A4D39';
const SOFT_CORAL = '#E67E6E';
const MIST = '#F0F4F0';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Archive</Text>
            <Text style={styles.subText}>Reviewing your skin's journey</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={DEEP_SAGE} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats Card - The "Weekly Summary" Pebble */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Last 7 Days</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>Clean Score</Text>
            </View>
          </View>
        </View>

        {/* Recent Items List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity>
            <Text style={styles.filterLink}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        {/* Mock Data Mapping */}
        {[
          { id: 1, title: 'Morning Routine Log', type: 'sunny-outline', date: 'Today • 8:15 AM', color: SAGE },
          { id: 2, title: 'Ingredient Analysis', type: 'scan-outline', date: 'Yesterday • 4:30 PM', color: SOFT_CORAL },
          { id: 3, title: 'Evening Routine Log', type: 'moon-outline', date: 'Oct 23 • 10:15 PM', color: DEEP_SAGE },
        ].map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyItem} activeOpacity={0.6}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.type as any} size={20} color={item.color} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAND,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '300',
    color: DEEP_SAGE,
  },
  subText: {
    fontSize: 14,
    color: '#828282',
    marginTop: 4,
    fontStyle: 'italic',
  },
  notificationBtn: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SOFT_CORAL,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  summaryCard: {
    backgroundColor: DEEP_SAGE,
    borderRadius: 30,
    padding: 24,
    marginBottom: 35,
    shadowColor: DEEP_SAGE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: DEEP_SAGE,
  },
  filterLink: {
    fontSize: 13,
    color: SAGE,
    fontWeight: '700',
  },
  historyItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DEEP_SAGE,
  },
  itemDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});