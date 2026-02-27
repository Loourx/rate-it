import React, { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRatings, Rating } from '@/lib/hooks/useRatings';
import { useFriendsTrending } from '@/lib/hooks/useFriendsTrending';
import { useGlobalTrending, type GlobalTrendingItem } from '@/lib/hooks/useGlobalTrending';
import { useSuggestedContent, type SuggestedItem } from '@/lib/hooks/useSuggestedContent';
import { ContentCard } from '@/components/content/ContentCard';
import { TrendingCard } from '@/components/content/TrendingCard';
import { GlobalTrendingCard } from '@/components/content/GlobalTrendingCard';
import { SuggestionCard } from '@/components/content/SuggestionCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ContentType, BaseContent } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

export default function HomeScreen() {
    const router = useRouter();
    const { data: ratings, isLoading, refetch } = useRatings();
    const { data: trending, isLoading: loadingTrending } = useFriendsTrending();
    const hasTrending = trending && trending.length > 0;
    const isFollowingNobody = trending !== undefined && trending.length === 0;
    const { data: globalTrending, isLoading: loadingGlobal } = useGlobalTrending();
    const hasGlobalTrending = globalTrending && globalTrending.length > 0;
    const { data: suggested } = useSuggestedContent();
    const hasSuggestions = suggested && suggested.length > 0;
    // No loading state para esta sección — si no hay datos simplemente no aparece

    const sections = useMemo(() => {
        if (!ratings) return {};

        const grouped: Record<string, Rating[]> = {};
        ratings.forEach(r => {
            if (!grouped[r.content_type]) {
                grouped[r.content_type] = [];
            }
            grouped[r.content_type].push(r);
        });
        return grouped;
    }, [ratings]);

    const hasRatings = ratings && ratings.length > 0;

    const handlePress = (content: BaseContent) => {
        router.push(`/content/${content.type}/${content.id}`);
    };

    const categories = [
        { type: 'movie' as const, label: 'Películas', emoji: '🎬' },
        { type: 'series' as const, label: 'Series', emoji: '📺' },
        { type: 'book' as const, label: 'Libros', emoji: '📚' },
        { type: 'game' as const, label: 'Videojuegos', emoji: '🎮' },
        { type: 'music' as const, label: 'Música', emoji: '🎵' },
        { type: 'podcast' as const, label: 'Podcasts', emoji: '🎙️' },
        { type: 'anything' as const, label: 'Anything', emoji: '📦' },
    ];

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <View className="p-6 gap-6">
                    <View className="gap-2">
                        <Skeleton width={120} height={32} borderRadius={8} />
                        <View className="flex-row gap-4">
                            <Skeleton width={160} height={260} borderRadius={16} />
                            <Skeleton width={160} height={260} borderRadius={16} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!hasRatings) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <EmptyState
                    icon="star-outline"
                    title="¡Bienvenido a Rate-it!"
                    description="Empieza a valorar contenido para ver tu colección aquí."
                    actionLabel="Buscar contenido"
                    onAction={() => router.push('/(tabs)/search')}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.textPrimary} />
                }
                contentContainerClassName="pb-24 pt-4"
            >
                {/* ── Sección: Popular entre tus amigos ── */}
                <View style={trendingStyles.section}>
                    <Text style={trendingStyles.sectionTitle}>Popular entre tus amigos</Text>

                    {loadingTrending && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={trendingStyles.horizontalList}>
                            {[1, 2, 3].map((i) => (
                                <View key={i} style={{ width: 130, marginRight: SPACING.sm, opacity: 0.3, backgroundColor: COLORS.surfaceElevated, height: 240, borderRadius: RADIUS.md }} />
                            ))}
                        </ScrollView>
                    )}

                    {!loadingTrending && isFollowingNobody && (
                        <TouchableOpacity
                            style={trendingStyles.ctaCard}
                            onPress={() => router.push('/users/search')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="people-outline" size={28} color={COLORS.textSecondary} />
                            <Text style={trendingStyles.ctaTitle}>Sigue a tus amigos</Text>
                            <Text style={trendingStyles.ctaSubtitle}>Descubre qué están valorando</Text>
                        </TouchableOpacity>
                    )}

                    {!loadingTrending && hasTrending && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={trendingStyles.horizontalList}
                        >
                            {trending!.map((item) => (
                                <TrendingCard
                                    key={item.ratingId}
                                    item={item}
                                    onPress={() => router.push(`/content/${item.contentType}/${item.contentId}`)}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* ── Sección: Lo más valorado ── */}
                <View style={trendingStyles.section}>
                    <Text style={trendingStyles.sectionTitle}>Lo más valorado</Text>

                    {loadingGlobal && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={trendingStyles.horizontalList}>
                            {[1, 2, 3].map((i) => (
                                <View
                                    key={i}
                                    style={[{ width: 130, marginRight: SPACING.sm, opacity: 0.3, backgroundColor: COLORS.surfaceElevated, height: 240, borderRadius: RADIUS.md }]}
                                />
                            ))}
                        </ScrollView>
                    )}

                    {!loadingGlobal && !hasGlobalTrending && (
                        <Text style={trendingStyles.emptyHint}>
                            Aún no hay suficientes valoraciones. ¡Empieza a valorar!
                        </Text>
                    )}

                    {!loadingGlobal && hasGlobalTrending && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={trendingStyles.horizontalList}
                        >
                            {globalTrending!.map((item) => (
                                <GlobalTrendingCard
                                    key={`${item.contentType}-${item.contentId}`}
                                    item={item}
                                    onPress={() =>
                                        router.push(`/content/${item.contentType}/${item.contentId}`)
                                    }
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* ── Sección: Quizás te interese (solo si hay datos) ── */}
                {hasSuggestions && (
                    <View style={trendingStyles.section}>
                        <Text style={trendingStyles.sectionTitle}>Quizás te interese</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={trendingStyles.horizontalList}
                        >
                            {suggested!.map((item) => (
                                <SuggestionCard
                                    key={`${item.contentType}-${item.contentId}`}
                                    item={item}
                                    onPress={() =>
                                        router.push(`/content/${item.contentType}/${item.contentId}`)
                                    }
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* ── Sección: Tu biblioteca (existente, sin cambios) ── */}
                <View className="px-6 mb-6">
                    <Text className="text-3xl font-bold text-primary">Tu Biblioteca</Text>
                </View>

                {categories.map((cat) => {
                    const catRatings = sections[cat.type];
                    if (!catRatings || catRatings.length === 0) return null;

                    return (
                        <View key={cat.type} className="mb-8">
                            <View className="flex-row items-center justify-between px-6 mb-4">
                                <Text className="text-xl font-bold text-primary">
                                    {cat.emoji} {cat.label}
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerClassName="px-6"
                            >
                                {catRatings.map((rating) => {
                                    // Construct base content from rating data
                                    const content: BaseContent = {
                                        id: rating.content_id,
                                        type: rating.content_type,
                                        title: rating.content_title,
                                        imageUrl: rating.content_image_url
                                    };

                                    return (
                                        <ContentCard
                                            key={rating.id}
                                            content={content}
                                            rating={rating.score}
                                            onPress={handlePress}
                                            orientation="vertical"
                                        />
                                    );
                                })}
                            </ScrollView>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const trendingStyles = StyleSheet.create({
    section: { marginBottom: SPACING.xl },
    sectionTitle: {
        ...TYPO.h4,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xl,
    },
    horizontalList: { paddingHorizontal: SPACING.xl },
    ctaCard: {
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.xl,
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderStyle: 'dashed',
    },
    ctaTitle: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
    },
    ctaSubtitle: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
    },
    emptyHint: {
        ...TYPO.bodySmall,
        fontFamily: FONT.medium,
        color: COLORS.textSecondary,
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.sm,
    },
});
