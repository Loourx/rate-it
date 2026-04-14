import React, { useState, useRef } from 'react';
import { View, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, SearchBarHandle } from '../../components/content/SearchBar';
import { ContentList } from '../../components/content/ContentList';
import { ContentType, BaseContent, Music } from '../../lib/types/content';
import { useSearchMovies } from '../../lib/hooks/useSearchMovies';
import { useSearchSeries } from '../../lib/hooks/useSearchSeries';
import { useSearchBooks } from '../../lib/hooks/useSearchBooks';
import { useSearchGames } from '../../lib/hooks/useSearchGames';
import { useSearchMusic } from '../../lib/hooks/useSearchMusic';
import { useSearchMusicTracks } from '../../lib/hooks/useSearchMusicTracks';
import { useSearchPodcasts } from '../../lib/hooks/useSearchPodcasts';
import { useSearchAnything } from '../../lib/hooks/useSearchAnything';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '../../lib/utils/constants';
import { TYPO, FONT } from '../../lib/utils/typography';
import { FolderNavigation } from '@/components/content/FolderNavigation';

const CATEGORY_LABELS: Record<ContentType, string> = {
    movie: 'Películas',
    series: 'Series',
    book: 'Libros',
    game: 'Juegos',
    music: 'Música',
    podcast: 'Podcasts',
    anything: 'Anything',
};

function usesDarkForeground(type: ContentType): boolean {
    return type === 'book' || type === 'music';
}

