import React from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/stores/authStore';
import {
    usePinnedItems,
    useTopRatedItems,
    useUpdatePinnedMode,
} from '@/lib/hooks/usePinnedItems';
import type { PinnedItem } from '@/lib/hooks/usePinnedItems';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { PinnedItemsManager } from './PinnedItemsManager';
import type { ContentType } from '@/lib/types/content';

interface Props {
    userId: string;
    isOwnProfile?: boolean;
    pinnedMode?: 'manual' | 'auto';
}

const POSTER_W = 70;
const POSTER_H = 105;

export function PinnedItemsGrid({ userId, isOwnProfile, pinnedMode = 'manual' }: Props) {
    const router = useRouter();
    const { session } = useAuthStore();
    const currentUserId = session?.user.id;
    const isOwn = isOwnProfile ?? (currentUserId === userId);

    const { data: pinnedItems = [], isLoading: pinnedLoading } = usePinnedItems(userId);
    const { data: topRatedItems = [], isLoading: topLoading } = useTopRatedItems(
        pinnedMode === 'auto' ? userId : undefined,
    );
    const updateModeMutation = useUpdatePinnedMode();
    const isLoading = pinnedMode === 'auto' ? topLoading : pinnedLoading;

    const displayItems: PinnedItem[] = pinnedMode === 'auto'
        ? topRatedItems.map((r, i) => ({
            id: r.id,
            userId,
            contentType: r.contentType,
            contentId: r.contentId,
            contentTitle: r.contentTitle,
            contentImageUrl: r.contentImageUrl,
            position: i + 1,
            createdAt: '',
        }))
        : pinnedItems;

    const handleModeChange = async (newMode: 'manual' | 'auto') => {
        if (newMode === pinnedMode) return;
        await Haptics.selectionAsync();
        updateModeMutation.mutate(newMode);
    };

    if (isLoading) return null;
    if (displayItems.length === 0 && !isOwn) return null;

    return (
        <Animated.View entering={FadeInDown.duration(350)} style={S.wrapper}>
            <View style={S.headerRow}>
                <Text style={S.sectionTitle}>⭐ Favoritos</Text>
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
                            <ActivityIndicator size="small" color={COLORS.link} style={{ marginLeft: SPACING.xs }} />
                        )}
                    </View>
                )}
            </View>

            {displayItems.length === 0 && pinnedMode === 'manual' ? (
                <Text style={S.emptyHint}>Fija tus contenidos favoritos desde su página de detalle</Text>
            ) : displayItems.length === 0 ? (
                <Text style={S.emptyHint}>Valora contenidos para ver tu top 5 automático</Text>
            ) : isOwn ? (
                <PinnedItemsManager items={displayItems} pinnedMode={pinnedMode} />
            ) : (
                <View style={S.row}>
                    {displayItems.map((item) => {
                        const borderColor = getCategoryColor(item.contentType as ContentType);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push(`/content/${item.contentType}/${item.contentId}` as never)}
                                activeOpacity={0.85}
                                style={[S.posterWrap, { borderBottomColor: borderColor, borderBottomWidth: 3 }]}
                            >
                                {item.contentImageUrl ? (
                                    <Image source={{ uri: item.contentImageUrl }} style={S.poster} resizeMode="cover" />
                                ) : (
                                    <View style={[S.poster, S.posterPlaceholder]}>
                                        <Text style={S.posterPlaceholderText}>{item.contentTitle.charAt(0)}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </Animated.View>
    );
}

const S = StyleSheet.create({
    wrapper: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    sectionTitle: { ...TYPO.caption, fontFamily: FONT.bold, color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
    toggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, padding: 2 },
    toggleBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
    toggleBtnActive: { backgroundColor: COLORS.link },
    toggleText: { ...TYPO.caption, color: COLORS.textTertiary },
    toggleTextActive: { color: COLORS.textPrimary, fontFamily: FONT.bold },
    row: { flexDirection: 'row', gap: SPACING.sm },
    posterWrap: { width: POSTER_W, height: POSTER_H, borderRadius: RADIUS.sm, overflow: 'hidden' },
    poster: { width: POSTER_W, height: POSTER_H, borderRadius: RADIUS.sm },
    posterPlaceholder: { backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
    posterPlaceholderText: { ...TYPO.h3, color: COLORS.textTertiary },
    emptyHint: { ...TYPO.caption, color: COLORS.textTertiary, textAlign: 'center', paddingVertical: SPACING.md },
});

