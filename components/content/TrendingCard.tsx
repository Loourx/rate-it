import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZE, getCategoryColor } from '@/lib/utils/constants';
import type { TrendingFriendItem } from '@/lib/hooks/useFriendsTrending';

interface TrendingCardProps {
    item: TrendingFriendItem;
    onPress: () => void;
}

export function TrendingCard({ item, onPress }: TrendingCardProps) {
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
                <Text style={styles.scoreText}>{item.score.toFixed(1)}</Text>
            </View>
            {/* Author row */}
            <View style={styles.author}>
                <Text style={styles.authorName} numberOfLines={1}>
                    @{item.authorUsername}
                </Text>
                {item.likesCount > 0 && (
                    <View style={styles.likes}>
                        <Ionicons name="heart" size={11} color={COLORS.error} />
                        <Text style={styles.likesText}>{item.likesCount}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.title} numberOfLines={2}>
                {item.contentTitle}
            </Text>
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
    author: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    authorName: {
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textSecondary,
        flex: 1,
    },
    likes: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    likesText: { fontSize: 10, color: COLORS.textSecondary },
    title: {
        fontSize: FONT_SIZE.bodySmall,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        marginTop: 2,
    },
});
