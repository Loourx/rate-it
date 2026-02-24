import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Notification } from '@/lib/types/notifications';
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate';

interface NotificationItemProps {
    notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
    const handlePress = () => {
        if (notification.type === 'follow') {
            router.push(`/profile/${notification.actorId}`);
        } else if (notification.type === 'like' && notification.ratingId) {
            router.push(
                `/content/${notification.ratingType}/${notification.ratingId}` as never,
            );
        }
    };

    const getMessage = () => {
        if (notification.type === 'follow') {
            return (
                <Text className="text-primary text-sm">
                    <Text className="font-semibold">{notification.actorUsername}</Text>
                    <Text className="text-secondary"> comenzó a seguirte</Text>
                </Text>
            );
        }

        if (notification.type === 'like') {
            return (
                <Text className="text-primary text-sm">
                    <Text className="font-semibold">{notification.actorUsername}</Text>
                    <Text className="text-secondary"> le gustó tu reseña de </Text>
                    <Text className="font-semibold">{notification.ratingTitle}</Text>
                </Text>
            );
        }

        return null;
    };

    return (
        <Pressable
            onPress={handlePress}
            className={`flex-row items-center px-4 py-3 ${
                !notification.isRead ? 'bg-surface-elevated/50' : 'bg-transparent'
            } active:opacity-70`}
        >
            <Image
                source={{
                    uri: notification.actorAvatarUrl || 'https://i.pravatar.cc/150',
                }}
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
    );
}
