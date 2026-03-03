import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ShareableRatingCard, ShareableRatingCardProps } from '@/components/sharing/ShareableRatingCard';
import { COLORS } from '@/lib/utils/constants';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;
const SCALE = 0.45;

const PREVIEW_WIDTH = Math.round(CARD_WIDTH * SCALE);   // ≈ 162
const PREVIEW_HEIGHT = Math.round(CARD_HEIGHT * SCALE); // ≈ 288

interface SharePreviewMiniProps {
    cardProps: ShareableRatingCardProps;
    style?: StyleProp<ViewStyle>;
}

export function SharePreviewMini({
    cardProps,
    style,
}: SharePreviewMiniProps): React.ReactElement {
    return (
        <View style={[styles.outer, style]}>
            {/* Clipping container — exact scaled dimensions */}
            <View style={styles.clipper} pointerEvents="none">
                {/* The card renders at its natural size, scaled from top-left */}
                <View
                    style={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        transform: [{ scale: SCALE }],
                        transformOrigin: 'top left',
                    } as ViewStyle}
                >
                    <ShareableRatingCard {...cardProps} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        // Shadow wrapper — must not clip itself
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    clipper: {
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        overflow: 'hidden',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
});
