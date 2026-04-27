import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { THEMES } from '@/src/constants/themes';

const { width } = Dimensions.get('window');
const { COLORS } = THEMES.DERMA_AI;

/* ================= TYPES & CONSTANTS ================= */

type RoutineType = 'morning' | 'evening' | 'lifestyle';

interface RoutineItem {
    id: string;
    title: string;
    completed: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    type: RoutineType;
}

const STORAGE_KEYS = {
    LAST_DATE: 'skincare_last_date',
    STREAK: 'skincare_streak',
} as const;

/* ================= REFINED GENERATOR ================= */

const generateRoutine = (products: any[], lifestyle: any[]): RoutineItem[] => {
    let routine: RoutineItem[] = [];

    products.forEach((product, index) => {
        const usage = (product.usage || "").toLowerCase();
        const title = product.product_name;

        if (usage.includes("morning") && usage.includes("evening")) {
            routine.push({ id: `p-${index}-m`, title, completed: false, icon: "sunny", type: "morning" });
            routine.push({ id: `p-${index}-e`, title, completed: false, icon: "moon", type: "evening" });
        } else if (usage.includes("night") || usage.includes("evening")) {
            routine.push({ id: `p-${index}`, title, completed: false, icon: "moon", type: "evening" });
        } else {
            routine.push({ id: `p-${index}`, title, completed: false, icon: "sunny", type: "morning" });
        }
    });

    lifestyle.forEach((tip, index) => {
        routine.push({ id: `l-${index}`, title: tip.title, completed: false, icon: "leaf", type: "lifestyle" });
    });

    return routine;
};

/* ================= COMPONENTS ================= */

const ProgressCircle = ({ done, total, streak }: { done: number, total: number, streak: number }) => {
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return (
        <View style={styles.progressContainer}>
            <View style={styles.statsRow}>
                <View>
                    <Text style={styles.progressTitle}>Daily Progress</Text>
                    <Text style={styles.progressSubtitle}>{percentage}% Completed</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={16} color="#F59E0B" />
                    <Text style={styles.streakText}>{streak} Day Streak</Text>
                </View>
            </View>
            
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
        </View>
    );
};

const RoutineCard = memo(({ item, onToggle }: { item: RoutineItem, onToggle: (id: string) => void }) => {
    const isMorning = item.type === 'morning';
    const isEvening = item.type === 'evening';
    
    const iconBg = isMorning ? '#FFF7ED' : isEvening ? '#F5F3FF' : '#F0FDF4';
    const iconColor = isMorning ? '#F59E0B' : isEvening ? '#7C3AED' : '#10B981';

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToggle(item.id)}
            style={[styles.itemCard, item.completed && styles.itemCardCompleted]}
        >
            <View style={[styles.iconWrapper, { backgroundColor: item.completed ? '#F1F5F9' : iconBg }]}>
                <Ionicons 
                    name={item.icon} 
                    size={20} 
                    color={item.completed ? '#94A3B8' : iconColor} 
                />
            </View>
            
            <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]} numberOfLines={1}>
                {item.title}
            </Text>

            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
        </TouchableOpacity>
    );
});

/* ================= MAIN SCREEN ================= */

export default function StartSkinCareJourney() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse Data
    const products = useMemo(() => {
        try { return params.products ? JSON.parse(params.products as string) : []; } catch { return []; }
    }, [params.products]);

    const lifestyle = useMemo(() => {
        try { return params.lifestyle ? JSON.parse(params.lifestyle as string) : []; } catch { return []; }
    }, [params.lifestyle]);

    // Routine Logic
    const dynamicRoutine = useMemo(() => generateRoutine(products, lifestyle), [products, lifestyle]);
    const [routine, setRoutine] = useState<RoutineItem[]>(dynamicRoutine);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        (async () => {
            const today = new Date().toDateString();
            const savedDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DATE);
            const savedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
            const currentStreak = Number(savedStreak) || 0;

            if (savedDate !== today) {
                setStreak(savedDate ? currentStreak + 1 : 1);
                // Keep the dynamic routine for new day
            } else {
                setStreak(currentStreak);
            }
        })();
    }, []);

    const toggleItem = (id: string) => {
        setRoutine(prev => prev.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const categorized = useMemo(() => ({
        morning: routine.filter(i => i.type === 'morning'),
        evening: routine.filter(i => i.type === 'evening'),
        lifestyle: routine.filter(i => i.type === 'lifestyle'),
    }), [routine]);

    const doneCount = routine.filter(i => i.completed).length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daily Routine</Text>
                <TouchableOpacity style={styles.calendarBtn}>
                    <Ionicons name="calendar-outline" size={22} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
                <ProgressCircle done={doneCount} total={routine.length} streak={streak} />

                <Section title="Morning Protocol" icon="sunny" color="#F59E0B" data={categorized.morning} onToggle={toggleItem} />
                <Section title="Evening Protocol" icon="moon" color="#7C3AED" data={categorized.evening} onToggle={toggleItem} />
                <Section title="Lifestyle Habits" icon="leaf" color="#10B981" data={categorized.lifestyle} onToggle={toggleItem} />
            </ScrollView>
        </SafeAreaView>
    );
}

const Section = ({ title, data, onToggle, icon, color }: any) => {
    if (data.length === 0) return null;
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.countText}>{data.filter((i: any) => i.completed).length}/{data.length}</Text>
            </View>
            {data.map((item: any) => (
                <RoutineCard key={item.id} item={item} onToggle={onToggle} />
            ))}
        </View>
    );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFF'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    calendarBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },

    scrollBody: { paddingBottom: 40 },

    /* PROGRESS CARD */
    progressContainer: {
        margin: 20,
        padding: 24,
        backgroundColor: '#FFF',
        borderRadius: 30,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
            android: { elevation: 3 }
        })
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    progressTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    progressSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
    streakBadge: { 
        flexDirection: 'row', alignItems: 'center', gap: 6, 
        backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 
    },
    streakText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
    progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.PRIMARY, borderRadius: 4 },

    /* SECTIONS */
    section: { paddingHorizontal: 20, marginTop: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10 },
    sectionTitle: { fontSize: 14, fontWeight: "900", color: "#64748B", textTransform: 'uppercase', letterSpacing: 1, flex: 1 },
    countText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },

    /* ITEM CARDS */
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FFF",
        marginBottom: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    itemCardCompleted: {
        backgroundColor: '#F8FAFC',
        borderColor: 'transparent',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    itemText: { fontSize: 15, fontWeight: "700", color: "#334155", flex: 1 },
    itemTextCompleted: { color: "#94A3B8", textDecorationLine: 'line-through' },
    
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkboxChecked: {
        backgroundColor: '#10B981',
        borderColor: '#10B981'
    }
});