import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocialFeed } from '@/lib/hooks/useSocialFeed';
import { router } from 'expo-router';
import FeedCard from '@/components/feed/FeedCard';
import { FeedSkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { FilterBar, type ActivityFilter } from '@/components/feed/FilterBar';
import type { ContentType } from '@/lib/types/content';

export default function FeedScreen() {
    const insets = useSafeAreaInsets();
    const {
        data,
        isLoading,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSocialFeed();

    const [categoryFilter, setCategoryFilter] = useState<ContentType | 'all'>('all');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

    const allItems = data?.pages.flatMap((page) => page) ?? [];

    const filteredItems = allItems.filter((item) => {
        if (categoryFilter !== 'all' && item.contentType !== categoryFilter) return false;
        if (activityFilter === 'reviewed' && !item.reviewText) return false;
        return true;
    });

    // ESTADO 1: Loading inicial
    if (isLoading) {
        return (
            <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
                <FeedSkeletonList count={5} />
            </View>
        );
    }

    // ESTADO 2: Error
    if (error) {
        return (
            <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
                <ErrorState
                    message="No pudimos cargar tu feed"
                    onRetry={refetch}
                />
            </View>
        );
    }

    // ESTADO 3: Empty
    if (allItems.length === 0) {
        return (
            <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
                <EmptyState
                    icon="people-outline"
                    title="Tu feed está vacío"
                    description="Sigue a otros usuarios para ver su actividad aquí"
                    actionLabel="Buscar usuarios"
                    onAction={() => router.push('/(tabs)/search')}
                />
            </View>
        );
    }

    // ESTADO 4: Success — FlatList con scroll infinito
    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <FilterBar
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                activityFilter={activityFilter}
                onActivityChange={setActivityFilter}
            />
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <FeedCard item={item} index={index} />
                )}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.bodyMedium }}>
                            Sin resultados con estos filtros
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View className="py-4">
                            <ActivityIndicator
                                size="small"
                                color={COLORS.textPrimary}
                            />
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={refetch}
                        tintColor={COLORS.textPrimary}
                    />
                }
                contentContainerStyle={{ paddingVertical: 16 }}
            />
        </View>
    );
}
