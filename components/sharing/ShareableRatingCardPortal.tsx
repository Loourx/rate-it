import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShareableRatingCard } from './ShareableRatingCard';
import type { ShareableRatingCardProps } from './ShareableRatingCard';

interface ShareableRatingCardPortalProps {
    cardProps: Omit<ShareableRatingCardProps, 'format'>;
    storiesRef: React.RefObject<View>;
    feedRef: React.RefObject<View>;
}

/**
 * Renders both card formats off-screen for image capture via react-native-view-shot.
 * Must be mounted before shareAsStory/shareAsFeed is called.
 * collapsable={false} is REQUIRED so React Native does not optimise the node away.
 */
export function ShareableRatingCardPortal({
    cardProps,
    storiesRef,
    feedRef,
}: ShareableRatingCardPortalProps): React.ReactElement {
    return (
        <View style={styles.offscreen} pointerEvents="none">
            {/* Stories format: 9:16 */}
            <View ref={storiesRef} collapsable={false}>
                <ShareableRatingCard {...cardProps} format="stories" />
            </View>

            {/* Feed format: 4:5 */}
            <View ref={feedRef} collapsable={false}>
                <ShareableRatingCard {...cardProps} format="feed" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    offscreen: {
        position: 'absolute',
        left: -9999,
        top: 0,
    },
});
