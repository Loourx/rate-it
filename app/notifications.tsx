import React, { useEffect, useCallback } from 'react';
import { FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { useNotifications } from '@/lib/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import Screen from '@/components/ui/Screen';
import { NotificationSkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsScreen() {
    const {
        data: notifications,
        isLoading,
        error,
        refetch,
        markAllAsRead,
    } = useNotifications();

    // Marcar todas como leídas 500ms después de abrir la pantalla
    useEffect(() => {
        if (notifications && notifications.some((n) => !n.isRead)) {
            const timer = setTimeout(() => markAllAsRead(), 500);
            return () => clearTimeout(timer);
        }
    }, [notifications, markAllAsRead]);

    const handleGoToFeed = useCallback(() => {
        router.push('/(tabs)/feed');
    }, []);

    if (isLoading) {
        return (
            <Screen edges={['top']}>
                <Stack.Screen options={{ title: 'Notificaciones' }} />
                <NotificationSkeletonList count={8} />
            </Screen>
        );
    }

    if (error) {
        return (
            <Screen edges={['top']}>
                <Stack.Screen options={{ title: 'Notificaciones' }} />
                <ErrorState
                    message="No pudimos cargar tus notificaciones"
                    onRetry={refetch}
                />
            </Screen>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <Screen edges={['top']}>
                <Stack.Screen options={{ title: 'Notificaciones' }} />
                <EmptyState
                    icon="notifications-outline"
                    title="Sin notificaciones"
                    description="Te avisaremos cuando alguien interactúe con tu contenido"
                    actionLabel="Ir al feed"
                    onAction={handleGoToFeed}
                />
            </Screen>
        );
    }

    return (
        <Screen edges={['top']}>
            <Stack.Screen options={{ title: 'Notificaciones' }} />
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationItem notification={item} />}
                contentContainerStyle={{ paddingVertical: 8 }}
            />
        </Screen>
    );
}
