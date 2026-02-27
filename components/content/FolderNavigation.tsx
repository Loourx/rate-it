import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

const { width: SCREEN_W } = Dimensions.get('window');
const FOLDER_W = (SCREEN_W - SPACING.base * 2 - SPACING.md) / 2;

interface FolderNavigationProps {
    onSelectCategory: (category: ContentType) => void;
}

const FOLDERS: { type: ContentType; emoji: string; label: string }[] = [
    { type: 'movie', emoji: '🎬', label: 'Películas' },
    { type: 'series', emoji: '📺', label: 'Series' },
    { type: 'book', emoji: '📚', label: 'Libros' },
    { type: 'game', emoji: '🎮', label: 'Juegos' },
    { type: 'music', emoji: '🎵', label: 'Música' },
    { type: 'podcast', emoji: '🎙️', label: 'Podcasts' },
    { type: 'anything', emoji: '✨', label: 'Anything' },
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
    const faded = getCategoryFadedColor(folder.type);

    return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(300)}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    S.folder,
                    {
                        backgroundColor: faded,
                        borderColor: color,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                ]}
            >
                {/* Tab shape on top */}
                <View style={[S.tab, { backgroundColor: color + '44' }]} />
                <Text style={S.emoji}>{folder.emoji}</Text>
                <Text style={[S.label, { color }]}>{folder.label}</Text>
            </Pressable>
        </Animated.View>
    );
}

export function FolderNavigation({ onSelectCategory }: FolderNavigationProps) {
    return (
        <View style={S.container}>
            <Text style={S.title}>Explorar</Text>
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
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.base,
    },
    title: {
        ...TYPO.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.base,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    folder: {
        width: FOLDER_W,
        height: FOLDER_W * 0.65,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    tab: {
        position: 'absolute',
        top: 0,
        left: SPACING.md,
        width: FOLDER_W * 0.35,
        height: 10,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    emoji: {
        fontSize: 32,
        marginBottom: SPACING.xs,
    },
    label: {
        ...TYPO.bodySmall,
        fontFamily: FONT.semibold,
    },
});
