import React from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/stores/authStore';
import {
    usePinnedItems,
    useUnpinItem,
    useTopRatedItems,
    useUpdatePinnedMode,
} from '@/lib/hooks/usePinnedItems';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '@/lib/utils/constants';

interface Props {
    userId: string;
    isOwnProfile?: boolean;
    pinnedMode?: 'manual' | 'auto';
}

const POSTER_W = 60;
const POSTER_H = 90;
const MAX_PINS = 5;

type DisplayItem = {
    id: string;
    contentType: string;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
    pinnedItemId?: string;
};

export function PinnedItemsGrid({ userId, isOwnProfile, pinnedMode = 'manual' }: Props) {
    const router = useRouter();
    const { session } = useAuthStore();
    const currentUserId = session?.user.id;
    const isOwn = isOwnProfile ?? (currentUserId === userId);

    const { data: pinnedItems = [], isLoading: pinnedLoading } = usePinnedItems(userId);
    const { data: topRatedItems = [], isLoading: topLoading } = useTopRatedItems(
        pinnedMode === 'auto' ? userId : undefined,
    );
    const unpinMutation = useUnpinItem();
    const updateModeMutation = useUpdatePinnedMode();

    const isLoading = pinnedMode === 'auto' ? topLoading : pinnedLoading;

    const displayItems: DisplayItem[] = pinnedMode === 'auto'
        ? topRatedItems.map((r) => ({
            id: r.id,
            contentType: r.contentType,
            contentId: r.contentId,
            contentTitle: r.contentTitle,
            contentImageUrl: r.contentImageUrl,
        }))
        : pinnedItems.map((p) => ({
            id: p.id,
            contentType: p.contentType,
            contentId: p.contentId,
            contentTitle: p.contentTitle,
            contentImageUrl: p.contentImageUrl,
            pinnedItemId: p.id,
        }));

    const handlePosterPress = (contentType: string, contentId: string) => {
        router.push(`/content/${contentType}/${contentId}` as never);
    };

    const handleUnpin = (pinnedItemId: string) => {
        Alert.alert(
            'Desanclar favorito',
            'Â¿Quieres eliminar este item de tus favoritos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desanclar',
                    style: 'destructive',
                    onPress: async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        unpinMutation.mutate(pinnedItemId);
                    },
                },
            ],
        );
    };

    const handleModeChange = async (newMode: 'manual' | 'auto') => {
        if (newMode === pinnedMode) return;
        await Haptics.selectionAsync();
        updateModeMutation.mutate(newMode);
    };

    if (isLoading) return null;
    if (displayItems.length === 0 && !isOwn) return null;

    return (
        <Animated.View entering={FadeInDown.duration(350)} style={S.wrapper}>
            {/* Header row */}
            <View style={S.headerRow}>
                <Text style={S.sectionTitle}>â­ Favoritos</Text>

                {isOwn && (
                    <View style={S.toggle}>
                        <TouchableOpacity
                            style={[S.toggleBtn, pinnedMode === 'manual' && S.toggleBtnActive]}
                            onPress={() => handleModeChange('manual')}
                            disabled={updateModeMutation.isPending}
                            activeOpacity={0.7}
                        >
                            <Text style={[S.toggleText, pinnedMode === 'manual' && S.toggleTextActive]}>
                                Manual
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[S.toggleBtn, pinnedMode === 'auto' && S.toggleBtnActive]}
                            onPress={() => handleModeChange('auto')}
                            disabled={updateModeMutation.isPending}
                            activeOpacity={0.7}
                        >
                            <Text style={[S.toggleText, pinnedMode === 'auto' && S.toggleTextActive]}>
                                Por nota
                            </Text>
                        </TouchableOpacity>

                        {updateModeMutation.isPending && (
                            <ActivityIndicator size="small" color={COLORS.link} style={S.spinner} />
                        )}
                    </View>
                )}
            </View>

            {displayItems.length === 0 && pinnedMode === 'manual' ? (
                <Text style={S.emptyHint}>
                    Fija tus contenidos favoritos desde su pÃ¡gina de detalle
                </Text>
            ) : displayItems.length === 0 ? (
                <Text style={S.emptyHint}>
                    Valora contenidos para ver tu top 5 automÃ¡tico
                </Text>
            ) : (
                <View style={S.row}>
                    {displayItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handlePosterPress(item.contentType, item.contentId)}
                            onLongPress={
                                isOwn && pinnedMode === 'manual' && item.pinnedItemId
                                    ? () => handleUnpin(item.pinnedItemId!)
                                    : undefined
                            }
                            activeOpacity={0.85}
                            style={S.posterWrap}
                        >
                            {item.contentImageUrl ? (
                                <Image
                                    source={{ uri: item.contentImageUrl }}
                                    style={S.poster}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[S.poster, S.posterPlaceholder]}>
                                    <Text style={S.posterPlaceholderText}>
                                        {item.contentTitle.charAt(0)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}

                    {isOwn && pinnedMode === 'manual' && Array.from(
                        { length: MAX_PINS - displayItems.length },
                    ).map((_, i) => (
                        <View key={`empty-${i}`} style={[S.posterWrap, S.emptySlot]}>
                            <Text style={S.emptySlotIcon}>+</Text>
                        </View>
                    ))}
                </View>
            )}
        </Animated.View>
    );
}

const S = StyleSheet.create({
    wrapper: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '700',
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.full,
        padding: 2,
    },
    toggleBtn: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.link,
    },
    toggleText: {
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    toggleTextActive: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    spinner: {
        marginLeft: SPACING.xs,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    posterWrap: {
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
    },
    poster: {
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: RADIUS.sm,
    },
    posterPlaceholder: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterPlaceholderText: {
        fontSize: FONT_SIZE.headlineMedium,
        fontWeight: 'bold',
        color: COLORS.textTertiary,
    },
    emptySlot: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.textTertiary,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptySlotIcon: {
        fontSize: FONT_SIZE.headlineMedium,
        color: COLORS.textTertiary,
        fontWeight: '300',
    },
    emptyHint: {
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textTertiary,
        textAlign: 'center',
        paddingVertical: SPACING.md,
        lineHeight: 18,
    },
});

