import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, getCategoryColor } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import type { ContentType } from '@/lib/types/content';

export type ActivityFilter = 'all' | 'rated' | 'reviewed';

export const CATEGORY_FILTERS: Array<{ value: ContentType | 'all'; label: string }> = [
    { value: 'all',      label: 'Todo' },
    { value: 'movie',    label: '🎬 Pelis' },
    { value: 'series',   label: '📺 Series' },
    { value: 'book',     label: '📚 Libros' },
    { value: 'game',     label: '🎮 Juegos' },
    { value: 'music',    label: '🎵 Música' },
    /* MVP_DISABLED: { value: 'podcast',  label: '🎙️ Podcasts' }, */
    /* MVP_DISABLED: { value: 'anything', label: '✨ Anything' }, */
];

export const ACTIVITY_FILTERS: Array<{ value: ActivityFilter; label: string }> = [
    { value: 'all',      label: 'Todo' },
    { value: 'rated',    label: 'Solo ratings' },
    { value: 'reviewed', label: 'Con reseña' },
];

function FilterChip({
    label,
    isActive,
    color,
    onPress,
}: {
    label: string;
    isActive: boolean;
    color?: string;
    onPress: () => void;
}) {
    const activeColor = color ?? COLORS.textPrimary;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                S.chip,
                isActive && { backgroundColor: activeColor + '20', borderColor: activeColor },
            ]}
        >
            <Text style={[S.chipText, isActive && { color: activeColor }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export function FilterBar({
    categoryFilter,
    onCategoryChange,
    activityFilter,
    onActivityChange,
    horizontalInset = SPACING.md,
}: {
    categoryFilter: ContentType | 'all';
    onCategoryChange: (v: ContentType | 'all') => void;
    activityFilter: ActivityFilter;
    onActivityChange: (v: ActivityFilter) => void;
    horizontalInset?: number;
}) {
    return (
        <View style={S.filterBar}>
            {/* Fila 1: Categorías */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    S.chipRow,
                    { paddingHorizontal: horizontalInset, paddingRight: horizontalInset + SPACING.sm },
                ]}
            >
                {CATEGORY_FILTERS.map((f) => (
                    <FilterChip
                        key={f.value}
                        label={f.label}
                        isActive={categoryFilter === f.value}
                        color={f.value !== 'all' ? getCategoryColor(f.value as ContentType) : undefined}
                        onPress={() => onCategoryChange(f.value as ContentType | 'all')}
                    />
                ))}
                <View style={S.endSpacer} />
            </ScrollView>

            {/* Fila 2: Tipo de actividad */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    S.chipRow,
                    { paddingHorizontal: horizontalInset, paddingRight: horizontalInset + SPACING.sm },
                ]}
            >
                {ACTIVITY_FILTERS.map((f) => (
                    <FilterChip
                        key={f.value}
                        label={f.label}
                        isActive={activityFilter === f.value}
                        onPress={() => onActivityChange(f.value)}
                    />
                ))}
                <View style={S.endSpacer} />
            </ScrollView>
        </View>
    );
}

const S = StyleSheet.create({
    filterBar: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        paddingBottom: SPACING.sm,
    },
    chipRow: {
        paddingVertical: SPACING.xs,
        gap: SPACING.sm,
        flexDirection: 'row',
    },
    endSpacer: {
        width: SPACING.xs,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.divider,
        backgroundColor: 'transparent',
    },
    chipText: {
        ...TYPO.caption,
        color: COLORS.textSecondary,
    },
});
