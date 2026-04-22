import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Internal assets/constants
import { THEMES } from '@/src/constants/themes';

/* ==========================================================================
   TYPES & CONSTANTS
   ========================================================================== */

const { COLORS, SHADOWS } = THEMES.DERMA_AI;

const STORAGE_KEYS = {
    LAST_DATE: 'skincare_last_date',
    STREAK: 'skincare_streak',
} as const;

type RoutineType = 'morning' | 'evening';

interface RoutineItem {
    id: string;
    title: string;
    completed: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    type: RoutineType;
}

const DEFAULT_ROUTINE: RoutineItem[] = [
    { id: '1', title: 'Gentle Cleanser', completed: false, icon: 'sunny-outline', type: 'morning' },
    { id: '2', title: 'Vitamin C Serum', completed: false, icon: 'leaf-outline', type: 'morning' },
    { id: '3', title: 'SPF 30+ Protection', completed: false, icon: 'umbrella-outline', type: 'morning' },
    { id: '4', title: 'Deep Cleansing Balm', completed: false, icon: 'moon-outline', type: 'evening' },
    { id: '5', title: 'Hydrating Moisturizer', completed: false, icon: 'water-outline', type: 'evening' },
    { id: '6', title: 'Night Repair Serum', completed: false, icon: 'sparkles-outline', type: 'evening' },
];

/* ==========================================================================
   CUSTOM HOOKS
   ========================================================================== */

const useSkincareRoutine = () => {
    const [routine, setRoutine] = useState<RoutineItem[]>(DEFAULT_ROUTINE);
    const [streak, setStreak] = useState<number>(0);

    const initializeProgress = useCallback(async () => {
        const today = new Date().toDateString();
        try {
            const [savedDate, savedStreak] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.LAST_DATE),
                AsyncStorage.getItem(STORAGE_KEYS.STREAK),
            ]);

            const currentStreak = Number(savedStreak) || 0;
            
            if (savedDate !== today) {
                // Logic: Only increment streak if the last recorded date was yesterday
                const updatedStreak = savedDate ? currentStreak + 1 : 1;
                setStreak(updatedStreak);
                setRoutine(DEFAULT_ROUTINE);
                
                await AsyncStorage.multiSet([
                    [STORAGE_KEYS.STREAK, String(updatedStreak)],
                    [STORAGE_KEYS.LAST_DATE, today],
                ]);
            } else {
                setStreak(currentStreak);
            }
        } catch (error) {
            console.error('[Storage Error]: Failed to load routine state', error);
        }
    }, []);

    useEffect(() => {
        initializeProgress();
    }, [initializeProgress]);

    const toggleItem = useCallback((id: string) => {
        setRoutine(prev =>
            prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
        );
    }, []);

    const progress = useMemo(() => {
        const completedCount = routine.filter(i => i.completed).length;
        return {
            completedCount,
            totalCount: routine.length,
            percentage: routine.length ? completedCount / routine.length : 0,
        };
    }, [routine]);

    const categorizedRoutine = useMemo(() => ({
        morning: routine.filter(item => item.type === 'morning'),
        evening: routine.filter(item => item.type === 'evening'),
    }), [routine]);

    return { categorizedRoutine, streak, toggleItem, progress };
};

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

const ProgressBar = memo(({ progress }: { progress: number }) => (
    <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
));

const RoutineCard = memo(({ item, onToggle }: { item: RoutineItem; onToggle: (id: string) => void }) => (
    <TouchableOpacity
        onPress={() => onToggle(item.id)}
        style={[styles.itemRow, item.completed && styles.itemCompleted]}
        activeOpacity={0.6}
    >
        <View style={styles.itemContent}>
            <View style={[styles.iconWrapper, item.completed && styles.iconWrapperDone]}>
                <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.completed ? COLORS.WHITE : COLORS.PRIMARY}
                />
            </View>
            <Text style={[styles.itemText, item.completed && styles.itemTextDone]}>
                {item.title}
            </Text>
        </View>
        <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.completed ? COLORS.SUCCESS : '#D1D1D6'}
        />
    </TouchableOpacity>
));

