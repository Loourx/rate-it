import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueries } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS, FONT_SIZE, getCategoryColor } from '@/lib/utils/constants';
import { fetchChallenges, countProgress } from '@/lib/api/challenges';
import { useCelebration } from '@/lib/hooks/useCelebration';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryFilter = AnnualChallenge['categoryFilter'];

interface ChallengeProgressProps {
    userId: string | undefined;
    isOwnProfile?: boolean;
    /** Called (once per session) when a newly-completed challenge is detected. */
    onCelebrate?: (markFn: () => void) => void;
}

// ─── Static metadata ──────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

const CATEGORY_META: Record<CategoryFilter, { emoji: string; label: string }> = {
    movie:    { emoji: '🎬', label: 'Películas' },
    series:   { emoji: '📺', label: 'Series' },
    book:     { emoji: '📚', label: 'Libros' },
    game:     { emoji: '🎮', label: 'Videojuegos' },
    music:    { emoji: '🎵', label: 'Música' },
    podcast:  { emoji: '🎙️', label: 'Podcasts' },
    anything: { emoji: '✨', label: 'Anything' },
    all:      { emoji: '🌟', label: 'Todas' },
};

function getChallengeBarColor(category: CategoryFilter): string {
    if (category === 'all') return COLORS.link;
    return getCategoryColor(category as ContentType);
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function ChallengeRow({ challenge, progress }: { challenge: AnnualChallenge; progress: number }) {
    const pct = Math.min(100, Math.round((progress / challenge.targetCount) * 100));
    const completed = progress >= challenge.targetCount;
    const meta = CATEGORY_META[challenge.categoryFilter];
    const color = getChallengeBarColor(challenge.categoryFilter);

    return (
        <View style={S.row}>
            {/* Label */}
            <Text style={S.rowLabel} numberOfLines={1}>
                {meta.emoji} {meta.label}:
            </Text>

            {/* Counts */}
            <Text style={S.rowCounts}>
                {progress}/{challenge.targetCount}
            </Text>

            {/* Progress bar */}
            <View style={S.barTrack}>
                <View
                    style={[
                        S.barFill,
                        { width: `${pct}%` as `${number}%`, backgroundColor: color },
                    ]}
                />
            </View>

            {/* Trailing indicator */}
            {completed ? (
                <Text style={S.trophy}>🏆</Text>
            ) : (
                <Text style={[S.pct, { color }]}>{pct}%</Text>
            )}
        </View>
    );
}

// ─── Celebration gate (one per challenge, renders nothing) ───────────────────

/**
 * Invisible component that monitors a single challenge.
 * If shouldCelebrate becomes true it calls onCelebrate once and stops.
 * Lives in the tree so it can legally call hooks per challenge.
 */
function CelebrationGate({
    challengeId,
    isCompleted,
    onCelebrate,
}: {
    challengeId: string;
    isCompleted: boolean;
    onCelebrate: (markFn: () => void) => void;
}) {
    const { shouldCelebrate, markCelebrated } = useCelebration(challengeId, isCompleted);
    const firedRef = useRef(false);

    useEffect(() => {
        if (shouldCelebrate && !firedRef.current) {
            firedRef.current = true;
            onCelebrate(markCelebrated);
        }
    }, [shouldCelebrate, markCelebrated, onCelebrate]);

    return null;
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ChallengeProgress({ userId, isOwnProfile = false, onCelebrate }: ChallengeProgressProps) {
    const router = useRouter();

    // ── Only one celebration fires per mount (queue the rest for next open) ──
    const hasTriggeredRef = useRef(false);
    const handleGateCelebrate = useCallback((markFn: () => void) => {
        if (hasTriggeredRef.current) return; // another challenge already won
        hasTriggeredRef.current = true;
        onCelebrate?.(markFn);
    }, [onCelebrate]);

    const { data: challenges = [], isLoading } = useQuery<AnnualChallenge[]>({
        queryKey: ['challenges', userId, YEAR],
        queryFn: () => fetchChallenges(userId!, YEAR),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    const progressResults = useQueries({
        queries: challenges.map((c) => ({
            queryKey: ['challenge-progress', userId, YEAR, c.categoryFilter] as const,
            queryFn: () => countProgress(userId!, YEAR, c.categoryFilter),
            enabled: !!userId,
            staleTime: 1000 * 60 * 5,
        })),
    });

    // Don't render while loading or if no active challenges
    if (isLoading || challenges.length === 0) return null;

    const cardContent = (
        <View style={S.card}>
            <Text style={S.title}>Retos {YEAR} 🔥</Text>
            {challenges.map((c, i) => {
                const progress = (progressResults[i]?.data as number | undefined) ?? 0;
                return <ChallengeRow key={c.id} challenge={c} progress={progress} />;
            })}
        </View>
    );

    // Gates are rendered outside the card (invisible) to detect completions
    const celebrationGates = onCelebrate
        ? challenges.map((c, i) => {
              const progress = (progressResults[i]?.data as number | undefined) ?? 0;
              const isCompleted = progress >= c.targetCount;
              return (
                  <CelebrationGate
                      key={`gate-${c.id}`}
                      challengeId={c.id}
                      isCompleted={isCompleted}
                      onCelebrate={handleGateCelebrate}
                  />
              );
          })
        : null;

    if (isOwnProfile) {
        return (
            <>
                {celebrationGates}
                <TouchableOpacity
                    onPress={() => router.push('/profile/challenge')}
                    activeOpacity={0.85}
                >
                    {cardContent}
                </TouchableOpacity>
            </>
        );
    }

    return (
        <>
            {celebrationGates}
            {cardContent}
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.base,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.base,
        gap: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZE.bodyLarge,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minHeight: 28,
    },
    rowLabel: {
        width: 108,
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textSecondary,
        flexShrink: 0,
    },
    rowCounts: {
        width: 52,
        fontSize: FONT_SIZE.bodySmall,
        color: COLORS.textTertiary,
        textAlign: 'right',
        flexShrink: 0,
    },
    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: RADIUS.full,
    },
    trophy: {
        width: 28,
        textAlign: 'center',
        fontSize: 14,
    },
    pct: {
        width: 34,
        fontSize: FONT_SIZE.labelSmall ?? 10,
        fontWeight: '600',
        textAlign: 'right',
        flexShrink: 0,
    },
});
