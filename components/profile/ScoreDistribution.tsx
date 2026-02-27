import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScoreDistribution } from '@/lib/hooks/useScoreDistribution';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

interface ScoreDistributionProps {
    userId: string | undefined;
}

const BAR_MAX_HEIGHT = 64; // px — altura de la barra más alta
const MIN_RATINGS = 3;     // mostrar solo si hay suficientes datos

// Enteros que se muestran como etiqueta en el eje X
const X_LABEL_SET = new Set([0, 2, 4, 6, 8, 10]);

const CATEGORY_LABELS: Record<string, string> = {
    movie: 'Cine',
    series: 'Series',
    book: 'Libros',
    game: 'Juegos',
    music: 'Música',
    podcast: 'Podcasts',
    anything: 'Anything',
};

export function ScoreDistribution({ userId }: ScoreDistributionProps) {
    const { data, isLoading } = useScoreDistribution(userId);

    // Categorías presentes en los datos (para la leyenda)
    const presentCategories = useMemo(() => {
        if (!data) return [];
        const seen = new Map<string, string>(); // contentType → color
        for (const bucket of data.buckets) {
            for (const seg of bucket.segments) {
                if (!seen.has(seg.contentType)) {
                    seen.set(seg.contentType, seg.color);
                }
            }
        }
        return Array.from(seen.entries()).map(([type, color]) => ({
            type,
            color,
            label: CATEGORY_LABELS[type] ?? type,
        }));
    }, [data]);

    // No mostrar durante carga ni con pocos datos
    if (isLoading || !data || data.totalRatings < MIN_RATINGS) return null;

    return (
        <View style={S.container}>
            <Text style={S.title}>Distribución de notas</Text>

            <View style={S.chart}>
                {data.buckets.map((bucket) => {
                    const totalHeight = data.maxCount > 0
                        ? (bucket.totalCount / data.maxCount) * BAR_MAX_HEIGHT
                        : 0;

                    return (
                        <View key={bucket.score} style={S.barWrapper}>
                            {/* Count total encima (solo si > 0) */}
                            {bucket.totalCount > 0 && (
                                <Text style={S.countLabel}>{bucket.totalCount}</Text>
                            )}

                            {/* Barra apilada */}
                            <View style={S.barTrack}>
                                <View style={[S.stackContainer, { height: totalHeight }]}>
                                    {bucket.segments.map((seg) => {
                                        const segHeight = bucket.totalCount > 0
                                            ? (seg.count / bucket.totalCount) * totalHeight
                                            : 0;
                                        return (
                                            <View
                                                key={seg.contentType}
                                                style={{
                                                    width: '100%',
                                                    height: segHeight,
                                                    backgroundColor: seg.color,
                                                    minHeight: segHeight > 0 ? 2 : 0,
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Etiqueta X — solo enteros, los demás invisibles pero ocupan espacio */}
                            <Text
                                style={[
                                    S.xLabel,
                                    !X_LABEL_SET.has(bucket.score) && S.xLabelHidden,
                                ]}
                            >
                                {bucket.score % 1 === 0 ? String(bucket.score) : '·'}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Leyenda de categorías */}
            {presentCategories.length > 1 && (
                <View style={S.legend}>
                    {presentCategories.map((cat) => (
                        <View key={cat.type} style={S.legendItem}>
                            <View style={[S.legendDot, { backgroundColor: cat.color }]} />
                            <Text style={S.legendLabel}>{cat.label}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
        marginTop: SPACING.md,
    },
    title: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: BAR_MAX_HEIGHT + 36, // barras + etiquetas
        gap: 2,
    },
    barWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    countLabel: {
        fontSize: 8,
        color: COLORS.textTertiary,
        marginBottom: 2,
        fontFamily: FONT.medium,
    },
    barTrack: {
        width: '80%',
        height: BAR_MAX_HEIGHT,
        justifyContent: 'flex-end',
    },
    stackContainer: {
        width: '100%',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        borderRadius: 2,
    },
    xLabel: {
        fontSize: 9,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontFamily: FONT.medium,
        textAlign: 'center',
    },
    xLabelHidden: {
        opacity: 0, // ocupa espacio pero no se ve — mantiene alineación
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: SPACING.sm,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        ...TYPO.label,
        color: COLORS.textSecondary,
    },
});
