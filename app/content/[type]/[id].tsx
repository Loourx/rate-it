import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useContentDetails } from '../../../lib/hooks/useContentDetails';
import { ContentType, Movie, Series, Book, Game, Music, Podcast, Anything } from '../../../lib/types/content';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import { ReportModal } from '@/components/anything/ReportModal';
import { useHasReported } from '@/lib/hooks/useReportAnything';

export default function ContentDetailsScreen() {
    const { type, id } = useLocalSearchParams<{ type: ContentType; id: string }>();
    const router = useRouter();
    const [showReportModal, setShowReportModal] = useState(false);

    // Ensure type is a valid ContentType, though routing should handle this if configured strictly
    const { data: item, isLoading, isError, error } = useContentDetails(type as ContentType, id);
    const { data: hasReported } = useHasReported(type === 'anything' ? id : '');

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color={COLORS.link} />
            </View>
        );
    }

    if (isError || !item) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-6">
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text className="text-error text-lg font-bold mt-4 text-center">Error al cargar contenido</Text>
                <Text className="text-secondary text-center mt-2">{error?.message || 'No se encontró el contenido especificado.'}</Text>
            </View>
        );
    }

    const renderMetadata = () => {
        switch (item.type) {
            case 'movie':
                const movie = item as Movie;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {movie.year && <Badge text={movie.year} icon="calendar" />}
                        {movie.director && <Badge text={movie.director} icon="videocam" />}
                    </View>
                );
            case 'series':
                const series = item as Series;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {series.year && <Badge text={series.year} icon="calendar" />}
                        {series.creator && <Badge text={series.creator} icon="person" />}
                    </View>
                );
            case 'book':
                const book = item as Book;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {book.author && <Badge text={book.author} icon="person" />}
                        {book.pages && <Badge text={`${book.pages} págs`} icon="book" />}
                    </View>
                );
            case 'game':
                const game = item as Game;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {game.year && <Badge text={game.year} icon="calendar" />}
                        {game.developer && <Badge text={game.developer} icon="code" />}
                        {game.platform && <Badge text={game.platform} icon="hardware-chip" />}
                    </View>
                );
            case 'music':
                const music = item as Music;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {music.artist && <Badge text={music.artist} icon="person" />}
                        {music.album && <Badge text={music.album} icon="disc" />}
                    </View>
                );
            case 'podcast':
                const podcast = item as Podcast;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {podcast.publisher && <Badge text={podcast.publisher} icon="mic" />}
                    </View>
                );
            case 'anything':
                const anything = item as Anything;
                return (
                    <View className="flex-row flex-wrap gap-4 mb-4">
                        {anything.categoryTag && <Badge text={anything.categoryTag} icon="pricetag" />}
                    </View>
                );
            default:
                return null;
        }
    };

    const getDescription = () => {
        switch (item.type) {
            case 'movie': return (item as Movie).overview;
            case 'series': return (item as Series).overview;
            case 'book': return (item as Book).description;
            case 'game': return (item as Game).description;
            case 'anything': return (item as Anything).description;
            case 'podcast': return (item as Podcast).description;
            default: return null;
        }
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Detalles', headerBackTitle: 'Atrás' }} />
            <ScrollView className="flex-1 bg-background">
                {/* Header Image */}
                <View className="w-full h-80 bg-surface-elevated relative">
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Text className="text-4xl text-tertiary font-bold">{item.title.substring(0, 1)}</Text>
                        </View>
                    )}
                    <View className="absolute bottom-0 left-0 right-0 h-24 bg-black/60" />
                </View>

                {/* Content Info */}
                <View className="px-6 -mt-10 pb-10">
                    {/* Title */}
                    <Text className="text-3xl font-bold text-primary mb-2">{item.title}</Text>

                    {/* Metadata Badges */}
                    {renderMetadata()}

                    {/* Action Buttons */}
                    <View className="flex-row gap-4 my-6">
                        <TouchableOpacity
                            className="flex-1 bg-link py-3 rounded-lg flex-row items-center justify-center"
                            onPress={() => router.push(`/rate/${type}/${id}`)}
                        >
                            <Ionicons name="star" size={20} color="white" className="mr-2" />
                            <Text className="text-primary font-bold text-base ml-2">Valorar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="w-12 h-12 bg-surface rounded-lg items-center justify-center border border-divider">
                            <Ionicons name="bookmark-outline" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-12 h-12 bg-surface rounded-lg items-center justify-center border border-divider">
                            <Ionicons name="share-social-outline" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View>
                        <Text className="text-lg font-bold text-primary mb-2">Sinopsis</Text>
                        <Text className="text-base text-secondary leading-relaxed">
                            {getDescription() || 'No hay descripción disponible para este contenido.'}
                        </Text>
                    </View>

                    {/* Report button for Anything items */}
                    {item.type === 'anything' && (
                        <TouchableOpacity
                            onPress={() => setShowReportModal(true)}
                            disabled={hasReported}
                            className="flex-row items-center justify-center mt-8 py-3 border border-divider rounded-xl"
                            style={{ opacity: hasReported ? 0.5 : 1 }}
                        >
                            <Ionicons
                                name={hasReported ? 'checkmark-circle' : 'flag-outline'}
                                size={18}
                                color={hasReported ? COLORS.success : COLORS.textSecondary}
                            />
                            <Text className="text-secondary ml-2">
                                {hasReported ? 'Ya has reportado este item' : 'Reportar contenido inapropiado'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Report Modal */}
            {item.type === 'anything' && (
                <ReportModal
                    visible={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    anythingItemId={item.id}
                    itemTitle={item.title}
                />
            )}
        </>
    );
}

function Badge({ text, icon }: { text: string; icon: keyof typeof Ionicons.glyphMap }) {
    return (
        <View className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-divider">
            <Ionicons name={icon} size={14} color={COLORS.textSecondary} />
            <Text className="text-xs font-medium text-secondary ml-1.5">{text}</Text>
        </View>
    );
}
