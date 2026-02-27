/**
 * ConfettiCelebration
 *
 * Full-screen confetti overlay using react-native-reanimated.
 * 40 particles fall, rotate, and fade over 3 seconds then call onFinish.
 * Respects the system reduce-motion preference via useReducedMotion.
 *
 * Mount as a sibling to ScrollView with pointerEvents="none" so it doesn't
 * block interaction.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    useReducedMotion,
} from 'react-native-reanimated';
import { COLORS } from '@/lib/utils/constants';

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 40;
const FALL_DURATION  = 3000; // ms total window

const PALETTE = [
    COLORS.categoryMovie,    // #FF595E coral
    COLORS.categorySeries,   // #8939F7 purple
    COLORS.categoryBook,     // #8AC926 green
    COLORS.categoryGame,     // #1982C4 blue
    COLORS.categoryMusic,    // #FFCA3A yellow
    COLORS.categoryPodcast,  // #5BC0EB sky
    '#FF9F1C',               // orange accent (replaces near-white anything)
];

// ─── Particle ─────────────────────────────────────────────────────────────────

interface ParticleConfig {
    x: number;
    size: number;
    color: string;
    isRect: boolean;
    delay: number;        // JS-side stagger in ms
    innerDuration: number; // actual fall duration after delay
    endRotation: number;  // deg
}

function useParticleConfig(screenWidth: number): ParticleConfig {
    return useMemo(() => {
        const delay = Math.random() * 700;
        return {
            x: Math.random() * screenWidth,
            size: Math.random() * 8 + 6,           // 6–14 px
            color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
            isRect: Math.random() > 0.5,
            delay,
            innerDuration: FALL_DURATION - delay,
            endRotation: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally stable per mount
}

function Particle({
    screenWidth,
    screenHeight,
}: {
    screenWidth: number;
    screenHeight: number;
}) {
    const cfg = useParticleConfig(screenWidth);

    const translateY = useSharedValue(-cfg.size);
    const rotate     = useSharedValue(0);
    const opacity    = useSharedValue(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Initial opacity burst
        opacity.value = 1;

        timerRef.current = setTimeout(() => {
            translateY.value = withTiming(screenHeight + cfg.size, {
                duration: cfg.innerDuration,
            });
            rotate.value = withTiming(cfg.endRotation, {
                duration: cfg.innerDuration,
            });
            // Fade starts at 60% of the fall
            fadeRef.current = setTimeout(() => {
                opacity.value = withTiming(0, {
                    duration: cfg.innerDuration * 0.4,
                });
            }, cfg.innerDuration * 0.6);
        }, cfg.delay);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (fadeRef.current)  clearTimeout(fadeRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

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
                {
                    position: 'absolute',
                    top: 0,
                    left: cfg.x,
                    width:  cfg.isRect ? cfg.size * 1.6 : cfg.size,
                    height: cfg.size,
                    backgroundColor: cfg.color,
                    borderRadius: cfg.isRect ? 3 : cfg.size / 2,
                },
                animStyle,
            ]}
        />
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ConfettiCelebrationProps {
    onFinish: () => void;
}

export function ConfettiCelebration({ onFinish }: ConfettiCelebrationProps) {
    const { width, height } = useWindowDimensions();
    const reducedMotion = useReducedMotion();
    const onFinishRef = useRef(onFinish);
    onFinishRef.current = onFinish;

    useEffect(() => {
        // Dismiss after FALL_DURATION (or immediately for reduced motion)
        const delay = reducedMotion ? 0 : FALL_DURATION;
        const t = setTimeout(() => onFinishRef.current(), delay);
        return () => clearTimeout(t);
    }, [reducedMotion]);

    // Accessibility: skip animation
    if (reducedMotion) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
        >
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
                <Particle key={i} screenWidth={width} screenHeight={height} />
            ))}
        </Animated.View>
    );
}
