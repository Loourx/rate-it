import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { CardFooter } from './partials';

export interface ShareableChallengeCardProps {
    username: string;
    current: number;
    target: number;
    year: number;
    streak: number;
    categoryFilter: 'movie' | 'series' | 'book' | 'game' | 'music' | 'all';
}

const CATEGORY_COLORS = [
    COLORS.categoryMovie,
    COLORS.categorySeries,
    COLORS.categoryBook,
    COLORS.categoryGame,
    COLORS.categoryMusic,
];

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

export function ShareableChallengeCard({
    username,
    current,
    target,
    year,
    streak,
    categoryFilter,
}: ShareableChallengeCardProps) {
    const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
    const remaining = Math.max(0, target - current);
    // Hero number gradient text: fallback technique (no MaskedView):
    // Text in white, absolutely over a LinearGradient background, with overflow: hidden and borderRadius.

    return (
        <View style={styles.root}>
            {/* Multicolor Glow (top) */}
            <View style={styles.glowWrap} pointerEvents="none">
                <LinearGradient
                    colors={CATEGORY_COLORS.map(c => c + '26')}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.glow}
                />
            </View>

            {/* Header row */}
            <View style={styles.headerRow}>
                <Text style={styles.headerLeft}>{`RETO ${year}`.toUpperCase()}</Text>
                <Text style={styles.headerRight}>{`${streak} días 🔥`}</Text>
            </View>
            <View style={styles.usernameRow}>
                <Text style={styles.username}>@{username}</Text>
            </View>

            {/* Hero number with gradient */}
            <View style={styles.heroWrap}>
                <View style={styles.heroGradientWrap}>
                    <LinearGradient
                        colors={CATEGORY_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.heroGradient}
                    />
                    <Text
                        style={styles.heroNumber}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {current}
                    </Text>
                </View>
                <Text style={styles.heroSub}>{`de ${target} items culturales`}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressWrap}>
                <View style={styles.progressBarTrack}>
                    <LinearGradient
                        colors={CATEGORY_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${pct}%` }]}
                    />
                </View>
                <View style={styles.progressInfoRow}>
                    <Text style={styles.progressPct}>{pct}% completado</Text>
                    <Text style={styles.progressRemain}>{remaining} por ir</Text>
                </View>
            </View>

            {/* 5 Dots (category colors) */}
            <View style={styles.dotsRow}>
                {CATEGORY_COLORS.map((color, i) => (
                    <View
                        key={color}
                        style={{
                            width: 28,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: color,
                            marginHorizontal: i === 0 ? 0 : 4,
                        }}
                    />
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footerWrap}>
                <CardFooter username={username} accentColor="#FFFFFF" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: COLORS.background,
        borderRadius: 24,
        overflow: 'hidden',
        padding: 0,
        position: 'relative',
        justifyContent: 'flex-start',
    },
    glowWrap: {
        position: 'absolute',
        top: -40,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 1,
        opacity: 0.7,
        filter: Platform.OS === 'web' ? 'blur(20px)' : undefined,
        // For native, use shadow if needed
    },
    glow: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 56,
        paddingHorizontal: 24,
        zIndex: 2,
    },
    headerLeft: {
        fontSize: 10,
        fontFamily: FONT.bold,
        color: COLORS.textSecondary,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    headerRight: {
        fontSize: 13,
        fontFamily: FONT.bold,
        color: '#FFD700',
        letterSpacing: 0.5,
    },
    usernameRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        zIndex: 2,
    },
    username: {
        fontSize: 12,
        fontFamily: FONT.medium,
        color: COLORS.textSecondary,
    },
    heroWrap: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 12,
        zIndex: 2,
    },
    heroGradientWrap: {
        width: 180,
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
    },
    heroNumber: {
        fontSize: 80,
        fontFamily: FONT.bold,
        fontWeight: '700',
        letterSpacing: -4,
        color: '#fff',
        textAlign: 'center',
        zIndex: 2,
        includeFontPadding: false,
        textShadowColor: 'rgba(0,0,0,0.12)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    heroSub: {
        fontSize: 18,
        fontFamily: FONT.regular,
        color: COLORS.textTertiary,
        marginTop: 8,
        textAlign: 'center',
    },
    progressWrap: {
        marginTop: 32,
        paddingHorizontal: 32,
        zIndex: 2,
    },
    progressBarTrack: {
        width: '100%',
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.surfaceElevated,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    progressInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    progressPct: {
        fontSize: 13,
        fontFamily: FONT.medium,
        color: COLORS.textPrimary,
    },
    progressRemain: {
        fontSize: 13,
        fontFamily: FONT.medium,
        color: COLORS.textSecondary,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 16,
        zIndex: 2,
    },
    footerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 24,
        paddingBottom: 24,
        zIndex: 3,
    },
});
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
