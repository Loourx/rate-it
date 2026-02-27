import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
    useReducedMotion,
} from 'react-native-reanimated';
import { COLORS } from '@/lib/utils/constants';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ShapeConfig {
    emoji: string;
    color: string;
    size: number;
    startX: number;
    finalY: number;
    rotation: number;
    delay: number;
}

const CATEGORY_SHAPES: { emoji: string; color: string }[] = [
    { emoji: '🎬', color: COLORS.categoryMovie },
    { emoji: '📺', color: COLORS.categorySeries },
    { emoji: '📚', color: COLORS.categoryBook },
    { emoji: '🎮', color: COLORS.categoryGame },
    { emoji: '🎵', color: COLORS.categoryMusic },
    { emoji: '🎙️', color: COLORS.categoryPodcast },
    { emoji: '✨', color: COLORS.categoryAnything },
];

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function FallingShape({ config, reducedMotion }: { config: ShapeConfig; reducedMotion: boolean }) {
    const translateY = useSharedValue(reducedMotion ? config.finalY : -120);
    const rotate = useSharedValue(reducedMotion ? config.rotation : 0);
    const opacity = useSharedValue(reducedMotion ? 0.7 : 0);

    useEffect(() => {
        if (reducedMotion) return;

        opacity.value = withDelay(config.delay, withTiming(0.7, { duration: 200 }));

        translateY.value = withDelay(
            config.delay,
            withTiming(config.finalY, {
                duration: 1200,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }, () => {
                translateY.value = withSpring(config.finalY, {
                    damping: 12,
                    stiffness: 90,
                    mass: 0.8,
                });
            }),
        );

        rotate.value = withDelay(
            config.delay,
            withTiming(config.rotation, { duration: 1200, easing: Easing.out(Easing.quad) }),
        );
    }, [config, reducedMotion, translateY, rotate, opacity]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                S.shape,
                {
                    width: config.size,
                    height: config.size * 0.7,
                    left: config.startX,
                    backgroundColor: config.color + '33',
                    borderColor: config.color + '66',
                },
                animStyle,
            ]}
        >
            <Animated.Text style={S.emoji}>{config.emoji}</Animated.Text>
        </Animated.View>
    );
}

export function WelcomeAnimation() {
    const reducedMotion = useReducedMotion();

    const shapes = useMemo<ShapeConfig[]>(() =>
        CATEGORY_SHAPES.map((cat, i) => ({
            emoji: cat.emoji,
            color: cat.color,
            size: 56 + seededRandom(i * 7) * 24,
            startX: 20 + seededRandom(i * 13) * (SCREEN_W - 100),
            finalY: SCREEN_H * 0.15 + seededRandom(i * 19) * (SCREEN_H * 0.55),
            rotation: -15 + seededRandom(i * 23) * 30,
            delay: i * 150,
        })),
    []);

    return (
        <View style={S.container} pointerEvents="none">
            {shapes.map((config, i) => (
                <FallingShape key={i} config={config} reducedMotion={reducedMotion ?? false} />
            ))}
        </View>
    );
}

const S = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shape: {
        position: 'absolute',
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 24,
    },
});
