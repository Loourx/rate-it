import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShareableRatingCard } from './ShareableRatingCard';
import type { ShareableRatingCardProps } from './ShareableRatingCard';

import ViewShot from 'react-native-view-shot';

interface ShareableRatingCardPortalProps {
    cardProps: ShareableRatingCardProps;
    storiesRef: React.RefObject<ViewShot | null>;
    feedRef: React.RefObject<ViewShot | null>;
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
            <ViewShot ref={storiesRef}>
                <ShareableRatingCard {...cardProps} />
            </ViewShot>

            <ViewShot ref={feedRef}>
                <ShareableRatingCard {...cardProps} />
            </ViewShot>
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
