import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import type { Notification } from '@/lib/types/notifications';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';

interface NotificationItemProps {
    notification: Notification;
    index?: number;
}

export default React.memo(function NotificationItem({ notification, index = 0 }: NotificationItemProps) {
    const handlePress = () => {
        if (notification.type === 'follow') {
            router.push(`/profile/${notification.actorId}`);
        } else if (notification.type === 'like' && notification.ratingId) {
            router.push(
                `/content/${notification.ratingType}/${notification.ratingId}` as never,
            );
        } else if (notification.type === 'recommendation' && notification.recContentId) {
            router.push(
                `/content/${notification.recContentType}/${notification.recContentId}` as never,
            );
        }
    };

    /**
     * Generates a conversational message based on the notification type.
     * Uses brand-specific personality (informal, engaging).
     */
    const getMessage = () => {
        // New follower: emphasis on visibility
        if (notification.type === 'follow') {
            return (
                <Text className="text-primary text-sm">
                    <Text className="font-semibold">{notification.actorUsername}</Text>
                    <Text className="text-secondary"> ahora ve lo que puntúas 👀</Text>
                </Text>
            );
        }

        // Like on review: friendly/appreciative tone
        if (notification.type === 'like') {
            return (
                <Text className="text-primary text-sm">
                    <Text className="font-semibold">{notification.actorUsername}</Text>
                    <Text className="text-secondary"> aplaudió tu reseña de </Text>
                    <Text className="font-semibold">{notification.ratingTitle}</Text>
                    <Text className="text-secondary"> 👏</Text>
                </Text>
            );
        }

        // Recommendation: helpful/curated suggestion tone
        if (notification.type === 'recommendation') {
            return (
                <Text className="text-primary text-sm">
                    <Text className="font-semibold">{notification.actorUsername}</Text>
                    <Text className="text-secondary"> cree que deberías ver </Text>
                    <Text className="font-semibold">{notification.recContentTitle}</Text>
                    <Text className="text-secondary"> 🎯</Text>
                </Text>
            );
        }

        return null;
    };

    return (
        <Animated.View
            entering={FadeInDown
                .delay(Math.min(index, 9) * 40)
                .duration(250)
                .reduceMotion(ReduceMotion.System)
            }
        >
        <Pressable
            onPress={handlePress}
            className={`flex-row items-center px-4 py-3 ${
                !notification.isRead ? 'bg-surface-elevated/50' : 'bg-transparent'
            } active:opacity-70`}
        >
            <Image
                source={notification.actorAvatarUrl || 'https://i.pravatar.cc/150'}
                cachePolicy="memory-disk"
                className="w-12 h-12 rounded-full"
            />

            <View className="flex-1 ml-3">
                {getMessage()}
                <Text className="text-tertiary text-xs mt-1">
                    {formatRelativeDate(notification.createdAt)}
                </Text>
            </View>

            {!notification.isRead && (
                <View className="w-2 h-2 rounded-full bg-link" />
            )}
        </Pressable>
        </Animated.View>
    );
});
