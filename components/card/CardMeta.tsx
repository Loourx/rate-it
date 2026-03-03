import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

const CATEGORY_EMOJI: Record<ContentType, string> = {
    movie: '🎬',
    series: '📺',
    book: '📚',
    game: '🎮',
    music: '🎵',
    podcast: '🎙️',
    anything: '✨',
};

interface CardMetaProps {
    category: ContentType;
    badges?: string[];
    year?: string;
    extra?: string;
}

export function CardMeta({ category, badges = [], year, extra }: CardMetaProps) {
    const color = getCategoryColor(category);
    const faded = getCategoryFadedColor(category);
    const emoji = CATEGORY_EMOJI[category];

    return (
        <View style={S.wrapper}>
            {/* Category badge */}
            <View style={[S.badge, { backgroundColor: faded }]}>
                <Text style={S.emoji}>{emoji}</Text>
                <Text style={[S.badgeText, { color }]}>{category}</Text>
            </View>

            {/* Year */}
            {year ? <Text style={S.secondary}>{year}</Text> : null}

            {/* Extra info */}
            {extra ? <Text style={S.secondary}>{extra}</Text> : null}

            {/* Genre badges */}
            {badges.map((badge) => (
                <View key={badge} style={[S.genreBadge, { backgroundColor: faded }]}>
                    <Text style={[S.genreText, { color }]}>{badge}</Text>
                </View>
            ))}
        </View>
    );
}

const S = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        gap: 4,
    },
    emoji: {
        fontSize: 10,
    },
    badgeText: {
        ...TYPO.label,
        textTransform: 'capitalize',
    },
    secondary: {
        ...TYPO.caption,
        color: COLORS.textTertiary,
    },
    genreBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    genreText: {
        ...TYPO.label,
    },
});
