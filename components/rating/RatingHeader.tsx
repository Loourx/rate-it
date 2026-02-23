import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AllContent, ContentType } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/lib/utils/constants';

const CATEGORY_COLORS: Record<ContentType, string> = {
    movie: COLORS.categoryMovie,
    series: COLORS.categorySeries,
    book: COLORS.categoryBook,
    game: COLORS.categoryGame,
    music: COLORS.categoryMusic,
    podcast: COLORS.categoryPodcast,
    anything: COLORS.categoryAnything,
};

const CATEGORY_FADED: Record<ContentType, string> = {
    movie: COLORS.categoryMovieFaded,
    series: COLORS.categorySeriesFaded,
    book: COLORS.categoryBookFaded,
    game: COLORS.categoryGameFaded,
    music: COLORS.categoryMusicFaded,
    podcast: COLORS.categoryPodcastFaded,
    anything: COLORS.categoryAnythingFaded,
};

const CATEGORY_LABELS: Record<ContentType, string> = {
    movie: 'Película',
    series: 'Serie',
    book: 'Libro',
    game: 'Videojuego',
    music: 'Música',
    podcast: 'Podcast',
    anything: 'Anything',
};

function getSubtitle(content: AllContent): string | undefined {
    switch (content.type) {
        case 'movie':
            return content.year ?? content.director;
        case 'series':
            return content.year ?? content.creator;
        case 'book':
            return content.author;
        case 'game':
            return content.year ?? content.developer;
        case 'music':
            return content.artist;
        case 'podcast':
            return content.publisher;
        case 'anything':
            return content.categoryTag;
    }
}

interface RatingHeaderProps {
    content: AllContent;
}

export function RatingHeader({ content }: RatingHeaderProps) {
    const color = CATEGORY_COLORS[content.type];
    const fadedColor = CATEGORY_FADED[content.type];
    const label = CATEGORY_LABELS[content.type];
    const subtitle = getSubtitle(content);

    return (
        <View style={styles.container}>
            {content.imageUrl ? (
                <Image source={{ uri: content.imageUrl }} style={styles.poster} />
            ) : (
                <View style={[styles.poster, styles.posterFallback]}>
                    <Text style={styles.posterFallbackText}>
                        {content.title.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {content.title}
                </Text>
                {subtitle ? (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
                <View style={[styles.badge, { backgroundColor: fadedColor }]}>
                    <Text style={[styles.badgeText, { color }]}>{label}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.base,
    },
    poster: {
        width: 60,
        height: 90,
        borderRadius: RADIUS.sm,
    },
    posterFallback: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterFallbackText: {
        color: COLORS.textTertiary,
        fontSize: FONT_SIZE.headlineLarge,
        fontWeight: '700',
    },
    info: {
        flex: 1,
        gap: SPACING.xs,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.headlineMedium,
        fontWeight: '700',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.bodyMedium,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        marginTop: SPACING.xs,
    },
    badgeText: {
        fontSize: FONT_SIZE.labelSmall,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
