import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STORY_TOKENS } from './storyTokens';
import { StoryCardProps } from './storyTypes';
import { StoryGlow } from './StoryGlow';
import { StoryCard } from './StoryCard';

const { CANVAS, CARD, SURFACE, TEXT_COLOR, TYPOGRAPHY } = STORY_TOKENS;

/**
 * StoryCanvas — root 9:16 canvas captured by react-native-view-shot.
 * Fixed 390×844 px. Never use Dimensions.get() here.
 */
export function StoryCanvas(props: StoryCardProps) {
    return (
        <View style={styles.canvas}>
            {/* Layer 1 — Ambient glow (background) */}
            <StoryGlow contentType={props.contentType} />

            {/* Layer 2 — Decorative canvas branding */}
            <View style={styles.brandingContainer}>
                <Text style={styles.brandingText}>RATE. / COMPARTIR</Text>
            </View>

            {/* Layer 3 — Floating card */}
            <View style={styles.cardWrapper}>
                <StoryCard {...props} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    canvas: {
        width: CANVAS.width,
        height: CANVAS.height,
        backgroundColor: SURFACE.canvas,
        overflow: 'hidden',
        position: 'relative',
    },
    brandingContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    brandingText: {
        ...TYPOGRAPHY.canvasBranding,
        color: TEXT_COLOR.branding,
        letterSpacing: 3,
    },
    cardWrapper: {
        position: 'absolute',
        top: CARD.top,
        left: CARD.marginHorizontal,
    },
});
