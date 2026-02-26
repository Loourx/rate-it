import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePendingRatings } from '@/lib/hooks/usePendingRatings';
import { useRatings } from '@/lib/hooks/useRatings';
import { COLORS, FONT_SIZE, SPACING, RADIUS, getCategoryColor } from '@/lib/utils/constants';
import type { ContentType } from '@/lib/types/content';

const STATUS_LABEL: Record<string, string> = {
    want: 'Pendiente',
    doing: 'En curso',
};

// ── Item row reutilizable ────────────────────────────────────

function ContentRow({
    contentType,
    contentTitle,
    contentImageUrl,
    badge,
    score,
    onPress,
}: {
    contentType: ContentType;
    contentTitle: string;
    contentImageUrl: string | null;
    badge?: string;
    score?: number;
    onPress: () => void;
}) {
    const color = getCategoryColor(contentType);
    const initials = contentTitle.charAt(0).toUpperCase();

    return (
        <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={0.7}>
            {contentImageUrl ? (
                <Image source={{ uri: contentImageUrl }} style={S.thumb} />
            ) : (
                <View style={[S.thumb, S.thumbFallback]}>
                    <Text style={S.thumbLetter}>{initials}</Text>
                </View>
            )}
            <View style={S.rowInfo}>
                <Text style={S.rowTitle} numberOfLines={1}>
                    {contentTitle}
                </Text>
                {badge && (
                    <View style={[S.badge, { backgroundColor: color + '25' }]}>
                        <Text style={[S.badgeText, { color }]}>{badge}</Text>
                    </View>
                )}
            </View>
            {score !== undefined ? (
                <Text style={[S.score, { color }]}>{score.toFixed(1)}</Text>
            ) : (
                <Ionicons name="star-outline" size={20} color={COLORS.textTertiary} />
            )}
        </TouchableOpacity>
    );
}

// ── Pantalla principal ───────────────────────────────────────

export default function RateHubScreen() {
    const router = useRouter();
    const { data: pending, isLoading: loadingPending } = usePendingRatings();
    const { data: recent, isLoading: loadingRecent } = useRatings();

    const recentSlice = (recent ?? []).slice(0, 5);

    return (
        <SafeAreaView style={S.screen} edges={['top']}>
            <ScrollView
                style={S.scroll}
                contentContainerStyle={S.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <Text style={S.header}>Valorar</Text>

                {/* SearchBar — redirige a tab Buscar */}
                <TouchableOpacity
                    style={S.searchBar}
                    onPress={() => router.push('/(tabs)/search')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search" size={18} color={COLORS.textTertiary} />
                    <Text style={S.searchPlaceholder}>Busca una peli, libro, juego…</Text>
                </TouchableOpacity>

                {/* Sección: Pendiente de valorar */}
                <View style={S.section}>
                    <Text style={S.sectionTitle}>Pendiente de valorar</Text>
                    {loadingPending ? (
                        <ActivityIndicator color={COLORS.textSecondary} style={S.loader} />
                    ) : !pending || pending.length === 0 ? (
                        <Text style={S.emptyText}>
                            Nada pendiente — ¡todo valorado! 🎉
                        </Text>
                    ) : (
                        pending.map((item) => (
                            <ContentRow
                                key={item.id}
                                contentType={item.contentType}
                                contentTitle={item.contentTitle}
                                contentImageUrl={item.contentImageUrl}
                                badge={STATUS_LABEL[item.status]}
                                onPress={() =>
                                    router.push(
                                        `/rate/${item.contentType}/${item.contentId}` as never,
                                    )
                                }
                            />
                        ))
                    )}
                </View>

                {/* Sección: Últimas valoradas */}
                <View style={S.section}>
                    <Text style={S.sectionTitle}>Últimas valoradas</Text>
                    {loadingRecent ? (
                        <ActivityIndicator color={COLORS.textSecondary} style={S.loader} />
                    ) : recentSlice.length === 0 ? (
                        <Text style={S.emptyText}>Aún no has valorado nada</Text>
                    ) : (
                        recentSlice.map((item) => (
                            <ContentRow
                                key={item.id}
                                contentType={item.content_type}
                                contentTitle={item.content_title}
                                contentImageUrl={item.content_image_url}
                                score={item.score}
                                onPress={() =>
                                    router.push(
                                        `/content/${item.content_type}/${item.content_id}` as never,
                                    )
                                }
                            />
                        ))
                    )}
                </View>

                {/* CTA Crear Anything */}
                <TouchableOpacity
                    style={S.anythingCta}
                    onPress={() => router.push('/anything/create')}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={22}
                        color={COLORS.categoryAnything}
                    />
                    <Text style={S.anythingCtaText}>Crear un Anything</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Estilos ──────────────────────────────────────────────────

const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING['2xl'],
    },
    header: {
        fontSize: FONT_SIZE.headlineLarge,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        paddingVertical: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.divider,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        marginBottom: SPACING.xl,
    },
    searchPlaceholder: {
        fontSize: FONT_SIZE.bodyMedium,
        color: COLORS.textTertiary,
        fontFamily: 'SpaceGrotesk_500Medium',
    },
    section: { marginBottom: SPACING.xl },
    sectionTitle: {
        fontSize: FONT_SIZE.headlineSmall,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    loader: { marginTop: SPACING.md },
    emptyText: {
        fontSize: FONT_SIZE.bodyMedium,
        color: COLORS.textSecondary,
        fontFamily: 'SpaceGrotesk_500Medium',
        marginTop: SPACING.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        gap: SPACING.sm,
    },
    thumb: { width: 44, height: 44, borderRadius: RADIUS.sm },
    thumbFallback: {
        backgroundColor: COLORS.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbLetter: {
        fontSize: FONT_SIZE.bodyLarge,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
    },
    rowInfo: { flex: 1, gap: 4 },
    rowTitle: {
        fontSize: FONT_SIZE.bodyMedium,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.textPrimary,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    badgeText: {
        fontSize: FONT_SIZE.bodySmall,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    score: {
        fontSize: FONT_SIZE.headlineSmall,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    anythingCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.categoryAnything + '40',
        marginTop: SPACING.sm,
    },
    anythingCtaText: {
        flex: 1,
        fontSize: FONT_SIZE.bodyMedium,
        fontFamily: 'SpaceGrotesk_700Bold',
        color: COLORS.categoryAnything,
    },
});
