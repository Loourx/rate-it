import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZE, getCategoryColor } from '@/lib/utils/constants';
import type { GlobalTrendingItem } from '@/lib/hooks/useGlobalTrending';

interface GlobalTrendingCardProps {
    item: GlobalTrendingItem;
    onPress: () => void;
}

export function GlobalTrendingCard({ item, onPress }: GlobalTrendingCardProps) {
    const color = getCategoryColor(item.contentType);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {item.contentImageUrl ? (
                <Image source={{ uri: item.contentImageUrl }} style={styles.poster} />
            ) : (
                <View style={[styles.poster, styles.posterFallback]}>
                    <Text style={styles.posterLetter}>{item.contentTitle.charAt(0)}</Text>
                </View>
            )}
            {/* Score badge */}
            <View style={[styles.scoreBadge, { backgroundColor: color }]}>
                <Text style={styles.scoreText}>{item.averageScore.toFixed(1)}</Text>
            </View>
            {/* Count badge */}
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.ratingCount} ★</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{item.contentTitle}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { width: 130, marginRight: SPACING.sm },
    poster: {
        width: 130,
        height: 190,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surfaceElevated,
    },
    posterFallback: { justifyContent: 'center', alignItems: 'center' },
    posterLetter: {
        fontSize: 36,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textTertiary,
    },
    scoreBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    scoreText: {
        fontSize: 11,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: '#FFF',
    },
    countBadge: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    countText: {
        fontSize: 10,
        fontFamily: 'SpaceGrotesk_500Medium',
        color: COLORS.textSecondary,
    },
    title: {
        fontSize: FONT_SIZE.bodySmall,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        marginTop: 2,
    },
});
