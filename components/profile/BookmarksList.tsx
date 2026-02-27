import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useGroupedBookmarks, type BookmarkGroup } from '@/lib/hooks/useGroupedBookmarks';
import type { BookmarkRow } from '@/lib/hooks/useBookmark';
import { BookmarkBox } from './BookmarkBox';
import { BookmarkBoxExpanded } from './BookmarkBoxExpanded';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_PAD = SPACING.xl;
const GRID_GAP = SPACING.md;
const BOX_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2;

/* -------------------------------------------------- */
/* Skeleton                                            */
/* -------------------------------------------------- */

function SkeletonBox() {
    const opacity = useSharedValue(0.3);
    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1,
            true,
        );
    }, [opacity]);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[styles.skeletonBox, style]} />
    );
}

/* -------------------------------------------------- */
/* BookmarksList                                       */
/* -------------------------------------------------- */

export function BookmarksList({ userId }: { userId?: string }) {
    const router = useRouter();
    const { groups, totalCount, isLoading, isError, refetch } = useGroupedBookmarks(userId);
    const [expandedCategory, setExpandedCategory] = useState<ContentType | null>(null);

    const handleToggle = useCallback(
        (type: ContentType) => {
            setExpandedCategory((prev) => (prev === type ? null : type));
        },
        [],
    );

    const handleItemPress = useCallback(
        (item: BookmarkRow) => {
            router.push(`/content/${item.contentType}/${item.contentId}`);
        },
        [router],
    );

    const handleExplore = useCallback(
        (type: ContentType) => {
            router.push('/(tabs)/search');
        },
        [router],
    );

    /* Loading */
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Guardados</Text>
                <View style={styles.skeletonGrid}>
                    <SkeletonBox />
                    <SkeletonBox />
                    <SkeletonBox />
                    <SkeletonBox />
                </View>
            </View>
        );
    }

    /* Error */
    if (isError) {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Guardados</Text>
                <Text style={styles.errorText}>Error al cargar los guardados</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Build rows of 2 — expanded content goes after the row containing expanded box
    const rows: BookmarkGroup[][] = [];
    for (let i = 0; i < groups.length; i += 2) {
        rows.push(groups.slice(i, i + 2));
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Guardados</Text>
                {totalCount > 0 && (
                    <Text style={styles.totalBadge}>{totalCount}</Text>
                )}
            </View>

            {rows.map((row, rowIdx) => {
                // Check if any box in this row is expanded
                const expandedInRow = row.find((g) => g.type === expandedCategory);

                return (
                    <View key={rowIdx}>
                        {/* The row of 2 boxes */}
                        <View style={styles.boxRow}>
                            {row.map((group) => (
                                <BookmarkBox
                                    key={group.type}
                                    type={group.type}
                                    label={group.label}
                                    items={group.items}
                                    count={group.count}
                                    isExpanded={expandedCategory === group.type}
                                    onToggle={() => handleToggle(group.type)}
                                    onExplore={() => handleExplore(group.type)}
                                    boxWidth={BOX_W}
                                />
                            ))}
                        </View>

                        {/* Expanded grid below the row */}
                        {expandedInRow && expandedInRow.count > 0 && (
                            <BookmarkBoxExpanded
                                type={expandedInRow.type}
                                items={expandedInRow.items}
                                onItemPress={handleItemPress}
                                visible
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
}

/* -------------------------------------------------- */
/* Styles                                              */
/* -------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: GRID_PAD,
        paddingBottom: SPACING.xl,
        marginTop: SPACING.xl,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.base,
        gap: SPACING.sm,
    },
    sectionTitle: {
        ...TYPO.h4,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
    },
    totalBadge: {
        ...TYPO.caption,
        fontFamily: FONT.bold,
        color: COLORS.textSecondary,
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    boxRow: {
        flexDirection: 'row',
        gap: GRID_GAP,
        marginBottom: GRID_GAP,
    },
    errorText: {
        ...TYPO.bodySmall,
        color: COLORS.error,
        textAlign: 'center',
    },
    retryButton: {
        alignSelf: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.full,
    },
    retryText: {
        ...TYPO.bodySmall,
        fontFamily: FONT.semibold,
        color: COLORS.textPrimary,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
    },
    skeletonBox: {
        width: BOX_W,
        height: 150,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.surfaceElevated,
    },
});
