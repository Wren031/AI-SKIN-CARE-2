import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Correct import for 'edges' prop

// Internal Imports
import { THEMES } from '@/src/constants/themes';
import { useProfileData } from '@/src/features/auth/hooks/useProfileData';
import HistoryCard from '../components/HistoryCard';
import { use_skin_result } from '../hooks/use_skin_result';
import { users_skin_result } from '../types/users_skin_result';

const { COLORS, RADIUS, SHADOWS } = THEMES.DERMA_AI;

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<users_skin_result[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { profile } = useProfileData();
  const {
    fetchUserHistory,
    removeReport,
    deleteAllReports,
    isLoading
  } = use_skin_result();

  // Load Data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchUserHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('[HistoryScreen] Error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimized Search Logic
  const filteredHistory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return history;
    return history.filter(item =>
      item.skin_type?.toLowerCase().includes(q) ||
      item.severity?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  // Action Handlers
  const handleDelete = (id: number) => {
    Alert.alert("Delete Analysis", "This record will be permanently removed from your archive.", [
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
    Alert.alert("Reset Archive", "Are you sure you want to clear all analysis records?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          const ok = await deleteAllReports();
          if (ok) setHistory([]);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.subtitle}>NEURAL ARCHIVE</Text>
            <Text style={styles.title}>History</Text>
          </View>

          {history.length > 0 && (
            <TouchableOpacity style={styles.iconCircleBtn} onPress={handleDeleteAll}>
              <Ionicons name="trash-outline" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search analysis history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            selectionColor={COLORS.PRIMARY}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
          <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons 
                name={searchQuery ? "search-outline" : "document-text-outline"} 
                size={32} 
                color={COLORS.PRIMARY} 
              />
            </View>
            <Text style={styles.emptyTitle}>{searchQuery ? "No Results Found" : "Archive Empty"}</Text>
            <Text style={styles.emptySub}>
              {searchQuery 
                ? "Try searching for a specific skin condition or date." 
                : `Reports for ${profile?.first_name || 'your profile'} will appear here once you complete an AI scan.`}
            </Text>
            {!searchQuery && (
               <TouchableOpacity 
                  style={styles.primaryBtn}
                  onPress={() => router.push('/')}
               >
                  <Text style={styles.primaryBtnText}>Start New Analysis</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.BACKGROUND 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 12, 
    marginBottom: 15 
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  
  // Unified Typography (Matches Home & Progress)
  subtitle: { 
    fontSize: 10, 
    color: COLORS.TEXT_SECONDARY, 
    fontWeight: '800', 
    letterSpacing: 0.5 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.TEXT_PRIMARY, 
    letterSpacing: -0.5, 
    marginTop: 2 
  },
  
  iconCircleBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: COLORS.WHITE, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...SHADOWS.SOFT 
  },

  searchBar: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: COLORS.WHITE, 
    borderRadius: RADIUS.S,
    paddingHorizontal: 16, 
    height: 52,
    borderWidth: 1, 
    borderColor: COLORS.BORDER, 
    ...SHADOWS.SOFT
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 15, 
    fontWeight: '600', 
    color: COLORS.TEXT_PRIMARY 
  },
  
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 100 
  },
  centerEmpty: { 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  
  emptyContainer: { 
    alignItems: 'center', 
    paddingBottom: 60 
  },
  emptyIconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 24, 
    backgroundColor: `${COLORS.PRIMARY}10`, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: COLORS.TEXT_PRIMARY 
  },
  emptySub: { 
    fontSize: 14, 
    color: COLORS.TEXT_SECONDARY, 
    textAlign: 'center', 
    marginTop: 8, 
    lineHeight: 20, 
    maxWidth: '85%' 
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.S,
    ...SHADOWS.SOFT,
  },
  primaryBtnText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 15 
  },
});