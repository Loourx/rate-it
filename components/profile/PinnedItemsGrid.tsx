import React from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/lib/stores/authStore';
import { usePinnedItems, useUnpinItem } from '@/lib/hooks/usePinnedItems';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '@/lib/utils/constants';

interface Props {
    userId: string;
    isOwnProfile?: boolean;
}

const POSTER_W = 60;
const POSTER_H = 90;
const MAX_PINS = 5;

export function PinnedItemsGrid({ userId, isOwnProfile }: Props) {
    const router = useRouter();
    const { session } = useAuthStore();
    const currentUserId = session?.user.id;
    const isOwn = isOwnProfile ?? (currentUserId === userId);

    const { data: items = [], isLoading } = usePinnedItems(userId);
    const unpinMutation = useUnpinItem();

    const handlePosterPress = (contentType: string, contentId: string) => {
        router.push(`/content/${contentType}/${contentId}`);
    };

    const handleUnpin = async (pinnedItemId: string) => {
        Alert.alert(
            'Desanclar favorito',
            '¿Quieres eliminar este item de tus favoritos?',
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

    // Don't render if loading or: no items and not own profile
    if (isLoading) return null;
    if (items.length === 0 && !isOwn) return null;

    return (
        <Animated.View entering={FadeInDown.duration(350)} style={S.wrapper}>
            <Text style={S.sectionTitle}>⭐ Favoritos</Text>

            {items.length === 0 && isOwn ? (
                <Text style={S.emptyHint}>
                    Fija tus contenidos favoritos desde su página de detalle
                </Text>
            ) : (
                <View style={S.row}>
                    {items.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handlePosterPress(item.contentType, item.contentId)}
                            onLongPress={isOwn ? () => handleUnpin(item.id) : undefined}
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

                    {/* Empty slots — only for own profile */}
                    {isOwn && Array.from({ length: MAX_PINS - items.length }).map((_, i) => (
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
    sectionTitle: {
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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
