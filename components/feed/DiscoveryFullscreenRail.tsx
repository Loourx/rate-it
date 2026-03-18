import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDiscoveryFeed, type DiscoveryItem } from '@/lib/hooks/useDiscoveryFeed';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { DiscoveryFullscreenCard } from './DiscoveryFullscreenCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterBar, type ActivityFilter } from '@/components/feed/FilterBar';
import type { ContentType } from '@/lib/types/content';
import type { FlatListProps } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 56;

const AnimatedFlatList = Animated.createAnimatedComponent(
    FlatList as React.ComponentType<FlatListProps<DiscoveryItem>>,
);

export function DiscoveryFullscreenRail(): React.ReactElement {
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const [categoryFilter, setCategoryFilter] = useState<ContentType | 'all'>('all');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

    const {
        items,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useDiscoveryFeed();

    const TAB_BAR_HEIGHT = 49 + insets.bottom;
    const CARD_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;
    const cardWidth = Math.min(340, SCREEN_WIDTH - SPACING.xl);
    const horizontalInset = Math.max(SPACING.base, Math.max(insets.left, insets.right) + SPACING.sm);

    const filteredItems = useMemo(() => {
        if (categoryFilter === 'all') return items;
        return items.filter((item) => item.contentType === categoryFilter);
    }, [items, categoryFilter]);

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
    );

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, CARD_HEIGHT * 0.4],
        outputRange: [0, -HEADER_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, CARD_HEIGHT * 0.3],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const renderItem = useCallback(
        ({ item }: { item: DiscoveryItem }) => (
            <View style={{ height: CARD_HEIGHT, width: SCREEN_WIDTH }}>
                <DiscoveryFullscreenCard item={item} width={cardWidth} height={CARD_HEIGHT} />
            </View>
        ),
        [CARD_HEIGHT, cardWidth],
    );

    if (isLoading && filteredItems.length === 0) {
        return (
            <View style={{ height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
            </View>
        );
    }

    if (isError && filteredItems.length === 0) {
        return (
            <View style={{ height: CARD_HEIGHT }}>
                <ErrorState message={error?.message || 'No pudimos cargar Discovery'} onRetry={refetch} />
            </View>
        );
    }

    if (filteredItems.length === 0) {
        return (
            <View style={{ height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl }}>
                <Text style={{ color: COLORS.textSecondary, textAlign: 'center', ...TYPO.body, fontFamily: FONT.medium }}>
                    Aun no hay suficientes ratings para poblar Discovery.
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, height: CARD_HEIGHT, backgroundColor: '#0A0A0A' }}>
            <Animated.View
                style={{
                    transform: [{ translateY: headerTranslateY }],
                    opacity: headerOpacity,
                    position: 'absolute',
                    top: insets.top,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    height: HEADER_HEIGHT,
                    backgroundColor: '#0A0A0A',
                }}
            >
                <FilterBar
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    activityFilter={activityFilter}
                    onActivityChange={setActivityFilter}
                    horizontalInset={horizontalInset}
                />
            </Animated.View>

            <AnimatedFlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                pagingEnabled={false}
                snapToInterval={CARD_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                getItemLayout={(_data, index) => ({
                    length: CARD_HEIGHT,
                    offset: CARD_HEIGHT * index + HEADER_HEIGHT,
                    index,
                })}
                showsVerticalScrollIndicator={false}
                windowSize={3}
                maxToRenderPerBatch={3}
                initialNumToRender={2}
                removeClippedSubviews
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={{ paddingBottom: SPACING.base }}>
                            <ActivityIndicator size="small" color={COLORS.textPrimary} />
                        </View>
                    ) : null
                }
                nestedScrollEnabled
            />
        </View>
    );
}
