import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueries } from '@tanstack/react-query';
import { COLORS, SPACING } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';
import { fetchChallenges, countProgress } from '@/lib/api/challenges';
import { useCelebration } from '@/lib/hooks/useCelebration';
import { ActivityRing } from './ActivityRing';
import type { AnnualChallenge } from '@/lib/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallengeProgressProps {
    userId: string | undefined;
    isOwnProfile?: boolean;
    onCelebrate?: (markFn: () => void) => void;
}

const YEAR = new Date().getFullYear();

// ─── Celebration gate (invisible, one per challenge) ─────────────────────────

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

    const hasTriggeredRef = useRef(false);
    const handleGateCelebrate = useCallback((markFn: () => void) => {
        if (hasTriggeredRef.current) return;
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

    const progressMap = useMemo(() => {
        const map: Record<string, number> = {};
        challenges.forEach((c, i) => {
            map[c.id] = (progressResults[i]?.data as number | undefined) ?? 0;
        });
        return map;
    }, [challenges, progressResults]);

    if (isLoading) return null;

    // Celebration gates (invisible)
    const celebrationGates = onCelebrate
        ? challenges.map((c) => (
              <CelebrationGate
                  key={`gate-${c.id}`}
                  challengeId={c.id}
                  isCompleted={(progressMap[c.id] ?? 0) >= c.targetCount}
                  onCelebrate={handleGateCelebrate}
              />
          ))
        : null;

    const ringContent = (
        <View style={S.card}>
            <Text style={S.title}>Retos {YEAR} 🔥</Text>
            <ActivityRing challenges={challenges} progressMap={progressMap} />
        </View>
    );

    if (isOwnProfile) {
        return (
            <>
                {celebrationGates}
                <TouchableOpacity
                    onPress={() => router.push('/profile/challenge')}
                    activeOpacity={0.85}
                >
                    {ringContent}
                </TouchableOpacity>
            </>
        );
    }

    return (
        <>
            {celebrationGates}
            {ringContent}
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
    },
    title: {
        ...TYPO.body,
        fontFamily: FONT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
});
