import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { BookmarkRow } from '@/lib/hooks/useBookmark';
import type { ContentType } from '@/lib/types/content';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface BookmarkBoxProps {
    type: ContentType;
    label: string;
    items: BookmarkRow[];
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
    onExplore: () => void;
    /** Width of the box — set by parent grid */
    boxWidth: number;
}

/* -------------------------------------------------- */
/*  Poster fan config                                  */
/* -------------------------------------------------- */

const POSTER_W = 40;
const POSTER_H = 60;
const POSTER_OVERLAP = -10; // negative margin for fan overlap
const BOX_H = 150;
const INFO_H = 42;

// Subtle rotations for each poster in the fan (max 4)
const ROTATIONS = [-4, -1, 2, 5];

/* -------------------------------------------------- */
/*  BookmarkBox                                        */
/* -------------------------------------------------- */

export function BookmarkBox({
    type,
    label,
    items,
    count,
    isExpanded,
    onToggle,
    onExplore,
    boxWidth,
}: BookmarkBoxProps) {
    const color = getCategoryColor(type);
    const faded = getCategoryFadedColor(type);
    const isEmpty = count === 0;
    const previewItems = items.slice(0, 4);

    /* ── Empty state ── */
    if (isEmpty) {
        return (
            <Animated.View entering={FadeIn.duration(300)} style={{ width: boxWidth }}>
                <Pressable
                    onPress={onExplore}
                    style={({ pressed }) => [
                        S.box,
                        S.boxEmpty,
                        {
                            borderColor: color + '50',
                            width: boxWidth,
                            opacity: pressed ? 0.7 : 1,
                        },
                    ]}
                >
                    <Ionicons name="add" size={26} color={color + '90'} />
                    <Text style={[S.emptyLabel, { color: COLORS.textTertiary }]}>{label}</Text>
                </Pressable>
            </Animated.View>
        );
    }

    /* ── Filled state ── */
    return (
        <Animated.View entering={FadeIn.duration(300)} style={{ width: boxWidth }}>
            <Pressable
                onPress={onToggle}
                style={({ pressed }) => [
                    S.box,
                    {
                        backgroundColor: faded,
                        borderColor: color + '60',
                        width: boxWidth,
                        opacity: pressed ? 0.85 : 1,
                    },
                ]}
            >
                {/* Poster fan — horizontally centered */}
                <View style={S.posterArea}>
                    <View style={S.posterFan}>
                        {previewItems.map((item, i) => (
                            <View
                                key={item.id}
                                style={[
                                    S.posterWrapper,
                                    {
                                        zIndex: i,
                                        marginLeft: i === 0 ? 0 : POSTER_OVERLAP,
                                        transform: [{ rotate: `${ROTATIONS[i]}deg` }],
                                    },
                                ]}
                            >
                                {item.contentImageUrl ? (
                                    <Image
                                        source={{ uri: item.contentImageUrl }}
                                        style={[S.poster, { borderColor: color + '30' }]}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[S.poster, S.posterPlaceholder, { borderColor: color + '30' }]}>
                                        <Text style={S.posterLetter}>
                                            {item.contentTitle.charAt(0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom info bar */}
                <View style={[S.infoBar, { borderTopColor: color + '25' }]}>
                    <View style={S.infoText}>
                        <Text style={[S.boxLabel, { color: COLORS.textPrimary }]} numberOfLines={1}>
                            {label}
                        </Text>
                        <Text style={[S.countText, { color }]}>
                            {count} guardado{count !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={COLORS.textTertiary}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
}

/* -------------------------------------------------- */
/*  Styles                                             */
/* -------------------------------------------------- */

const S = StyleSheet.create({
    box: {
        height: BOX_H,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    boxEmpty: {
        borderStyle: 'dashed',
        borderWidth: 1.5,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
    },
    emptyLabel: {
        ...TYPO.caption,
        fontFamily: FONT.semibold,
    },

    // Poster area — fills space above info bar, centers the fan
    posterArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterFan: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    poster: {
        width: POSTER_W,
        height: POSTER_H,
        borderRadius: RADIUS.sm - 2,
        borderWidth: 1,
    },
    posterPlaceholder: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    posterLetter: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        color: COLORS.textTertiary,
    },

    // Bottom info bar
    infoBar: {
        height: INFO_H,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        borderTopWidth: 1,
        backgroundColor: 'rgba(18, 18, 18, 0.6)',
    },
    infoText: {
        flex: 1,
        gap: 1,
    },
    boxLabel: {
        ...TYPO.caption,
        fontFamily: FONT.bold,
    },
    countText: {
        ...TYPO.label,
        fontFamily: FONT.semibold,
    },
});
