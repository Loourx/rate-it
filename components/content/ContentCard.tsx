import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BaseContent, Movie, Series, Book, Game, Music, Podcast, Anything } from '../../lib/types/content';
import { getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { RatingSlider } from '../rating/RatingSlider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ContentCardProps {
    content: BaseContent;
    onPress: (content: BaseContent) => void;
    rating?: number;
    orientation?: 'horizontal' | 'vertical';
}

const formatRuntime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
};

const getGenres = (item: BaseContent): string[] => {
    switch (item.type) {
        case 'movie': return (item as Movie).genres ?? [];
        case 'series': return (item as Series).genres ?? [];
        case 'game': return (item as Game).genres ?? [];
        case 'book': return (item as Book).categories ?? [];
        default: return [];
    }
};

const getSubtitle = (item: BaseContent): string => {
    switch (item.type) {
        case 'movie': {
            const movie = item as Movie;
            const parts: string[] = [];
            if (movie.year) parts.push(movie.year);
            if (movie.runtime) parts.push(formatRuntime(movie.runtime));
            return parts.length > 0 ? parts.join(' · ') : 'Película';
        }
        case 'series': {
            const series = item as Series;
            const parts: string[] = [];
            if (series.year) parts.push(series.year);
            if (series.seasons) parts.push(`${series.seasons} temporada${series.seasons > 1 ? 's' : ''}`);
            return parts.length > 0 ? parts.join(' · ') : 'Serie';
        }
        case 'book': return (item as Book).author || 'Libro';
        case 'game': return (item as Game).year ?? 'Videojuego';
        case 'music': return (item as Music).artist || 'Música';
        case 'podcast': return (item as Podcast).publisher || 'Podcast';
        case 'anything': return (item as Anything).categoryTag ?? 'Anything';
        default: return 'Contenido';
    }
};

const getSecondaryInfo = (item: BaseContent): string | null => {
    if (item.type === 'music') {
        const music = item as Music;
        if (!music.isAlbum && music.album) return music.album;
    }
    if (item.type === 'game') {
        const game = item as Game;
        if (game.platforms && game.platforms.length > 0) return game.platforms[0];
    }
    return null;
};

export function ContentCard({ content, onPress, rating, orientation = 'horizontal' }: ContentCardProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
        opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const categoryColor = getCategoryColor(content.type);
    const categoryFaded = getCategoryFadedColor(content.type);
    const genres = getGenres(content).slice(0, 2);
    const secondaryInfo = getSecondaryInfo(content);

    const containerClasses = orientation === 'horizontal'
        ? "flex-row p-3 bg-surface rounded-2xl mb-3 overflow-hidden"
        : "w-[160px] p-3 bg-surface rounded-2xl mr-3 overflow-hidden";

    const imageContainerClasses = orientation === 'horizontal'
        ? "w-16 h-24 rounded-lg mr-4"
        : "w-full h-[140px] rounded-lg mb-2";

    return (
        <AnimatedPressable
            onPress={() => onPress(content)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animatedStyle]}
            className={containerClasses}
        >
            <View className={`bg-surface-elevated overflow-hidden ${imageContainerClasses}`}>
                {content.imageUrl ? (
                    <Image source={{ uri: content.imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-surface-elevated">
                        <Text className="text-xl font-bold text-tertiary">{content.title.substring(0, 1)}</Text>
                    </View>
                )}
            </View>

            <View className={orientation === 'vertical' ? "flex-1" : "flex-1 justify-center"}>
                <Text className="text-sm font-semibold text-primary mb-1" numberOfLines={2}>
                    {content.title}
                </Text>

                {orientation === 'horizontal' && (
                    <>
                        <Text className="text-xs text-secondary" numberOfLines={1}>
                            {getSubtitle(content)}
                        </Text>
                        {secondaryInfo && (
                            <Text className="text-xs text-tertiary" numberOfLines={1}>
                                {secondaryInfo}
                            </Text>
                        )}
                        {genres.length > 0 && (
                            <View className="flex-row flex-wrap mt-1 gap-1">
                                {genres.map((genre) => (
                                    <View
                                        key={genre}
                                        style={{ backgroundColor: categoryFaded }}
                                        className="px-2 py-0.5 rounded"
                                    >
                                        <Text style={{ color: categoryColor }} className="text-xs">
                                            {genre}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {rating !== undefined ? (
                    <View className={orientation === 'horizontal' ? 'mt-1' : ''}>
                        <RatingSlider
                            value={rating}
                            onValueChange={() => undefined}
                            category={content.type}
                            size="display"
                            layout={orientation === 'vertical' ? 'vertical' : 'horizontal'}
                        />
                    </View>
                ) : (
                    <View className="flex-row items-center mt-1">
                        <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: categoryColor }} />
                        <Text className="text-xs text-tertiary capitalize">{content.type}</Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}
