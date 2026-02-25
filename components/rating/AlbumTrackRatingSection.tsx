import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RatingSlider } from '@/components/rating/RatingSlider';
import { useAlbumTracks } from '@/lib/hooks/useAlbumTracks';
import { AlbumTrack } from '@/lib/types/content';
import { TrackRatingEntry } from '@/lib/types/database';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '@/lib/utils/constants';

interface AlbumTrackRatingSectionProps {
    collectionId: string;
    trackRatings: TrackRatingEntry[];
    onTrackScoreChange: (trackId: string, score: number) => void;
    trackAverage: number | null;
    expanded: boolean;
    onToggleExpanded: (expanded: boolean) => void;
    initializeTrackRatings: (tracks: AlbumTrack[]) => void;
    categoryColor: string;
}

export function AlbumTrackRatingSection({
    collectionId,
    trackRatings,
    onTrackScoreChange,
    trackAverage,
    expanded,
    onToggleExpanded,
    initializeTrackRatings,
    categoryColor,
}: AlbumTrackRatingSectionProps) {
    const { data: tracks, isLoading, error } = useAlbumTracks(collectionId);

    useEffect(() => {
        if (tracks && tracks.length > 0) {
            initializeTrackRatings(tracks);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracks]);

    const ratedCount = trackRatings.filter((t) => t.score > 0).length;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => onToggleExpanded(!expanded)}
                activeOpacity={0.75}
            >
                <Text style={styles.headerTitle}>Puntuar canciones</Text>
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

            {trackAverage !== null && (
                <Text
                    style={[styles.averageLabel, { color: categoryColor }]}
                >
                    Media canciones: {trackAverage.toFixed(1)}
                </Text>
            )}

            {expanded && (
                <View style={styles.body}>
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={categoryColor}
                            style={styles.loader}
                        />
                    )}

                    {!!error && !isLoading && (
                        <Text style={styles.errorText}>
                            No se pudieron cargar las canciones.
                        </Text>
                    )}

                    {!isLoading &&
                        !error &&
                        tracks &&
                        tracks.map((track) => {
                            const entry = trackRatings.find(
                                (r) => r.trackId === track.trackId
                            );
                            const score = entry?.score ?? 0;
                            return (
                                <View key={track.trackId} style={styles.trackRow}>
                                    <Text style={styles.trackName} numberOfLines={1}>
                                        {track.trackNumber}. {track.trackName}
                                    </Text>
                                    <RatingSlider
                                        value={score}
                                        onValueChange={(v) =>
                                            onTrackScoreChange(track.trackId, v)
                                        }
                                        category="music"
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
        fontFamily: 'SpaceGrotesk_600SemiBold',
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
        fontSize: FONT_SIZE.labelSmall,
        fontFamily: 'SpaceGrotesk_600SemiBold',
        color: COLORS.background,
    },
    body: {
        paddingTop: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    loader: {
        paddingVertical: SPACING.lg,
    },
    errorText: {
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.error,
        textAlign: 'center',
        paddingVertical: SPACING.md,
    },
    trackRow: {
        marginBottom: SPACING.md,
    },
    trackName: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    averageLabel: {
        fontSize: FONT_SIZE.bodyLarge,
        fontFamily: 'SpaceGrotesk_700Bold',
        textAlign: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
});
