import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    useReducedMotion,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SCREEN_W = Dimensions.get('window').width;

// Ring config
const CENTER = 90;
const STROKE_W = 12;
const RING_GAP = 15;
const BASE_RADIUS = 78;

type CategoryFilter = AnnualChallenge['categoryFilter'];

const CATEGORY_META: Record<CategoryFilter, { emoji: string; label: string }> = {
    movie:    { emoji: '🎬', label: 'Películas' },
    series:   { emoji: '📺', label: 'Series' },
    book:     { emoji: '📚', label: 'Libros' },
    game:     { emoji: '🎮', label: 'Juegos' },
    music:    { emoji: '🎵', label: 'Música' },
    podcast:  { emoji: '🎙️', label: 'Podcasts' },
    anything: { emoji: '✨', label: 'Anything' },
    all:      { emoji: '🌟', label: 'Todas' },
};

interface RingData {
    challenge: AnnualChallenge;
    progress: number;
    color: string;
    radius: number;
}

interface ActivityRingProps {
    challenges: AnnualChallenge[];
    progressMap: Record<string, number>;
}

function ProgressArc({ ring, index }: { ring: RingData; index: number }) {
    const reducedMotion = useReducedMotion();
    const circumference = 2 * Math.PI * ring.radius;
    const pct = Math.min(1, ring.progress / ring.challenge.targetCount);
    const targetOffset = circumference * (1 - pct);

    const animatedOffset = useSharedValue(reducedMotion ? targetOffset : circumference);

    useEffect(() => {
        if (reducedMotion) {
            animatedOffset.value = targetOffset;
            return;
        }
        animatedOffset.value = withTiming(targetOffset, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
    }, [targetOffset, reducedMotion, animatedOffset]);

    const animProps = useAnimatedProps(() => ({
        strokeDashoffset: animatedOffset.value,
    }));

    return (
        <>
            {/* Track (background) */}
            <Circle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                stroke={ring.color + '26'}
                strokeWidth={STROKE_W}
                fill="none"
            />
            {/* Progress arc */}
            <AnimatedCircle
                cx={CENTER}
                cy={CENTER}
                r={ring.radius}
                stroke={ring.color}
                strokeWidth={STROKE_W}
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                animatedProps={animProps}
                fill="none"
                rotation={-90}
                origin={`${CENTER}, ${CENTER}`}
            />
        </>
    );
}

export function ActivityRing({ challenges, progressMap }: ActivityRingProps) {
    const router = useRouter();

    if (challenges.length === 0) {
        return <EmptyRingSkeleton onPress={() => router.push('/profile/challenge')} />;
    }

    const rings: RingData[] = challenges.map((c, i) => {
        const color = c.categoryFilter === 'all'
            ? COLORS.link
            : getCategoryColor(c.categoryFilter as ContentType);
        return {
            challenge: c,
            progress: progressMap[c.id] ?? 0,
            color,
            radius: BASE_RADIUS - i * RING_GAP,
        };
    });

    const totalProgress = rings.reduce((sum, r) => sum + r.progress, 0);
    const totalTarget = rings.reduce((sum, r) => sum + r.challenge.targetCount, 0);

    return (
        <View style={S.container}>
            <Svg width={CENTER * 2} height={CENTER * 2} viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}>
                {rings.map((ring, i) => (
                    <ProgressArc key={ring.challenge.id} ring={ring} index={i} />
                ))}
            </Svg>

            {/* Center text */}
            <View style={S.centerText}>
                <Text style={S.centerNumber}>{totalProgress}</Text>
                <Text style={S.centerLabel}>/ {totalTarget}</Text>
            </View>

            {/* Legend below */}
            <View style={S.legend}>
                {rings.map((ring) => {
                    const meta = CATEGORY_META[ring.challenge.categoryFilter];
                    return (
                        <View key={ring.challenge.id} style={S.legendRow}>
                            <View style={[S.legendDot, { backgroundColor: ring.color }]} />
                            <Text style={S.legendLabel}>{meta.emoji} {meta.label}</Text>
                            <Text style={[S.legendCount, { color: ring.color }]}>
                                {ring.progress}/{ring.challenge.targetCount}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

function EmptyRingSkeleton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable style={S.emptyContainer} onPress={onPress}>
            <Svg width={CENTER * 2} height={CENTER * 2} viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}>
                <Circle
                    cx={CENTER}
                    cy={CENTER}
                    r={BASE_RADIUS}
                    stroke={COLORS.surfaceElevated}
                    strokeWidth={STROKE_W}
                    fill="none"
                />
            </Svg>
            <View style={S.centerText}>
                <Text style={S.emptyEmoji}>🎯</Text>
                <Text style={S.emptyText}>Crea tu primer reto</Text>
            </View>
        </Pressable>
    );
}

const S = StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: SPACING.base },
    centerText: {
        position: 'absolute',
        top: SPACING.base,
        left: 0,
        right: 0,
        height: CENTER * 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerNumber: { ...TYPO.h1, color: COLORS.textPrimary },
    centerLabel: { ...TYPO.caption, color: COLORS.textTertiary },
    legend: { marginTop: SPACING.md, width: '100%', gap: SPACING.xs },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendLabel: { ...TYPO.bodySmall, color: COLORS.textSecondary, flex: 1 },
    legendCount: { ...TYPO.bodySmall, fontFamily: FONT.bold },
    emptyContainer: { alignItems: 'center', paddingVertical: SPACING.base },
    emptyEmoji: { fontSize: 32, marginBottom: SPACING.xs },
    emptyText: { ...TYPO.bodySmall, color: COLORS.textTertiary },
});
