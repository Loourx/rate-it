import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ContentType, Movie, Series, Book, Game, Music, Podcast, Anything, AllContent } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';

interface ContentMetadataBadgesProps {
    item: AllContent;
    categoryColor: string;
    categoryFadedColor: string;
}

/** Renders type-specific metadata badges and genre/category pills. */
export function ContentMetadataBadges({ item, categoryColor, categoryFadedColor }: ContentMetadataBadgesProps) {
    const { badges, genres } = getMetadata(item);

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(150)}>
            {/* Info badges */}
            {badges.length > 0 && (
                <View style={styles.row}>
                    {badges.map((b, i) => (
                        <View key={i} style={[styles.badge, { borderColor: categoryColor, backgroundColor: categoryFadedColor }]}>
                            <Ionicons name={b.icon} size={14} color={categoryColor} style={{ marginRight: 4 }} />
                            <Text style={[styles.badgeText, { color: categoryColor }]}>{b.label}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Genre pills */}
            {genres.length > 0 && (
                <View style={[styles.row, { marginTop: SPACING.sm }]}>
                    {genres.map((g, i) => (
                        <View key={i} style={[styles.pill, { borderColor: categoryColor, backgroundColor: categoryFadedColor }]}>
                            <Text style={[styles.pillText, { color: categoryColor }]}>{g}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Animated.View>
    );
}

// ── helpers ──────────────────────────────────────────────

interface BadgeInfo {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}

function formatRuntime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function getMetadata(item: AllContent): { badges: BadgeInfo[]; genres: string[] } {
    switch (item.type) {
        case 'movie': {
            const m = item as Movie;
            const badges: BadgeInfo[] = [];
            if (m.year) badges.push({ icon: 'calendar-outline', label: m.year });
            if (m.director) badges.push({ icon: 'videocam-outline', label: m.director });
            if (m.runtime) badges.push({ icon: 'time-outline', label: formatRuntime(m.runtime) });
            return { badges, genres: m.genres ?? [] };
        }
        case 'series': {
            const s = item as Series;
            const badges: BadgeInfo[] = [];
            if (s.year) badges.push({ icon: 'calendar-outline', label: s.year });
            if (s.creator) badges.push({ icon: 'person-outline', label: s.creator });
            const parts: string[] = [];
            if (s.seasons) parts.push(`${s.seasons} temporadas`);
            if (s.episodes) parts.push(`${s.episodes} episodios`);
            if (parts.length) badges.push({ icon: 'tv-outline', label: parts.join(' · ') });
            return { badges, genres: s.genres ?? [] };
        }
        case 'book': {
            const b = item as Book;
            const badges: BadgeInfo[] = [];
            if (b.author) badges.push({ icon: 'person-outline', label: b.author });
            if (b.pages) badges.push({ icon: 'book-outline', label: `${b.pages} págs` });
            if (b.year) badges.push({ icon: 'calendar-outline', label: b.year });
            return { badges, genres: b.categories ?? [] };
        }
        case 'game': {
            const g = item as Game;
            const badges: BadgeInfo[] = [];
            if (g.year) badges.push({ icon: 'calendar-outline', label: g.year });
            if (g.developer) badges.push({ icon: 'code-outline', label: g.developer });
            // Platforms as individual badges
            g.platforms?.forEach((p) => badges.push({ icon: 'hardware-chip-outline', label: p }));
            return { badges, genres: g.genres ?? [] };
        }
        case 'music': {
            const mu = item as Music;
            const badges: BadgeInfo[] = [];
            if (mu.artist) badges.push({ icon: 'person-outline', label: mu.artist });
            if (mu.year) badges.push({ icon: 'calendar-outline', label: mu.year });
            if (mu.genre) badges.push({ icon: 'musical-notes-outline', label: mu.genre });
            if (mu.isAlbum) {
                // Album badges
                if (mu.trackCount) badges.push({ icon: 'list-outline', label: `${mu.trackCount} tracks` });
            } else {
                // Track badges
                if (mu.album && mu.album !== mu.title) {
                    badges.push({ icon: 'disc-outline', label: mu.album });
                }
                if (mu.durationMs) {
                    const totalSecs = Math.floor(mu.durationMs / 1000);
                    const mins = Math.floor(totalSecs / 60);
                    const secs = totalSecs % 60;
                    badges.push({ icon: 'time-outline', label: `${mins}:${secs.toString().padStart(2, '0')}` });
                }
            }
            return { badges, genres: [] };
        }
        case 'podcast': {
            const pod = item as Podcast;
            const badges: BadgeInfo[] = [];
            if (pod.publisher) badges.push({ icon: 'mic-outline', label: pod.publisher });
            if (pod.genre) badges.push({ icon: 'pricetag-outline', label: pod.genre });
            if (pod.episodeCount) badges.push({ icon: 'list-outline', label: `${pod.episodeCount} episodios` });
            return { badges, genres: [] };
        }
        case 'anything': {
            const a = item as Anything;
            const badges: BadgeInfo[] = [];
            if (a.categoryTag) badges.push({ icon: 'pricetag-outline', label: a.categoryTag });
            if (a.creatorUsername) badges.push({ icon: 'person-outline', label: `@${a.creatorUsername}` });
            return { badges, genres: [] };
        }
        default:
            return { badges: [], genres: [] };
    }
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
    },
    badgeText: { fontSize: 12, fontFamily: 'SpaceGrotesk_600SemiBold' },
    pill: {
        borderWidth: 1,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    pillText: { fontSize: 12, fontFamily: 'SpaceGrotesk_500Medium' },
});
