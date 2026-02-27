import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

type CategoryFilter = AnnualChallenge['categoryFilter'];

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

function getColor(cat: CategoryFilter): string {
    return cat === 'all' ? COLORS.link : getCategoryColor(cat as ContentType);
}
function getFaded(cat: CategoryFilter): string {
    return cat === 'all' ? 'rgba(100,210,255,0.2)' : getCategoryFadedColor(cat as ContentType);
}

interface ChallengeListProps {
    challenges: AnnualChallenge[];
    getProgress: (id: string) => number;
    getPercentage: (id: string) => number;
    isCompleted: (id: string) => boolean;
    onDelete: (id: string) => void;
}

export function ChallengeList({
    challenges, getProgress, getPercentage, isCompleted, onDelete,
}: ChallengeListProps) {
    if (challenges.length === 0) {
        return (
            <View style={S.emptyBox}>
                <Text style={S.emptyEmoji}>🎯</Text>
                <Text style={S.emptyText}>Aún no tienes retos este año. ¡Crea uno!</Text>
            </View>
        );
    }

    return (
        <View style={{ gap: SPACING.sm }}>
            {challenges.map((c) => {
                const meta = CATEGORY_META[c.categoryFilter];
                const color = getColor(c.categoryFilter);
                const faded = getFaded(c.categoryFilter);
                const progress = getProgress(c.id);
                const pct = getPercentage(c.id);
                const done = isCompleted(c.id);

                const handleDelete = () => {
                    Alert.alert('Eliminar reto', `¿Eliminar el reto de ${meta.label}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(c.id) },
                    ]);
                };

                return (
                    <View key={c.id} style={[S.card, { borderLeftColor: color, backgroundColor: faded }]}>
                        <View style={S.cardHeader}>
                            <View style={S.cardLeft}>
                                <Text style={S.cardEmoji}>{meta.emoji}</Text>
                                <View>
                                    <Text style={S.cardLabel}>{meta.label}</Text>
                                    <Text style={[S.cardCount, done && { color: COLORS.success }]}>
                                        {done ? '✓ ' : ''}{progress} / {c.targetCount}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleDelete} hitSlop={8} style={{ padding: SPACING.xs }}>
                                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                        <View style={S.barTrack}>
                            <View style={[S.barFill, { width: `${pct}%`, backgroundColor: done ? COLORS.success : color }]} />
                        </View>
                        <Text style={S.barPct}>{pct}%</Text>
                    </View>
                );
            })}
        </View>
    );
}

const S = StyleSheet.create({
    emptyBox: { alignItems: 'center', paddingVertical: SPACING['2xl'], backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.lg, marginBottom: SPACING.base },
    emptyEmoji: { fontSize: 36, marginBottom: SPACING.sm },
    emptyText: { ...TYPO.bodySmall, color: COLORS.textSecondary, textAlign: 'center' },
    card: { borderRadius: RADIUS.lg, borderLeftWidth: 4, padding: SPACING.base },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    cardEmoji: { fontSize: 28 },
    cardLabel: { ...TYPO.body, fontFamily: FONT.semibold, color: COLORS.textPrimary },
    cardCount: { ...TYPO.caption, color: COLORS.textSecondary, marginTop: 2 },
    barTrack: { height: 6, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, overflow: 'hidden' },
    barFill: { height: 6, borderRadius: RADIUS.full },
    barPct: { ...TYPO.label, color: COLORS.textTertiary, marginTop: SPACING.xs, textAlign: 'right' },
});
