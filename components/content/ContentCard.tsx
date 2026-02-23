import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BaseContent, Movie, Series, Book, Game, Music, Podcast, Anything } from '../../lib/types/content';
import { COLORS } from '@/lib/utils/constants';
import { RatingSlider } from '../rating/RatingSlider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ContentCardProps {
    content: BaseContent;
    onPress: (content: BaseContent) => void;
    rating?: number;
    orientation?: 'horizontal' | 'vertical'; // horizontal = row (list), vertical = column (carousel)
}

export function ContentCard({ content, onPress, rating, orientation = 'horizontal' }: ContentCardProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const getCategoryColor = (type: string) => {
        switch (type) {
            case 'movie': return COLORS.categoryMovie;
            case 'series': return COLORS.categorySeries;
            case 'book': return COLORS.categoryBook;
            case 'game': return COLORS.categoryGame;
            case 'music': return COLORS.categoryMusic;
            case 'podcast': return COLORS.categoryPodcast;
            case 'anything': return COLORS.categoryAnything;
            default: return COLORS.textPrimary;
        }
    };

    const getSubtitle = (item: BaseContent): string => {
        switch (item.type) {
            case 'movie':
                return (item as Movie).year ? `${(item as Movie).year}` : 'Película';
            case 'series':
                return (item as Series).year ? `${(item as Series).year}` : 'Serie';
            case 'book':
                return (item as Book).author || 'Libro';
            case 'game':
                return (item as Game).year ? `${(item as Game).year}` : 'Videojuego';
            case 'music':
                return (item as Music).artist || 'Música';
            case 'podcast':
                return (item as Podcast).publisher || 'Podcast';
            case 'anything':
                return (item as Anything).categoryTag ? `${(item as Anything).categoryTag}` : 'Custom';
            default:
                return 'Contenido';
        }
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
        opacity.value = withTiming(0.8, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1, { duration: 100 });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const categoryColor = getCategoryColor(content.type);

    // Dynamic classes based on orientation
    const containerClasses = orientation === 'horizontal'
        ? "flex-row p-3 bg-surface rounded-2xl mb-3 overflow-hidden"
        : "w-[160px] p-3 bg-surface rounded-2xl mr-3 overflow-hidden h-[260px]"; // Fixed width for carousel

    const imageContainerClasses = orientation === 'horizontal'
        ? "w-16 h-24 rounded-lg mr-4"
        : "w-full h-[180px] rounded-lg mb-3";

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
                    <Image
                        source={{ uri: content.imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-surface-elevated">
                        <Text className="text-xl font-bold text-tertiary">{content.title.substring(0, 1)}</Text>
                    </View>
                )}
            </View>

            <View className="flex-1 justify-center">
                <Text className="text-base font-semibold text-primary mb-1" numberOfLines={orientation === 'vertical' ? 1 : 2}>
                    {content.title}
                </Text>
                {orientation === 'horizontal' && (
                    <Text className="text-sm text-secondary mb-2" numberOfLines={1}>
                        {getSubtitle(content)}
                    </Text>
                )}

                {rating !== undefined ? (
                    <RatingSlider
                        value={rating}
                        onValueChange={() => undefined}
                        category={content.type}
                        size="display"
                    />
                ) : (
                    <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: categoryColor }} />
                        <Text className="text-xs text-tertiary capitalize">{content.type}</Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}
