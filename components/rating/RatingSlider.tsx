import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
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

interface RatingSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    category: ContentType;
    disabled?: boolean;
    size?: 'display' | 'interactive';
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
}: RatingSliderProps) {
    const categoryColor = CATEGORY_COLORS[category];
    /** Use red when score is exactly 0 */
    const color = value === 0 ? ZERO_COLOR : categoryColor;
    const isDisplay = size === 'display';

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

    if (isDisplay) {
        return (
            <View style={styles.displayRow}>
                <View style={[styles.track, { height: barHeight }]}>
                    <Animated.View
                        style={[styles.fill, { backgroundColor: color }, fillStyle]}
                    />
                </View>
                <Text style={[styles.displayNumber, { color }]}>
                    {formatScore(value)}
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
                        {formatScore(value)}
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
        fontSize: FONT_SIZE.bodySmall,
        fontWeight: '700',
        width: 28,
        textAlign: 'right',
    },
    interactiveNumber: {
        fontSize: FONT_SIZE.headlineLarge,
        fontWeight: '700',
        minWidth: 48,
        textAlign: 'right',
    },
});
