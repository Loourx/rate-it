import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ChallengeList } from '@/components/challenges/ChallengeList';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import { useAnnualChallenges } from '@/lib/hooks/useAnnualChallenges';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { TYPO } from '@/lib/utils/typography';
import type { AnnualChallenge } from '@/lib/types/database';

type CategoryFilter = AnnualChallenge['categoryFilter'];

const YEAR = new Date().getFullYear();

export default function ChallengeScreen() {
    const {
        challenges, isLoading, error,
        createChallenge, deleteChallenge,
        isCreating, getProgress, getPercentage, isCompleted,
    } = useAnnualChallenges(YEAR);

    const usedCategories = new Set(challenges.map((c) => c.categoryFilter));

    const handleCreate = (category: CategoryFilter, target: number, onSuccess: () => void) => {
        createChallenge({ targetCount: target, categoryFilter: category }, { onSuccess });
    };

    if (isLoading) {
        return (
            <View style={{ padding: SPACING.xl, gap: SPACING.base }}>
                <Skeleton width="50%" height={28} borderRadius={RADIUS.sm} />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width="100%" height={90} borderRadius={RADIUS.lg} />
                ))}
            </View>
        );
    }

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
                style={S.root}
                contentContainerStyle={S.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={S.sectionTitle}>Retos activos</Text>
                <ChallengeList
                    challenges={challenges}
                    getProgress={getProgress}
                    getPercentage={getPercentage}
                    isCompleted={isCompleted}
                    onDelete={deleteChallenge}
                />
                <ChallengeForm
                    usedCategories={usedCategories}
                    isCreating={isCreating}
                    onCreate={handleCreate}
                />
            </ScrollView>
        </>
    );
}

const S = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.xl, paddingBottom: 60 },
    sectionTitle: { ...TYPO.h4, color: COLORS.textPrimary, marginBottom: SPACING.base },
});
