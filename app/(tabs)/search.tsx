import React, { useState } from 'react';
import { View, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryPicker } from '../../components/content/CategoryPicker';
import { SearchBar } from '../../components/content/SearchBar';
import { ContentList } from '../../components/content/ContentList';
import { ContentType, BaseContent } from '../../lib/types/content';
import { useSearchMovies } from '../../lib/hooks/useSearchMovies';
import { useSearchSeries } from '../../lib/hooks/useSearchSeries';
import { useSearchBooks } from '../../lib/hooks/useSearchBooks';
import { useSearchGames } from '../../lib/hooks/useSearchGames';
import { useSearchMusic } from '../../lib/hooks/useSearchMusic';
import { useSearchMusicTracks } from '../../lib/hooks/useSearchMusicTracks';
import { useSearchPodcasts } from '../../lib/hooks/useSearchPodcasts';
import { useSearchAnything } from '../../lib/hooks/useSearchAnything';
import { COLORS } from '../../lib/utils/constants';

export default function SearchScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<ContentType>('movie');
    const [query, setQuery] = useState('');
    const [musicSearchType, setMusicSearchType] = useState<'albums' | 'tracks'>('albums');

    const movieQuery = useSearchMovies(selectedCategory === 'movie' ? query : '');
    const seriesQuery = useSearchSeries(selectedCategory === 'series' ? query : '');
    const bookQuery = useSearchBooks(selectedCategory === 'book' ? query : '');
    const gameQuery = useSearchGames(selectedCategory === 'game' ? query : '');
    const musicAlbumsQuery = useSearchMusic(selectedCategory === 'music' && musicSearchType === 'albums' ? query : '');
    const musicTracksQuery = useSearchMusicTracks(selectedCategory === 'music' && musicSearchType === 'tracks' ? query : '');
    const podcastQuery = useSearchPodcasts(selectedCategory === 'podcast' ? query : '');
    const anythingQuery = useSearchAnything(selectedCategory === 'anything' ? query : '');

    const getCurrentQuery = () => {
        switch (selectedCategory) {
            case 'movie': return movieQuery;
            case 'series': return seriesQuery;
            case 'book': return bookQuery;
            case 'game': return gameQuery;
            case 'music': return musicSearchType === 'albums' ? musicAlbumsQuery : musicTracksQuery;
            case 'podcast': return podcastQuery;
            case 'anything': return anythingQuery;
            default: return movieQuery;
        }
    };

    const { data, isLoading, isError } = getCurrentQuery();

    const handleSelectCategory = (category: ContentType) => {
        setSelectedCategory(category);
    };

    const handleItemPress = (item: BaseContent) => {
        router.push(`/content/${item.type}/${item.id}`);
    };

    const handleCreateAnything = () => {
        router.push('/anything/create');
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    // Props for empty state when searching Anything
    const showCreateAnythingButton = selectedCategory === 'anything' && query.length >= 3 && (!data || data.length === 0);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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

                    {selectedCategory === 'music' && (
                        <View className="flex-row items-center justify-center space-x-2 mt-2 px-4">
                            <TouchableOpacity
                                onPress={() => setMusicSearchType('albums')}
                                style={{
                                    backgroundColor: musicSearchType === 'albums' ? COLORS.categoryMusic : COLORS.surfaceElevated,
                                    borderRadius: 999,
                                    paddingVertical: 6,
                                    paddingHorizontal: 16,
                                    marginRight: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: musicSearchType === 'albums' ? COLORS.background : COLORS.textPrimary,
                                        fontWeight: musicSearchType === 'albums' ? '600' : '400',
                                        fontSize: 14,
                                    }}
                                >
                                    Álbums
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMusicSearchType('tracks')}
                                style={{
                                    backgroundColor: musicSearchType === 'tracks' ? COLORS.categoryMusic : COLORS.surfaceElevated,
                                    borderRadius: 999,
                                    paddingVertical: 6,
                                    paddingHorizontal: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        color: musicSearchType === 'tracks' ? COLORS.background : COLORS.textPrimary,
                                        fontWeight: musicSearchType === 'tracks' ? '600' : '400',
                                        fontSize: 14,
                                    }}
                                >
                                    Tracks
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="flex-1 bg-background mt-2">
                        <ContentList
                            data={data}
                            isLoading={isLoading && query.length >= 3}
                            isError={isError}
                            onItemPress={handleItemPress}
                            emptyMessage={
                                query.length < 3
                                    ? 'Escribe al menos 3 caracteres'
                                    : selectedCategory === 'anything'
                                        ? '¿No existe? ¡Créalo tú mismo!'
                                        : 'No se encontraron resultados'
                            }
                            emptyActionLabel={showCreateAnythingButton ? 'Crear Anything' : undefined}
                            onEmptyAction={showCreateAnythingButton ? handleCreateAnything : undefined}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
