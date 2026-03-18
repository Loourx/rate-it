import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHybridFeed } from '@/lib/hooks/useHybridFeed';
import { hybridFeedKeyExtractor } from '@/lib/types/hybridFeed';
import type { HybridFeedItem } from '@/lib/types/hybridFeed';
import { FeedSectionSeparator } from '@/components/feed/FeedSectionSeparator';
import { GlobalTrendingCard } from '@/components/content/GlobalTrendingCard';
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
    const horizontalInset = Math.max(SPACING.base, Math.max(insets.left, insets.right) + SPACING.sm);
    const {
        items,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        hasSocialItems,
    } = useHybridFeed();

    const [categoryFilter, setCategoryFilter] = useState<ContentType | 'all'>('all');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

    // El filtro solo aplica a items sociales — los trending y separador
    // siempre se muestran independientemente del filtro.
    const filteredItems = items.filter((item): item is HybridFeedItem => {
        if (item.kind === 'separator') return true;
        if (item.kind === 'trending') return true;
        // kind === 'social': aplicar filtros existentes
        if (categoryFilter !== 'all' && item.data.contentType !== categoryFilter) return false;
        if (activityFilter === 'reviewed' && !item.data.reviewText) return false;
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

    const renderItem = useCallback(
        ({ item, index }: { item: HybridFeedItem; index: number }): React.ReactElement | null => {
            switch (item.kind) {
                case 'social':
                    return <FeedCard item={item.data} index={index} />;
                case 'separator':
                    return <FeedSectionSeparator label={item.label} horizontalInset={horizontalInset} />;
                case 'trending':
                    if (index > 0 && filteredItems[index - 1]?.kind === 'trending') {
                        return null;
                    }

                    const trendingRow = filteredItems
                        .slice(index)
                        .filter((feedItem): feedItem is HybridFeedItem & { kind: 'trending' } => feedItem.kind === 'trending')
                        .map((feedItem) => feedItem.data);

                    return (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: horizontalInset,
                                paddingRight: horizontalInset + SPACING.sm,
                            }}
                        >
                            {trendingRow.map((trendingItem) => (
                                <GlobalTrendingCard
                                    key={`${trendingItem.contentType}-${trendingItem.contentId}`}
                                    item={trendingItem}
                                    onPress={() =>
                                        router.push(
                                            `/content/${trendingItem.contentType}/${trendingItem.contentId}`
                                        )
                                    }
                                />
                            ))}
                            <View style={{ width: SPACING.xs }} />
                        </ScrollView>
                    );
                default:
                    return null;
            }
        },
        [filteredItems, horizontalInset],
    );

    // ESTADO 1: Loading inicial
    if (isLoading) {
        return (
            <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
                <FeedSkeletonList count={5} />
            </View>
        );
    }

    // ESTADO 2: Error
    if (isError) {
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
    if (items.length === 0) {
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
                horizontalInset={horizontalInset}
            />
            <FlatList
                data={filteredItems}
                keyExtractor={hybridFeedKeyExtractor}
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
                removeClippedSubviews={false}
            />
        </View>
    );
}
