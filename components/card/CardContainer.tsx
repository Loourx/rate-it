import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '@/lib/utils/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardContainerProps {
    children: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    accentColor?: string;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export function CardContainer({
    children,
    onPress,
    onLongPress,
    accentColor,
    style,
    disabled,
}: CardContainerProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(0.85, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                {
                    backgroundColor: COLORS.surface,
                    borderRadius: RADIUS.lg,
                    padding: 16,
                    overflow: 'hidden' as const,
                    borderWidth: accentColor ? 1 : 0,
                    borderColor: accentColor ?? 'transparent',
                },
                animatedStyle,
                style,
            ]}
        >
            {children}
        </AnimatedPressable>
    );
}
