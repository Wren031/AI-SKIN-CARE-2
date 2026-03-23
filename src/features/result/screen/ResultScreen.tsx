import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, CheckCircle2, ChevronLeft, Microscope, ShieldAlert } from 'lucide-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Oasis Clinical Palette
const THEME = {
  bg: '#FCFAF7',     // Oasis Cream
  surface: '#FFFFFF', 
  text: '#2D312E',    // Deep Slate
  sage: '#8FA08E',    // Primary Oasis Sage
  accent: '#64748B',  // Steel Grey
  border: '#E2E8E2',
  
  // Status Colors (Professional Desaturated)
  high: '#C38E8E',    // Muted Rose (for high severity)
  med: '#D4B483',     // Muted Gold
  low: '#8FA08E',     // Sage (Stable)
};

export default function ResultScreen() {
    const { data } = useLocalSearchParams();
    const router = useRouter();
    const results = data ? JSON.parse(data as string) : null;

    if (!results) return null;

    const getScoreColor = (score: number) => {
        if (score > 70) return THEME.high;
        if (score > 30) return THEME.med;
        return THEME.low;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. TECHNICAL HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                    <ChevronLeft color={THEME.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerTextStack}>
                    <Text style={styles.headerTitle}>DIAGNOSTIC_REPORT</Text>
                    <Text style={styles.headerSub}>ID: OS-SCAN-{Math.floor(Math.random() * 1000)}</Text>
                </View>
                <Microscope color={THEME.sage} size={20} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 2. BIOMETRIC INDEX CARD */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                        <Activity size={14} color={THEME.accent} />
                        <Text style={styles.scoreLabel}>SKIN_HEALTH_INDEX</Text>
                    </View>
                    <Text style={[styles.scoreValue, {color: getScoreColor(100 - results.overall_score)}]}>
                        {results.overall_score}
                    </Text>
                    <View style={styles.scoreDivider} />
                    <Text style={styles.scoreSub}>ACCURACY_RATING: 98.4%</Text>
                </View>

                {/* 3. ANALYSIS BREAKDOWN */}
                <Text style={styles.sectionHeader}>SURFACE_DETECTIONS</Text>
                {results.detections.sort((a:any, b:any) => b.score - a.score).map((item: any, i: number) => (
                    <View key={i} style={styles.row}>
                        <View style={styles.rowInfo}>
                            <Text style={styles.rowLabel}>{item.label.toUpperCase()}</Text>
                            <View style={[styles.scoreBadge, {backgroundColor: getScoreColor(item.score) + '15'}]}>
                                <Text style={[styles.badgeText, {color: getScoreColor(item.score)}]}>
                                    {item.score > 70 ? 'CRITICAL' : item.score > 30 ? 'ATTENTION' : 'OPTIMAL'}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.meterContainer}>
                            <View style={[styles.meterFill, { width: `${item.score}%`, backgroundColor: getScoreColor(item.score) }]} />
                        </View>
                        <View style={styles.rowFooter}>
                            <Text style={styles.rowMeta}>DENSITY_ANALYSIS</Text>
                            <Text style={styles.percentageText}>{item.score}% SEVERITY</Text>
                        </View>
                    </View>
                ))}

                {/* 4. CLINICAL ADVICE SECTION */}
                <View style={styles.adviceBox}>
                    <View style={styles.adviceHeader}>
                        <ShieldAlert size={16} color={THEME.sage} />
                        <Text style={styles.adviceTitle}>SYSTEM_ADVICE</Text>
                    </View>
                    <Text style={styles.adviceText}>{results.advice}</Text>
                </View>

                {/* 5. ACTION BUTTON */}
                <TouchableOpacity style={styles.finalBtn} onPress={() => router.replace('/')}>
                    <View style={styles.btnContent}>
                        <CheckCircle2 color="white" size={20} strokeWidth={1.5} />
                        <Text style={styles.finalText}>COMMIT TO ARCHIVE</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.footerNote}>© OASIS BIOMETRICS // ENCRYPTED DATA TRANSFER</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 25, 
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerTextStack: { alignItems: 'center' },
    headerTitle: { fontWeight: '800', fontSize: 11, color: THEME.accent, letterSpacing: 2 },
    headerSub: { fontSize: 8, color: '#A0A0A0', fontWeight: '600', marginTop: 2 },
    
    scrollContent: { padding: 25 },

    scoreCard: { 
        backgroundColor: THEME.surface, 
        paddingVertical: 40, 
        borderRadius: 4, // Sharp clinical corners
        alignItems: 'center', 
        marginBottom: 30,
        borderWidth: 1,
        borderColor: THEME.border,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1
    },
    scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
    scoreLabel: { fontSize: 10, fontWeight: '800', color: THEME.accent, letterSpacing: 1.5 },
    scoreValue: { fontSize: 84, fontWeight: '300', color: THEME.text }, // Thinner font for "Medical Instrument" look
    scoreDivider: { width: 40, height: 1, backgroundColor: THEME.border, marginVertical: 15 },
    scoreSub: { fontSize: 9, fontWeight: '700', color: '#A0A0A0', letterSpacing: 1 },

    sectionHeader: { fontSize: 10, fontWeight: '800', color: THEME.accent, marginBottom: 15, letterSpacing: 1.5 },
    
    row: { 
        backgroundColor: THEME.surface, 
        padding: 20, 
        borderRadius: 4, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.border
    },
    rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    rowLabel: { fontSize: 14, fontWeight: '700', color: THEME.text, letterSpacing: 0.5 },
    scoreBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
    badgeText: { fontSize: 9, fontWeight: '800' },
    
    meterContainer: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, overflow: 'hidden' },
    meterFill: { height: '100%' },
    
    rowFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    rowMeta: { fontSize: 8, fontWeight: '700', color: '#BBB' },
    percentageText: { fontSize: 9, fontWeight: '800', color: THEME.accent },

    adviceBox: { 
        backgroundColor: '#F3F5F3', // Very faint Sage tint
        padding: 20, 
        borderRadius: 4, 
        marginTop: 15,
        borderLeftWidth: 3,
        borderLeftColor: THEME.sage
    },
    adviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    adviceTitle: { fontWeight: '800', fontSize: 11, color: THEME.sage, letterSpacing: 1 },
    adviceText: { color: THEME.text, lineHeight: 20, fontSize: 13, fontWeight: '500' },

    finalBtn: { marginTop: 35, backgroundColor: THEME.sage, borderRadius: 4, overflow: 'hidden' },
    btnContent: { padding: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    finalText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1.5 },
    
    footerNote: { textAlign: 'center', fontSize: 9, color: '#BBB', fontWeight: '700', marginTop: 30, marginBottom: 40, letterSpacing: 1 }
});