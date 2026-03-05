import { useQuery, useQueries, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import type { AnnualChallenge } from '@/lib/types/database';
import type { ContentType } from '@/lib/types/content';
import {
    fetchChallenges,
    createChallenge as apiCreateChallenge,
    deleteChallenge as apiDeleteChallenge,
    countProgress,
} from '@/lib/api/challenges';

interface UseAnnualChallengesReturn {
    challenges: AnnualChallenge[];
    isLoading: boolean;
    error: Error | null;
    createChallenge: UseMutationResult<any, Error, { targetCount: number; categoryFilter: AnnualChallenge['categoryFilter'] }>['mutate'];
    deleteChallenge: UseMutationResult<any, Error, string>['mutate'];
    isCreating: boolean;
    isDeleting: boolean;
    getProgress: (challengeId: string) => number;
    getPercentage: (challengeId: string) => number;
    isCompleted: (challengeId: string) => boolean;
}

export function useAnnualChallenges(year: number = new Date().getFullYear()): UseAnnualChallengesReturn {
    const { session } = useAuthStore();
    const queryClient = useQueryClient();
    const userId = session?.user.id ?? '';

    // ── 1. Fetch all challenges for the year ─────────────────────────────────
    const {
        data: challenges = [],
        isLoading: isChallengesLoading,
        error: challengesError,
    } = useQuery<AnnualChallenge[]>({
        queryKey: ['challenges', userId, year],
        queryFn: () => fetchChallenges(userId, year),
        enabled: !!userId,
        staleTime: 60_000,
        gcTime: 300_000,
    });

    // ── 2. Batch progress queries — one per challenge ────────────────────────
    const progressResults = useQueries({
        queries: challenges.map((c) => ({
            queryKey: ['challenge-progress', userId, year, c.categoryFilter] as const,
            queryFn: () => countProgress(userId, year, c.categoryFilter as (ContentType | 'all')),
            enabled: !!userId,
            staleTime: 60_000,
            gcTime: 300_000,
        })),
    });

    // Build a map { challengeId → progress count } aligned by index
    const progressMap: Record<string, number> = {};
    challenges.forEach((c, i) => {
        progressMap[c.id] = (progressResults[i]?.data as number | undefined) ?? 0;
    });

    const isProgressLoading = progressResults.some((r) => r.isLoading);

    // ── 3. Create mutation ───────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (input: {
            targetCount: number;
            categoryFilter: AnnualChallenge['categoryFilter'];
        }) =>
            apiCreateChallenge({
                userId,
                year,
                targetCount: input.targetCount,
                categoryFilter: input.categoryFilter,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
        },
    });

    // ── 4. Delete mutation ───────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: (challengeId: string) => apiDeleteChallenge(challengeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-progress'] });
        },
    });

    // ── 5. Computed helpers ──────────────────────────────────────────────────
    function getProgress(challengeId: string): number {
        return progressMap[challengeId] ?? 0;
    }

    function getPercentage(challengeId: string): number {
        const challenge = challenges.find((c) => c.id === challengeId);
        if (!challenge) return 0;
        const progress = getProgress(challengeId);
        return Math.min(100, Math.round((progress / challenge.targetCount) * 100));
    }

    function isCompleted(challengeId: string): boolean {
        const challenge = challenges.find((c) => c.id === challengeId);
        if (!challenge) return false;
        return getProgress(challengeId) >= challenge.targetCount;
    }

    return {
        challenges,
        isLoading: isChallengesLoading || isProgressLoading,
        error: challengesError,
        createChallenge: createMutation.mutate,
        deleteChallenge: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        getProgress,
        getPercentage,
        isCompleted,
    };
}
