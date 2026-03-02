import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ChallengeList } from '@/components/challenges/ChallengeList';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import { useAnnualChallenges } from '@/lib/hooks/useAnnualChallenges';
import { EmptyState } from '@/components/ui/EmptyState';
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
    const scrollRef = useRef<ScrollView>(null);

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
                ref={scrollRef}
                style={S.root}
                contentContainerStyle={S.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={S.sectionTitle}>Retos activos</Text>
                {challenges.length === 0 ? (
                    <EmptyState
                        icon="trophy-outline"
                        title="¿Cuánto puedes disfrutar este año?"
                        description="Crea un reto personal: 50 películas, 20 libros, 100 de todo... tú decides la meta."
                        actionLabel="Crear mi reto"
                        onAction={() => scrollRef.current?.scrollToEnd({ animated: true })}
                    />
                ) : (
                    <ChallengeList
                        challenges={challenges}
                        getProgress={getProgress}
                        getPercentage={getPercentage}
                        isCompleted={isCompleted}
                        onDelete={deleteChallenge}
                    />
                )}
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
