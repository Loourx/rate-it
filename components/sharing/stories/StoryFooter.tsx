import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryFooterProps {
    username: string;
    contentType: StoryContentType;
}

/**
 * Bottom row of the Story card.
 * Displays the @username and the "Rate." brand wordmark.
 */
export function StoryFooter({ username, contentType }: StoryFooterProps) {
    const dotColor = getCategoryColor(contentType);

    return (
        <View style={styles.container}>
            {/* Top horizontal divider */}
            <View style={styles.divider} />

            {/* Content row */}
            <View style={styles.row}>
                <Text style={styles.username}>@{username}</Text>

                <Text style={styles.wordmark}>
                    Rate
                    <Text style={{ color: dotColor }}>.</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: STORY_TOKENS.SURFACE.card,
    },
    divider: {
        height: 1,
        backgroundColor: STORY_TOKENS.SURFACE.dividerFooter,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    username: {
        ...STORY_TOKENS.TYPOGRAPHY.username,
        color: STORY_TOKENS.TEXT_COLOR.quaternary,
    },
    wordmark: {
        ...STORY_TOKENS.TYPOGRAPHY.wordmark,
        color: '#FFFFFF',
    },
});
