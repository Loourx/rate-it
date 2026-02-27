import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import { useUpdatePinPositions } from '@/lib/hooks/useUpdatePinPositions';
import type { PinnedItem } from '@/lib/hooks/usePinnedItems';
import type { ContentType } from '@/lib/types/content';

const POSTER_W = 70;
const POSTER_H = 105;
const MAX_PINS = 5;

interface PinnedItemsManagerProps {
    items: PinnedItem[];
    pinnedMode: 'manual' | 'auto';
}

type DragItem = PinnedItem & { key: string };

export function PinnedItemsManager({ items, pinnedMode }: PinnedItemsManagerProps) {
    const router = useRouter();
    const updatePositions = useUpdatePinPositions();

    const dragData: DragItem[] = items.map((item) => ({
        ...item,
        key: item.id,
    }));

    const handleDragEnd = useCallback(
        ({ data }: { data: DragItem[] }) => {
            const updates = data.map((item, index) => ({
                id: item.id,
                position: index + 1,
            }));
            updatePositions.mutate(updates);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        [updatePositions],
    );

    const handlePress = useCallback(
        (contentType: string, contentId: string) => {
            router.push(`/content/${contentType}/${contentId}` as never);
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item, drag, isActive }: RenderItemParams<DragItem>) => {
            const borderColor = getCategoryColor(item.contentType as ContentType);

            return (
                <ScaleDecorator activeScale={1.08}>
                    <View
                        style={[
                            S.posterWrap,
                            isActive && S.posterActive,
                            { borderBottomColor: borderColor, borderBottomWidth: 3 },
                        ]}
                    >
                        {pinnedMode === 'manual' ? (
                            <View
                                onTouchEnd={() => handlePress(item.contentType, item.contentId)}
                                onTouchStart={() => undefined}
                            >
                                <View>
                                    {item.contentImageUrl ? (
                                        <Image
                                            source={{ uri: item.contentImageUrl }}
                                            style={S.poster}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[S.poster, S.placeholder]}>
                                            <Text style={S.placeholderText}>
                                                {item.contentTitle.charAt(0)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View>
                                {item.contentImageUrl ? (
                                    <Image
                                        source={{ uri: item.contentImageUrl }}
                                        style={S.poster}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[S.poster, S.placeholder]}>
                                        <Text style={S.placeholderText}>
                                            {item.contentTitle.charAt(0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </ScaleDecorator>
            );
        },
        [pinnedMode, handlePress],
    );

    // Empty slots for manual mode
    const emptySlots = pinnedMode === 'manual'
        ? Array.from({ length: MAX_PINS - items.length }).map((_, i) => (
              <View key={`empty-${i}`} style={[S.posterWrap, S.emptySlot]}>
                  <Text style={S.emptyIcon}>+</Text>
              </View>
          ))
        : null;

    return (
        <View style={S.container}>
            {pinnedMode === 'manual' && items.length > 0 ? (
                <View style={S.row}>
                    <DraggableFlatList
                        data={dragData}
                        onDragEnd={handleDragEnd}
                        keyExtractor={(item) => item.key}
                        renderItem={renderItem}
                        horizontal
                        onDragBegin={() =>
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        }
                        containerStyle={S.listContainer}
                        contentContainerStyle={S.listContent}
                    />
                    {emptySlots}
                </View>
            ) : (
                <View style={S.row}>
                    {items.map((item) => {
                        const borderColor = getCategoryColor(item.contentType as ContentType);
                        return (
                            <View
                                key={item.id}
                                style={[S.posterWrap, { borderBottomColor: borderColor, borderBottomWidth: 3 }]}
                            >
                                {item.contentImageUrl ? (
                                    <Image
                                        source={{ uri: item.contentImageUrl }}
                                        style={S.poster}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[S.poster, S.placeholder]}>
                                        <Text style={S.placeholderText}>
                                            {item.contentTitle.charAt(0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    {emptySlots}
                </View>
            )}
        </View>
    );
}

const S = StyleSheet.create({
    container: { width: '100%' },
    row: { flexDirection: 'row', gap: SPACING.sm },
    listContainer: { flexGrow: 0 },
    listContent: { gap: SPACING.sm },
    posterWrap: {
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
    },
    posterActive: {
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    poster: {
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: RADIUS.sm,
    },
    placeholder: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        ...TYPO.h3,
        color: COLORS.textTertiary,
    },
    emptySlot: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.textTertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        ...TYPO.h3,
        color: COLORS.textTertiary,
        fontWeight: '300',
    },
});
