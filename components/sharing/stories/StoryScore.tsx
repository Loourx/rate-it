import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StoryScoreProps {
    score: number;
    accentColor: string;
}

function formatScore(score: number): string {
    if (score === 10) return '10';
    return score.toFixed(1); // "7.0", "9.5", etc.
}

/**
 * StoryScore — Unifies score rendering into a single line.
 * Optimized size (76px) to prevent vertical overflow on social shares.
 */
export function StoryScore({ score, accentColor }: StoryScoreProps): React.ReactElement {
    return (
        <View style={styles.container}>
            <Text style={[styles.scoreText, { color: accentColor }]}>
                {formatScore(score)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    scoreText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 76,
        lineHeight: 80,
        letterSpacing: -2,
        includeFontPadding: false,
    },
});
