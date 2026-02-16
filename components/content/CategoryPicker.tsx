import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ContentType } from '../../lib/types/content';

interface CategoryPickerProps {
    selectedCategory: ContentType;
    onSelectCategory: (category: ContentType) => void;
}

const categories: { type: ContentType; label: string }[] = [
    { type: 'movie', label: 'Películas' },
    { type: 'series', label: 'Series' },
    { type: 'book', label: 'Libros' },
    { type: 'game', label: 'Juegos' },
    { type: 'music', label: 'Música' },
    { type: 'podcast', label: 'Podcasts' },
    { type: 'anything', label: 'Anything' },
];

export function CategoryPicker({ selectedCategory, onSelectCategory }: CategoryPickerProps) {
    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-2"
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.type}
                        onPress={() => onSelectCategory(cat.type)}
                        className={`px-4 py-2 rounded-full border ${selectedCategory === cat.type
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                    >
                        <Text
                            className={`font-medium ${selectedCategory === cat.type
                                    ? 'text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
