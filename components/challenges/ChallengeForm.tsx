import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

type CategoryFilter = AnnualChallenge['categoryFilter'];

const ALL_CATEGORIES: CategoryFilter[] = [
    'movie', 'series', 'book', 'game', 'music', 'podcast', 'anything', 'all',
];

const CATEGORY_META: Record<CategoryFilter, { emoji: string; label: string }> = {
    movie: { emoji: '🎬', label: 'Películas' },
    series: { emoji: '📺', label: 'Series' },
    book: { emoji: '📚', label: 'Libros' },
    game: { emoji: '🎮', label: 'Videojuegos' },
    music: { emoji: '🎵', label: 'Música' },
    podcast: { emoji: '🎙️', label: 'Podcasts' },
    anything: { emoji: '✨', label: 'Cualquier cosa' },
    all: { emoji: '🌟', label: 'Todas' },
};

const SUGGESTED_TARGETS = [5, 10, 25, 50, 100];

function getColor(cat: CategoryFilter): string {
    return cat === 'all' ? COLORS.link : getCategoryColor(cat as ContentType);
}

interface ChallengeFormProps {
    usedCategories: Set<CategoryFilter>;
    isCreating: boolean;
    onCreate: (category: CategoryFilter, target: number, onSuccess: () => void) => void;
}

export function ChallengeForm({ usedCategories, isCreating, onCreate }: ChallengeFormProps) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
    const [customTarget, setCustomTarget] = useState('');

    const available = ALL_CATEGORIES.filter((cat) => !usedCategories.has(cat));
    const effectiveTarget = selectedTarget ?? (customTarget ? parseInt(customTarget, 10) : null);
    const canCreate = selectedCategory !== null && effectiveTarget !== null && effectiveTarget > 0 && !isNaN(effectiveTarget);

    if (available.length === 0) {
        return (
            <View style={S.allCovered}>
                <Text style={S.allCoveredText}>Ya tienes retos en todas las categorías 🎉</Text>
            </View>
        );
    }

    const handleCreate = () => {
        if (!canCreate || !selectedCategory || !effectiveTarget) return;
        onCreate(selectedCategory, effectiveTarget, () => {
            setSelectedCategory(null);
            setSelectedTarget(null);
            setCustomTarget('');
        });
    };

    return (
        <View style={{ marginTop: SPACING['2xl'] }}>
            <Text style={S.sectionTitle}>Añadir reto</Text>

            <Text style={S.fieldLabel}>Categoría</Text>
            <View style={S.chipRow}>
                {available.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const color = getColor(cat);
                    const selected = selectedCategory === cat;
                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[S.chip, { borderColor: color }, selected && { backgroundColor: color }]}
                            activeOpacity={0.75}
                        >
                            <Text style={S.chipEmoji}>{meta.emoji}</Text>
                            <Text style={[S.chipLabel, { color: selected ? COLORS.background : color }]}>
                                {meta.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={S.fieldLabel}>Objetivo</Text>
            <View style={S.chipRow}>
                {SUGGESTED_TARGETS.map((n) => {
                    const selected = selectedTarget === n && customTarget === '';
                    return (
                        <TouchableOpacity
                            key={n}
                            onPress={() => { setSelectedTarget(n); setCustomTarget(''); }}
                            style={[S.chip, S.chipTarget, selected && S.chipTargetSelected]}
                            activeOpacity={0.75}
                        >
                            <Text style={[S.chipLabel, { color: selected ? COLORS.background : COLORS.textPrimary }]}>
                                {n}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TextInput
                style={S.customInput}
                value={customTarget}
                onChangeText={(v) => { setCustomTarget(v); setSelectedTarget(null); }}
                placeholder="Otro número…"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="number-pad"
                maxLength={4}
            />

            <TouchableOpacity
                onPress={handleCreate}
                disabled={!canCreate || isCreating}
                style={[S.createBtn, { opacity: canCreate && !isCreating ? 1 : 0.4 }]}
                activeOpacity={0.8}
            >
                {isCreating ? (
                    <ActivityIndicator color={COLORS.background} />
                ) : (
                    <Text style={S.createBtnTxt}>Crear reto</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const S = StyleSheet.create({
    sectionTitle: { ...TYPO.h4, color: COLORS.textPrimary, marginBottom: SPACING.base },
    fieldLabel: { ...TYPO.bodySmall, fontFamily: FONT.medium, color: COLORS.textSecondary, marginBottom: SPACING.sm, marginTop: SPACING.base },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xs },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.divider },
    chipEmoji: { fontSize: 14 },
    chipLabel: { ...TYPO.caption, fontFamily: FONT.semibold },
    chipTarget: { borderColor: COLORS.textTertiary, minWidth: 44, justifyContent: 'center' },
    chipTargetSelected: { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },
    customInput: { backgroundColor: COLORS.surfaceElevated, color: COLORS.textPrimary, borderRadius: RADIUS.md, padding: SPACING.base, ...TYPO.body, marginTop: SPACING.sm },
    createBtn: { marginTop: SPACING.xl, paddingVertical: SPACING.base, borderRadius: RADIUS.full, alignItems: 'center', backgroundColor: COLORS.link },
    createBtnTxt: { ...TYPO.h4, color: COLORS.background },
    allCovered: { marginTop: SPACING['2xl'], padding: SPACING.xl, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.lg, alignItems: 'center' },
    allCoveredText: { ...TYPO.body, fontFamily: FONT.semibold, color: COLORS.textPrimary, textAlign: 'center' },
});
