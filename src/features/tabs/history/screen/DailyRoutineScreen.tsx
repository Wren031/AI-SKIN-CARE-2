import { THEMES } from '@/src/constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { ProductCardRoutine } from '../components/routine/ProductCardRoutine';

import { LifestyleCardRoutine } from '../components/routine/LifestyleCardRoutine';
import { user_recommendation_service } from '../services/user_recommendation_service';

const { COLORS } = THEMES.DERMA_AI;

export default function DailyRoutineScreen() {
  const { ida } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<{ morning: any[]; evening: any[] }>({ morning: [], evening: [] });
  // Added state for lifestyle tips
  const [lifestyleTips, setLifestyleTips] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!ida) return;
    try {
      setLoading(true);
      const result = await user_recommendation_service.get_recommendation_by_id(ida as string);
      
      // 1. Handle Products
      if (result?.recommendation?.recommendation_products) {
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
      if (result?.recommendation?.recommendation_lifestyle_tips) {
        setLifestyleTips(result.recommendation.recommendation_lifestyle_tips);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [ida]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleItem = useCallback((id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1E293B" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Regimen</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Morning Section */}
        <SectionHeader title="Morning" icon="sunny" color="#F59E0B" bgColor="#FFF7ED" />
        {routines.morning.map((item, i) => (
          <ProductCardRoutine 
            key={`am-${i}`} 
            item={item} 
            type="am" 
            isCompleted={completedItems.has(`am-${item.product?.id}`)} 
            onToggle={toggleItem} 
          />
        ))}

        {/* Evening Section */}
        <SectionHeader title="Evening" icon="moon" color="#4338CA" bgColor="#EEF2FF" />
        {routines.evening.map((item, i) => (
          <ProductCardRoutine 
            key={`pm-${i}`} 
            item={item} 
            type="pm" 
            isCompleted={completedItems.has(`pm-${item.product?.id}`)} 
            onToggle={toggleItem} 
          />
        ))}

        {/* NEW: Lifestyle Section */}
        {lifestyleTips.length > 0 && (
          <>
            <SectionHeader title="Lifestyle Habits" icon="sparkles" color={COLORS.PRIMARY} bgColor={`${COLORS.PRIMARY}15`} />
            {lifestyleTips.map((item, i) => (
              <LifestyleCardRoutine 
                key={`life-${i}`} 
                item={item} 
                index={i}
                isCompleted={completedItems.has(`life-${item.lifestyle?.id || i}`)} 
                onToggle={toggleItem} 
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionHeader = ({ title, icon, color, bgColor }: any) => (
  <View style={[styles.sectionLabel, { backgroundColor: bgColor, marginTop: 10 }]}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={[styles.sectionLabelText, { color }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingHorizontal: 12, borderRadius: 20, marginBottom: 12, alignSelf: 'flex-start' },
  sectionLabelText: { fontSize: 12, fontWeight: '800', marginLeft: 6, textTransform: 'uppercase' },
});