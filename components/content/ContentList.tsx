import React from 'react';
import { FlatList, View } from 'react-native';
import { BaseContent } from '../../lib/types/content';
import { ContentCard } from './ContentCard';
import { Skeleton } from '../ui/Skeleton';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';

interface ContentListProps {
    data: BaseContent[] | undefined;
    isLoading: boolean;
    isError: boolean;
    onItemPress: (content: BaseContent) => void;
    emptyMessage?: string;
}

export function ContentList({
    data,
    isLoading,
    isError,
    onItemPress,
    emptyMessage = 'No se encontraron resultados'
}: ContentListProps) {

    if (isLoading) {
        return (
            <View className="p-4 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} className="flex-row items-center p-3 bg-surface rounded-2xl">
                        <Skeleton width={64} height={96} borderRadius={8} className="mr-4" />
                        <View className="flex-1 gap-2">
                            <Skeleton width="70%" height={20} borderRadius={4} />
                            <Skeleton width="40%" height={16} borderRadius={4} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    if (isError) {
        return <ErrorState message="No pudimos cargar los resultados." />;
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                icon="search-outline"
                title="Sin resultados"
                description={emptyMessage}
            />
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
                <ContentCard content={item} onPress={onItemPress} />
            )}
            contentContainerClassName="p-4 pb-24"
            showsVerticalScrollIndicator={false}
        />
    );
}
