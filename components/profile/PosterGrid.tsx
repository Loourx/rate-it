import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, formatScore } from '@/lib/utils/constants';
import type { RatingHistoryItem } from '@/lib/hooks/useRatingHistory';

const COLUMNS = 3;

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
    movie:    { emoji: '🎬', color: COLORS.categoryMovie },
    series:   { emoji: '📺', color: COLORS.categorySeries },
    book:     { emoji: '📚', color: COLORS.categoryBook },
    game:     { emoji: '🎮', color: COLORS.categoryGame },
    music:    { emoji: '🎵', color: COLORS.categoryMusic },
    podcast:  { emoji: '🎙', color: COLORS.categoryPodcast },
    anything: { emoji: '✨', color: COLORS.categoryAnything },
};

interface PosterCellProps {
    item: RatingHistoryItem;
    cellWidth: number;
    cellHeight: number;
    onPress: () => void;
}

function PosterCell({ item, cellWidth, cellHeight, onPress }: PosterCellProps) {
    const meta = CATEGORY_META[item.contentType] ?? { emoji: '❓', color: COLORS.textTertiary };

    return (
        <TouchableOpacity
            style={{ width: cellWidth, height: cellHeight }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {item.contentImageUrl ? (
                <Image
                    source={{ uri: item.contentImageUrl }}
                    style={styles.poster}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
            ) : (
                <View style={[styles.poster, styles.placeholder, { backgroundColor: meta.color + '22' }]}>
                    <Text style={styles.placeholderEmoji}>{meta.emoji}</Text>
                </View>
            )}

            {/* Score badge */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatScore(item.score)}</Text>
            </View>
        </TouchableOpacity>
    );
}

interface PosterGridProps {
    ratings: RatingHistoryItem[];
    onPressItem: (rating: RatingHistoryItem) => void;
    onEndReached?: () => void;
    isFetchingNextPage?: boolean;
}

export function PosterGrid({ ratings, onPressItem, onEndReached, isFetchingNextPage }: PosterGridProps) {
    const [containerWidth, setContainerWidth] = useState(0);

    // Integer pixels to eliminate sub-pixel gaps between cells on all densities.
    const cellWidth = containerWidth > 0 ? Math.floor(containerWidth / COLUMNS) : 0;
    const cellHeight = Math.round(cellWidth * 1.5); // 2:3 poster ratio

    const getItemLayout = useCallback(
        (_: ArrayLike<RatingHistoryItem> | null | undefined, index: number) => ({
            length: cellHeight,
            offset: cellHeight * Math.floor(index / COLUMNS),
            index,
        }),
        [cellHeight],
    );

    return (
        <View
            style={styles.container}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {containerWidth > 0 && (
                <FlatList
                    data={ratings}
                    keyExtractor={(item) => item.id}
                    numColumns={COLUMNS}
                    renderItem={({ item }) => (
                        <PosterCell
                            item={item}
                            cellWidth={cellWidth}
                            cellHeight={cellHeight}
                            onPress={() => onPressItem(item)}
                        />
                    )}
                    getItemLayout={getItemLayout}
                    scrollEnabled={false}
                    removeClippedSubviews
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View style={styles.loadingFooter}>
                                <Text style={styles.loadingText}>Cargando…</Text>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    loadingFooter: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surfaceElevated,
    },
    placeholderEmoji: {
        fontSize: 32,
    },
    badge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        lineHeight: 15,
    },
});