export default function SearchScreen() {
    const router = useRouter();
    const searchBarRef = useRef<SearchBarHandle>(null);
    const [activeFolder, setActiveFolder] = useState<ContentType | null>(null);
    const [query, setQuery] = useState('');
    const [musicSearchType, setMusicSearchType] = useState<'albums' | 'tracks'>('albums');

    // Search queries — only fire when inside a folder
    const movieQuery = useSearchMovies(activeFolder === 'movie' ? query : '');
    const seriesQuery = useSearchSeries(activeFolder === 'series' ? query : '');
    const bookQuery = useSearchBooks(activeFolder === 'book' ? query : '');
    const gameQuery = useSearchGames(activeFolder === 'game' ? query : '');
    const musicAlbumsQuery = useSearchMusic(activeFolder === 'music' && musicSearchType === 'albums' ? query : '');
    const musicTracksQuery = useSearchMusicTracks(activeFolder === 'music' && musicSearchType === 'tracks' ? query : '');
    /* MVP_DISABLED: const podcastQuery = useSearchPodcasts(activeFolder === 'podcast' ? query : ''); */
    /* MVP_DISABLED: const anythingQuery = useSearchAnything(activeFolder === 'anything' ? query : ''); */

    const getCurrentQuery = () => {
        if (!activeFolder) return { data: undefined, isLoading: false, isError: false };
        switch (activeFolder) {
            case 'movie': return movieQuery;
            case 'series': return seriesQuery;
            case 'book': return bookQuery;
            case 'game': return gameQuery;
            case 'music': return musicSearchType === 'albums' ? musicAlbumsQuery : musicTracksQuery;
            /* MVP_DISABLED: case 'podcast': return podcastQuery; */
            /* MVP_DISABLED: case 'anything': return anythingQuery; */
            default: return movieQuery;
        }
    };

    const { data, isLoading, isError } = getCurrentQuery();

    const handleOpenFolder = (category: ContentType) => {
        setActiveFolder(category);
        setQuery('');
    };

    const handleCloseFolder = () => {
        setActiveFolder(null);
        setQuery('');
        Keyboard.dismiss();
    };

    const handleItemPress = (item: BaseContent) => {
        if (item.type === 'music' && 'isAlbum' in item) {
            const isAlbum = (item as Music).isAlbum;
            router.push(`/content/${item.type}/${item.id}?isAlbum=${isAlbum}`);
        } else {
            router.push(`/content/${item.type}/${item.id}`);
        }
    };

    const handleCreateAnything = () => {
        router.push('/anything/create');
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    /* MVP_DISABLED: const showCreateAnythingButton = activeFolder === 'anything' && query.length >= 3 && (!data || data.length === 0); */
    const showCreateAnythingButton = false;

    // ── Landing view (no folder selected) ──
    if (!activeFolder) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={S.screen}>
                        <View style={S.gridHeader}>
                            <Text style={S.gridTitle}>Buscar</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/users/search')}
                                style={S.peopleButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="people-outline" size={22} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={S.gridSubtitle}>Encuentra por categoría</Text>

                        <SearchBar
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Buscar carpeta..."
                            debounceMs={180}
                        />

                        <FolderNavigation onSelectCategory={handleOpenFolder} query={query} />
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        );
    }

    // ── Inside a folder ──
    const folderColor = getCategoryColor(activeFolder);
    const folderLabel = CATEGORY_LABELS[activeFolder];
    const darkForeground = usesDarkForeground(activeFolder);
    const folderTextColor = darkForeground ? COLORS.background : COLORS.textPrimary;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={S.screen}>
                    <View style={S.gridHeader}>
                        <Text style={S.gridTitle}>Buscar</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/users/search')}
                            style={S.peopleButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="people-outline" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={S.activeFolderWrap}>
                        <View style={[S.activeFolderTab, { backgroundColor: folderColor }]} />
                        <View style={[S.activeFolderHeader, { backgroundColor: folderColor }]}>
                            <Pressable onPress={handleCloseFolder} style={S.backButton} hitSlop={12}>
                                <Ionicons name="arrow-back" size={22} color={folderTextColor} />
                            </Pressable>
                            <Text style={[S.activeFolderName, { color: folderTextColor }]}>{folderLabel}</Text>
                        </View>
                    </View>

                    <SearchBar
                        ref={searchBarRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder={`Buscar en ${folderLabel}...`}
                        debounceMs={420}
                        autoFocus={true}
                    />

                    {/* Music sub-toggle */}
                    {activeFolder === 'music' && (
                        <View style={S.musicToggleRow}>
                            <TouchableOpacity
                                onPress={() => setMusicSearchType('albums')}
                                style={[
                                    S.musicToggle,
                                    musicSearchType === 'albums' ? S.musicToggleActive : S.musicToggleInactive,
                                ]}
                            >
                                <Text style={[S.musicToggleText, musicSearchType === 'albums' ? S.musicToggleTextActive : S.musicToggleTextInactive]}>
                                    Álbums
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMusicSearchType('tracks')}
                                style={[
                                    S.musicToggle,
                                    musicSearchType === 'tracks' ? S.musicToggleActive : S.musicToggleInactive,
                                ]}
                            >
                                <Text style={[S.musicToggleText, musicSearchType === 'tracks' ? S.musicToggleTextActive : S.musicToggleTextInactive]}>
                                    Tracks
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Results */}
                    <View className="flex-1 bg-background mt-1">
                        <ContentList
                            data={data}
                            isLoading={isLoading && query.length >= 3}
                            isError={isError}
                            onItemPress={handleItemPress}
                            emptyIcon={
                                query.length < 3 ? 'sparkles-outline' : 'search-outline'
                            }
                            emptyTitle={
                                query.length < 3
                                    ? '¿Qué has visto últimamente?'
                                    : 'Sin resultados para esa búsqueda'
                            }
                            emptyMessage={
                                query.length < 3
                                    ? 'Busca películas, series, libros, juegos o música.'
                                    : 'Prueba con otro título o revisa la ortografía.'
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

const S = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Landing view ──
    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
    },
    gridTitle: {
        ...TYPO.h1,
        color: COLORS.textPrimary,
    },
    gridSubtitle: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        marginBottom: SPACING.xs,
        paddingHorizontal: SPACING.lg,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    peopleButton: {
        padding: 8,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Active folder view ──
    activeFolderWrap: {
        paddingHorizontal: SPACING.base,
        marginTop: SPACING.sm,
    },
    activeFolderTab: {
        width: 136,
        height: 16,
        borderTopLeftRadius: RADIUS.sm,
        borderTopRightRadius: RADIUS.sm,
        marginLeft: SPACING.base,
    },
    activeFolderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg + SPACING.sm,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.md,
        minHeight: 72,
        gap: SPACING.sm,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    activeFolderName: {
        ...TYPO.h2,
        fontFamily: FONT.bold,
        flex: 1,
    },

    // ── Music toggle ──
    musicToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.base,
    },
    musicToggle: {
        borderRadius: RADIUS.full,
        paddingVertical: 6,
        paddingHorizontal: SPACING.base,
    },
    musicToggleActive: {
        backgroundColor: COLORS.categoryMusic,
    },
    musicToggleInactive: {
        backgroundColor: COLORS.surfaceElevated,
    },
    musicToggleText: {
        ...TYPO.bodySmall,
    },
    musicToggleTextActive: {
        color: COLORS.background,
        fontFamily: FONT.semibold,
    },
    musicToggleTextInactive: {
        color: COLORS.textPrimary,
        fontFamily: FONT.regular,
    },
});
