import React, { useCallback } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';

interface CardActionsProps {
    isLiked?: boolean;
    likesCount?: number;
    onLike?: () => void;
    likeMutating?: boolean;
}

export function CardActions({
    isLiked = false,
    likesCount = 0,
    onLike,
    likeMutating = false,
}: CardActionsProps) {
    const heartScale = useSharedValue(1);
    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const handleLike = useCallback(() => {
        if (likeMutating || !onLike) return;
        heartScale.value = withSpring(1.3, { damping: 15 }, () => {
            heartScale.value = withSpring(1, { damping: 15 });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLike();
    }, [likeMutating, onLike, heartScale]);

    return (
        <View style={S.wrapper}>
            <Pressable
                style={S.likeBtn}
                onPress={handleLike}
                disabled={likeMutating}
            >
                <Animated.Text style={[S.heart, heartStyle]}>
                    {isLiked ? '❤️' : '♡'}
                </Animated.Text>
                <Text style={S.count}>{likesCount} likes</Text>
            </Pressable>
        </View>
    );
}

const S = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heart: {
        fontSize: 22,
        marginRight: 4,
    },
    count: {
        ...TYPO.caption,
        color: COLORS.textTertiary,
    },
});
