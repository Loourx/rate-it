import React from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';
import { ContentType } from '../../lib/types/content';
import { COLORS } from '@/lib/utils/constants';

interface CategoryPickerProps {
    selectedCategory: ContentType;
    onSelectCategory: (category: ContentType) => void;
}

const categories: { type: ContentType; label: string; colorClass: string; textClass: string; borderClass: string }[] = [
    { type: 'movie', label: 'Películas', colorClass: 'bg-category-movie', textClass: 'text-category-movie', borderClass: 'border-category-movie' },
    { type: 'series', label: 'Series', colorClass: 'bg-category-series', textClass: 'text-category-series', borderClass: 'border-category-series' },
    { type: 'book', label: 'Libros', colorClass: 'bg-category-book', textClass: 'text-category-book', borderClass: 'border-category-book' },
    { type: 'game', label: 'Juegos', colorClass: 'bg-category-game', textClass: 'text-category-game', borderClass: 'border-category-game' },
    { type: 'music', label: 'Música', colorClass: 'bg-category-music', textClass: 'text-category-music', borderClass: 'border-category-music' },
    { type: 'podcast', label: 'Podcasts', colorClass: 'bg-category-podcast', textClass: 'text-category-podcast', borderClass: 'border-category-podcast' },
    { type: 'anything', label: 'Anything', colorClass: 'bg-category-anything', textClass: 'text-category-anything', borderClass: 'border-category-anything' },
];

export function CategoryPicker({ selectedCategory, onSelectCategory }: CategoryPickerProps) {
    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-2"
            >
                {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.type;
                    return (
                        <Pressable
                            key={cat.type}
                            onPress={() => onSelectCategory(cat.type)}
                            className={`px-4 py-2 rounded-full border ${isSelected
                                ? `${cat.colorClass} border-transparent`
                                : `bg-transparent ${cat.borderClass}`
                                }`}
                        >
                            <Text
                                className={`font-medium ${isSelected
                                    ? 'text-background'
                                    : cat.textClass
                                    }`}
                            >
                                {cat.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View >
    );
}
