import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export interface ShareableRatingCardProps {
    contentTitle: string;
    contentImageUrl: string | null;
    contentType: 'movie' | 'series' | 'book' | 'game' | 'music' | 'podcast' | 'anything';
    score: number;
    review: string | null;
    username: string;
    userAvatarUrl: string | null;
    format: 'stories' | 'feed';
}

const CATEGORY_COLORS: Record<ShareableRatingCardProps['contentType'], string> = {
    movie: '#FF595E',
    series: '#8939F7',
    book: '#8AC926',
    game: '#1982C4',
    music: '#FFCA3A',
    podcast: '#5BC0EB',
    anything: '#FFFBFF',
};

const CATEGORY_COLORS_FADED: Record<ShareableRatingCardProps['contentType'], string> = {
    movie: 'rgba(255, 89, 94, 0.2)',
    series: 'rgba(137, 57, 247, 0.2)',
    book: 'rgba(138, 201, 38, 0.2)',
    game: 'rgba(25, 130, 196, 0.2)',
    music: 'rgba(255, 202, 58, 0.2)',
    podcast: 'rgba(91, 192, 235, 0.2)',
    anything: 'rgba(255, 251, 255, 0.2)',
};

const CATEGORY_EMOJI: Record<ShareableRatingCardProps['contentType'], string> = {
    movie: '🎬',
    series: '📺',
    book: '📚',
    game: '🎮',
    music: '🎵',
    podcast: '🎙️',
    anything: '✨',
};

const CATEGORY_LABEL: Record<ShareableRatingCardProps['contentType'], string> = {
    movie: 'Película',
    series: 'Serie',
    book: 'Libro',
    game: 'Juego',
    music: 'Música',
    podcast: 'Podcast',
    anything: 'Anything',
};

const SURFACE = {
    background: '#121212',
    card: '#1E1E1E',
    elevated: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
};

export function ShareableRatingCard(props: ShareableRatingCardProps): React.ReactElement {
    const accentColor = CATEGORY_COLORS[props.contentType];
    const fadedColor = CATEGORY_COLORS_FADED[props.contentType];
    const emoji = CATEGORY_EMOJI[props.contentType];
    const label = CATEGORY_LABEL[props.contentType];
    const cardHeight = props.format === 'stories' ? 640 : 450;
    const reviewText = props.review ? props.review.slice(0, 150) : null;

    const headerH = Math.round(cardHeight * 0.15);
    const posterH = Math.round(cardHeight * 0.45);
    const scoreH = Math.round(cardHeight * 0.15);
    const reviewH = Math.round(cardHeight * 0.15);
    const footerH = cardHeight - headerH - posterH - scoreH - reviewH;

    const fillWidth = `${(props.score / 10) * 100}%` as const;

    return (
        <View style={[styles.card, { height: cardHeight, borderLeftColor: accentColor }]}>

            {/* HEADER */}
            <View style={[styles.header, { height: headerH, backgroundColor: fadedColor }]}>
                {props.userAvatarUrl ? (
                    <Image
                        source={{ uri: props.userAvatarUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: accentColor }]}>
                        <Text style={styles.avatarLetter} numberOfLines={1}>
                            {props.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
                    {props.username}
                </Text>
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                        {emoji} {label}
                    </Text>
                </View>
            </View>

            {/* POSTER */}
            <View style={[styles.poster, { height: posterH }]}>
                {props.contentImageUrl ? (
                    <Image
                        source={{ uri: props.contentImageUrl }}
                        style={styles.posterImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.posterFallback, { backgroundColor: fadedColor }]}>
                        <Text style={styles.posterEmoji}>{emoji}</Text>
                    </View>
                )}
            </View>

            {/* SCORE */}
            <View style={[styles.scoreSection, { height: scoreH }]}>
                <View style={styles.scoreRow}>
                    <Text style={[styles.scoreNumber, { color: accentColor }]}>
                        {props.score.toFixed(1)}
                    </Text>
                    <Text style={styles.scoreDivider}> / 10</Text>
                </View>
                <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: fillWidth, backgroundColor: accentColor }]} />
                </View>
            </View>

            {/* REVIEW */}
            <View style={[styles.reviewSection, { height: reviewH }]}>
                {reviewText ? (
                    <Text
                        style={styles.reviewText}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {reviewText}
                    </Text>
                ) : (
                    <Text style={styles.reviewEmpty}>Sin reseña</Text>
                )}
            </View>

            {/* FOOTER */}
            <View style={[styles.footer, { height: footerH }]}>
                <Text style={styles.footerBrand}>rate-it</Text>
                <Text style={styles.footerCta} numberOfLines={1}>Descúbrelo en rate-it</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 360,
        borderRadius: 16,
        overflow: 'hidden',
        borderLeftWidth: 4,
        backgroundColor: SURFACE.background,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLetter: {
        fontSize: 18,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    username: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.textPrimary,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Bold',
        color: SURFACE.background,
    },
    // Poster
    poster: {
        width: '100%',
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
        fontSize: 64,
    },
    // Score
    scoreSection: {
        backgroundColor: SURFACE.card,
        paddingHorizontal: 16,
        justifyContent: 'center',
        gap: 6,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    scoreNumber: {
        fontSize: 48,
        fontFamily: 'SpaceGrotesk-Bold',
        lineHeight: 52,
    },
    scoreDivider: {
        fontSize: 20,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textSecondary,
        marginBottom: 6,
    },
    barTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: SURFACE.elevated,
        overflow: 'hidden',
    },
    barFill: {
        height: 8,
        borderRadius: 999,
    },
    // Review
    reviewSection: {
        backgroundColor: SURFACE.background,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    reviewText: {
        fontSize: 16,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textPrimary,
        fontStyle: 'italic',
    },
    reviewEmpty: {
        fontSize: 16,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textTertiary,
    },
    // Footer
    footer: {
        backgroundColor: SURFACE.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    footerBrand: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Bold',
        color: 'rgba(255,255,255,0.6)',
    },
    footerCta: {
        fontSize: 12,
        fontFamily: 'SpaceGrotesk-Regular',
        color: SURFACE.textSecondary,
    },
});
