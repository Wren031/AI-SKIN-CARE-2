import { THEMES } from '@/src/constants/themes';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LifestyleCardRoutine } from '../components/routine/LifestyleCardRoutine';
import { ProductCardRoutine } from '../components/routine/ProductCardRoutine';
import { user_recommendation_service } from '../services/user_recommendation_service';

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, SHADOWS, RADIUS } = SKIN_THEME;

export default function DailyRoutineScreen() {
  const { ida } = useLocalSearchParams();
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<{ morning: any[]; evening: any[] }>({ morning: [], evening: [] });
  const [lifestyleTips, setLifestyleTips] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!ida) return;
    try {
      setLoading(true);
      const result = await user_recommendation_service.get_recommendation_by_id(ida as string);
      
      if (result) {
        setCreatedAt(result.created_at);
        
        // 1. Handle Products
        if (result.recommendation?.recommendation_products) {
          const products = result.recommendation.recommendation_products;
          const am: any[] = [];
          const pm: any[] = [];

          products.forEach((item: any) => {
            const usage = (item.product?.usage || "").toLowerCase();
            if (usage.includes('both')) { am.push(item); pm.push(item); }
            else if (usage.includes('evening')) { pm.push(item); }
            else { am.push(item); }
          });
          setRoutines({ morning: am, evening: pm });
        }

        // 2. Handle Lifestyle Tips
        if (result.recommendation?.recommendation_lifestyle_tips) {
          setLifestyleTips(result.recommendation.recommendation_lifestyle_tips);
        }
      }
    } catch (e) {
      console.error("Error fetching routine:", e);
    } finally {
      setLoading(false);
    }
  }, [ida]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const nextAssessment = useMemo(() => {
    if (!createdAt) return "Not Scheduled";
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [createdAt]);

  // PROGRESS TRACKER
  const totalTasks = routines.morning.length + routines.evening.length + lifestyleTips.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedItems.size / totalTasks) * 100) : 0;

  const toggleItem = useCallback((id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="small" color={COLORS.PRIMARY} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* PROFESSIONAL HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTextCenter}>
          <Text style={styles.headerSubtitle}>Personalized</Text>
          <Text style={styles.headerTitle}>Daily Regimen</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROGRESS & NEXT ASSESSMENT SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>DAILY PROGRESS</Text>
              <View style={styles.scoreRow}>
                 <Text style={styles.summaryValue}>{progressPercent}%</Text>
                 <Text style={styles.taskCount}>{completedItems.size}/{totalTasks} tasks</Text>
              </View>
            </View>
            <View style={styles.assessmentBox}>
              <Text style={styles.assessmentLabel}>BI-WEEKLY SCAN</Text>
              <Text style={styles.assessmentDate}>{nextAssessment}</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* MORNING SECTION */}
        <SectionHeader title="Morning Protocol" icon="sunny" color="#F59E0B" bgColor="#FFF7ED" />
        <View style={styles.cardGroup}>
          {routines.morning.map((item, i) => (
            <ProductCardRoutine 
              key={`am-${i}`} 
              item={item} 
              type="am" 
              isCompleted={completedItems.has(`am-${item.product?.id}`)} 
              onToggle={toggleItem} 
            />
          ))}
        </View>

        {/* EVENING SECTION */}
        <SectionHeader title="Evening Protocol" icon="moon" color="#4338CA" bgColor="#EEF2FF" />
        <View style={styles.cardGroup}>
          {routines.evening.map((item, i) => (
            <ProductCardRoutine 
              key={`pm-${i}`} 
              item={item} 
              type="pm" 
              isCompleted={completedItems.has(`pm-${item.product?.id}`)} 
              onToggle={toggleItem} 
            />
          ))}
        </View>

        {/* LIFESTYLE SECTION */}
        {lifestyleTips.length > 0 && (
          <>
            <SectionHeader title="Lifestyle Habits" icon="sparkles" color={COLORS.PRIMARY} bgColor={`${COLORS.PRIMARY}15`} />
            <View style={styles.cardGroup}>
              {lifestyleTips.map((item, i) => (
                <LifestyleCardRoutine 
                  key={`life-${i}`} 
                  item={item} 
                  index={i}
                  isCompleted={completedItems.has(`life-${item.lifestyle?.id || i}`)} 
                  onToggle={toggleItem} 
                />
              ))}
            </View>
          </>
        )}

        {/* FOOTER NOTE - FIXED ICON ERROR */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#94A3B8" />
          <Text style={styles.footerNoteText}>
            Routine is optimized for your 14-day skin cycle.
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Sub-Components ---
const SectionHeader = ({ title, icon, color, bgColor }: any) => (
  <View style={[styles.sectionLabel, { backgroundColor: bgColor }]}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[styles.sectionLabelText, { color }]}>{title}</Text>
  </View>
);

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTextCenter: { alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  infoBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { padding: 20 },

  summaryCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 25, 
    ...SHADOWS.SOFT 
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  summaryValue: { fontSize: 28, fontWeight: '900', color: COLORS.PRIMARY },
  taskCount: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  assessmentBox: { alignItems: 'flex-end' },
  assessmentLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  assessmentDate: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 2 },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.PRIMARY, borderRadius: 4 },

  sectionLabel: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    marginBottom: 16, 
    alignSelf: 'flex-start' 
  },
  sectionLabelText: { fontSize: 11, fontWeight: '800', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  cardGroup: { marginBottom: 20 },

  footerNote: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    gap: 8 
  },
  footerNoteText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' }
});