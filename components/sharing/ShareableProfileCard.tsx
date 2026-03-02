import React from 'react';
import type { DimensionValue } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export interface ShareableProfileCardProps {
    username: string;
    avatarUrl: string | null;
    totalRatings: number;
    averageScore: number | null;
    currentStreak: number;
    pinnedItems: Array<{
        title: string;
        imageUrl: string | null;
        contentType: 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';
    }>;
    challenge: {
        target: number;
        current: number;
        categoryFilter: string | null;
    } | null;
}

type ContentType = ShareableProfileCardProps['pinnedItems'][number]['contentType'];

const CATEGORY_COLORS: Record<ContentType, string> = {
    movie: '#FF595E',
    series: '#8939F7',
    book: '#8AC926',
    game: '#1982C4',
    music: '#FFCA3A',
    podcast: '#5BC0EB',
    anything: '#FFFBFF',
};

const CATEGORY_COLORS_FADED: Record<ContentType, string> = {
    movie: 'rgba(255, 89, 94, 0.2)',
    series: 'rgba(137, 57, 247, 0.2)',
    book: 'rgba(138, 201, 38, 0.2)',
    game: 'rgba(25, 130, 196, 0.2)',
    music: 'rgba(255, 202, 58, 0.2)',
    podcast: 'rgba(91, 192, 235, 0.2)',
    anything: 'rgba(255, 251, 255, 0.2)',
};

const CATEGORY_EMOJI: Record<ContentType, string> = {
    movie: '🎬',
    series: '📺',
    book: '📚',
    game: '🎮',
    music: '🎵',
    podcast: '🎙️',
    anything: '✨',
};

const SURFACE = {
    background: '#121212',
    card: '#1E1E1E',
    elevated: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
};

function getProgressColor(ratio: number): string {
    if (ratio >= 0.75) return '#FFCA3A';
    if (ratio >= 0.5) return '#34C759';
    if (ratio >= 0.25) return '#FFD60A';
    return '#FF453A';
}

export function ShareableProfileCard(props: ShareableProfileCardProps): React.ReactElement {
    const initial = props.username.charAt(0).toUpperCase();
    const avgDisplay = props.averageScore !== null ? props.averageScore.toFixed(1) : '—';
    const visiblePins = props.pinnedItems.slice(0, 5);

    let challengeRatio = 0;
    if (props.challenge) {
        challengeRatio = Math.min(props.challenge.current / props.challenge.target, 1);
    }
    const progressPct: DimensionValue = `${Math.round(challengeRatio * 100)}%`;
    const progressColor = getProgressColor(challengeRatio);

    return (
        <View style={styles.card}>

            {/* ── 1. HEADER ── */}
            <View style={styles.header}>
                {props.avatarUrl ? (
                    <Image source={props.avatarUrl} style={styles.avatar} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarLetter}>{initial}</Text>
                    </View>
                )}
                <View style={styles.headerText}>
                    <Text style={styles.headerUsername} numberOfLines={1}>{props.username}</Text>
                    <Text style={styles.headerSubtitle}>rate-it</Text>
                </View>
            </View>

            {/* ── 2. STATS ROW ── */}
            <View style={styles.statsRow}>
                <View style={styles.statCol}>
                    <Text style={styles.statNumber}>{props.totalRatings}</Text>
                    <Text style={styles.statLabel}>valoraciones</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statCol}>
                    <Text style={styles.statNumber}>{avgDisplay}</Text>
                    <Text style={styles.statLabel}>media</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statCol}>
                    <Text style={styles.statNumber}>{props.currentStreak} 🔥</Text>
                    <Text style={styles.statLabel}>días de racha</Text>
                </View>
            </View>

            {/* ── 3. PINNED SECTION ── */}
            <View style={styles.pinnedSection}>
                <Text style={styles.sectionLabel}>Favoritos</Text>
                {visiblePins.length > 0 ? (
                    <View style={styles.postersRow}>
                        {visiblePins.map((item, i) => (
                            <View key={i} style={styles.poster}>
                                {item.imageUrl ? (
                                    <Image
                                        source={item.imageUrl}
                                        style={styles.posterImage}
                                        contentFit="cover"
                                        cachePolicy="memory-disk"
                                    />
                                ) : (
                                    <View style={[
                                        styles.posterFallback,
                                        { backgroundColor: CATEGORY_COLORS_FADED[item.contentType] },
                                    ]}>
                                        <Text style={styles.posterEmoji}>
                                            {CATEGORY_EMOJI[item.contentType]}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.pinnedEmpty}>
                        <Text style={styles.pinnedEmptyText}>Sin favoritos aún</Text>
                    </View>
                )}
            </View>

            {/* ── 4. CHALLENGE SECTION ── */}
            <View style={styles.challengeSection}>
                {props.challenge ? (
                    <View style={styles.challengeContent}>
                        <View style={styles.challengeHeader}>
                            <View>
                                <Text style={styles.challengeTitle}>Reto 2026</Text>
                                <Text style={styles.challengeCategory}>
                                    {props.challenge.categoryFilter ?? 'Todas las categorías'}
                                </Text>
                            </View>
                            <Text style={styles.challengeRatio}>
                                {props.challenge.current}/{props.challenge.target}
                            </Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[
                                styles.progressFill,
                                { width: progressPct, backgroundColor: progressColor },
                            ]} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.challengeEmpty}>
                        <Text style={styles.challengeEmptyText}>Únete al reto anual</Text>
                    </View>
                )}
            </View>

            {/* ── 5. FOOTER ── */}
            <View style={styles.footer}>
                <Text style={styles.footerBrand}>rate-it</Text>
                <Text style={styles.footerCta}>Comparte tu cultura</Text>
            </View>

        </View>
    );
}

