import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ContentType } from '@/lib/types/content';
import { COLORS, FONT_SIZE, RATING, formatScore } from '@/lib/utils/constants';

const CATEGORY_COLORS: Record<ContentType, string> = {
    movie: COLORS.categoryMovie,
    series: COLORS.categorySeries,
    book: COLORS.categoryBook,
    game: COLORS.categoryGame,
    music: COLORS.categoryMusic,
    podcast: COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

const BAR_HEIGHT_DISPLAY = 8;
const BAR_HEIGHT_INTERACTIVE = 12;
const TOUCH_TARGET_HEIGHT = 44;

/** Color for score 0.0 (terrible) */
const ZERO_COLOR = COLORS.error; // red

const ENHANCED_BAR_HEIGHT = 22;

/** Lighten a hex color by blending towards white */
function lightenColor(hex: string, percent: number = 0.18): string {
    if (!hex.startsWith('#')) return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgb(${Math.min(255, Math.round(r + (255 - r) * percent))}, ${Math.min(255, Math.round(g + (255 - g) * percent))}, ${Math.min(255, Math.round(b + (255 - b) * percent))})`;
}

interface RatingSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    category: ContentType;
    disabled?: boolean;
    size?: 'display' | 'interactive';
    layout?: 'horizontal' | 'vertical'; // For display mode: horizontal = number beside bar, vertical = number above bar
    exactScoreDisplay?: boolean;
}

function clampAndSnap(raw: number): number {
    'worklet';
    const clamped = Math.max(RATING.MIN, Math.min(RATING.MAX, raw));
    return Math.round(clamped * (1 / RATING.STEP)) * RATING.STEP;
}

function ratingToProgress(rating: number): number {
    'worklet';
    return (rating - RATING.MIN) / (RATING.MAX - RATING.MIN);
}

export function RatingSlider({
    value,
    onValueChange,
    category,
    disabled = false,
    size = 'interactive',
    layout = 'horizontal',
    exactScoreDisplay = false,
}: RatingSliderProps) {
    const categoryColor = CATEGORY_COLORS[category];
    /** Use red when score is exactly 0 */
    const color = value === 0 ? ZERO_COLOR : categoryColor;
    const isDisplay = size === 'display';

    const displayedScore = exactScoreDisplay ? value.toFixed(1) : formatScore(value);

    const [layoutWidth, setLayoutWidth] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    const fillProgress = useSharedValue(ratingToProgress(value));
    const numberScale = useSharedValue(1);
    const lastSnapped = useSharedValue(value);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
        const sub = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setReduceMotion,
        );
        return () => sub.remove();
    }, []);

    useEffect(() => {
        const target = ratingToProgress(value);
        fillProgress.value = reduceMotion
            ? withTiming(target, { duration: 0 })
            : withSpring(target, { damping: 15, stiffness: 120 });
        lastSnapped.value = value;
    }, [value, reduceMotion]);

    const triggerHaptic = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const emitValue = useCallback(
        (v: number) => {
            onValueChange(v);
        },
        [onValueChange],
    );

    const bounceNumber = useCallback(() => {
        if (reduceMotion) return;
        numberScale.value = withSpring(1.15, { damping: 8, stiffness: 300 }, () => {
            numberScale.value = withSpring(1, { damping: 10, stiffness: 200 });
        });
    }, [reduceMotion]);

    const pan = Gesture.Pan()
        .enabled(!isDisplay && !disabled)
        .activeOffsetX([-12, 12])
        .failOffsetY([-8, 8])
        .onUpdate((e) => {
            if (layoutWidth === 0) return;
            const ratio = Math.max(0, Math.min(1, e.x / layoutWidth));
            const raw = RATING.MIN + ratio * (RATING.MAX - RATING.MIN);
            const snapped = clampAndSnap(raw);

            fillProgress.value = ratingToProgress(snapped);

            if (snapped !== lastSnapped.value) {
                lastSnapped.value = snapped;
                runOnJS(triggerHaptic)();
                runOnJS(emitValue)(snapped);
            }
        })
        .onEnd(() => {
            runOnJS(bounceNumber)();
        });

    const fillStyle = useAnimatedStyle(() => ({
        width: `${fillProgress.value * 100}%`,
    }));

    const scaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: numberScale.value }],
    }));

    const barHeight = isDisplay ? BAR_HEIGHT_DISPLAY : BAR_HEIGHT_INTERACTIVE;

    /** Tick marks at whole numbers (0, 1, 2, … 10) for visual feedback */
    const ticks = useMemo(() => {
        if (isDisplay) return null;
        const marks: React.ReactNode[] = [];
        for (let i = RATING.MIN; i <= RATING.MAX; i += 1) {
            const pct = ((i - RATING.MIN) / (RATING.MAX - RATING.MIN)) * 100;
            marks.push(
                <View
                    key={i}
                    style={[
                        styles.tick,
                        {
                            left: `${pct}%`,
                            backgroundColor:
                                i <= value ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.10)',
                        },
                    ]}
                />,
            );
        }
        return <View style={styles.tickContainer}>{marks}</View>;
    }, [isDisplay, value]);

    /** Subtle scale marks at integer positions for the enhanced display bar */
    const displayTicks = useMemo(() => {
        if (!isDisplay || layout !== 'vertical') return null;
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
    }, [isDisplay, layout]);

    const lighterColor = useMemo(() => lightenColor(color, 0.18), [color]);

    if (isDisplay) {
        // Enhanced vertical layout: gradient bar with embedded score badge
        if (layout === 'vertical') {
            return (
                <View style={styles.enhancedBarOuter}>
                    {/* Track background with tick marks */}
                    <View style={styles.enhancedTrack}>
                        {displayTicks}
                        {/* Gradient fill — rounded on both ends */}
                        <Animated.View style={[styles.enhancedFillClip, fillStyle]}>
                            <LinearGradient
                                colors={[color, lighterColor]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.enhancedGradient}
                            />
                        </Animated.View>
                    </View>
                    {/* Score badge centered on fill edge */}
                    <Animated.View style={[styles.badgePositioner, fillStyle]}>
                        <View style={[styles.scoreBadgeInBar, { borderColor: color, borderWidth: 1.5 }]}>
                            <Text style={[styles.scoreBadgeInBarText, { color }]}>
                                {displayedScore}
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            );
        }
        // Horizontal layout: bar with number beside (default)
        return (
            <View style={styles.displayRow}>
                <View style={[styles.trackFlex, { height: barHeight }]}>
                    <Animated.View
                        style={[styles.fill, { backgroundColor: color }, fillStyle]}
                    />
                </View>
                <Text style={[styles.displayNumber, { color }]}>
                    {displayedScore}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GestureDetector gesture={pan}>
                <View style={styles.interactiveRow}>
                    <View
                        style={[styles.touchTarget, { height: TOUCH_TARGET_HEIGHT }]}
                        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
                    >
                        <View style={[styles.track, { height: barHeight }]}>
                            <Animated.View
                                style={[styles.fill, { backgroundColor: color }, fillStyle]}
                            />
                        </View>
                        {ticks}
                    </View>
                    <Animated.Text
                        style={[
                            styles.interactiveNumber,
                            { color },
                            scaleStyle,
                        ]}
                    >
                        {displayedScore}
                    </Animated.Text>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    displayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    displayVertical: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        width: '100%',
    },
    interactiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    touchTarget: {
        flex: 1,
        justifyContent: 'center',
    },
    track: {
        width: '100%',
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 999,
        overflow: 'hidden',
    },
    trackFlex: {
        flex: 1,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
    tickContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    tick: {
        position: 'absolute',
        width: 1,
        height: 16,
        borderRadius: 0.5,
    },
    displayNumber: {
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '700',
        minWidth: 24,
        textAlign: 'right',
    },
    displayNumberLarge: {
        fontSize: FONT_SIZE.headlineMedium,
        fontWeight: '700',
    },
    interactiveNumber: {
        fontSize: FONT_SIZE.headlineLarge,
        fontWeight: '700',
        minWidth: 48,
        textAlign: 'right',
    },
    // ── Enhanced display bar (vertical layout) ──
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
    enhancedFillClip: {
        height: '100%',
        borderRadius: 999,
        overflow: 'hidden' as const,
    },
    enhancedGradient: {
        flex: 1,
    },
    badgePositioner: {
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        overflow: 'visible' as const,
    },
    scoreBadgeInBar: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 999,
        // Shift right so badge is centered on the fill edge
        marginRight: -16,
    },
    scoreBadgeInBarText: {
        fontSize: 11,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
});
