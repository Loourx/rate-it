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

/* -------------------------------------------------- */
/* Compound skeleton for Feed cards                    */
/* -------------------------------------------------- */

interface FeedSkeletonListProps {
    count?: number;
}

/* -------------------------------------------------- */
/* Compound skeleton for Notification items            */
/* -------------------------------------------------- */

interface NotificationSkeletonListProps {
    count?: number;
}

export function NotificationSkeletonList({ count = 8 }: NotificationSkeletonListProps) {
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

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className="px-4 pt-4">
            {Array.from({ length: count }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={animatedStyle}
                    className="flex-row items-center py-3 mb-2"
                >
                    <View className="w-12 h-12 rounded-full bg-surface-elevated" />
                    <View className="flex-1 ml-3">
                        <View className="h-4 bg-surface-elevated rounded w-4/5 mb-2" />
                        <View className="h-3 bg-surface-elevated rounded w-1/3" />
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}

export function FeedSkeletonList({ count = 5 }: FeedSkeletonListProps) {
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

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className="px-4 pt-4">
            {Array.from({ length: count }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={animatedStyle}
                    className="bg-surface rounded-2xl p-4 mb-3"
                >
                    {/* Avatar + username */}
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 rounded-full bg-surface-elevated" />
                        <View className="ml-3 flex-1">
                            <View className="h-4 bg-surface-elevated rounded w-32 mb-2" />
                            <View className="h-3 bg-surface-elevated rounded w-20" />
                        </View>
                    </View>
                    {/* Content */}
                    <View className="flex-row mb-3">
                        <View className="w-16 h-24 rounded-lg bg-surface-elevated" />
                        <View className="flex-1 ml-3">
                            <View className="h-4 bg-surface-elevated rounded mb-2" />
                            <View className="h-4 bg-surface-elevated rounded w-3/4 mb-3" />
                            <View className="h-2 bg-surface-elevated rounded-full" />
                        </View>
                    </View>
                    {/* Review */}
                    <View className="h-3 bg-surface-elevated rounded mb-1" />
                    <View className="h-3 bg-surface-elevated rounded w-5/6" />
                </Animated.View>
            ))}
        </View>
    );
}