/* ==========================================================================
   MAIN SCREEN
   ========================================================================== */

export default function StartSkinCareJourney() {
    const router = useRouter();
    const { categorizedRoutine, streak, toggleItem, progress } = useSkincareRoutine();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header / Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Medical Protocol</Text>
                <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={14} color={COLORS.WHITE} />
                    <Text style={styles.streakText}>{streak} Day Streak</Text>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                {/* Progress Overview */}
                <View style={styles.headerSection}>
                    <View>
                        <Text style={styles.mainTitle}>Daily Status</Text>
                        <Text style={styles.subTitle}>Optimized for your skin profile</Text>
                    </View>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>
                            {progress.completedCount}/{progress.totalCount}
                        </Text>
                    </View>
                </View>

                <View style={styles.progressWrapper}>
                    <ProgressBar progress={progress.percentage} />
                </View>

                {/* Morning Routine Section */}
                <RoutineSection 
                    title="Morning Routine" 
                    icon="sunny" 
                    iconColor="#FF9500" 
                    data={categorizedRoutine.morning} 
                    onToggle={toggleItem} 
                />

                {/* Evening Routine Section */}
                <RoutineSection 
                    title="Evening Routine" 
                    icon="moon" 
                    iconColor="#5856D6" 
                    data={categorizedRoutine.evening} 
                    onToggle={toggleItem} 
                />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    onPress={() => router.push('/home')} 
                    style={styles.primaryButton}
                >
                    <Text style={styles.primaryButtonText}>Complete Session</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const RoutineSection = ({ title, icon, iconColor, data, onToggle }: any) => (
    <View style={styles.routineSection}>
        <View style={styles.sectionHeader}>
            <Ionicons name={icon} size={20} color={iconColor} />
            <Text style={styles.sectionLabel}>{title}</Text>
        </View>
        <View style={styles.mainCard}>
            {data.map((item: RoutineItem) => (
                <RoutineCard key={item.id} item={item} onToggle={onToggle} />
            ))}
        </View>
    </View>
);

/* ==========================================================================
   STYLES
   ========================================================================== */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: { padding: 4 },
    navTitle: { fontSize: 17, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
    streakBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: COLORS.PRIMARY, 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 12, 
        gap: 4 
    },
    streakText: { color: COLORS.WHITE, fontSize: 11, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 120 },
    headerSection: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 24 
    },
    mainTitle: { fontSize: 24, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
    subTitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
    counterBadge: { 
        backgroundColor: COLORS.WHITE, 
        width: 50, 
        height: 50, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        ...SHADOWS.SOFT 
    },
    counterText: { color: COLORS.PRIMARY, fontWeight: 'bold', fontSize: 14 },
    progressWrapper: { paddingHorizontal: 24, marginBottom: 30 },
    progressContainer: { height: 10, backgroundColor: '#E5E5EA', borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.PRIMARY },
    routineSection: { paddingHorizontal: 20, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    sectionLabel: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
    mainCard: { 
        backgroundColor: COLORS.WHITE, 
        borderRadius: 20, 
        padding: 12, 
        ...SHADOWS.SOFT 
    },
    itemRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 14, 
        paddingHorizontal: 8 
    },
    itemContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    itemCompleted: { opacity: 0.6 },
    iconWrapper: { 
        width: 36, 
        height: 36, 
        borderRadius: 10, 
        backgroundColor: '#F2F2F7', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    iconWrapperDone: { backgroundColor: COLORS.SUCCESS + '20' },
    itemText: { fontSize: 16, fontWeight: '500', color: COLORS.TEXT_PRIMARY },
    itemTextDone: { textDecorationLine: 'line-through', color: COLORS.TEXT_SECONDARY },
    footer: { 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: 24, 
        backgroundColor: 'rgba(242, 242, 247, 0.9)' 
    },
    primaryButton: { 
        backgroundColor: COLORS.PRIMARY, 
        height: 58, 
        borderRadius: 18, 
        justifyContent: 'center', 
        alignItems: 'center', 
        ...SHADOWS.SOFT 
    },
    primaryButtonText: { color: COLORS.WHITE, fontSize: 17, fontWeight: '700' },
});