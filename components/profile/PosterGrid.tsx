import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, RADIUS, formatScore, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';
import type { RatingHistoryItem } from '@/lib/hooks/useRatingHistory';

const SCREEN_W = Dimensions.get('window').width;
const GAP = SPACING.md; // 12px consistent gap
const COLUMNS = SCREEN_W > 400 ? 3 : 2;

interface PosterCellProps {
    item: RatingHistoryItem;
    cellWidth: number;
    cellHeight: number;
    onPress: () => void;
}

function PosterCell({ item, cellWidth, cellHeight, onPress }: PosterCellProps) {
    const categoryColor = getCategoryColor(item.contentType as ContentType);

    return (
        <TouchableOpacity
            style={[S.cellWrap, { width: cellWidth, height: cellHeight, marginBottom: GAP }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[S.posterContainer, { borderBottomColor: categoryColor }]}>
                {item.contentImageUrl ? (
                    <Image
                        source={{ uri: item.contentImageUrl }}
                        style={S.poster}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={[S.poster, S.placeholder, { backgroundColor: categoryColor + '22' }]}>
                        <Text style={S.placeholderEmoji}>
                            {CATEGORY_EMOJI[item.contentType] ?? '❓'}
                        </Text>
                    </View>
                )}

                {/* Score badge */}
                <View style={S.badge}>
                    <Text style={S.badgeText}>{formatScore(item.score)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const CATEGORY_EMOJI: Record<string, string> = {
    movie: '🎬', series: '📺', book: '📚', game: '🎮',
    music: '🎵', podcast: '🎙', anything: '✨',
};

interface PosterGridProps {
    ratings: RatingHistoryItem[];
    onPressItem: (rating: RatingHistoryItem) => void;
    onEndReached?: () => void;
    isFetchingNextPage?: boolean;
}

export function PosterGrid({ ratings, onPressItem, onEndReached, isFetchingNextPage }: PosterGridProps) {
    const [containerWidth, setContainerWidth] = useState(0);

    const totalGap = GAP * (COLUMNS - 1);
    const cellWidth = containerWidth > 0
        ? Math.floor((containerWidth - totalGap) / COLUMNS)
        : 0;
    const cellHeight = Math.round(cellWidth * 1.5); // 2:3

    const chunkedRatings = useMemo(() => {
        const chunks: RatingHistoryItem[][] = [];
        for (let i = 0; i < ratings.length; i += COLUMNS) {
            chunks.push(ratings.slice(i, i + COLUMNS));
        }
        return chunks;
    }, [ratings]);

    return (
        <View
            style={S.container}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {containerWidth > 0 && (
                <View>
                    {chunkedRatings.map((row, rowIdx) => (
                        <View key={rowIdx} style={[S.row, { gap: GAP }]}>
                            {row.map((item) => (
                                <PosterCell
                                    key={item.id}
                                    item={item}
                                    cellWidth={cellWidth}
                                    cellHeight={cellHeight}
                                    onPress={() => onPressItem(item)}
                                />
                            ))}
                            {/* Fill empty spaces in last row if needed */}
                            {row.length < COLUMNS && (
                                Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                                    <View key={`empty-${i}`} style={{ width: cellWidth }} />
                                ))
                            )}
                        </View>
                    ))}

                    {isFetchingNextPage && (
                        <View style={S.loadingFooter}>
                            <Text style={S.loadingText}>Cargando…</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    container: { width: '100%', paddingHorizontal: SPACING.xl },
    row: { flexDirection: 'row', marginBottom: GAP },
    cellWrap: { overflow: 'hidden' },
    posterContainer: {
        width: '100%',
        height: '100%',
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
        borderBottomWidth: 3,
    },
    poster: { width: '100%', height: '100%' },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surfaceElevated,
    },
    placeholderEmoji: { fontSize: 32 },
    badge: {
        position: 'absolute',
        bottom: 9,  // above the 3px border
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    badgeText: {
        ...TYPO.label,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        fontSize: 11,
    },
    loadingFooter: { paddingVertical: 16, alignItems: 'center' },
    loadingText: { ...TYPO.caption, color: COLORS.textTertiary },
});
