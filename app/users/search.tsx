import React, { useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
    useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '@/components/content/SearchBar';
import { UserSearchResultCard } from '@/components/social/UserSearchResultCard';
import { useSearchUsers } from '@/lib/hooks/useSearchUsers';
import { useAuthStore } from '@/lib/stores/authStore';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import type { UserSearchResult } from '@/lib/types/social';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
    const opacity = useSharedValue(0.3);
    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1, true,
        );
    }, [opacity]);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[styles.skeletonRow, style]}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonLines}>
                <View style={styles.skeletonLine1} />
                <View style={styles.skeletonLine2} />
            </View>
            <View style={styles.skeletonButton} />
        </Animated.View>
    );
}

function Skeleton() {
    return (
        <View>
            {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </View>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function UserSearchScreen() {
    const [query, setQuery] = useState('');
    const { session } = useAuthStore();
    const currentUserId = session?.user.id ?? '';

    const { data, isLoading, isError } = useSearchUsers(query);

    // Filter out the current user from results
    const results = (data ?? []).filter((u) => u.id !== currentUserId);

    const renderItem = ({ item }: { item: UserSearchResult }) => (
        <UserSearchResultCard user={item} currentUserId={currentUserId} />
    );

    // ─── Content ─────────────────────────────────────────────────────────────

    const renderContent = () => {
        if (query.length < 2) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={52} color={COLORS.textTertiary} />
                    <Text style={styles.emptyText}>Escribe al menos 2 caracteres</Text>
                </View>
            );
        }

        if (isLoading) return <Skeleton />;

        if (isError) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={52} color={COLORS.error} />
                    <Text style={styles.emptyTitle}>Error al buscar</Text>
                    <Text style={styles.emptyText}>Inténtalo de nuevo más tarde.</Text>
                </View>
            );
        }

        if (results.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-outline" size={52} color={COLORS.textTertiary} />
                    <Text style={styles.emptyTitle}>Sin resultados</Text>
                    <Text style={styles.emptyText}>No encontramos usuarios con ese nombre.</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />
        );
    };

    return (
        <SafeAreaView style={styles.screen} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
                    <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Buscar personas</Text>
            </View>

            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar personas..."
            />

            <View style={styles.content}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingTop: SPACING.xs },
    backButton: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm },
    title: { fontSize: FONT_SIZE.headlineSmall, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 4 },
    content: { flex: 1 },
    emptyContainer: { alignItems: 'center', paddingTop: SPACING['3xl'], paddingHorizontal: 32, gap: 10 },
    emptyTitle: { fontSize: FONT_SIZE.headlineSmall, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
    emptyText: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
    skeletonRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 12, gap: 12 },
    skeletonAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceElevated },
    skeletonLines: { flex: 1, gap: 8 },
    skeletonLine1: { height: 13, width: '55%', backgroundColor: COLORS.surfaceElevated, borderRadius: 6 },
    skeletonLine2: { height: 11, width: '35%', backgroundColor: COLORS.surfaceElevated, borderRadius: 6 },
    skeletonButton: { width: 80, height: 32, borderRadius: 999, backgroundColor: COLORS.surfaceElevated },
});
