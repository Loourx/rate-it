import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { ContentType } from '@/lib/types/content';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { useCommunityScore } from '@/lib/hooks/useCommunityScore';

interface CommunityScoreProps {
    contentId: string;
    contentType: ContentType;
}

export function CommunityScore({ contentId, contentType }: CommunityScoreProps) {
    const { data, isLoading, isError } = useCommunityScore(contentType, contentId);

    if (isLoading) {
        return (
            <View style={S.container}>
                <ActivityIndicator color={COLORS.textSecondary} />
            </View>
        );
    }

    if (isError || !data) {
        return null; // Fallo silencioso — no romper la pantalla de detalle
    }

    if (data.totalRatings === 0) {
        return (
            <View style={S.container}>
                <Text style={S.label}>Sin valoraciones aún</Text>
            </View>
        );
    }

    return (
        <View style={S.container}>
            <Text style={S.label}>
                Nota media · {data.totalRatings} {data.totalRatings === 1 ? 'usuario' : 'usuarios'}
            </Text>
            <View pointerEvents="none">
                <RatingSlider
                    value={data.averageScore}
                    onValueChange={() => {}}
                    category={contentType}
                    size="interactive"
                    disabled={true}
                    exactScoreDisplay={true}
                />
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    container: {
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },
    label: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        marginBottom: -SPACING.sm,
    },
});
