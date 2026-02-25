import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Image, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useIsFollowing } from '@/lib/hooks/useIsFollowing';
import { useFollow } from '@/lib/hooks/useFollow';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RatingHistory } from '@/components/profile/RatingHistory';
import { PinnedItemsGrid } from '@/components/profile/PinnedItemsGrid';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function HeaderSkeleton() {
    const opacity = useSharedValue(0.3);
    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })),
            -1, true,
        );
    }, [opacity]);
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[styles.skeletonHeader, style]}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonLines}>
                <View style={styles.skeletonLine1} />
                <View style={styles.skeletonLine2} />
            </View>
        </Animated.View>
    );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const { data: profile, isLoading, isError, refetch } = useUserProfile(id);
    const { data: isFollowing } = useIsFollowing(id);
    const followMutation = useFollow(id ?? '');

    const handleFollowPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        followMutation.mutate(isFollowing ?? false);
    };

    const canViewContent = !profile?.isPrivate || isFollowing === true;
    const initials = profile?.username?.charAt(0).toUpperCase() ?? '?';

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top }]}>
                <BackButton />
                <HeaderSkeleton />
                <ProfileStats />
            </View>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (isError || !profile) {
        return (
            <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
                <BackButton />
                <Ionicons name="alert-circle-outline" size={52} color={COLORS.error} />
                <Text style={styles.errorTitle}>No pudimos cargar este perfil</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
        >
            <BackButton />

            {/* ── Profile Header ── */}
            <View style={styles.header}>
                {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitial}>{initials}</Text>
                    </View>
                )}
                <Text style={styles.username}>@{profile.username}</Text>
                {profile.displayName ? (
                    <Text style={styles.displayName}>{profile.displayName}</Text>
                ) : null}
                {profile.bio ? (
                    <Text style={styles.bio}>{profile.bio}</Text>
                ) : null}

                {/* ── Follow Button ── */}
                <TouchableOpacity
                    onPress={handleFollowPress}
                    disabled={followMutation.isPending}
                    style={[styles.followButton, isFollowing && styles.followingButton]}
                    activeOpacity={0.8}
                >
                    {followMutation.isPending ? (
                        <ActivityIndicator size="small" color={isFollowing ? COLORS.textPrimary : COLORS.background} />
                    ) : (
                        <Text style={[styles.followText, isFollowing && styles.followingText]}>
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Private gate ── */}
            {!canViewContent ? (
                <View style={styles.privateContainer}>
                    <Ionicons name="lock-closed-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.privateTitle}>Este perfil es privado</Text>
                    <Text style={styles.privateSubtitle}>
                        Síguelo para ver su actividad y estadísticas.
                    </Text>
                </View>
            ) : (
                <>
                    <PinnedItemsGrid userId={id} isOwnProfile={false} />
                    <ProfileStats userId={id} />
                    <RatingHistory userId={id} />
                </>
            )}
        </ScrollView>
    );
}

function BackButton() {
    return (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.background },
    centered: { alignItems: 'center', justifyContent: 'center' },
    backButton: { paddingHorizontal: 16, paddingVertical: 12 },
    header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 6 },
    avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 8 },
    avatarPlaceholder: { backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: FONT_SIZE.displayMedium, fontWeight: '700', color: COLORS.textSecondary },
    username: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, letterSpacing: 0.3 },
    displayName: { fontSize: FONT_SIZE.headlineMedium, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center' },
    bio: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 2 },
    followButton: { marginTop: 8, paddingHorizontal: 32, paddingVertical: 10, borderRadius: 999, backgroundColor: COLORS.link, minWidth: 120, alignItems: 'center' },
    followingButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.divider },
    followText: { fontSize: FONT_SIZE.bodyMedium, fontWeight: '700', color: COLORS.background },
    followingText: { color: COLORS.textPrimary },
    privateContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'], paddingHorizontal: 32, gap: 10 },
    privateTitle: { fontSize: FONT_SIZE.headlineSmall, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
    privateSubtitle: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
    errorTitle: { fontSize: FONT_SIZE.headlineSmall, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, marginBottom: 4 },
    retryButton: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.surfaceElevated, borderRadius: 999 },
    retryText: { fontSize: FONT_SIZE.bodyMedium, fontWeight: '600', color: COLORS.textPrimary },
    skeletonHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 20 },
    skeletonAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.surfaceElevated },
    skeletonLines: { flex: 1, gap: 10 },
    skeletonLine1: { height: 16, width: '60%', backgroundColor: COLORS.surfaceElevated, borderRadius: 6 },
    skeletonLine2: { height: 12, width: '40%', backgroundColor: COLORS.surfaceElevated, borderRadius: 6 },
});
