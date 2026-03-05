import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryScore } from './StoryScore';
import { StoryInfo } from './StoryInfo';
import { StoryCardProps } from './storyTypes';

/**
 * Orchestrator for the middle section of the Story card.
 * Aligns the Score and the Info column separated by a subtle vertical divider.
 */
export function StoryVerdict(props: StoryCardProps) {
    return (
        <View style={styles.container}>
            {/* Left: Score */}
            <StoryScore
                score={props.score}
                accentColor={getCategoryColor(props.contentType)}
            />

            {/* Vertical Divider */}
            <View style={styles.divider} />

            {/* Right: Info column */}
            <View style={styles.infoWrapper}>
                <StoryInfo {...props} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: STORY_TOKENS.SURFACE.card,
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 20,
    },
    divider: {
        width: 1,
        backgroundColor: STORY_TOKENS.SURFACE.dividerVertical,
        alignSelf: 'stretch',
        marginVertical: 4,
        marginHorizontal: 16,  // añadir esto — da aire a ambos lados del divisor
    },
    infoWrapper: {
        flex: 1,
        paddingLeft: 0,  // era 16 — ahora el marginHorizontal del divider lo gestiona
    },
});
