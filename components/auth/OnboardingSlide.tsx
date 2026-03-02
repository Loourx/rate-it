import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    ReduceMotion,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { WelcomeAnimation } from '@/components/auth/WelcomeAnimation';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

interface OnboardingSlidePros {
    title: string;
    subtitle: string;
    emoji: string;
    isFirst: boolean;
}

export function OnboardingSlide({ title, subtitle, emoji, isFirst }: OnboardingSlidePros) {
    const reducedMotion = useReducedMotion();
    const emojiScale = useSharedValue(0.7);

    useEffect(() => {
        if (!isFirst) {
            emojiScale.value = reducedMotion
                ? withSpring(1, { damping: 15 })
                : withSpring(1.08, { damping: 8, stiffness: 200 }, () => {
                    emojiScale.value = withSpring(1, { damping: 12, stiffness: 180 });
                });
        }
    }, [isFirst, reducedMotion, emojiScale]);

    const emojiStyle = useAnimatedStyle(() => ({
        transform: [{ scale: emojiScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Background layer */}
            {isFirst ? (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <WelcomeAnimation />
                </View>
            ) : null}

            {/* Bottom gradient to ensure text readability over animation */}
            <LinearGradient
                colors={['transparent', COLORS.background]}
                style={styles.gradient}
                pointerEvents="none"
            />

            {/* Content */}
            <View style={styles.content}>
                {!isFirst && (
                    <Animated.Text
                        style={[styles.emoji, emojiStyle]}
                        entering={FadeInDown.duration(400).reduceMotion(ReduceMotion.System)}
                    >
                        {emoji}
                    </Animated.Text>
                )}

                <Animated.View
                    entering={FadeInDown.delay(isFirst ? 200 : 300).duration(400).reduceMotion(ReduceMotion.System)}
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'flex-end',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 320,
    },
    content: {
        paddingHorizontal: SPACING['2xl'] ?? 32,
        paddingBottom: SPACING.xl ?? 24,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 72,
        marginBottom: SPACING.lg ?? 20,
        textAlign: 'center',
    },
    title: {
        fontFamily: FONT.bold,
        fontSize: 28,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm ?? 8,
        lineHeight: 36,
    },
    subtitle: {
        ...TYPO.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
