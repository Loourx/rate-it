import React, { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRatings, Rating } from '@/lib/hooks/useRatings';
import { useFriendsTrending } from '@/lib/hooks/useFriendsTrending';
import { useGlobalTrending } from '@/lib/hooks/useGlobalTrending';
import { useSuggestedContent } from '@/lib/hooks/useSuggestedContent';
import { ContentCard } from '@/components/content/ContentCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BaseContent, ContentType } from '@/lib/types/content';
import { COLORS, SPACING, RADIUS, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DiscoveryItem = {
    key: string;
    contentId: string;
    contentType: ContentType;
    title: string;
    imageUrl: string | null;
    scoreLabel: string;
    scoreColor: string;
    metaLabel: string;
    metaValue: string;
};

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: ratings, isLoading, error, refetch } = useRatings();
    const { data: trending, isLoading: loadingTrending } = useFriendsTrending();
    const hasTrending = trending && trending.length > 0;
    const isFollowingNobody = trending !== undefined && trending.length === 0;
    const { data: globalTrending, isLoading: loadingGlobal } = useGlobalTrending();
    const hasGlobalTrending = globalTrending && globalTrending.length > 0;
    const { data: suggested } = useSuggestedContent();
    const hasSuggestions = suggested && suggested.length > 0;
    // No loading state para esta sección — si no hay datos simplemente no aparece

    const horizontalPad = Math.max(SPACING.xl, Math.max(insets.left, insets.right) + SPACING.base);

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

    const trendingWide = useMemo<DiscoveryItem[]>(() => {
        if (!trending) return [];
        return trending.map((item) => ({
            key: `friends-${item.ratingId}`,
            contentId: item.contentId,
            contentType: item.contentType,
            title: item.contentTitle,
            imageUrl: item.contentImageUrl,
            scoreLabel: item.score.toFixed(1),
            scoreColor: getCategoryColor(item.contentType),
            metaLabel: 'Amigo',
            metaValue: `@${item.authorUsername}`,
        }));
    }, [trending]);

    const globalWide = useMemo<DiscoveryItem[]>(() => {
        if (!globalTrending) return [];
        return globalTrending.map((item) => ({
            key: `global-${item.contentType}-${item.contentId}`,
            contentId: item.contentId,
            contentType: item.contentType,
            title: item.contentTitle,
            imageUrl: item.contentImageUrl,
            scoreLabel: item.averageScore.toFixed(1),
            scoreColor: getCategoryColor(item.contentType),
            metaLabel: 'Valoraciones',
            metaValue: `${item.ratingCount}`,
        }));
    }, [globalTrending]);

    const suggestedWide = useMemo<DiscoveryItem[]>(() => {
        if (!suggested) return [];
        return suggested.map((item) => ({
            key: `suggested-${item.contentType}-${item.contentId}`,
            contentId: item.contentId,
            contentType: item.contentType,
            title: item.contentTitle,
            imageUrl: item.contentImageUrl,
            scoreLabel: item.bestScore.toFixed(1),
            scoreColor: getCategoryColor(item.contentType),
            metaLabel: 'Amigos',
            metaValue: `${item.friendCount}`,
        }));
    }, [suggested]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
                <View className="p-6 gap-6">
                    <View className="gap-2">
                        <Skeleton width={120} height={32} borderRadius={8} />
                        <View className="flex-row gap-4">
                            <Skeleton width={DISCOVERY_CARD_W} height={DISCOVERY_CARD_H} borderRadius={16} />
                            <Skeleton width={DISCOVERY_CARD_W} height={DISCOVERY_CARD_H} borderRadius={16} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
                <ErrorState
                    message="No pudimos cargar tu biblioteca"
                    onRetry={refetch}
                />
            </SafeAreaView>
        );
    }

    if (!hasRatings) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
                <EmptyState
                    icon="compass-outline"
                    title="Tu aventura cultural empieza aquí"
                    description="Busca una película, serie o libro y dile al mundo qué te pareció."
                    actionLabel="Explorar contenido"
                    onAction={() => router.push('/(tabs)/search')}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.textPrimary} />
                }
                contentContainerStyle={{ paddingTop: SPACING.md, paddingBottom: SPACING['3xl'] + insets.bottom }}
            >
                <DiscoverySection
                    title="Popular entre tus amigos"
                    subtitle="Lo que más está sonando entre la gente que sigues"
                    loading={loadingTrending}
                    items={trendingWide}
                    horizontalPad={horizontalPad}
                    onCardPress={(item) => router.push(`/content/${item.contentType}/${item.contentId}`)}
                    emptyState={
                        isFollowingNobody ? (
                            <TouchableOpacity
                                style={[trendingStyles.ctaCard, { marginHorizontal: horizontalPad }]}
                                onPress={() => router.push('/users/search')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="people-outline" size={28} color={COLORS.textSecondary} />
                                <Text style={trendingStyles.ctaTitle}>Sigue a tus amigos</Text>
                                <Text style={trendingStyles.ctaSubtitle}>Descubre qué están valorando</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                />

                <DiscoverySection
                    title="Lo más valorado"
                    subtitle="Contenido que está recibiendo más atención global"
                    loading={loadingGlobal}
                    items={globalWide}
                    horizontalPad={horizontalPad}
                    onCardPress={(item) => router.push(`/content/${item.contentType}/${item.contentId}`)}
                    emptyState={
                        !loadingGlobal && !hasGlobalTrending ? (
                            <Text style={[trendingStyles.emptyHint, { paddingHorizontal: horizontalPad }]}>Aún no hay suficientes valoraciones. ¡Empieza a valorar!</Text>
                        ) : null
                    }
                />

                {hasSuggestions && (
                    <DiscoverySection
                        title="Quizás te interese"
                        subtitle="Recomendaciones según lo mejor puntuado por tus amigos"
                        loading={false}
                        items={suggestedWide}
                        horizontalPad={horizontalPad}
                        onCardPress={(item) => router.push(`/content/${item.contentType}/${item.contentId}`)}
                    />
                )}

                {/* ── Sección: Tu biblioteca (existente, sin cambios) ── */}
                <View style={[trendingStyles.libraryHeading, { paddingHorizontal: horizontalPad }]}> 
                    <Text style={trendingStyles.libraryTitle}>Tu Biblioteca</Text>
                </View>

                {categories.map((cat) => {
                    const catRatings = sections[cat.type];
                    if (!catRatings || catRatings.length === 0) return null;

                    return (
                        <View key={cat.type} style={trendingStyles.librarySection}>
                            <View style={[trendingStyles.categoryHeader, { paddingHorizontal: horizontalPad }]}>
                                <Text style={trendingStyles.categoryTitle}>
                                    {cat.emoji} {cat.label}
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: horizontalPad, paddingRight: horizontalPad + SPACING.sm }}
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
                                <View style={{ width: SPACING.sm }} />
                            </ScrollView>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

function DiscoverySection({
    title,
    subtitle,
    loading,
    items,
    horizontalPad,
    onCardPress,
    emptyState,
}: {
    title: string;
    subtitle: string;
    loading: boolean;
    items: DiscoveryItem[];
    horizontalPad: number;
    onCardPress: (item: DiscoveryItem) => void;
    emptyState?: React.ReactNode;
}) {
    return (
        <View style={trendingStyles.section}>
            <View style={[trendingStyles.sectionHeader, { paddingHorizontal: horizontalPad }]}> 
                <Text style={trendingStyles.sectionTitle}>{title}</Text>
                <Text style={trendingStyles.sectionSubtitle}>{subtitle}</Text>
            </View>

            {loading && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: horizontalPad, paddingRight: horizontalPad + SPACING.sm }}
                >
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={trendingStyles.wideSkeleton} />
                    ))}
                </ScrollView>
            )}

            {!loading && items.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: horizontalPad, paddingRight: horizontalPad + SPACING.sm }}
                >
                    {items.map((item) => (
                        <WideDiscoveryCard key={item.key} item={item} onPress={() => onCardPress(item)} />
                    ))}
                    <View style={{ width: SPACING.sm }} />
                </ScrollView>
            )}

            {!loading && items.length === 0 && emptyState}
        </View>
    );
}

