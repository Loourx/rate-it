import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Movie, Series, Book, Game, Music, Podcast, Anything, AllContent } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';

interface ContentMetadataBadgesProps {
    item: AllContent;
    categoryColor: string;
    categoryFadedColor: string;
}

/**
 * Three-layer metadata display:
 *   Layer 1 — Identity (year · creator) — plain text, secondary color
 *   Layer 2 — Platforms (chips with platform icons, horizontal scroll) — games only
 *   Layer 3 — Genres (minimal semi-transparent pills, wrap)
 */
export function ContentMetadataBadges({ item, categoryColor, categoryFadedColor }: ContentMetadataBadgesProps) {
    const { identityParts, platforms, genres } = getLayeredMetadata(item);

    const hasIdentity = identityParts.length > 0;
    const hasPlatforms = platforms.length > 0;
    const hasGenres = genres.length > 0;

    if (!hasIdentity && !hasPlatforms && !hasGenres) return null;

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(150)} style={styles.container}>
            {/* ── Layer 1 — Identity metadata ── */}
            {hasIdentity && (
                <Text style={styles.identityText}>{identityParts.join('  ·  ')}</Text>
            )}

            {/* ── Layer 2 — Platforms (horizontal scroll chips) ── */}
            {hasPlatforms && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.platformScroll}
                    contentContainerStyle={styles.platformContent}
                >
                    {platforms.map((p, i) => {
                        const info = getPlatformInfo(p);
                        return (
                            <View
                                key={i}
                                style={[styles.platformChip, { backgroundColor: categoryFadedColor }]}
                            >
                                <Ionicons
                                    name={info.icon}
                                    size={15}
                                    color={info.color}
                                    style={styles.platformIcon}
                                />
                                <Text style={[styles.platformText, { color: categoryColor }]}>
                                    {info.shortLabel ?? p}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── Layer 3 — Genres (minimal pills) ── */}
            {hasGenres && (
                <View style={styles.genreRow}>
                    {genres.map((g, i) => (
                        <View key={i} style={styles.genrePill}>
                            <Text style={styles.genreText}>{g}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Animated.View>
    );
}

// ── Platform icon / color mapping ────────────────────────

interface PlatformInfo {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    shortLabel?: string;
}

function getPlatformInfo(platform: string): PlatformInfo {
    const l = platform.toLowerCase();

    // PlayStation family
    if (l.includes('playstation 5') || l === 'ps5')
        return { icon: 'logo-playstation', color: '#0070D1', shortLabel: 'PS5' };
    if (l.includes('playstation 4') || l === 'ps4')
        return { icon: 'logo-playstation', color: '#0070D1', shortLabel: 'PS4' };
    if (l.includes('playstation 3') || l === 'ps3')
        return { icon: 'logo-playstation', color: '#0070D1', shortLabel: 'PS3' };
    if (l.includes('ps vita'))
        return { icon: 'logo-playstation', color: '#0070D1', shortLabel: 'PS Vita' };
    if (l.includes('playstation'))
        return { icon: 'logo-playstation', color: '#0070D1' };

    // Xbox family
    if (l.includes('xbox series'))
        return { icon: 'logo-xbox', color: '#107C10', shortLabel: 'Xbox S|X' };
    if (l.includes('xbox one'))
        return { icon: 'logo-xbox', color: '#107C10', shortLabel: 'Xbox One' };
    if (l.includes('xbox 360'))
        return { icon: 'logo-xbox', color: '#107C10', shortLabel: 'Xbox 360' };
    if (l.includes('xbox'))
        return { icon: 'logo-xbox', color: '#107C10' };

    // Nintendo
    if (l.includes('nintendo switch') || l === 'switch')
        return { icon: 'game-controller-outline', color: '#E60012', shortLabel: 'Switch' };
    if (l.includes('nintendo') || l.includes('wii') || l.includes('game boy'))
        return { icon: 'game-controller-outline', color: '#E60012' };

    // PC / Desktop
    if (l === 'pc' || l.includes('windows'))
        return { icon: 'desktop-outline', color: '#00A4EF', shortLabel: 'PC' };
    if (l === 'macos' || l === 'mac')
        return { icon: 'logo-apple', color: '#A2AAAD', shortLabel: 'macOS' };
    if (l === 'linux')
        return { icon: 'terminal-outline', color: '#FCC624', shortLabel: 'Linux' };

    // Mobile
    if (l === 'ios' || l === 'iphone')
        return { icon: 'phone-portrait-outline', color: '#A2AAAD', shortLabel: 'iOS' };
    if (l === 'android')
        return { icon: 'logo-android', color: '#3DDC84', shortLabel: 'Android' };

    // Web
    if (l === 'web')
        return { icon: 'globe-outline', color: '#64D2FF', shortLabel: 'Web' };

    // Fallback
    return { icon: 'hardware-chip-outline', color: '#A0A0A0' };
}

// ── Layered metadata extraction ──────────────────────────

interface LayeredMetadata {
    identityParts: string[];
    platforms: string[];
    genres: string[];
}

function formatRuntime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

function getLayeredMetadata(item: AllContent): LayeredMetadata {
    switch (item.type) {
        case 'movie': {
            const m = item as Movie;
            const parts: string[] = [];
            if (m.year) parts.push(m.year);
            if (m.director) parts.push(m.director);
            if (m.runtime) parts.push(formatRuntime(m.runtime));
            return { identityParts: parts, platforms: [], genres: m.genres ?? [] };
        }
        case 'series': {
            const s = item as Series;
            const parts: string[] = [];
            if (s.year) parts.push(s.year);
            if (s.creator) parts.push(s.creator);
            const sub: string[] = [];
            if (s.seasons) sub.push(`${s.seasons} temporadas`);
            if (s.episodes) sub.push(`${s.episodes} episodios`);
            if (sub.length) parts.push(sub.join(', '));
            return { identityParts: parts, platforms: [], genres: s.genres ?? [] };
        }
        case 'book': {
            const b = item as Book;
            const parts: string[] = [];
            if (b.author) parts.push(b.author);
            if (b.year) parts.push(b.year);
            if (b.pages) parts.push(`${b.pages} págs`);
            return { identityParts: parts, platforms: [], genres: b.categories ?? [] };
        }
        case 'game': {
            const g = item as Game;
            const parts: string[] = [];
            if (g.year) parts.push(g.year);
            if (g.developer) parts.push(g.developer);
            return { identityParts: parts, platforms: g.platforms ?? [], genres: g.genres ?? [] };
        }
        case 'music': {
            const mu = item as Music;
            const parts: string[] = [];
            if (mu.artist) parts.push(mu.artist);
            if (mu.year) parts.push(mu.year);
            if (mu.genre) parts.push(mu.genre);
            if (mu.isAlbum) {
                if (mu.trackCount) parts.push(`${mu.trackCount} tracks`);
            } else {
                if (mu.album && mu.album !== mu.title) parts.push(mu.album);
                if (mu.durationMs) {
                    const totalSecs = Math.floor(mu.durationMs / 1000);
                    const mins = Math.floor(totalSecs / 60);
                    const secs = totalSecs % 60;
                    parts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
                }
            }
            return { identityParts: parts, platforms: [], genres: [] };
        }
        case 'podcast': {
            const pod = item as Podcast;
            const parts: string[] = [];
            if (pod.publisher) parts.push(pod.publisher);
            if (pod.genre) parts.push(pod.genre);
            if (pod.episodeCount) parts.push(`${pod.episodeCount} episodios`);
            return { identityParts: parts, platforms: [], genres: [] };
        }
        case 'anything': {
            const a = item as Anything;
            const parts: string[] = [];
            if (a.categoryTag) parts.push(a.categoryTag);
            if (a.creatorUsername) parts.push(`@${a.creatorUsername}`);
            return { identityParts: parts, platforms: [], genres: [] };
        }
        default:
            return { identityParts: [], platforms: [], genres: [] };
    }
}

// ── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        gap: SPACING.lg, // 20px between layers — perceptual grouping via spacing
    },

    /* Layer 1 — Identity */
    identityText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk_500Medium',
        color: COLORS.textSecondary,
        lineHeight: 20,
    },

    /* Layer 2 — Platforms */
    platformScroll: {
        marginHorizontal: -SPACING.base, // bleed to screen edges for scroll affordance
    },
    platformContent: {
        paddingHorizontal: SPACING.base,
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    platformIcon: {
        marginRight: 6,
    },
    platformText: {
        fontSize: 13,
        fontFamily: 'SpaceGrotesk_600SemiBold',
    },

    /* Layer 3 — Genres */
    genreRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    genrePill: {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    genreText: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk_500Medium',
        color: COLORS.textTertiary,
    },
});
