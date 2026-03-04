import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { STORY_TOKENS } from './storyTokens';
import { StoryCardProps } from './storyTypes';
import { StoryImage } from './StoryImage';
import { StoryVerdict } from './StoryVerdict';
import { StoryFooter } from './StoryFooter';

/**
 * The complete Story card component.
 * Orchestrates Image, Verdict, and Footer into a cohesive shareable piece.
 */
export function StoryCard(props: StoryCardProps) {
    return (
        <View style={styles.card}>
            {/* 1. Content Image Container */}
            <StoryImage
                contentType={props.contentType}
                posterUrl={props.posterUrl}
                title={props.title}
            />

            {/* 2. Verdict Section (Score + Info) */}
            <StoryVerdict {...props} />

            {/* 3. Brand Footer */}
            <StoryFooter
                username={props.username}
                contentType={props.contentType}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: STORY_TOKENS.CARD.width,
        borderRadius: STORY_TOKENS.CARD.borderRadius,
        backgroundColor: STORY_TOKENS.SURFACE.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: STORY_TOKENS.CARD.border,

        // iOS Shadows
        shadowColor: STORY_TOKENS.CARD.shadow.shadowColor,
        shadowOffset: STORY_TOKENS.CARD.shadow.shadowOffset,
        shadowRadius: STORY_TOKENS.CARD.shadow.shadowRadius,
        shadowOpacity: STORY_TOKENS.CARD.shadow.shadowOpacity,

        // Android Elevation
        ...Platform.select({
            android: {
                elevation: STORY_TOKENS.CARD.shadow.elevation,
            },
        }),
    },
});
