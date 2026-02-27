import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryColor, COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { SuggestedItem } from '@/lib/hooks/useSuggestedContent';

export function SuggestionCard({
    item,
    onPress,
}: {
    item: SuggestedItem;
    onPress: () => void;
}) {
    const color = getCategoryColor(item.contentType);

    return (
        <TouchableOpacity style={S.card} onPress={onPress} activeOpacity={0.8}>
            {item.contentImageUrl ? (
                <Image source={{ uri: item.contentImageUrl }} style={S.poster} />
            ) : (
                <View style={[S.poster, S.posterFallback]}>
                    <Text style={S.posterLetter}>{item.contentTitle.charAt(0)}</Text>
                </View>
            )}

            {/* Score badge */}
            <View style={[S.scoreBadge, { backgroundColor: color }]}>
                <Text style={S.scoreText}>{item.bestScore.toFixed(1)}</Text>
            </View>

            {/* Friend count badge — solo si > 1 */}
            {item.friendCount > 1 && (
                <View style={S.friendBadge}>
                    <Ionicons name="people" size={10} color={COLORS.textSecondary} />
                    <Text style={S.friendText}>{item.friendCount}</Text>
                </View>
            )}

            <Text style={S.title} numberOfLines={2}>{item.contentTitle}</Text>
        </TouchableOpacity>
    );
}

const S = StyleSheet.create({
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
        fontFamily: FONT.bold,
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
    scoreText: { fontSize: 11, fontFamily: FONT.bold, color: '#FFF' },
    friendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 5,
    },
    friendText: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontFamily: FONT.medium,
    },
    title: {
        ...TYPO.caption,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },
});
