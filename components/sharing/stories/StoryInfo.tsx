import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryInfoProps {
    contentType: StoryContentType;
    title: string;
    year?: string;
    platform?: string;
    favoriteTrack?: string;
    bookFormat?: string;
    reviewText?: string;
    showReview: boolean;
    showPlatform: boolean;
    showFavoriteTrack: boolean;
}

/**
 * Information column for the Story card.
 * Handles Title, Metadata (conditional), Favorite Track (Music only), and Review Quote.
 */
export function StoryInfo({
    contentType,
    title,
    year,
    platform,
    favoriteTrack,
    bookFormat,
    reviewText,
    showReview,
    showPlatform,
    showFavoriteTrack,
}: StoryInfoProps) {
    // Level 2: Metadata string construction
    const platformVal = contentType === 'book' ? bookFormat : platform;
    const metadataParts = [
        year,
        showPlatform && platformVal ? platformVal : null,
    ].filter(Boolean);
    const metadataStr = metadataParts.join(' · ');

    // Level 2.5: Favorite track logic (Music only)
    const isMusic = contentType === 'music';
    const displayFavoriteTrack = isMusic && showFavoriteTrack && !!favoriteTrack?.trim();

    // Level 3: Quote logic
    const displayQuote = showReview && !!reviewText?.trim();

    return (
        <View style={styles.container}>
            {/* Level 1: Title */}
            <Text
                style={styles.title}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {title}
            </Text>

            {/* Level 2: Context Metadata */}
            {!!metadataStr && (
                <Text style={styles.metadata}>
                    {metadataStr}
                </Text>
            )}

            {/* Level 2.5: Favorite Track (Music) */}
            {displayFavoriteTrack && (
                <View style={styles.musicRow}>
                    <Text style={[styles.musicIcon, { color: getCategoryColor('music') }]}>♫</Text>
                    <Text style={styles.favoriteTrack} numberOfLines={1}>
                        {favoriteTrack}
                    </Text>
                </View>
            )}

            {/* Level 3: Review Quote */}
            {displayQuote && (
                <Text
                    style={styles.quote}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                >
                    {`"${reviewText}"`}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        ...STORY_TOKENS.TYPOGRAPHY.title,
        color: STORY_TOKENS.TEXT_COLOR.primary,
    },
    metadata: {
        ...STORY_TOKENS.TYPOGRAPHY.metadata,
        color: STORY_TOKENS.TEXT_COLOR.tertiary,
        marginTop: 4,
    },
    musicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    musicIcon: {
        fontSize: 12,
    },
    favoriteTrack: {
        ...STORY_TOKENS.TYPOGRAPHY.favoriteTrack,
        color: STORY_TOKENS.TEXT_COLOR.secondary,
        marginLeft: 4,
    },
    quote: {
        ...STORY_TOKENS.TYPOGRAPHY.quote,
        color: STORY_TOKENS.TEXT_COLOR.secondary,
        fontStyle: 'italic',
        marginTop: 8,
    },
});
