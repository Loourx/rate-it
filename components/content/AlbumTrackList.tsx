import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlbumTrack } from '@/lib/types/content';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';

// ── helpers ──────────────────────────────────────────────

function formatDuration(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ── types ─────────────────────────────────────────────────

interface AlbumTrackListProps {
    tracks: AlbumTrack[];
    onTrackPress?: (trackId: string) => void;
    categoryColor: string;
}

// ── constants ─────────────────────────────────────────────

const INITIAL_VISIBLE = 5;

// ── component ─────────────────────────────────────────────

export function AlbumTrackList({ tracks, onTrackPress, categoryColor }: AlbumTrackListProps) {
    const [expanded, setExpanded] = useState(false);

    const hasMore = tracks.length > INITIAL_VISIBLE;
    const visibleTracks = expanded ? tracks : tracks.slice(0, INITIAL_VISIBLE);
    const hiddenCount = tracks.length;

    return (
        <View style={styles.container}>
            {visibleTracks.map((track) => (
                <TouchableOpacity
                    key={track.trackId}
                    style={styles.row}
                    onPress={() => onTrackPress?.(track.trackId)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.trackNumber}>
                        {track.trackNumber.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.trackName} numberOfLines={1}>
                        {track.trackName}
                    </Text>
                    <Text style={styles.duration}>
                        {formatDuration(track.durationMs)}
                    </Text>
                </TouchableOpacity>
            ))}

            {hasMore && !expanded && (
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setExpanded(true)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, { color: categoryColor }]}>
                        {`Ver todas las canciones (${hiddenCount})`}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={categoryColor} />
                </TouchableOpacity>
            )}

            {hasMore && expanded && (
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setExpanded(false)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.toggleText, { color: categoryColor }]}>
                        Ver menos
                    </Text>
                    <Ionicons name="chevron-up" size={16} color={categoryColor} />
                </TouchableOpacity>
            )}
        </View>
    );
}

// ── styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    trackNumber: {
        width: 28,
        textAlign: 'center',
        fontSize: 13,
        color: COLORS.textTertiary,
        fontFamily: FONT.medium,
    },
    trackName: {
        flex: 1,
        marginHorizontal: SPACING.sm,
        fontSize: 14,
        color: COLORS.textPrimary,
        fontFamily: FONT.medium,
    },
    duration: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontFamily: FONT.regular,
    },
    toggleButton: {
        marginTop: SPACING.sm,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    toggleText: {
        fontSize: 13,
        fontFamily: FONT.medium,
    },
});
