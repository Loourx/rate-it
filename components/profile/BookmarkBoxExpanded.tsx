import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeIn,
    Easing,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { BookmarkRow } from '@/lib/hooks/useBookmark';
import type { ContentType } from '@/lib/types/content';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface BookmarkBoxExpandedProps {
    type: ContentType;
    items: BookmarkRow[];
    onItemPress: (item: BookmarkRow) => void;
    visible: boolean;
}

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_PAD = SPACING.xl; // match BookmarksList container padding
const GRID_GAP = SPACING.sm;
const COLS = 3;
const ITEM_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP * (COLS - 1)) / COLS;
const ITEM_H = ITEM_W * 1.5; // 2:3 aspect ratio

/* -------------------------------------------------- */
/*  BookmarkBoxExpanded                                */
/* -------------------------------------------------- */

export function BookmarkBoxExpanded({
    type,
    items,
    onItemPress,
    visible,
}: BookmarkBoxExpandedProps) {
    const color = getCategoryColor(type);
    const rowCount = Math.ceil(items.length / COLS);
    const targetH = visible ? rowCount * (ITEM_H + 28) + SPACING.base : 0;

    const height = useSharedValue(0);

    useEffect(() => {
        height.value = withTiming(targetH, {
            duration: 280,
            easing: Easing.out(Easing.cubic),
        });
    }, [visible, targetH, height]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: height.value > 5 ? 1 : 0,
        overflow: 'hidden' as const,
    }));

    if (!visible && items.length === 0) return null;

    return (
        <Animated.View style={animatedStyle}>
            <View style={S.grid}>
                {items.map((item, i) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeIn.delay(i * 40).duration(200)}
                        style={S.itemWrapper}
                    >
                        <Pressable
                            onPress={() => onItemPress(item)}
                            style={({ pressed }) => [
                                S.item,
                                { opacity: pressed ? 0.7 : 1 },
                            ]}
                        >
                            {item.contentImageUrl ? (
                                <Image
                                    source={{ uri: item.contentImageUrl }}
                                    style={[S.poster, { borderColor: color + '40' }]}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[S.poster, S.posterPlaceholder, { borderColor: color + '40' }]}>
                                    <Text style={S.posterLetter}>
                                        {item.contentTitle.charAt(0)}
                                    </Text>
                                </View>
                            )}
                            <Text style={S.title} numberOfLines={1}>
                                {item.contentTitle}
                            </Text>
                        </Pressable>
                    </Animated.View>
                ))}
            </View>
        </Animated.View>
    );
}

/* -------------------------------------------------- */
/*  Styles                                             */
/* -------------------------------------------------- */

const S = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    itemWrapper: {
        width: ITEM_W,
    },
    item: {
        width: ITEM_W,
        alignItems: 'center',
    },
    poster: {
        width: ITEM_W,
        height: ITEM_H,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        marginBottom: SPACING.xs,
    },
    posterPlaceholder: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterLetter: {
        ...TYPO.h2,
        color: COLORS.textTertiary,
    },
    title: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        width: '100%',
    },
});
