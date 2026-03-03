import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { useSeriesEpisodes } from '@/lib/hooks/useSeriesEpisodes';
import { SeriesEpisode } from '@/lib/types/content';
import { EpisodeRatingEntry } from '@/lib/types/database';
import { COLORS, RADIUS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

interface SeriesEpisodeRatingSectionProps {
    seriesId: string;
    seasonCount: number;
    episodeRatings: EpisodeRatingEntry[];
    onEpisodeScoreChange: (episodeId: string, score: number) => void;
    episodeAverage: number | null;
    expanded: boolean;
    onToggleExpanded: (expanded: boolean) => void;
    initializeEpisodeRatings: (episodes: SeriesEpisode[]) => void;
    categoryColor: string;
}

function SeasonTabs({
    seasonCount,
    selected,
    onSelect,
    categoryColor,
}: {
    seasonCount: number;
    selected: number;
    onSelect: (n: number) => void;
    categoryColor: string;
}): React.ReactElement {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
        >
            {Array.from({ length: seasonCount }, (_, i) => i + 1).map((n) => {
                const isActive = n === selected;
                return (
                    <TouchableOpacity
                        key={n}
                        onPress={() => onSelect(n)}
                        activeOpacity={0.75}
                        style={[
                            styles.tab,
                            isActive
                                ? { backgroundColor: categoryColor, borderColor: categoryColor }
                                : styles.tabInactive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: isActive ? '#FFF' : COLORS.textSecondary },
                            ]}
                        >
                            T{n}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

export function SeriesEpisodeRatingSection({
    seriesId,
    seasonCount,
    episodeRatings,
    onEpisodeScoreChange,
    episodeAverage,
    expanded,
    onToggleExpanded,
    initializeEpisodeRatings,
    categoryColor,
}: SeriesEpisodeRatingSectionProps): React.ReactElement {
    const [selectedSeason, setSelectedSeason] = useState(1);
    const { data: episodes, isLoading, error } = useSeriesEpisodes(seriesId, selectedSeason);

    useEffect(() => {
        if (episodes && episodes.length > 0) {
            initializeEpisodeRatings(episodes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episodes]);

    const ratedCount = episodeRatings.filter((e) => e.score > 0).length;
    const seasonEpisodes = episodeRatings.filter(
        (e) => e.seasonNumber === selectedSeason
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => onToggleExpanded(!expanded)}
                activeOpacity={0.75}
            >
                <Text style={styles.headerTitle}>Puntuar episodios</Text>
                <View style={styles.headerRight}>
                    {ratedCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: categoryColor }]}>
                            <Text style={styles.badgeText}>{ratedCount}</Text>
                        </View>
                    )}
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={COLORS.textSecondary}
                    />
                </View>
            </TouchableOpacity>

            {episodeAverage !== null && (
                <Text style={[styles.averageLabel, { color: categoryColor }]}>
                    Media episodios: {episodeAverage.toFixed(1)}
                </Text>
            )}

            {expanded && (
                <View style={styles.body}>
                    <SeasonTabs
                        seasonCount={seasonCount}
                        selected={selectedSeason}
                        onSelect={setSelectedSeason}
                        categoryColor={categoryColor}
                    />

                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={categoryColor}
                            style={styles.loader}
                        />
                    )}

                    {!!error && !isLoading && (
                        <Text style={styles.errorText}>
                            No se pudieron cargar los episodios.
                        </Text>
                    )}

                    {!isLoading && !error && episodes && seasonEpisodes.map((entry) => {
                        const ep = episodes.find((e) => e.episodeId === entry.episodeId);
                        const label = ep
                            ? `${entry.episodeId}  ${ep.episodeName}`
                            : entry.episodeId;
                        return (
                            <View key={entry.episodeId} style={styles.episodeRow}>
                                <Text style={styles.episodeName} numberOfLines={1}>
                                    {label}
                                </Text>
                                <RatingSlider
                                    value={entry.score}
                                    onValueChange={(v) =>
                                        onEpisodeScoreChange(entry.episodeId, v)
                                    }
                                    category="series"
                                    size="interactive"
                                />
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: RADIUS.lg,
    },
    headerTitle: {
        fontSize: 15,
        fontFamily: FONT.semibold,
        color: COLORS.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    badge: {
        borderRadius: RADIUS.full,
        paddingHorizontal: 7,
        paddingVertical: 2,
        minWidth: 22,
        alignItems: 'center',
    },
    badgeText: {
        ...TYPO.label,
        fontFamily: FONT.semibold,
        color: COLORS.background,
    },
    averageLabel: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        textAlign: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    body: {
        paddingTop: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    tabsScroll: {
        marginBottom: SPACING.md,
    },
    tabsContent: {
        gap: SPACING.xs,
        paddingHorizontal: 2,
    },
    tab: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 5,
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    tabInactive: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.divider,
    },
    tabText: {
        fontSize: 13,
        fontFamily: FONT.semibold,
    },
    loader: {
        paddingVertical: SPACING.lg,
    },
    errorText: {
        ...TYPO.caption,
        color: COLORS.error,
        textAlign: 'center',
        paddingVertical: SPACING.md,
    },
    episodeRow: {
        marginBottom: SPACING.md,
    },
    episodeName: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
});
