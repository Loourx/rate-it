import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryScoreProps {
    score: number;
    contentType: StoryContentType;
}

/**
 * Oversized score display for Story cards.
 * Features an emissive glow effect and specific formatting for "10".
 */
export function StoryScore({ score, contentType }: StoryScoreProps) {
    const color = getCategoryColor(contentType);

    // Formatting: 10 fixed, others show one decimal
    const displayScore = score === 10 ? '10' : score.toFixed(1);

    return (
        <View style={styles.container}>
            <Text
                style={[
                    styles.score,
                    {
                        color,
                        textShadowColor: color + 'AA', // Emissive glow (~66% opacity per briefing instruction)
                    },
                ]}
            >
                {displayScore}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: STORY_TOKENS.SCORE_COLUMN_WIDTH, // 110px
        justifyContent: 'center',
        alignItems: 'center',
    },
    score: {
        ...STORY_TOKENS.TYPOGRAPHY.score,
        fontFamily: FONT.bold,
        letterSpacing: -4,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 40,
    },
});
