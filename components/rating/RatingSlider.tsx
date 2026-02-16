import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    withTiming,
    useDerivedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/lib/utils/constants';

interface RatingSliderProps {
    initialRating?: number;
    onRatingChange?: (rating: number) => void;
    onRatingComplete?: (rating: number) => void;
    readOnly?: boolean;
    color?: string; // Category color
    size?: 'sm' | 'lg'; // sm for cards, lg for rating screen
}

export function RatingSlider({
    initialRating = 0,
    onRatingChange,
    onRatingComplete,
    readOnly = false,
    color = COLORS.categoryMovie, // Default
    size = 'lg',
}: RatingSliderProps) {
    const [currentRating, setCurrentRating] = useState(initialRating);

    // Display width based on container is tricky without onLayout, 
    // but for 'lg' we assume full width minus padding, for 'sm' we assume fixed mini width.
    // We'll use a ref-based approach or just simple percentage for display.
    // For interactive, we need layout measurements.

    const [width, setWidth] = useState(0);
    const progress = useSharedValue(initialRating / 10);
    const isPressed = useSharedValue(false);

    useEffect(() => {
        progress.value = withSpring(initialRating / 10, { damping: 15 });
        setCurrentRating(initialRating);
    }, [initialRating]);

    // Haptics trigger
    const triggerHaptic = () => {
        Haptics.selectionAsync();
    };

    const pan = Gesture.Pan()
        .enabled(!readOnly)
        .onBegin((e) => {
            isPressed.value = true;
        })
        .onUpdate((e) => {
            if (width === 0) return;

            // Calculate new progress based on x position
            let newProgress = e.x / width;
            // Clamp 0-1
            newProgress = Math.max(0, Math.min(1, newProgress));
            progress.value = newProgress;

            // Calculate rating 1-10 with decimal
            const rawRating = newProgress * 10;
            // Snap to 0.1
            const snappedRating = Math.round(rawRating * 10) / 10;

            if (snappedRating !== currentRating) {
                runOnJS(setCurrentRating)(snappedRating);
                runOnJS(triggerHaptic)();
                if (onRatingChange) {
                    runOnJS(onRatingChange)(snappedRating);
                }
            }
        })
        .onFinalize(() => {
            isPressed.value = false;
            if (onRatingComplete) {
                runOnJS(onRatingComplete)(currentRating);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`,
            backgroundColor: color,
        };
    });

    const numberStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isPressed.value ? withSpring(1.2) : withSpring(1) }]
        }
    })

    // Mini read-only version
    if (size === 'sm') {
        return (
            <View className="flex-row items-center gap-2">
                <View className="h-2 flex-1 bg-surface-elevated rounded-full overflow-hidden">
                    <View
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, initialRating * 10))}%`, backgroundColor: color }}
                    />
                </View>
                <Text className="text-white font-bold text-xs w-6 text-right">{initialRating.toFixed(1)}</Text>
            </View>
        );
    }

    // Interactive Large version
    return (
        <View className="w-full">
            <View className="flex-row justify-between items-end mb-2">
                <Text className="text-secondary font-medium">Desliza para puntuar</Text>
                <Animated.Text style={[numberStyle, { color }]} className="text-4xl font-bold">
                    {currentRating.toFixed(1)}
                </Animated.Text>
            </View>

            <GestureDetector gesture={pan}>
                <View
                    className="h-12 bg-surface-elevated rounded-full overflow-hidden justify-center"
                    onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
                >
                    <Animated.View
                        style={[
                            animatedStyle,
                            { height: '100%', borderRadius: 999 }
                        ]}
                    />
                </View>
            </GestureDetector>
        </View>
    );
}
