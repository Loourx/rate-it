import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ContentType } from '@/lib/types/content';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { RatingSlider } from '@/components/rating/RatingSlider';

interface CommunityScoreProps {
    contentId: string;
    contentType: ContentType;
}

export function CommunityScore({ contentId, contentType }: CommunityScoreProps) {
    // TODO: Reemplazar placeholder por datos reales de Supabase (avg de ratings por content_id)
    const { score, users } = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < contentId.length; i++) {
            hash = ((hash << 5) - hash) + contentId.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash);

        // Generar un número de pasos de 0.1 entre 4.0 y 9.5
        // (9.5 - 4.0) / 0.1 = 55 pasos, 56 valores posibles
        const steps = 56;
        const stepIndex = seed % steps;
        const generatedScore = 4.0 + stepIndex * 0.1;

        // Usuarios aleatorios entre 10 y 500
        const generatedUsers = 10 + (seed % 491);

        return { score: generatedScore, users: generatedUsers };
    }, [contentId]);

    return (
        <View style={S.container}>
            <Text style={S.label}>Nota media · {users} usuarios</Text>
            <View pointerEvents="none">
                <RatingSlider
                    value={score}
                    onValueChange={() => { }}
                    category={contentType}
                    size="interactive" // Using interactive provides headlineLarge bold as requested
                    disabled={true} // Effectively display mode
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
        fontSize: FONT_SIZE.bodyLarge,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        marginBottom: -SPACING.sm, // Acercar un poco el slider al texto
    },
});