const POSTER_WIDTH = Math.floor((360 - 32 - 4 * 8) / 5); // ≈ 54

const styles = StyleSheet.create({
    card: {
        width: 360,
        height: 500,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: SURFACE.background,
    },

    // ── HEADER (100px) ──
    header: {
        height: 100,
        backgroundColor: SURFACE.elevated,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarFallback: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: SURFACE.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 28,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    headerText: {
        flex: 1,
        gap: 2,
    },
    headerUsername: {
        fontSize: 20,
        fontFamily: 'SpaceGrotesk-SemiBold',
        color: SURFACE.textPrimary,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Medium',
        color: 'rgba(255,255,255,0.6)',
    },

    // ── STATS ROW (75px) ──
    statsRow: {
        height: 75,
        backgroundColor: SURFACE.card,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statNumber: {
        fontSize: 22,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'SpaceGrotesk-SemiBold',
        color: SURFACE.textSecondary,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: SURFACE.elevated,
    },

    // ── PINNED SECTION (175px) ──
    pinnedSection: {
        height: 175,
        backgroundColor: SURFACE.background,
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-SemiBold',
        color: SURFACE.textSecondary,
        marginBottom: 10,
    },
    postersRow: {
        flexDirection: 'row',
        gap: 8,
    },
    poster: {
        width: POSTER_WIDTH,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    posterFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterEmoji: {
        fontSize: 20,
    },
    pinnedEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinnedEmptyText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textTertiary,
    },

    // ── CHALLENGE SECTION (100px) ──
    challengeSection: {
        height: 100,
        backgroundColor: SURFACE.card,
    },
    challengeContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    challengeTitle: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-SemiBold',
        color: SURFACE.textPrimary,
    },
    challengeCategory: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textSecondary,
    },
    challengeRatio: {
        fontSize: 20,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: SURFACE.elevated,
        overflow: 'hidden',
    },
    progressFill: {
        height: 8,
        borderRadius: 999,
    },
    challengeEmpty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeEmptyText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textTertiary,
    },

    // ── FOOTER (50px) ──
    footer: {
        height: 50,
        backgroundColor: SURFACE.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    footerBrand: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Medium',
        color: 'rgba(255,255,255,0.6)',
    },
    footerCta: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Medium',
        color: SURFACE.textSecondary,
    },
});
