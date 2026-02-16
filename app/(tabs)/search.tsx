import React, { useState } from 'react';
import { View, SafeAreaView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryPicker } from '../../components/content/CategoryPicker';
import { SearchBar } from '../../components/content/SearchBar';
import { ContentList } from '../../components/content/ContentList';
import { ContentType, BaseContent } from '../../lib/types/content';
import { useSearchMovies } from '../../lib/hooks/useSearchMovies';
import { useSearchSeries } from '../../lib/hooks/useSearchSeries';
import { useSearchBooks } from '../../lib/hooks/useSearchBooks';
import { useSearchGames } from '../../lib/hooks/useSearchGames';
import { useSearchMusic } from '../../lib/hooks/useSearchMusic';
import { useSearchPodcasts } from '../../lib/hooks/useSearchPodcasts';
import { useSearchAnything } from '../../lib/hooks/useSearchAnything';

export default function SearchScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<ContentType>('movie');
    const [query, setQuery] = useState('');

    // We call all hooks but only pass the query to the active one.
    // The hooks are implemented to be enabled only when query.length >= 3.
    // Passing empty string or short string effectively disables the inactive ones.
    const movieQuery = useSearchMovies(selectedCategory === 'movie' ? query : '');
    const seriesQuery = useSearchSeries(selectedCategory === 'series' ? query : '');
    const bookQuery = useSearchBooks(selectedCategory === 'book' ? query : '');
    const gameQuery = useSearchGames(selectedCategory === 'game' ? query : '');
    const musicQuery = useSearchMusic(selectedCategory === 'music' ? query : '');
    const podcastQuery = useSearchPodcasts(selectedCategory === 'podcast' ? query : '');
    const anythingQuery = useSearchAnything(selectedCategory === 'anything' ? query : '');

    const getCurrentQuery = () => {
        switch (selectedCategory) {
            case 'movie': return movieQuery;
            case 'series': return seriesQuery;
            case 'book': return bookQuery;
            case 'game': return gameQuery;
            case 'music': return musicQuery;
            case 'podcast': return podcastQuery;
            case 'anything': return anythingQuery;
            default: return movieQuery;
        }
    };

    const { data, isLoading, isError } = getCurrentQuery();

    const handleSelectCategory = (category: ContentType) => {
        setSelectedCategory(category);
        // Optional: Clear query or keep it? Keeping it is better UX usually.
    };

    const handleItemPress = (item: BaseContent) => {
        router.push(`/content/${item.type}/${item.id}`);
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View className="flex-1">
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        placeholder={`Buscar ${selectedCategory}...`}
                    />

                    <CategoryPicker
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                    />

                    <View className="flex-1 bg-gray-50 dark:bg-gray-900 mt-2">
                        <ContentList
                            data={data}
                            isLoading={isLoading && query.length >= 3}
                            isError={isError}
                            onItemPress={handleItemPress}
                            emptyMessage={query.length < 3 ? 'Escribe al menos 3 caracteres para buscar' : 'No se encontraron resultados'}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
