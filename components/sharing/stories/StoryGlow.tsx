import React from 'react';
import Svg, {
    Defs, RadialGradient, Stop, Rect, Ellipse,
} from 'react-native-svg';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryGlowProps {
    contentType: StoryContentType;
}

/**
 * Ambient background glow for the story canvas.
 * Uses a radial gradient centered in the safe zone.
 */
export function StoryGlow({ contentType }: StoryGlowProps) {
    const { width, height } = STORY_TOKENS.CANVAS;
    const {
        centerX, centerY, rx, ry, opacityStart,
    } = STORY_TOKENS.GLOW;
    const color = getCategoryColor(contentType);

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: 'absolute', inset: 0 }}
        >
            <Defs>
                <RadialGradient
                    id="glow"
                    cx={centerX}
                    cy={centerY}
                    rx={rx}
                    ry={ry}
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0" stopColor={color} stopOpacity={opacityStart} />
                    <Stop offset="1" stopColor="#121212" stopOpacity={0} />
                </RadialGradient>
            </Defs>

            {/* Background Rect */}
            <Rect x="0" y="0" width={width} height={height} fill="#121212" />

            {/* Ambient Gradient Ellipse */}
            <Ellipse
                cx={centerX}
                cy={centerY}
                rx={rx}
                ry={ry}
                fill="url(#glow)"
            />
        </Svg>
    );
}
