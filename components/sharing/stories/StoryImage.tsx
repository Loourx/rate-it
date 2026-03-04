import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';
import { StoryPill } from './StoryPill';

interface StoryImageProps {
    contentType: StoryContentType;
    posterUrl: string | null;
    title: string;
}

/**
 * Top container of the StoryCard housing the poster image or fallback initials.
 * Includes a gradient overlay and the category pill.
 */
export function StoryImage({ contentType, posterUrl, title }: StoryImageProps) {
    const height = STORY_TOKENS.IMAGE_HEIGHT[contentType];
    const color = getCategoryColor(contentType);

    return (
        <View style={[styles.container, { height }]}>
            {posterUrl ? (
                <Image
                    source={posterUrl}
                    contentFit="cover"
                    style={styles.image}
                    cachePolicy="memory-disk"
                />
            ) : (
                <View style={[styles.fallback, { backgroundColor: color + '54' }]}>
                    <Text style={styles.initial}>{title.charAt(0).toUpperCase()}</Text>
                </View>
            )}

            {/* Bottom Gradient Overlay */}
            <LinearGradient
                colors={['transparent', STORY_TOKENS.SURFACE.card]}
                locations={[0.6, 1]}
                style={styles.overlay}
            />

            <StoryPill contentType={contentType} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: STORY_TOKENS.CARD.width,
        borderTopLeftRadius: STORY_TOKENS.CARD.borderRadius,
        borderTopRightRadius: STORY_TOKENS.CARD.borderRadius,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: STORY_TOKENS.SURFACE.card,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallback: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initial: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    overlay: {
        position: 'absolute',
        inset: 0,
    },
});
