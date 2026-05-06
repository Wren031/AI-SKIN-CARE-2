import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useProfileData } from '@/src/features/auth/hooks/useProfileData'; // Added for name
import HistoryCard from '../components/HistoryCard';
import { use_skin_result } from '../hooks/use_skin_result';
import { users_skin_result } from '../types/users_skin_result';

const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

type FilterType = 'ALL' | 'MONTH' | '2W';

export default function HistoryScreen() {
  const [history, setHistory] = useState<users_skin_result[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  const { profile } = useProfileData(); // Get profile for the name
  const {
    fetchUserHistory,
    removeReport,
    deleteAllReports,
    isLoading
  } = use_skin_result();

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchUserHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('[HistoryScreen] Error loading data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ FILTER + SEARCH LOGIC
  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let filtered = [...history];

    const now = new Date();

    // 🔹 MONTH FILTER
    if (filter === 'MONTH') {
      filtered = filtered.filter(item => {
        const date = new Date(item.created_at);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });
    }

    // 🔹 LAST 2 WEEKS FILTER
    if (filter === '2W') {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(now.getDate() - 14);

      filtered = filtered.filter(item => {
        const date = new Date(item.created_at);
        return date >= twoWeeksAgo;
      });
    }

    // 🔹 SEARCH FILTER
    if (q) {
      filtered = filtered.filter(item =>
        item.skin_type?.toLowerCase().includes(q) ||
        item.severity?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [history, searchQuery, filter]);

  const handleDelete = (id: number) => {
    Alert.alert("Delete Analysis", "This record will be permanently removed.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const ok = await removeReport(id);
          if (ok) setHistory(prev => prev.filter(i => i.id !== id));
        }
      }
    ]);
  };

  const handleDeleteAll = () => {
    if (history.length === 0) return;

    Alert.alert(
      "Reset History",
      "Are you sure you want to clear all records?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteAllReports();
            if (ok) setHistory([]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.preTitle}>Your Neural</Text>
            <Text style={styles.title}>Skin History</Text>
          </View>

          {history.length > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleDeleteAll}
            >
              <Ionicons name="trash-bin-outline" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search skin type or severity..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.TEXT_SECONDARY}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTER BAR */}
        <View style={styles.filterBar}>
          {(['ALL', 'MONTH', '2W'] as FilterType[]).map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              style={[
                styles.filterBtn,
                filter === type && styles.filterBtnActive
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === type && styles.filterTextActive
                ]}
              >
                {type === 'ALL' ? 'All' : type === 'MONTH' ? 'This Month' : '2 Weeks'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          filteredHistory.length === 0 && styles.centerEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons 
                    name={searchQuery ? "search-outline" : "sparkles"} 
                    size={40} 
                    color={COLORS.PRIMARY} 
                />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No Results Found" : `Good day, ${profile?.first_name || 'User'}!`}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? "Try adjusting your search or filters."
                : "Please scan your face to start building your skin health history."}
            </Text>
            {!searchQuery && (
                <TouchableOpacity 
                    style={styles.scanNowBtn}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.scanNowText}>Scan Now</Text>
                </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredHistory.map(item => (
            <HistoryCard
              key={item.id}
              item={item}
              onPress={(selected) =>
                router.push({
                  pathname: '/view-details-result',
                  params: { ida: selected.id.toString() }
                })
              }
              onDelete={() => handleDelete(item.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: RADIUS.S,
    padding: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.S,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.WHITE,
    ...SHADOWS.SOFT,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
  },
  filterTextActive: {
    color: COLORS.PRIMARY,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    paddingTop: 8,
    borderBottomLeftRadius: RADIUS.M,
    borderBottomRightRadius: RADIUS.M,
    ...SHADOWS.SOFT,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  preTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.S,
    backgroundColor: `${COLORS.PRIMARY}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: RADIUS.S,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  centerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${COLORS.PRIMARY}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    maxWidth: '85%',
  },
  scanNowBtn: {
    marginTop: 24,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: RADIUS.M,
    ...SHADOWS.SOFT,
  },
  scanNowText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});