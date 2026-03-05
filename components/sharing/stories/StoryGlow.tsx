import React from 'react';
import Svg, { Defs, RadialGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { getCategoryColor } from '@/lib/utils/constants';
import { STORY_TOKENS } from './storyTokens';
import { StoryContentType } from './storyTypes';

interface StoryGlowProps {
    contentType: StoryContentType;
}

export function StoryGlow({ contentType }: StoryGlowProps): React.ReactElement {
    const { width, height } = STORY_TOKENS.CANVAS;
    const { top, bottom } = STORY_TOKENS.GLOW;
    const color = getCategoryColor(contentType);

    return (
        <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
        >
            <Defs>
                <RadialGradient
                    id="glowTop"
                    cx={top.cx}
                    cy={top.cy}
                    rx={top.rx}
                    ry={top.ry}
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0" stopColor={color} stopOpacity={top.opacity} />
                    <Stop offset="0.5" stopColor={color} stopOpacity={top.opacity * 0.4} />
                    <Stop offset="1" stopColor={color} stopOpacity={0} />
                </RadialGradient>

                <RadialGradient
                    id="glowBottom"
                    cx={bottom.cx}
                    cy={bottom.cy}
                    rx={bottom.rx}
                    ry={bottom.ry}
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0" stopColor={color} stopOpacity={bottom.opacity} />
                    <Stop offset="0.5" stopColor={color} stopOpacity={bottom.opacity * 0.4} />
                    <Stop offset="1" stopColor={color} stopOpacity={0} />
                </RadialGradient>
            </Defs>

            {/* Fondo base */}
            <Rect x="0" y="0" width={width} height={height} fill="#0A0A0A" />

            {/* Glow superior derecha */}
            <Ellipse
                cx={top.cx}
                cy={top.cy}
                rx={top.rx}
                ry={top.ry}
                fill="url(#glowTop)"
            />

            {/* Glow inferior izquierda */}
            <Ellipse
                cx={bottom.cx}
                cy={bottom.cy}
                rx={bottom.rx}
                ry={bottom.ry}
                fill="url(#glowBottom)"
            />
        </Svg>
    );
}
