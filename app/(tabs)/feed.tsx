import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocialFeed } from '@/lib/hooks/useSocialFeed';
import { router } from 'expo-router';
import FeedCard from '@/components/feed/FeedCard';
import { FeedSkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import { FilterBar, type ActivityFilter } from '@/components/feed/FilterBar';
import type { ContentType } from '@/lib/types/content';
import type { FeedItem } from '@/lib/types/social';

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

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderItem = useCallback(({ item, index }: { item: FeedItem; index: number }) => (
        <FeedCard item={item} index={index} />
    ), []);

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
                    icon="compass-outline"
                    title="Tu feed está esperando"
                    description="Sigue a alguien que te importe y descubre qué están leyendo, viendo y jugando."
                    actionLabel="Descubrir personas"
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
                renderItem={renderItem}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSecondary, ...TYPO.bodySmall }}>
                            Ningún amigo coincide con estos filtros. Prueba otra combinación.
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
                        onRefresh={handleRefresh}
                        tintColor={COLORS.textPrimary}
                    />
                }
                contentContainerStyle={{ paddingVertical: 16 }}
                windowSize={5}
                maxToRenderPerBatch={10}
                initialNumToRender={8}
                removeClippedSubviews
            />
        </View>
    );
}