const DISCOVERY_CARD_W = Math.min(320, Math.round(SCREEN_WIDTH * 0.8));
const DISCOVERY_CARD_H = Math.round(DISCOVERY_CARD_W * 0.56);

function WideDiscoveryCard({ item, onPress }: { item: DiscoveryItem; onPress: () => void }) {
    return (
        <TouchableOpacity style={trendingStyles.wideCard} activeOpacity={0.85} onPress={onPress}>
            {item.imageUrl ? (
                <Image source={item.imageUrl} style={trendingStyles.wideImage} contentFit="cover" cachePolicy="memory-disk" />
            ) : (
                <View style={[trendingStyles.wideImage, trendingStyles.wideImageFallback]}>
                    <Text style={trendingStyles.posterLetter}>{item.title.charAt(0)}</Text>
                </View>
            )}

            <View style={trendingStyles.overlay} />

            <View style={[trendingStyles.scorePill, { backgroundColor: item.scoreColor }]}>
                <Text style={trendingStyles.scorePillText}>{item.scoreLabel}</Text>
            </View>

            <View style={trendingStyles.metaPill}>
                <Text style={trendingStyles.metaPillText}>{item.metaLabel}: {item.metaValue}</Text>
            </View>

            <View style={trendingStyles.wideFooter}>
                <Text style={trendingStyles.wideTitle} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const trendingStyles = StyleSheet.create({
    section: { marginBottom: SPACING.xl },
    sectionHeader: { marginBottom: SPACING.sm },
    sectionTitle: {
        ...TYPO.h4,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
    },
    sectionSubtitle: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    wideCard: {
        width: DISCOVERY_CARD_W,
        height: DISCOVERY_CARD_H,
        borderRadius: RADIUS.lg,
        marginRight: SPACING.md,
        overflow: 'hidden',
        backgroundColor: COLORS.surfaceElevated,
    },
    wideImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.surfaceElevated,
    },
    wideImageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.34)',
    },
    scorePill: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
    },
    scorePillText: {
        ...TYPO.caption,
        fontFamily: FONT.bold,
        color: '#FFFFFF',
    },
    metaPill: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.42)',
        maxWidth: DISCOVERY_CARD_W * 0.64,
    },
    metaPillText: {
        ...TYPO.caption,
        color: '#E7E7E7',
        fontFamily: FONT.medium,
    },
    wideFooter: {
        position: 'absolute',
        left: SPACING.md,
        right: SPACING.md,
        bottom: SPACING.md,
    },
    wideTitle: {
        ...TYPO.h4,
        fontFamily: FONT.bold,
        color: '#FFFFFF',
    },
    wideSkeleton: {
        width: DISCOVERY_CARD_W,
        height: DISCOVERY_CARD_H,
        marginRight: SPACING.md,
        borderRadius: RADIUS.lg,
        opacity: 0.35,
        backgroundColor: COLORS.surfaceElevated,
    },
    posterLetter: {
        fontSize: 44,
        fontFamily: FONT.bold,
        color: COLORS.textTertiary,
    },
    ctaCard: {
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.xl,
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
        marginTop: SPACING.sm,
    },
    libraryHeading: { marginBottom: SPACING.lg },
    libraryTitle: {
        ...TYPO.h2,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
    },
    librarySection: { marginBottom: SPACING['2xl'] },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    categoryTitle: {
        ...TYPO.h4,
        color: COLORS.textPrimary,
        fontFamily: FONT.bold,
    },
});
