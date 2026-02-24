import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useProfileStats, type CategoryStat } from '@/lib/hooks/useProfileStats';
import { COLORS, FONT_SIZE } from '@/lib/utils/constants';

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
    movie: { emoji: '🎬', label: 'Cine', color: COLORS.categoryMovie },
    series: { emoji: '📺', label: 'Series', color: COLORS.categorySeries },
    book: { emoji: '📚', label: 'Libros', color: COLORS.categoryBook },
    game: { emoji: '🎮', label: 'Juegos', color: COLORS.categoryGame },
    music: { emoji: '🎵', label: 'Música', color: COLORS.categoryMusic },
    podcast: { emoji: '🎙', label: 'Podcasts', color: COLORS.categoryPodcast },
    custom: { emoji: '✨', label: 'Otros', color: COLORS.categoryAnything },
};

function SkeletonBar() {
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 800 }),
                withTiming(0.3, { duration: 800 }),
            ),
            -1,
            true,
        );
    }, [opacity]);

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <View style={styles.skeletonRow}>
            <Animated.View style={[styles.skeletonBar, style]} />
        </View>
    );
}

function CategoryRow({ stat, maxCount }: { stat: CategoryStat; maxCount: number }) {
    const meta = CATEGORY_META[stat.type] ?? { emoji: '❓', label: stat.type, color: COLORS.textTertiary };
    const barWidth = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;

    return (
        <View style={styles.categoryRow}>
            <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
            <Text style={styles.categoryLabel}>{meta.label}</Text>
            <Text style={styles.categoryCount}>{stat.count}</Text>
            <View style={styles.barTrack}>
                <View
                    style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: meta.color }]}
                />
            </View>
        </View>
    );
}

export function ProfileStats({ userId }: { userId?: string }) {
    const { data, isLoading, isError, refetch } = useProfileStats(userId);

    // Even when loading, we show counters with 0.
    const ratingCount = data?.totalRatings ?? 0;
    const followersCount = 0;
    const followingCount = 0;

    const renderCounters = () => (
        <View style={styles.countersRow}>
            <View style={styles.counterItem}>
                <Text style={styles.counterNumber}>{isLoading ? '-' : ratingCount}</Text>
                <Text style={styles.counterLabel}>Ratings</Text>
            </View>
            <View style={styles.counterItem}>
                <Text style={styles.counterNumber}>{followersCount}</Text>
                <Text style={styles.counterLabel}>Seguidores</Text>
            </View>
            <View style={styles.counterItem}>
                <Text style={styles.counterNumber}>{followingCount}</Text>
                <Text style={styles.counterLabel}>Siguiendo</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.wrapper}>
                {renderCounters()}
                <View style={styles.container}>
                    <SkeletonBar />
                    <SkeletonBar />
                    <SkeletonBar />
                </View>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.wrapper}>
                {renderCounters()}
                <View style={styles.container}>
                    <Text style={styles.errorText}>Error al cargar estadísticas</Text>
                    <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const maxCount = data && data.byCategory.length > 0 ? data.byCategory[0].count : 1;

    return (
        <View style={styles.wrapper}>
            {/* Top Counters Row (Ratings / Seguidores / Siguiendo) */}
            {renderCounters()}

            <View style={styles.container}>
                {/* Global Average */}
                <View style={styles.averageContainer}>
                    <Text style={styles.averageNumber}>
                        {ratingCount > 0 ? data!.averageScore.toFixed(1) : '—'}
                    </Text>
                    <Text style={styles.averageLabel}>Nota media</Text>
                </View>

                {/* Category Breakdown (only if there are ratings) */}
                {ratingCount > 0 && (
                    <View style={styles.categoriesContainer}>
                        {data!.byCategory.map((stat) => (
                            <CategoryRow key={stat.type} stat={stat} maxCount={maxCount} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { width: '100%' },
    countersRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.divider, backgroundColor: COLORS.surface, marginBottom: 24 },
    counterItem: { alignItems: 'center' },
    counterNumber: { fontSize: FONT_SIZE.headlineMedium, fontWeight: 'bold', color: COLORS.textPrimary },
    counterLabel: { fontSize: FONT_SIZE.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
    container: { paddingHorizontal: 24, paddingBottom: 24 },
    averageContainer: { alignItems: 'center', marginBottom: 24 },
    averageNumber: { fontSize: FONT_SIZE.headlineLarge, fontWeight: 'bold', color: COLORS.textPrimary },
    averageLabel: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, marginTop: 4 },
    categoriesContainer: { gap: 12 },
    categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    categoryEmoji: { fontSize: 16, width: 22 },
    categoryLabel: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textPrimary, width: 65 },
    categoryCount: { fontSize: FONT_SIZE.bodyMedium, fontWeight: 'bold', color: COLORS.textPrimary, width: 24, textAlign: 'right', marginRight: 4 },
    barTrack: { flex: 1, height: 12, backgroundColor: COLORS.surfaceElevated, borderRadius: 999, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 999 },
    skeletonRow: { marginBottom: 10 },
    skeletonBar: { height: 20, backgroundColor: COLORS.surfaceElevated, borderRadius: 8 },
    errorText: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.error, textAlign: 'center' },
    retryButton: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surfaceElevated, borderRadius: 999 },
    retryText: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textPrimary, fontWeight: '600' },
});
