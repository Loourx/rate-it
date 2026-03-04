import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryPillProps {
    contentType: StoryContentType;
}

/**
 * Category pill for the story card.
 * Displays an emoji and the category label.
 */
export function StoryPill({ contentType }: StoryPillProps) {
    const color = getCategoryColor(contentType);
    const config = STORY_TOKENS.PILL_CONFIG[contentType];

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <Text style={styles.emoji}>{config.emoji}</Text>
            <Text style={styles.label}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
        zIndex: 10,
    },
    emoji: {
        fontSize: 12,
    },
    label: {
        ...STORY_TOKENS.TYPOGRAPHY.pill,
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
});
