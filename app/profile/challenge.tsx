import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAnnualChallenges } from '@/lib/hooks/useAnnualChallenges';
import { COLORS, SPACING, RADIUS, FONT_SIZE, getCategoryColor, getCategoryFadedColor } from '@/lib/utils/constants';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

// ─── static metadata ─────────────────────────────────────────────────────────

type CategoryFilter = AnnualChallenge['categoryFilter'];

const ALL_CATEGORIES: CategoryFilter[] = [
    'movie', 'series', 'book', 'game', 'music', 'podcast', 'anything', 'all',
];

const CATEGORY_META: Record<CategoryFilter, { emoji: string; label: string }> = {
    movie:    { emoji: '🎬', label: 'Películas' },
    series:   { emoji: '📺', label: 'Series' },
    book:     { emoji: '📚', label: 'Libros' },
    game:     { emoji: '🎮', label: 'Videojuegos' },
    music:    { emoji: '🎵', label: 'Música' },
    podcast:  { emoji: '🎙️', label: 'Podcasts' },
    anything: { emoji: '✨', label: 'Cualquier cosa' },
    all:      { emoji: '🌟', label: 'Todas' },
};

const SUGGESTED_TARGETS = [5, 10, 25, 50, 100];

function getChallengeColor(category: CategoryFilter): string {
    if (category === 'all') return COLORS.link;
    return getCategoryColor(category as ContentType);
}

function getChallengeFadedColor(category: CategoryFilter): string {
    if (category === 'all') return 'rgba(100, 210, 255, 0.2)';
    return getCategoryFadedColor(category as ContentType);
}

// ─── sub-components ──────────────────────────────────────────────────────────

