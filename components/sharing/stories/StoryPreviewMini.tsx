import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { StoryCardProps } from './storyTypes';
import { StoryCanvas } from './StoryCanvas';

const CANVAS_WIDTH = 390;
const CANVAS_HEIGHT = 844;
const PREVIEW_FACTOR = 0.72;

/**
 * StoryPreviewMini — scaled-down StoryCanvas for in-app UI preview.
 * Uses CSS-style scale transform anchored to top-left via margin offset.
 * NOT the capture target — StoryCanvas is.
 */
export function StoryPreviewMini(props: StoryCardProps) {
    const { width: screenWidth } = useWindowDimensions();

    const scale = (screenWidth * PREVIEW_FACTOR) / CANVAS_WIDTH;
    const previewWidth = screenWidth * PREVIEW_FACTOR;
    const previewHeight = CANVAS_HEIGHT * scale;

    // After scaling, the canvas origin shifts by: canvas*(1-scale)/2
    // We translate back to top-left by applying a negative margin.
    const offset = (CANVAS_WIDTH * (1 - scale)) / 2;
    const offsetY = (CANVAS_HEIGHT * (1 - scale)) / 2;

    return (
        <View style={[styles.wrapper, { width: previewWidth, height: previewHeight }]}>
            <View
                style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                    transform: [{ scale }],
                    marginLeft: -offset,
                    marginTop: -offsetY,
                }}
            >
                <StoryCanvas {...props} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: 'hidden',
        borderRadius: 14,
    },
});
