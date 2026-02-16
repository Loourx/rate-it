import React from 'react';
import { Text, Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/lib/utils/constants'; // Backup if taiwind fails, but we use classes

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string; // Additional classes
    icon?: React.ReactNode;
}

export function Button({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    icon,
}: ButtonProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-surface-elevated'; // We might want dynamic color here depending on context, but guidelines say Primary = Filled. Using Surface Elevated as neutral primary or we can pass a specific color class
            case 'secondary':
                return 'bg-transparent border border-divider';
            case 'ghost':
                return 'bg-transparent';
            case 'destructive':
                return 'bg-error/10'; // 10% opacity error
            default:
                return 'bg-surface-elevated';
        }
    };

    const getTextClasses = () => {
        switch (variant) {
            case 'primary':
                return 'text-primary font-bold';
            case 'secondary':
                return 'text-primary font-medium';
            case 'ghost':
                return 'text-secondary font-medium';
            case 'destructive':
                return 'text-error font-bold';
            default:
                return 'text-primary';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 min-h-[32px]';
            case 'lg':
                return 'px-6 py-4 min-h-[56px]';
            case 'md':
            default:
                return 'px-5 py-3 min-h-[44px]'; // Standard target
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePressIn = () => {
        if (disabled || isLoading) return;
        scale.value = withSpring(0.96);
        opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
        if (disabled || isLoading) return;
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 100 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
            className={`rounded-xl flex-row items-center justify-center ${getVariantClasses()} ${getSizeClasses()} ${disabled ? 'opacity-50' : ''
                } ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : COLORS.textSecondary} />
            ) : (
                <>
                    {icon && <React.Fragment>{icon}</React.Fragment>}
                    <Text className={`${getTextClasses()} text-center ${icon ? 'ml-2' : ''} text-base`}>
                        {label}
                    </Text>
                </>
            )}
        </AnimatedPressable>
    );
}
