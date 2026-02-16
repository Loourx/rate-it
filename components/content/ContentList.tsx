import React from 'react';
import { FlatList, View, Text, ActivityIndicator } from 'react-native';
import { BaseContent } from '../../lib/types/content';
import { ContentCard } from './ContentCard';

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
            <View className="flex-1 items-center justify-center py-10">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-2">Buscando...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View className="flex-1 items-center justify-center py-10 px-6">
                <Text className="text-red-500 text-center text-base mb-2">⚠ Ocurrió un error</Text>
                <Text className="text-gray-500 text-center">No pudimos completar tu búsqueda. Por favor, intenta de nuevo.</Text>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-10 px-6">
                <Text className="text-gray-400 text-base text-center">{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
                <ContentCard content={item} onPress={onItemPress} />
            )}
            contentContainerClassName="pb-6"
            showsVerticalScrollIndicator={false}
        />
    );
}