function ChallengeCard({
    challenge,
    progress,
    percentage,
    completed,
    onDelete,
}: {
    challenge: AnnualChallenge;
    progress: number;
    percentage: number;
    completed: boolean;
    onDelete: () => void;
}) {
    const meta = CATEGORY_META[challenge.categoryFilter];
    const color = getChallengeColor(challenge.categoryFilter);
    const faded = getChallengeFadedColor(challenge.categoryFilter);

    const handleDelete = () => {
        Alert.alert(
            'Eliminar reto',
            `¿Eliminar el reto de ${meta.label}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: onDelete },
            ],
        );
    };

    return (
        <View style={[s.card, { borderLeftColor: color, backgroundColor: faded }]}>
            <View style={s.cardHeader}>
                <View style={s.cardLeft}>
                    <Text style={s.cardEmoji}>{meta.emoji}</Text>
                    <View>
                        <Text style={s.cardLabel}>{meta.label}</Text>
                        <Text style={[s.cardCount, completed && { color: COLORS.success }]}>
                            {completed ? '✓ ' : ''}{progress} / {challenge.targetCount}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleDelete} hitSlop={8} style={s.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={s.barTrack}>
                <View
                    style={[
                        s.barFill,
                        { width: `${percentage}%`, backgroundColor: completed ? COLORS.success : color },
                    ]}
                />
            </View>
            <Text style={s.barPct}>{percentage}%</Text>
        </View>
    );
}

function LoadingSkeleton() {
    return (
        <View style={{ padding: SPACING.xl, gap: SPACING.base }}>
            <Skeleton width="50%" height={28} borderRadius={RADIUS.sm} />
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={90} borderRadius={RADIUS.lg} />
            ))}
        </View>
    );
}

// ─── main screen ─────────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

export default function ChallengeScreen() {
    const {
        challenges, isLoading, error,
        createChallenge, deleteChallenge,
        isCreating, getProgress, getPercentage, isCompleted,
    } = useAnnualChallenges(YEAR);

    const [selectedCategory, setSelectedCategory] = useState<CategoryFilter | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
    const [customTarget, setCustomTarget] = useState('');

    const usedCategories = new Set(challenges.map((c) => c.categoryFilter));
    const availableCategories = ALL_CATEGORIES.filter((cat) => !usedCategories.has(cat));
    const allCovered = availableCategories.length === 0;

    const effectiveTarget = selectedTarget ?? (customTarget ? parseInt(customTarget, 10) : null);
    const canCreate =
        selectedCategory !== null &&
        effectiveTarget !== null &&
        effectiveTarget > 0 &&
        !isNaN(effectiveTarget);

    const handleCreate = () => {
        if (!canCreate || !selectedCategory || !effectiveTarget) return;
        createChallenge(
            { targetCount: effectiveTarget, categoryFilter: selectedCategory },
            {
                onSuccess: () => {
                    setSelectedCategory(null);
                    setSelectedTarget(null);
                    setCustomTarget('');
                },
            },
        );
    };

    if (isLoading) return <LoadingSkeleton />;
    if (error) {
        return (
            <>
                <Stack.Screen options={{ title: `Mis retos ${YEAR}` }} />
                <ErrorState onRetry={() => {}} />
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: `Mis retos ${YEAR}`,
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.textPrimary,
                }}
            />
            <ScrollView
                style={s.root}
                contentContainerStyle={s.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Active challenges ── */}
                <Text style={s.sectionTitle}>Retos activos</Text>

                {challenges.length === 0 ? (
                    <View style={s.emptyBox}>
                        <Text style={s.emptyEmoji}>🎯</Text>
                        <Text style={s.emptyText}>
                            Aún no tienes retos este año. ¡Crea uno!
                        </Text>
                    </View>
                ) : (
                    challenges.map((challenge) => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            progress={getProgress(challenge.id)}
                            percentage={getPercentage(challenge.id)}
                            completed={isCompleted(challenge.id)}
                            onDelete={() => deleteChallenge(challenge.id)}
                        />
                    ))
                )}

                {/* ── Add challenge form ── */}
                {allCovered ? (
                    <View style={s.allCoveredBox}>
                        <Text style={s.allCoveredText}>
                            Ya tienes retos en todas las categorías 🎉
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={[s.sectionTitle, { marginTop: SPACING['2xl'] }]}>
                            Añadir reto
                        </Text>

                        {/* Category chips */}
                        <Text style={s.fieldLabel}>Categoría</Text>
                        <View style={s.chipRow}>
                            {availableCategories.map((cat) => {
                                const meta = CATEGORY_META[cat];
                                const color = getChallengeColor(cat);
                                const selected = selectedCategory === cat;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        style={[
                                            s.chip,
                                            { borderColor: color },
                                            selected && { backgroundColor: color },
                                        ]}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={s.chipEmoji}>{meta.emoji}</Text>
                                        <Text
                                            style={[
                                                s.chipLabel,
                                                { color: selected ? COLORS.background : color },
                                            ]}
                                        >
                                            {meta.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Target chips */}
                        <Text style={s.fieldLabel}>Objetivo</Text>
                        <View style={s.chipRow}>
                            {SUGGESTED_TARGETS.map((n) => {
                                const selected = selectedTarget === n && customTarget === '';
                                return (
                                    <TouchableOpacity
                                        key={n}
                                        onPress={() => {
                                            setSelectedTarget(n);
                                            setCustomTarget('');
                                        }}
                                        style={[s.chip, s.chipTarget, selected && s.chipTargetSelected]}
                                        activeOpacity={0.75}
                                    >
                                        <Text
                                            style={[
                                                s.chipLabel,
                                                { color: selected ? COLORS.background : COLORS.textPrimary },
                                            ]}
                                        >
                                            {n}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Custom target input */}
                        <TextInput
                            style={s.customInput}
                            value={customTarget}
                            onChangeText={(v) => {
                                setCustomTarget(v);
                                setSelectedTarget(null);
                            }}
                            placeholder="Otro número…"
                            placeholderTextColor={COLORS.textTertiary}
                            keyboardType="number-pad"
                            maxLength={4}
                        />

                        {/* Create button */}
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={!canCreate || isCreating}
                            style={[s.createBtn, { opacity: canCreate && !isCreating ? 1 : 0.4 }]}
                            activeOpacity={0.8}
                        >
                            {isCreating ? (
                                <ActivityIndicator color={COLORS.background} />
                            ) : (
                                <Text style={s.createBtnTxt}>Crear reto</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </>
    );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.xl, paddingBottom: 60 },

    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.headlineSmall,
        fontWeight: '700',
        marginBottom: SPACING.base,
    },

    // Empty state
    emptyBox: {
        alignItems: 'center',
        paddingVertical: SPACING['2xl'],
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.base,
    },
    emptyEmoji: { fontSize: 36, marginBottom: SPACING.sm },
    emptyText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.bodyMedium, textAlign: 'center' },

    // All covered
    allCoveredBox: {
        marginTop: SPACING['2xl'],
        padding: SPACING.xl,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    allCoveredText: { color: COLORS.textPrimary, fontSize: FONT_SIZE.bodyLarge, textAlign: 'center', fontWeight: '600' },

    // Challenge card
    card: {
        borderRadius: RADIUS.lg,
        borderLeftWidth: 4,
        padding: SPACING.base,
        marginBottom: SPACING.sm,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    cardEmoji: { fontSize: 28 },
    cardLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZE.bodyLarge, fontWeight: '600' },
    cardCount: { color: COLORS.textSecondary, fontSize: FONT_SIZE.bodySmall, marginTop: 2 },
    deleteBtn: { padding: SPACING.xs },

    barTrack: { height: 6, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, overflow: 'hidden' },
    barFill: { height: 6, borderRadius: RADIUS.full },
    barPct: { color: COLORS.textTertiary, fontSize: FONT_SIZE.labelSmall, marginTop: SPACING.xs, textAlign: 'right' },

    // Form
    fieldLabel: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.bodyMedium,
        fontWeight: '500',
        marginBottom: SPACING.sm,
        marginTop: SPACING.base,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xs },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full, borderWidth: 1.5,
        borderColor: COLORS.divider,
    },
    chipEmoji: { fontSize: 14 },
    chipLabel: { fontSize: FONT_SIZE.bodySmall, fontWeight: '600' },
    chipTarget: { borderColor: COLORS.textTertiary, minWidth: 44, justifyContent: 'center' },
    chipTargetSelected: { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },

    customInput: {
        backgroundColor: COLORS.surfaceElevated,
        color: COLORS.textPrimary,
        borderRadius: RADIUS.md,
        padding: SPACING.base,
        fontSize: FONT_SIZE.bodyLarge,
        marginTop: SPACING.sm,
    },
    createBtn: {
        marginTop: SPACING.xl,
        paddingVertical: SPACING.base,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        backgroundColor: COLORS.link,
    },
    createBtnTxt: { color: COLORS.background, fontSize: FONT_SIZE.headlineSmall, fontWeight: '700' },
});
