import React, { useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { FeedItem } from '@/lib/types/social';
import { COLORS, formatScore } from '@/lib/utils/constants';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';
import { useRatingLike } from '@/lib/hooks/useRatingLike';
import { useRatingLikesCount } from '@/lib/hooks/useRatingLikesCount';

interface FeedCardProps {
    item: FeedItem;
    index: number;
}

export default function FeedCard({ item, index }: FeedCardProps) {
    const categoryColor = getCategoryColor(item.contentType);
    const animationDelay = index < 8 ? index * 50 : 0;

    const { isLiked, toggle, isMutating } = useRatingLike(item.id);
    const { data: likesCount } = useRatingLikesCount(item.id);

    const heartScale = useSharedValue(1);
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const handleLikePress = useCallback(() => {
        if (isMutating) return;
        heartScale.value = withSpring(1.3, { damping: 15 }, () => {
            heartScale.value = withSpring(1, { damping: 15 });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggle();
    }, [isMutating, toggle, heartScale]);

    const navigateToProfile = () => {
        router.push(`/profile/${item.userId}`);
    };

    const navigateToContent = () => {
        router.push(`/content/${item.contentType}/${item.contentId}`);
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(animationDelay).duration(300)}
            className="mx-4 mb-3"
        >
            <Pressable
                className="bg-surface rounded-2xl p-4 active:opacity-80"
                onPress={navigateToContent}
            >
                {/* Header: Avatar + Username + Acción */}
                <View className="flex-row items-center mb-3">
                    <Pressable onPress={navigateToProfile}>
                        <Image
                            source={{
                                uri: item.userAvatarUrl || 'https://i.pravatar.cc/150',
                            }}
                            className="w-10 h-10 rounded-full"
                        />
                    </Pressable>

                    <View className="flex-1 ml-3">
                        <Text className="text-primary font-semibold">
                            {item.username}
                            <Text className="text-secondary font-normal">
                                {' '}
                                valoró
                            </Text>
                        </Text>
                        <Text className="text-tertiary text-xs">
                            {formatRelativeDate(item.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Content Card */}
                <View className="flex-row mb-3">
                    {item.contentImageUrl && (
                        <Image
                            source={{ uri: item.contentImageUrl }}
                            className="w-16 h-24 rounded-lg"
                            resizeMode="cover"
                        />
                    )}
                    <View className="flex-1 ml-3 justify-center">
                        <Text
                            className="text-primary font-bold text-base"
                            numberOfLines={2}
                        >
                            {item.contentTitle}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <Text
                                className="text-2xl font-bold mr-2"
                                style={{ color: categoryColor }}
                            >
                                {formatScore(item.score)}
                            </Text>
                            <View className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${(item.score / 10) * 100}%`,
                                        backgroundColor: categoryColor,
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Review (si existe) */}
                {item.reviewText && (
                    <View className="mb-2">
                        {item.hasSpoiler && (
                            <View className="bg-error/20 px-2 py-1 rounded mb-1 self-start">
                                <Text className="text-error text-xs font-semibold">
                                    🚨 SPOILER
                                </Text>
                            </View>
                        )}
                        <Text
                            className="text-secondary text-sm"
                            numberOfLines={3}
                        >
                            {item.reviewText}
                        </Text>
                    </View>
                )}

                {/* Footer: Like button */}
                <View className="flex-row items-center pt-2 border-t border-divider">
                    <Pressable
                        className="flex-row items-center active:opacity-70"
                        onPress={handleLikePress}
                        disabled={isMutating}
                    >
                        <Animated.Text
                            className="text-2xl mr-1"
                            style={heartAnimatedStyle}
                        >
                            {isLiked ? '❤️' : '♡'}
                        </Animated.Text>
                        <Text className="text-tertiary text-sm">
                            {likesCount ?? item.likesCount} likes
                        </Text>
                    </Pressable>
                </View>
            </Pressable>
        </Animated.View>
    );
}

/** Map content type → category color from the design system */
function getCategoryColor(type: FeedItem['contentType']): string {
    const colors: Record<FeedItem['contentType'], string> = {
        movie: COLORS.categoryMovie,
        tv: COLORS.categorySeries,
        book: COLORS.categoryBook,
        game: COLORS.categoryGame,
        music: COLORS.categoryMusic,
        podcast: COLORS.categoryPodcast,
        custom: COLORS.categoryAnything,
    };
    return colors[type] ?? COLORS.textPrimary;
}
