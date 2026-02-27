import React, { useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useBookmarks, type BookmarkRow } from '@/lib/hooks/useBookmark';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import type { ContentType } from '@/lib/types/content';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
    movie: { label: 'Cine', color: COLORS.categoryMovie },
    series: { label: 'Series', color: COLORS.categorySeries },
    book: { label: 'Libros', color: COLORS.categoryBook },
    game: { label: 'Juegos', color: COLORS.categoryGame },
    music: { label: 'Música', color: COLORS.categoryMusic },
    podcast: { label: 'Podcasts', color: COLORS.categoryPodcast },
    anything: { label: 'Anything', color: COLORS.categoryAnything },
};

/* -------------------------------------------------- */
/* Skeleton                                            */
/* -------------------------------------------------- */

function SkeletonCard() {
    const opacity = useSharedValue(0.3);
    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1,
            true,
        );
    }, [opacity]);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[styles.skeletonCard, style]}>
            <View style={styles.skeletonThumb} />
            <View style={styles.skeletonLines}>
                <View style={styles.skeletonLine1} />
                <View style={styles.skeletonLine2} />
            </View>
        </Animated.View>
    );
}

/* -------------------------------------------------- */
/* Bookmark Item                                       */
/* -------------------------------------------------- */

function BookmarkItem({ item, onPress }: { item: BookmarkRow; onPress: () => void }) {
    const meta = CATEGORY_META[item.contentType] ?? { label: item.contentType, color: COLORS.textTertiary };

    return (
        <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
            <View style={styles.thumbContainer}>
                {item.contentImageUrl ? (
                    <Image source={{ uri: item.contentImageUrl }} style={styles.thumb} resizeMode="cover" />
                ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]}>
                        <Text style={styles.thumbLetter}>{item.contentTitle.charAt(0)}</Text>
                    </View>
                )}
            </View>
            <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.contentTitle}</Text>
                <View style={styles.metaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: meta.color + '20' }]}>
                        <View style={[styles.categoryDot, { backgroundColor: meta.color }]} />
                        <Text style={[styles.categoryLabel, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatRelativeDate(item.createdAt)}</Text>
                </View>
            </View>
            <Ionicons name="bookmark" size={18} color={meta.color} />
        </TouchableOpacity>
    );
}

/* -------------------------------------------------- */
/* BookmarksList                                       */
/* -------------------------------------------------- */

export function BookmarksList({ userId }: { userId?: string }) {
    const router = useRouter();
    const {
        data, isLoading, isError, refetch,
        fetchNextPage, hasNextPage, isFetchingNextPage,
    } = useBookmarks(userId);

    const allItems = data?.pages.flatMap((p) => p.items) ?? [];

    const handlePress = useCallback(
        (item: BookmarkRow) => {
            router.push(`/content/${item.contentType}/${item.contentId}`);
        },
        [router],
    );

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    /* Loading */
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Guardados</Text>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </View>
        );
    }

    /* Error */
    if (isError) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Guardados</Text>
                <Text style={styles.errorText}>Error al cargar los guardados</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /* Empty */
    if (allItems.length === 0) {
        const isOwnProfile = !userId;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>
                    {isOwnProfile ? 'Aún no has guardado nada' : 'Este usuario no tiene guardados'}
                </Text>
                {isOwnProfile && (
                    <Text style={styles.emptySubtitle}>
                        Toca el icono de bookmark en cualquier contenido para guardarlo aquí.
                    </Text>
                )}
            </View>
        );
    }

    /* List */
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Guardados</Text>
            <FlatList
                data={allItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <BookmarkItem item={item} onPress={() => handlePress(item)} />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                scrollEnabled={false}
                ListFooterComponent={isFetchingNextPage ? <SkeletonCard /> : null}
            />
        </View>
    );
}

/* -------------------------------------------------- */
/* Styles                                              */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
    container: { paddingHorizontal: 24, paddingBottom: 24, marginTop: SPACING.xl },
    sectionTitle: { ...TYPO.h4, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 12 },
    item: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center' },
    separator: { height: 1, backgroundColor: COLORS.divider },
    thumbContainer: { marginRight: 16 },
    thumb: { width: 60, height: 90, borderRadius: 8 },
    thumbPlaceholder: { backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
    thumbLetter: { ...TYPO.h1, color: COLORS.textTertiary },
    itemBody: { flex: 1, justifyContent: 'center', marginRight: 12 },
    itemTitle: { ...TYPO.bodySmall, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    categoryDot: { width: 6, height: 6, borderRadius: 3 },
    categoryLabel: { ...TYPO.label },
    dateText: { ...TYPO.caption, color: COLORS.textSecondary },
    emptyContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'], paddingHorizontal: 24, gap: 8 },
    emptyTitle: { ...TYPO.h4, fontFamily: FONT.bold, color: COLORS.textPrimary, marginTop: 12 },
    emptySubtitle: { ...TYPO.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
    errorText: { ...TYPO.bodySmall, color: COLORS.error, textAlign: 'center' },
    retryButton: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surfaceElevated, borderRadius: 999 },
    retryText: { ...TYPO.bodySmall, fontFamily: FONT.semibold, color: COLORS.textPrimary },
    skeletonCard: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center' },
    skeletonThumb: { width: 60, height: 90, borderRadius: 8, backgroundColor: COLORS.surfaceElevated, marginRight: 16 },
    skeletonLines: { flex: 1, justifyContent: 'center', gap: 8 },
    skeletonLine1: { height: 14, width: '70%', backgroundColor: COLORS.surfaceElevated, borderRadius: 4 },
    skeletonLine2: { height: 10, width: '45%', backgroundColor: COLORS.surfaceElevated, borderRadius: 4 },
});
