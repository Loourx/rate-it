import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ShareableChallengeCardProps {
    username: string;
    target: number;
    current: number;
    /** Pre-calculated 0–100, never recalculate here */
    percentage: number;
    categoryFilter: string | null;
    year: number;
}

const SURFACE = {
    background: '#121212',
    card: '#1E1E1E',
    elevated: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
};
const GOLD = '#FFCA3A';

function getProgressColor(pct: number): string {
    if (pct >= 75) return GOLD;
    if (pct >= 50) return '#34C759';
    if (pct >= 25) return '#FFD60A';
    return '#FF453A';
}

export function ShareableChallengeCard(props: ShareableChallengeCardProps): React.ReactElement {
    const safePct = Math.min(props.percentage, 100);
    const isCompleted = props.current >= props.target;
    const color = isCompleted ? GOLD : getProgressColor(safePct);
    const barWidth = `${safePct}%` as const;
    const categoryLabel = props.categoryFilter ?? 'Todas las categorías';

    return (
        <View style={styles.card}>
            <View style={[styles.header, { backgroundColor: `${color}22` }]}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>
                        {isCompleted ? '🏆' : '🎯'} Reto {props.year}
                    </Text>
                    <Text style={styles.headerCategory} numberOfLines={1}>{categoryLabel}</Text>
                </View>
                <Text style={[styles.ratio, { color }]}>{props.current}/{props.target}</Text>
            </View>
            <View style={styles.progressSection}>
                {isCompleted ? (
                    <Text style={[styles.completedText, { color: GOLD }]}>¡Reto completado!</Text>
                ) : (
                    <Text style={[styles.percentageText, { color }]}>{safePct}%</Text>
                )}
                <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
                </View>
                <Text style={styles.username} numberOfLines={1}>@{props.username}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerBrand}>rate-it</Text>
                <Text style={styles.footerCta}>Únete al reto anual</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 360,
        height: 240,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: SURFACE.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    headerLeft: { flex: 1, gap: 2 },
    headerTitle: {
        fontSize: 15,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    headerCategory: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textSecondary,
    },
    ratio: {
        fontSize: 22,
        fontFamily: 'SpaceGrotesk-Bold',
    },
    progressSection: {
        flex: 1,
        backgroundColor: SURFACE.card,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'center',
        gap: 10,
    },
    percentageText: {
        fontSize: 40,
        fontFamily: 'SpaceGrotesk-Bold',
        lineHeight: 44,
    },
    completedText: {
        fontSize: 24,
        fontFamily: 'SpaceGrotesk-Bold',
    },
    barTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: SURFACE.elevated,
        overflow: 'hidden',
    },
    barFill: { height: 10, borderRadius: 999 },
    username: {
        fontSize: 13,
        fontFamily: 'SpaceGrotesk-Medium',
        color: SURFACE.textSecondary,
    },
    footer: {
        height: 44,
        backgroundColor: SURFACE.elevated,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    footerBrand: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Bold',
        color: 'rgba(255,255,255,0.6)',
    },
    footerCta: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textSecondary,
    },
});
