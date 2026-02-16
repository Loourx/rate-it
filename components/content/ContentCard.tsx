import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BaseContent, Movie, Series, Book, Game, Music, Podcast, Anything } from '../../lib/types/content';

interface ContentCardProps {
    content: BaseContent;
    onPress: (content: BaseContent) => void;
}

export function ContentCard({ content, onPress }: ContentCardProps) {
    const getSubtitle = (item: BaseContent): string => {
        switch (item.type) {
            case 'movie':
                return (item as Movie).year ? `Película • ${(item as Movie).year}` : 'Película';
            case 'series':
                return (item as Series).year ? `Serie • ${(item as Series).year}` : 'Serie';
            case 'book':
                return (item as Book).author || 'Libro';
            case 'game':
                return (item as Game).year ? `Juego • ${(item as Game).year}` : 'Videojuego';
            case 'music':
                return (item as Music).artist || 'Música';
            case 'podcast':
                return (item as Podcast).publisher || 'Podcast';
            case 'anything':
                return (item as Anything).categoryTag ? `Custom • ${(item as Anything).categoryTag}` : 'Custom';
            default:
                return 'Contenido';
        }
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(content)}
            className="flex-row p-3 border-b border-gray-100 dark:border-gray-800 items-center bg-white dark:bg-gray-900"
            activeOpacity={0.7}
        >
            <View className="w-12 h-16 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden mr-3">
                {content.imageUrl ? (
                    <Image
                        source={{ uri: content.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-300 dark:bg-gray-700">
                        <Text className="text-xs text-gray-500 font-bold">{content.title.substring(0, 1)}</Text>
                    </View>
                )}
            </View>

            <View className="flex-1 justify-center">
                <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                    {content.title}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
                    {getSubtitle(content)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
