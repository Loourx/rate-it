import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useIsBookmarked, useToggleBookmark } from '@/lib/hooks/useBookmark';
import { useIsPinned, usePinItem, useUnpinItem } from '@/lib/hooks/usePinnedItems';
import { useContentDetails } from '@/lib/hooks/useContentDetails';
import { ContentType, Movie, Series, Anything, Music } from '@/lib/types/content';
import { AlbumTrackList } from '@/components/content/AlbumTrackList';
import { useAlbumTracks } from '@/lib/hooks/useAlbumTracks';
import { COLORS, SPACING, RADIUS, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { FONT } from '@/lib/utils/typography';
import { ContentDetailHeader } from '@/components/content/ContentDetailHeader';
import { ContentMetadataBadges } from '@/components/content/ContentMetadataBadges';
import { ContentDetailSkeleton } from '@/components/content/ContentDetailSkeleton';
import { CommunityScore } from '@/components/content/CommunityScore';
import { ErrorState } from '@/components/ui/ErrorState';
import { ReportModal } from '@/components/anything/ReportModal';
import { RecommendModal } from '@/components/content/RecommendModal';
import { useHasReported } from '@/lib/hooks/useReportAnything';

const TYPE_LABELS: Record<ContentType, string> = {
    movie: '🎬 Película',
    series: '📺 Serie',
    book: '📚 Libro',
    game: '🎮 Videojuego',
    music: '🎵 Música',
    podcast: '🎙️ Podcast',
    anything: '✨ Anything',
};

export default function ContentDetailsScreen() {
    const { type, id, isAlbum } = useLocalSearchParams<{ type: ContentType; id: string; isAlbum?: string }>();
    const router = useRouter();
    const [showReportModal, setShowReportModal] = useState(false);
    const [showRecommendModal, setShowRecommendModal] = useState(false);

    const { data: item, isLoading, isError, refetch } = useContentDetails(type as ContentType, id);
    const { data: hasReported } = useHasReported(type === 'anything' ? id : '');

    const contentType = type as ContentType;
    const color = getCategoryColor(contentType);
    const fadedColor = getCategoryFadedColor(contentType);
    const isAlbumContent = contentType === 'music' && (isAlbum === 'true' || (item as Music)?.isAlbum === true);

    // Album tracks (only fetched when isAlbumContent is true)
    const { data: albumTracks } = useAlbumTracks(isAlbumContent ? id : '');

    const handleTrackPress = useCallback((trackId: string) => {
        router.push(`/content/music/${trackId}?isAlbum=false`);
    }, [router]);

    // Bookmark
    const { data: isBookmarked } = useIsBookmarked(contentType, id);
    const toggleBookmark = useToggleBookmark();
    const bookmarkScale = useSharedValue(1);

    const bookmarkAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bookmarkScale.value }],
    }));

    const handleToggleBookmark = useCallback(() => {
        bookmarkScale.value = withSpring(1.2, { damping: 6, stiffness: 200 }, () => {
            bookmarkScale.value = withSpring(1);
        });
        toggleBookmark.mutate({
            contentType,
            contentId: id,
            contentTitle: item?.title ?? '',
            contentImageUrl: item?.imageUrl ?? null,
        });
    }, [contentType, id, item, toggleBookmark, bookmarkScale]);

    // Pin
    const { data: pinnedItem } = useIsPinned(contentType, id);
    const pinItem = usePinItem();
    const unpinItem = useUnpinItem();
    const pinScale = useSharedValue(1);

    const pinAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pinScale.value }],
    }));

    const handleTogglePin = useCallback(() => {
        pinScale.value = withSpring(1.3, { damping: 6, stiffness: 200 }, () => {
            pinScale.value = withSpring(1);
        });
        void import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) =>
            impactAsync(ImpactFeedbackStyle.Light),
        );
        if (pinnedItem) {
            unpinItem.mutate(pinnedItem.id);
        } else {
            pinItem.mutate(
                { contentType, contentId: id, contentTitle: item?.title ?? '', contentImageUrl: item?.imageUrl ?? null },
                {
                    onError: (err) => {
                        if ((err as Error).message === 'MAX_PINNED') {
                            Alert.alert(
                                'Máximo alcanzado',
                                'Has alcanzado el máximo de 5 favoritos. Desancla uno desde tu perfil.',
                            );
                        }
                    },
                },
            );
        }
    }, [pinnedItem, pinItem, unpinItem, contentType, id, item, pinScale]);

    const handleShare = useCallback(async () => {
        if (!item) return;
        try {
            await Share.share({
                title: item.title,
                message: `🎯 "${item.title}" en Rate-it\n\nDescúbrelo en la app: https://rateit.app/content/${type}/${id}`, // TODO F11e: reemplazar con deep link real
            });
        } catch {
            // El usuario canceló el share — no hacer nada
        }
    }, [item, type, id]);

    if (isLoading) {
        return (
            <>
                <Stack.Screen options={{ title: '', headerTransparent: true }} />
                <ContentDetailSkeleton />
            </>
        );
    }

    if (isError || !item) {
        return (
            <>
                <Stack.Screen options={{ title: 'Error', headerBackTitle: 'Atrás' }} />
                <ErrorState
                    message="No pudimos cargar este contenido. ¿Intentamos de nuevo?"
                    onRetry={() => refetch()}
                />
            </>
        );
    }

    const description = getDescription(item);

    return (
        <>
            <Stack.Screen options={{ title: '', headerTransparent: true, headerBackTitle: 'Atrás' }} />

            <ScrollView style={S.screen} contentContainerStyle={S.scroll}>
                <ContentDetailHeader
                    title={item.title}
                    imageUrl={item.imageUrl}
                    categoryColor={color}
                    categoryFadedColor={fadedColor}
                    typeLabel={TYPE_LABELS[contentType]}
                />

                <View style={S.body}>
                    <ContentMetadataBadges
                        item={item}
                        categoryColor={color}
                        categoryFadedColor={fadedColor}
                    />

                    {isAlbumContent && albumTracks && albumTracks.length > 0 && (
                        <AlbumTrackList
                            tracks={albumTracks}
                            onTrackPress={handleTrackPress}
                            categoryColor={color}
                        />
                    )}

                    <CommunityScore contentId={id} contentType={contentType} />

                    <Animated.View entering={FadeInDown.duration(350).delay(250)} style={S.actionsContainer}>

                        {/* Fila 1: Botón Valorar — ancho completo */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[S.rateBtn, { backgroundColor: color }]}
                            onPress={() => router.push(isAlbumContent
                                ? `/rate/${type}/${id}?isAlbum=true`
                                : `/rate/${type}/${id}`)}
                        >
                            <Ionicons name="star" size={20} color="#FFFFFF" />
                            <Text style={S.rateTxt}>Valorar</Text>
                        </TouchableOpacity>

                        {/* Fila 2: Acciones secundarias */}
                        <View style={S.secondaryActions}>

                            <Animated.View style={bookmarkAnimStyle}>
                                <TouchableOpacity
                                    style={[S.iconBtn, isBookmarked && { borderColor: color }]}
                                    onPress={handleToggleBookmark}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                        size={22}
                                        color={isBookmarked ? color : COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View style={pinAnimStyle}>
                                <TouchableOpacity
                                    style={[S.iconBtn, !!pinnedItem && { borderColor: color }]}
                                    onPress={handleTogglePin}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={pinnedItem ? 'pin' : 'pin-outline'}
                                        size={22}
                                        color={pinnedItem ? color : COLORS.textSecondary}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity style={S.iconBtn} onPress={handleShare} activeOpacity={0.7}>
                                <Ionicons name="share-social-outline" size={22} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={S.iconBtn}
                                onPress={() => setShowRecommendModal(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="paper-plane-outline" size={22} color={COLORS.textSecondary} />
                            </TouchableOpacity>

                        </View>
                    </Animated.View>

                    {description ? (
                        <Animated.View entering={FadeInDown.duration(350).delay(350)} style={S.synWrap}>
                            <Text style={S.synTitle}>Sinopsis</Text>
                            <Text style={S.synBody}>{description}</Text>
                        </Animated.View>
                    ) : null}

                    {item.type === 'anything' && (
                        <TouchableOpacity
                            onPress={() => setShowReportModal(true)}
                            disabled={hasReported}
                            style={[S.report, { opacity: hasReported ? 0.5 : 1 }]}
                        >
                            <Ionicons
                                name={hasReported ? 'checkmark-circle' : 'flag-outline'}
                                size={18}
                                color={hasReported ? COLORS.success : COLORS.textSecondary}
                            />
                            <Text style={S.reportTxt}>
                                {hasReported ? 'Ya has reportado este item' : 'Reportar contenido inapropiado'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {item.type === 'anything' && (
                <ReportModal
                    visible={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    anythingItemId={item.id}
                    itemTitle={item.title}
                />
            )}

            <RecommendModal
                visible={showRecommendModal}
                onClose={() => setShowRecommendModal(false)}
                contentType={contentType}
                contentId={id}
                contentTitle={item?.title ?? ''}
                contentImageUrl={item?.imageUrl ?? null}
            />
        </>
    );
}

function getDescription(item: ReturnType<typeof useContentDetails>['data']): string | undefined {
    if (!item) return undefined;
    switch (item.type) {
        case 'movie': return (item as Movie).overview;
        case 'series': return (item as Series).overview;
        case 'anything': return (item as Anything).description;
        default:
            return (item as { description?: string }).description;
    }
}

const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    scroll: { paddingBottom: 48 },
    body: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
    actionsContainer: { marginTop: SPACING.xl, gap: SPACING.md },
    rateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, gap: SPACING.sm },
    rateTxt: { fontSize: 16, fontFamily: FONT.bold, color: '#FFF' },
    secondaryActions: { flexDirection: 'row', justifyContent: 'space-evenly' },
    iconBtn: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.divider },
    synWrap: { marginTop: SPACING['2xl'] },
    synTitle: { fontSize: 20, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    synBody: { fontSize: 16, fontFamily: FONT.medium, color: COLORS.textSecondary, lineHeight: 24 },
    report: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING['2xl'], paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.divider, borderRadius: RADIUS.md },
    reportTxt: { fontSize: 14, color: COLORS.textSecondary, marginLeft: SPACING.sm },
});
