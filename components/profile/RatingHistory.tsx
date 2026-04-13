import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRatingHistory, type RatingHistoryItem } from '@/lib/hooks/useRatingHistory';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';
import { COLORS, SPACING, formatScore } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import { PosterGrid } from '@/components/profile/PosterGrid';
import { ShareableRatingCard } from '@/components/sharing/ShareableRatingCard';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
    movie: { label: 'Cine', color: COLORS.categoryMovie },
    series: { label: 'Series', color: COLORS.categorySeries },
    book: { label: 'Libros', color: COLORS.categoryBook },
    game: { label: 'Juegos', color: COLORS.categoryGame },
    music: { label: 'Música', color: COLORS.categoryMusic },
    /* MVP_DISABLED: podcast: { label: 'Podcasts', color: COLORS.categoryPodcast }, */
    /* MVP_DISABLED: anything: { label: 'Anything', color: COLORS.categoryAnything }, */
};

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

function HistoryItem({ item, onPress, onShare, isSharingThis }: {
    item: RatingHistoryItem;
    onPress: () => void;
    onShare?: () => void;
    isSharingThis?: boolean;
}) {
    const meta = CATEGORY_META[item.contentType] ?? { label: item.contentType, color: COLORS.textTertiary };

    return (
        <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
            <View style={styles.thumbContainer}>
                {item.contentImageUrl ? (
                    <Image source={item.contentImageUrl} style={styles.thumb} contentFit="cover" cachePolicy="memory-disk" />
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
            <View style={styles.ratingNumberContainer}>
                <Text style={[styles.ratingNumber, { color: meta.color }]}>
                    {formatScore(item.score)}
                </Text>
            </View>
            {Platform.OS !== 'web' && onShare !== undefined && (
                /* WEB_DISABLED — share feature not available on web */
                <TouchableOpacity
                    onPress={onShare}
                    disabled={isSharingThis}
                    style={styles.shareIconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    {isSharingThis ? (
                        <ActivityIndicator size="small" color={COLORS.textTertiary} />
                    ) : (
                        <Ionicons name="share-outline" size={16} color={COLORS.textTertiary} />
                    )}
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

export function RatingHistory({ userId, username }: { userId?: string; username?: string }) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [shareItem, setShareItem] = useState<RatingHistoryItem | null>(null);
    const [isSharingItem, setIsSharingItem] = useState(false);
    const ratingCardRef = useRef<View | null>(null);
    const pendingCapture = useRef(false);
    // Get current user id from auth store
    const { session } = require('@/lib/hooks/useAuth').useAuth();
    const currentUserId = session?.user?.id;
    const {
        data, isLoading, isError, refetch,
        fetchNextPage, hasNextPage, isFetchingNextPage,
    } = useRatingHistory(userId);

    const allItems = data?.pages.flatMap((p) => p.items) ?? [];

    const handlePress = useCallback(
        (item: RatingHistoryItem) => {
            router.push(`/content/${item.contentType}/${item.contentId}`);
        },
        [router],
    );

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ── Share individual rating ────────────────────────────────────────────
    const SHAREABLE_TYPES = new Set(['movie', 'series', 'book', 'game', 'music']);

    const handleShareItem = useCallback((item: RatingHistoryItem) => {
        router.push(`/share/${item.contentType}/${item.contentId}`);
    }, [router]);

    useEffect(() => {
        if (!shareItem || !pendingCapture.current) return;
        pendingCapture.current = false;
        const timer = setTimeout(async () => {
            try {
                const available = await Sharing.isAvailableAsync();
                if (available && ratingCardRef.current) {
                    const uri = await captureRef(ratingCardRef, { format: 'png', quality: 1.0 });
                    await Sharing.shareAsync(uri, {
                        mimeType: 'image/png',
                        dialogTitle: `Mi valoración de ${shareItem.contentTitle} en Rate-it`,
                    });
                }
            } catch {
                // silently ignore share errors
            } finally {
                setIsSharingItem(false);
                setShareItem(null);
            }
        }, 120);
        return () => clearTimeout(timer);
    }, [shareItem]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Recientes</Text>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Recientes</Text>
                <Text style={styles.errorText}>Error al cargar el historial</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (allItems.length === 0) {
        const isOwnProfile = !userId;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>
                    {isOwnProfile ? 'Tu perfil crece con cada opinión' : 'Aún no ha puntuado nada'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {isOwnProfile
                        ? 'Puntuú tu primera película o serie y verás cómo cobra vida.'
                        : 'Dale tiempo... seguro que pronto comparte su primera opinión.'}
                </Text>
                {isOwnProfile && (
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/search')}
                        style={styles.ctaButton}
                    >
                        <Ionicons name="search" size={18} color={COLORS.textPrimary} />
                        <Text style={styles.ctaText}>Puntuar algo</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.container, viewMode === 'grid' && styles.containerGrid]}>
            <View style={[styles.sectionHeader, viewMode === 'grid' && styles.sectionHeaderPadded]}>
                <Text style={styles.sectionTitle}>Recientes</Text>
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        onPress={() => setViewMode('list')}
                        style={styles.toggleButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="list-outline"
                            size={22}
                            color={viewMode === 'list' ? COLORS.link : COLORS.textTertiary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewMode('grid')}
                        style={styles.toggleButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="grid-outline"
                            size={22}
                            color={viewMode === 'grid' ? COLORS.link : COLORS.textTertiary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {viewMode === 'grid' ? (
                <PosterGrid
                    ratings={allItems}
                    onPressItem={handlePress}
                    onEndReached={handleEndReached}
                    isFetchingNextPage={isFetchingNextPage}
                />
            ) : (
                <View>
                    {allItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <HistoryItem
                                item={item}
                                onPress={() => handlePress(item)}
                                onShare={currentUserId === item.userId && SHAREABLE_TYPES.has(item.contentType)
                                    ? () => handleShareItem(item)
                                    : undefined
                                }
                                isSharingThis={isSharingItem && shareItem?.id === item.id}
                            />
                            {index < allItems.length - 1 && <View style={styles.separator} />}
                        </React.Fragment>
                    ))}
                    {isFetchingNextPage && <SkeletonCard />}

                    {hasNextPage && !isFetchingNextPage && (
                        <TouchableOpacity
                            onPress={() => fetchNextPage()}
                            style={styles.loadMoreBtn}
                        >
                            <Text style={styles.loadMoreText}>Cargar más</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Off-screen card for image capture — not tappable */}
            {shareItem !== null && SHAREABLE_TYPES.has(shareItem.contentType) && (
                <View style={styles.offscreen} pointerEvents="none">
                    <View ref={ratingCardRef} collapsable={false}>
                        <ShareableRatingCard
                            contentType={shareItem.contentType as 'movie' | 'series' | 'book' | 'game' | 'music'}
                            title={shareItem.contentTitle}
                            posterUrl={shareItem.contentImageUrl}
                            score={shareItem.score}
                            reviewText={null}
                            username={username ?? ''}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 24, paddingBottom: 24 },
    containerGrid: { paddingHorizontal: 0 },
    sectionHeaderPadded: { paddingHorizontal: 24 },
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
    ratingNumberContainer: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 44 },
    ratingNumber: { ...TYPO.h3 },
    shareIconBtn: { padding: 4, marginLeft: 8 },
    offscreen: { position: 'absolute', left: -9999, top: 0 },
    emptyContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'], paddingHorizontal: 24, gap: 8 },
    emptyTitle: { ...TYPO.h4, fontFamily: FONT.bold, color: COLORS.textPrimary, marginTop: 12 },
    emptySubtitle: { ...TYPO.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
    ctaButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.surfaceElevated, borderRadius: 999 },
    ctaText: { ...TYPO.bodySmall, fontFamily: FONT.semibold, color: COLORS.textPrimary },
    errorText: { ...TYPO.bodySmall, color: COLORS.error, textAlign: 'center' },
    retryButton: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surfaceElevated, borderRadius: 999 },
    retryText: { ...TYPO.bodySmall, fontFamily: FONT.semibold, color: COLORS.textPrimary },
    skeletonCard: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center' },
    skeletonThumb: { width: 60, height: 90, borderRadius: 8, backgroundColor: COLORS.surfaceElevated, marginRight: 16 },
    skeletonLines: { flex: 1, justifyContent: 'center', gap: 8 },
    skeletonLine1: { height: 14, width: '70%', backgroundColor: COLORS.surfaceElevated, borderRadius: 4 },
    skeletonLine2: { height: 10, width: '45%', backgroundColor: COLORS.surfaceElevated, borderRadius: 4 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleRow: { flexDirection: 'row', gap: 4 },
    toggleButton: { padding: 4 },
    loadMoreBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: 12,
    },
    loadMoreText: {
        ...TYPO.bodySmall,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
    },
});
