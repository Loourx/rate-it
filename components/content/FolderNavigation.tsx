import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, getCategoryColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

const CARD_TOTAL_H = 152;
const VISIBLE_BAND_H = 42;
const STACK_OVERLAP = CARD_TOTAL_H - VISIBLE_BAND_H;
const TAB_RISE = 16;
const TAB_W = 102;
const TAB_H = 30;

interface FolderNavigationProps {
    onSelectCategory: (category: ContentType) => void;
}

const FOLDERS: { type: ContentType; label: string }[] = [
    { type: 'movie', label: 'Películas' },
    { type: 'series', label: 'Series' },
    { type: 'book', label: 'Libros' },
    { type: 'game', label: 'Juegos' },
    { type: 'music', label: 'Música' },
    /* MVP_DISABLED: { type: 'podcast', label: 'Podcasts' }, */
    /* MVP_DISABLED: { type: 'anything', label: 'Anything' }, */
];

function usesDarkText(folderType: ContentType): boolean {
    return folderType === 'book' || folderType === 'music';
}

function FolderCard({
    folder,
    stackIndex,
    totalCount,
    index,
    onPress,
}: {
    folder: (typeof FOLDERS)[number];
    stackIndex: number;
    totalCount: number;
    index: number;
    onPress: () => void;
}) {
    const color = getCategoryColor(folder.type);
    const darkText = usesDarkText(folder.type);
    const isLast = stackIndex === totalCount - 1;

    const labelColor = darkText ? COLORS.background : COLORS.textPrimary;
    const guideColor = darkText ? 'rgba(18,18,18,0.16)' : 'rgba(255,255,255,0.22)';
    const elevation = Math.max(1, 20 - stackIndex);

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 65).duration(330).springify()}
            style={[
                S.cardWrapper,
                stackIndex > 0 && !isLast && S.overlap,
                {
                    zIndex: 40 - stackIndex,
                    ...(Platform.OS === 'android' ? { elevation } : null),
                },
            ]}
        >
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`Abrir carpeta ${folder.label}`}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }] }]}
            >
                <View style={S.shapeBox}>
                    <View style={[S.folderBody, { backgroundColor: color }]}>
                        <View style={S.folderBevel} />
                        <View style={[S.labelGuide, { backgroundColor: guideColor }]} />
                        <Text style={[S.label, { color: labelColor }]} numberOfLines={1}>
                            {folder.label}
                        </Text>
                    </View>

                    <View style={[S.folderTab, { backgroundColor: color }]} />
                    <View style={[S.tabShoulder, { backgroundColor: color }]} />
                </View>
            </Pressable>
        </Animated.View>
    );
}

export function FolderNavigation({ onSelectCategory }: FolderNavigationProps) {
    return (
        <View style={S.container}>
            <View style={S.stack}>
                {FOLDERS.map((folder, i) => (
                    <FolderCard
                        key={folder.type}
                        folder={folder}
                        stackIndex={i}
                        totalCount={FOLDERS.length}
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
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    stack: {
        paddingTop: SPACING.sm,
        overflow: 'visible',
    },
    cardWrapper: {
        width: '100%',
    },
    overlap: {
        marginTop: -STACK_OVERLAP,
    },
    shapeBox: {
        height: CARD_TOTAL_H,
    },
    folderBody: {
        position: 'absolute',
        top: TAB_RISE,
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: RADIUS.lg + SPACING.sm,
        borderBottomLeftRadius: RADIUS.lg + SPACING.sm,
        borderBottomRightRadius: RADIUS.lg + SPACING.sm,
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
        overflow: 'hidden',
    },
    folderTab: {
        position: 'absolute',
        top: 0,
        left: SPACING.base,
        width: TAB_W,
        height: TAB_H,
        borderTopLeftRadius: RADIUS.md,
        borderTopRightRadius: RADIUS.md,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: RADIUS.md,
    },
    tabShoulder: {
        position: 'absolute',
        top: TAB_RISE,
        left: SPACING.base + TAB_W - 16,
        width: 32,
        height: 18,
        borderRadius: RADIUS.full,
    },
    folderBevel: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        opacity: 0.55,
    },
    labelGuide: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        top: SPACING.lg,
        height: 1.5,
    },
    label: {
        ...TYPO.h1,
        fontFamily: FONT.bold,
        letterSpacing: -0.4,
        lineHeight: 34,
    },
});