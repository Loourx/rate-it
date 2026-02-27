import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, formatScore, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

interface CardRatingProps {
    score: number;
    category: ContentType;
    size?: 'default' | 'compact';
}

export function CardRating({ score, category, size = 'default' }: CardRatingProps) {
    const color = getCategoryColor(category);
    const pct = (score / 10) * 100;
    const isCompact = size === 'compact';

    return (
        <View style={S.wrapper}>
            <Text style={[isCompact ? S.scoreCompact : S.score, { color }]}>
                {formatScore(score)}
            </Text>
            <View style={S.barTrack}>
                <View
                    style={[S.barFill, { width: `${pct}%` as `${number}%`, backgroundColor: color }]}
                />
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    score: {
        ...TYPO.h3,
        minWidth: 32,
    },
    scoreCompact: {
        ...TYPO.bodySmall,
        fontFamily: FONT.bold,
        minWidth: 24,
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: RADIUS.full,
    },
});
