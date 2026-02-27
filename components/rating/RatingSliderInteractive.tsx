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
import { COLORS, RATING, formatScore } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import {
    BAR_HEIGHT_INTERACTIVE,
    TOUCH_TARGET_HEIGHT,
    type RatingSliderProps,
    clampAndSnap,
    ratingToProgress,
    resolveColor,
    sharedStyles,
} from './ratingSliderUtils';

type InteractiveProps = Pick<
    RatingSliderProps,
    'value' | 'onValueChange' | 'category' | 'disabled' | 'exactScoreDisplay'
>;

export function RatingSliderInteractive({
    value,
    onValueChange,
    category,
    disabled = false,
    exactScoreDisplay = false,
}: InteractiveProps) {
    const color = resolveColor(value, category);
    const displayedScore = exactScoreDisplay ? value.toFixed(1) : formatScore(value);

    const [layoutWidth, setLayoutWidth] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    const fillProgress = useSharedValue(ratingToProgress(value));
    const numberScale = useSharedValue(1);
    const lastSnapped = useSharedValue(value);

    // ── Reduced motion listener ──
    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => sub.remove();
    }, []);

    // ── Sync fill when value changes externally ──
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
        (v: number) => onValueChange(v),
        [onValueChange],
    );

    const bounceNumber = useCallback(() => {
        if (reduceMotion) return;
        numberScale.value = withSpring(1.15, { damping: 8, stiffness: 300 }, () => {
            numberScale.value = withSpring(1, { damping: 10, stiffness: 200 });
        });
    }, [reduceMotion]);

    // ── Pan gesture ──
    const pan = Gesture.Pan()
        .enabled(!disabled)
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

    // ── Tick marks at whole numbers ──
    const ticks = useMemo(() => {
        const marks: React.ReactNode[] = [];
        for (let i = RATING.MIN; i <= RATING.MAX; i += 1) {
            const pct = ((i - RATING.MIN) / (RATING.MAX - RATING.MIN)) * 100;
            marks.push(
                <View
                    key={i}
                    style={[
                        S.tick,
                        {
                            left: `${pct}%`,
                            backgroundColor:
                                i <= value ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.10)',
                        },
                    ]}
                />,
            );
        }
        return <View style={S.tickContainer}>{marks}</View>;
    }, [value]);

    return (
        <View style={S.container}>
            <GestureDetector gesture={pan}>
                <View style={S.interactiveRow}>
                    <View
                        style={S.touchTarget}
                        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
                    >
                        <View style={[sharedStyles.track, { height: BAR_HEIGHT_INTERACTIVE }]}>
                            <Animated.View
                                style={[sharedStyles.fill, { backgroundColor: color }, fillStyle]}
                            />
                        </View>
                        {ticks}
                    </View>
                    <Animated.Text style={[S.interactiveNumber, { color }, scaleStyle]}>
                        {displayedScore}
                    </Animated.Text>
                </View>
            </GestureDetector>
        </View>
    );
}

const S = StyleSheet.create({
    container: { width: '100%' },
    interactiveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    touchTarget: { flex: 1, justifyContent: 'center', height: TOUCH_TARGET_HEIGHT },
    tickContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
    tick: { position: 'absolute', width: 1, height: 16, borderRadius: 0.5 },
    interactiveNumber: {
        ...TYPO.h2,
        minWidth: 48,
        textAlign: 'right',
    },
});
