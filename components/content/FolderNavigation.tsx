import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = SPACING.md;
const GRID_PAD = SPACING.lg;
const CARD_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2;
const CARD_H = 88;
const TAB_W = CARD_W * 0.38;
const TAB_H = 14;

interface FolderNavigationProps {
    onSelectCategory: (category: ContentType) => void;
}

const FOLDERS: { type: ContentType; label: string }[] = [
    { type: 'movie', label: 'Películas' },
    { type: 'series', label: 'Series' },
    { type: 'book', label: 'Libros' },
    { type: 'game', label: 'Juegos' },
    { type: 'music', label: 'Música' },
    { type: 'podcast', label: 'Podcasts' },
    { type: 'anything', label: 'Anything' },
];

function FolderCard({
    folder,
    index,
    onPress,
}: {
    folder: (typeof FOLDERS)[number];
    index: number;
    onPress: () => void;
}) {
    const color = getCategoryColor(folder.type);

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 70).duration(350).springify()}
            style={[S.cardWrapper, index === FOLDERS.length - 1 && S.lastCard]}
        >
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            >
                {/* Tab / pestaña */}
                <View style={[S.tab, { backgroundColor: color }]} />
                {/* Body */}
                <View style={[S.folder, { backgroundColor: color }]}>
                    <Text style={S.label} numberOfLines={1}>
                        {folder.label}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

export function FolderNavigation({ onSelectCategory }: FolderNavigationProps) {
    return (
        <View style={S.container}>
            <View style={S.grid}>
                {FOLDERS.map((folder, i) => (
                    <FolderCard
                        key={folder.type}
                        folder={folder}
                        index={i}
                        onPress={() => onSelectCategory(folder.type)}
                    />
                ))}
            </View>
        </View>
    );
}

const S = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: GRID_PAD,
        paddingTop: SPACING['2xl'],
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
    },
    cardWrapper: {
        width: CARD_W,
    },
    lastCard: {
        // Center the 7th (odd) card
        alignSelf: 'center',
        marginLeft: (CARD_W + GRID_GAP) / 2,
    },
    tab: {
        width: TAB_W,
        height: TAB_H,
        borderTopLeftRadius: RADIUS.sm,
        borderTopRightRadius: RADIUS.sm,
        marginLeft: SPACING.md,
    },
    folder: {
        width: CARD_W,
        height: CARD_H,
        borderTopRightRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.lg,
        // top-left NOT rounded — connects with tab
        borderTopLeftRadius: 0,
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING.md,
    },
    label: {
        ...TYPO.bodySmall,
        fontFamily: FONT.bold,
        color: COLORS.background,
    },
});
