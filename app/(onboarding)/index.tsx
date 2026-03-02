import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { OnboardingSlide } from '@/components/auth/OnboardingSlide';
import { useOnboardingFlag } from '@/lib/hooks/useOnboardingFlag';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    isFirst: boolean;
}

const SLIDES: SlideData[] = [
    {
        id: '1',
        title: 'Todo tu consumo cultural\nen un lugar',
        subtitle: 'Películas, series, libros, juegos, música y más.\nTodo en un mismo sitio.',
        emoji: '✨',
        isFirst: true,
    },
    {
        id: '2',
        title: 'Comparte con\ntus amigos',
        subtitle: 'Sigue a quienes te inspiran. Descubre qué están viendo, leyendo y jugando.',
        emoji: '👥',
        isFirst: false,
    },
    {
        id: '3',
        title: 'Descubre qué ver,\nleer y jugar',
        subtitle: 'Tu próxima obsesión está a un deslizamiento de distancia.',
        emoji: '🔍',
        isFirst: false,
    },
];

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const { markCompleted } = useOnboardingFlag();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<SlideData>>(null);

    const handleComplete = useCallback(() => {
        markCompleted();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace('/(auth)/login');
    }, [markCompleted]);

    const handleSkip = useCallback(() => {
        markCompleted();
        router.replace('/(auth)/login');
    }, [markCompleted]);

    const handleNext = useCallback(() => {
        const next = currentIndex + 1;
        if (next < SLIDES.length) {
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
            setCurrentIndex(next);
        }
    }, [currentIndex]);

    const handleMomentumScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentIndex(index);
    }, []);

    const renderItem = useCallback(({ item }: ListRenderItemInfo<SlideData>) => (
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <OnboardingSlide
                title={item.title}
                subtitle={item.subtitle}
                emoji={item.emoji}
                isFirst={item.isFirst}
            />
        </View>
    ), []);

    const isLast = currentIndex === SLIDES.length - 1;

    return (
        <View style={[styles.root, { paddingBottom: insets.bottom + SPACING.base }]}>
            {/* Skip button */}
            {!isLast && (
                <Pressable
                    onPress={handleSkip}
                    style={[styles.skip, { top: insets.top + SPACING.base }]}
                    hitSlop={12}
                >
                    <Text style={styles.skipText}>Saltar</Text>
                </Pressable>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                getItemLayout={(_data, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                style={styles.flatList}
            />

            {/* Bottom controls */}
            <View style={styles.bottom}>
                {/* Dot indicator */}
                <View style={styles.dots}>
                    {SLIDES.map((_, i) => (
                        <DotIndicator key={i} active={i === currentIndex} />
                    ))}
                </View>

                {/* CTA button */}
                {isLast ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleComplete} activeOpacity={0.85}>
                        <Text style={styles.primaryButtonText}>Empezar a valorar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.85}>
                        <Text style={styles.primaryButtonText}>Siguiente</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

function DotIndicator({ active }: { active: boolean }) {
    const width = useSharedValue(active ? 20 : 8);
    const opacity = useSharedValue(active ? 1 : 0.4);

    React.useEffect(() => {
        width.value = withSpring(active ? 20 : 8, { damping: 15, stiffness: 200, reduceMotion: ReduceMotion.System });
        opacity.value = withSpring(active ? 1 : 0.4, { damping: 15, stiffness: 200, reduceMotion: ReduceMotion.System });
    }, [active, width, opacity]);

    const style = useAnimatedStyle(() => ({
        width: width.value,
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.dot, style]} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    skip: {
        position: 'absolute',
        right: SPACING.base,
        zIndex: 10,
    },
    skipText: {
        ...TYPO.body,
        color: COLORS.textSecondary,
    },
    flatList: {
        flex: 1,
    },
    bottom: {
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.lg,
        gap: SPACING.lg,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.link,
    },
    primaryButton: {
        backgroundColor: COLORS.link,
        borderRadius: SPACING.xl,
        paddingVertical: SPACING.base,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontFamily: FONT.bold,
        fontSize: 16,
        color: COLORS.background,
    },
});
