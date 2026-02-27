import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, RATING, formatScore } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import {
    BAR_HEIGHT_DISPLAY,
    ENHANCED_BAR_HEIGHT,
    type RatingSliderProps,
    lightenColor,
    ratingToProgress,
    resolveColor,
    sharedStyles,
} from './ratingSliderUtils';

type DisplayProps = Pick<RatingSliderProps, 'value' | 'category' | 'layout' | 'exactScoreDisplay'>;

export function RatingSliderDisplay({
    value,
    category,
    layout = 'horizontal',
    exactScoreDisplay = false,
}: DisplayProps) {
    const color = resolveColor(value, category);
    const lighterColor = useMemo(() => lightenColor(color, 0.18), [color]);
    const displayedScore = exactScoreDisplay ? value.toFixed(1) : formatScore(value);

    const fillProgress = useSharedValue(ratingToProgress(value));

    useEffect(() => {
        fillProgress.value = withSpring(ratingToProgress(value), { damping: 15, stiffness: 120 });
    }, [value]);

    const fillStyle = useAnimatedStyle(() => ({
        width: `${fillProgress.value * 100}%`,
    }));

    // ── Tick marks for the enhanced vertical bar ──
    const displayTicks = useMemo(() => {
        if (layout !== 'vertical') return null;
        const marks: React.ReactNode[] = [];
        for (let i = RATING.MIN; i <= RATING.MAX; i += 1) {
            const pct = ((i - RATING.MIN) / (RATING.MAX - RATING.MIN)) * 100;
            marks.push(
                <View
                    key={i}
                    style={{
                        position: 'absolute' as const,
                        left: `${pct}%`,
                        width: 1.5,
                        height: '65%',
                        backgroundColor: 'rgba(255,255,255,0.17)',
                        borderRadius: 1,
                    }}
                />,
            );
        }
        return (
            <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center' }]}>
                {marks}
            </View>
        );
    }, [layout]);

    // ── Enhanced vertical layout ──
    if (layout === 'vertical') {
        return (
            <View style={S.enhancedBarOuter}>
                <View style={S.enhancedTrack}>
                    {displayTicks}
                    <Animated.View style={[S.enhancedFillClip, fillStyle]}>
                        <LinearGradient
                            colors={[color, lighterColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={S.enhancedGradient}
                        />
                    </Animated.View>
                </View>
                <Animated.View style={[S.badgePositioner, fillStyle]}>
                    <View style={[S.scoreBadge, { borderColor: color, borderWidth: 1.5 }]}>
                        <Text style={[S.scoreBadgeText, { color }]}>{displayedScore}</Text>
                    </View>
                </Animated.View>
            </View>
        );
    }

    // ── Horizontal layout (default) ──
    return (
        <View style={S.displayRow}>
            <View style={[sharedStyles.trackFlex, { height: BAR_HEIGHT_DISPLAY }]}>
                <Animated.View style={[sharedStyles.fill, { backgroundColor: color }, fillStyle]} />
            </View>
            <Text style={[S.displayNumber, { color }]}>{displayedScore}</Text>
        </View>
    );
}

const S = StyleSheet.create({
    displayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    displayNumber: {
        ...TYPO.bodySmall,
        fontFamily: FONT.bold,
        minWidth: 24,
        textAlign: 'right',
    },
    enhancedBarOuter: {
        width: '100%',
        height: ENHANCED_BAR_HEIGHT,
        overflow: 'visible' as const,
    },
    enhancedTrack: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 999,
        overflow: 'hidden' as const,
    },
    enhancedFillClip: { height: '100%', borderRadius: 999, overflow: 'hidden' as const },
    enhancedGradient: { flex: 1 },
    badgePositioner: {
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        overflow: 'visible' as const,
    },
    scoreBadge: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 999,
        marginRight: -16,
    },
    scoreBadgeText: { fontSize: 11, fontFamily: FONT.bold },
});
