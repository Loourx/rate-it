import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

/** Skeleton placeholder that mimics the final ContentDetail layout. */
export function ContentDetailSkeleton() {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
        );
    }, []);

    const shimmer = useAnimatedStyle(() => ({ opacity: opacity.value }));

    const Box = ({ className = '', style }: { className?: string; style?: object }) => (
        <Animated.View className={`bg-surface-elevated ${className}`} style={[shimmer, style]} />
    );

    return (
        <View className="flex-1 bg-background">
            {/* Hero image */}
            <Box className="w-full" style={{ height: 320, borderRadius: 0 }} />

            <View className="px-4 -mt-10">
                {/* Title */}
                <Box className="rounded-lg mb-3" style={{ width: '75%', height: 28 }} />
                <Box className="rounded-lg mb-4" style={{ width: '50%', height: 20 }} />

                {/* Badges row */}
                <View className="flex-row gap-2 mb-4">
                    <Box className="rounded-full" style={{ width: 80, height: 28 }} />
                    <Box className="rounded-full" style={{ width: 100, height: 28 }} />
                    <Box className="rounded-full" style={{ width: 70, height: 28 }} />
                </View>

                {/* Genre pills */}
                <View className="flex-row gap-2 mb-6">
                    <Box className="rounded-full" style={{ width: 64, height: 26 }} />
                    <Box className="rounded-full" style={{ width: 72, height: 26 }} />
                    <Box className="rounded-full" style={{ width: 56, height: 26 }} />
                </View>

                {/* Rate button */}
                <Box className="rounded-xl mb-6" style={{ height: 48 }} />

                {/* Synopsis lines */}
                <Box className="rounded-lg mb-2" style={{ width: '40%', height: 18 }} />
                <Box className="rounded mb-2" style={{ height: 14 }} />
                <Box className="rounded mb-2" style={{ height: 14 }} />
                <Box className="rounded mb-2" style={{ width: '85%', height: 14 }} />
                <Box className="rounded" style={{ width: '60%', height: 14 }} />
            </View>
        </View>
    );
}
