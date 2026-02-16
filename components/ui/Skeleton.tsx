import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { COLORS } from '@/lib/utils/constants';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    className?: string; // tailwind classes
    style?: any;
}

export function Skeleton({ width, height, borderRadius = 8, className, style }: SkeletonProps) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View
            className={`bg-surface-elevated ${className}`}
            style={[
                {
                    width: width,
                    height: height,
                    borderRadius: borderRadius,
                },
                animatedStyle,
                style
            ]}
        />
    );
}
