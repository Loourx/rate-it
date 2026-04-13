import React, { useCallback, useRef, useState } from 'react';
import { Platform, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RatingHistory } from '@/components/profile/RatingHistory';
import { BookmarksList } from '@/components/profile/BookmarksList';
import { PinnedItemsGrid } from '@/components/profile/PinnedItemsGrid';
import { ScoreDistribution } from '@/components/profile/ScoreDistribution';
import { ChallengeProgress } from '@/components/profile/ChallengeProgress';
import { ConfettiCelebration } from '@/components/profile/ConfettiCelebration';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSocialFeed } from '@/lib/hooks/useSocialFeed';
import { useProfileStats } from '@/lib/hooks/useProfileStats';
import { useStreak } from '@/lib/hooks/useStreak';
import { usePinnedItems } from '@/lib/hooks/usePinnedItems';
import { useAnnualChallenges } from '@/lib/hooks/useAnnualChallenges';
import { useShareProfile } from '@/lib/hooks/useShareProfile';
import { useShareChallenge } from '@/lib/hooks/useShareChallenge';
import { ShareableProfileCard } from '@/components/sharing/ShareableProfileCard';
import { ShareableChallengeCard } from '@/components/sharing/ShareableChallengeCard';
import type { ShareableProfileCardProps } from '@/components/sharing';
import { Toast } from '@/components/ui/Toast';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useProfile();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/(auth)/login');
        } catch {
            // signOut already logs errors internally
        }
    };
    const { data: feedData } = useSocialFeed();
    const feedItems = feedData?.pages.flatMap(page => page) ?? [];
    const myUserId = useAuthStore((state) => state.user?.id);

    const [showConfetti, setShowConfetti] = useState(false);
    const markCelebratedRef = useRef<(() => void) | null>(null);

    const handleCelebrate = useCallback((markFn: () => void) => {
        markCelebratedRef.current = markFn;
        setShowConfetti(true);
    }, []);

    const handleConfettiFinish = useCallback(() => {
        markCelebratedRef.current?.();
        markCelebratedRef.current = null;
        setShowConfetti(false);
    }, []);

    // ── Sharing hooks ────────────────────────────────────────────────────────
    const { data: statsData } = useProfileStats(myUserId);
    const { data: streakData } = useStreak(myUserId);
    const { data: pinnedData } = usePinnedItems(myUserId);
    const { challenges, getProgress, getPercentage } = useAnnualChallenges();

    const { shareProfile, isCapturing, profileCardRef, toastVisible, toastMessage, toastType, dismissToast } =
        useShareProfile();
    const {
        shareChallenge,
        isCapturingChallenge,
        challengeCardRef,
        toastVisible: challengeToastVisible,
        toastMessage: challengeToastMessage,
        toastType: challengeToastType,
        dismissToast: dismissChallengeToast,
    } = useShareChallenge();

    const firstChallenge = challenges[0] ?? null;
    const catBreakdown = (statsData?.byCategory ?? []).reduce(
        (acc, stat) => {
            const k = stat.type as keyof typeof acc;
            if (k in acc) acc[k] = stat.count;
            return acc;
        },
        { movie: 0, series: 0, book: 0, game: 0, music: 0 },
    );
    const profileCardProps: ShareableProfileCardProps = {
        username: profile?.username ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        totalRatings: statsData?.totalRatings ?? 0,
        globalAverage: statsData?.averageScore ?? 0,
        streak: streakData?.streakDays ?? 0,
        topPosters: (pinnedData ?? [])
            .slice(0, 3)
            .map((p) => p.contentImageUrl ?? '')
            .filter(Boolean),
        categoryBreakdown: catBreakdown,
    };
    // void suppresses TS warning for unused feedItems
    void feedItems;

    // ESTADO 1: Loading
    if (profileLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <View className="px-6 py-6 items-center gap-4">
                    <Skeleton width={96} height={96} borderRadius={48} />
                    <Skeleton width={160} height={24} borderRadius={8} />
                    <Skeleton width={240} height={16} borderRadius={8} />
                </View>
                <View className="px-6 gap-4">
                    <Skeleton width="100%" height={80} borderRadius={16} />
                    <Skeleton width="100%" height={200} borderRadius={16} />
                </View>
            </SafeAreaView>
        );
    }

    // ESTADO 2: Error
    if (profileError) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <ErrorState
                    message="No pudimos cargar tu perfil"
                    onRetry={refetchProfile}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ position: 'relative' }}>
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
            >
                {/* Header */}
                <View className="px-6 py-6 items-center">
                    <View className="w-24 h-24 bg-surface-elevated rounded-full mb-4 items-center justify-center overflow-hidden border-2 border-surface-elevated">
                        {profile?.avatarUrl ? (
                            <Image
                                source={profile.avatarUrl}
                                className="w-24 h-24"
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <Ionicons name="person" size={48} color={COLORS.textTertiary} />
                        )}
                    </View>
                    <Text className="text-displaySmall font-bold text-primary text-center">
                        {profile?.displayName || profile?.username || 'Usuario'}
                    </Text>
                    {profile?.bio ? (
                        <Text className="text-bodyLarge text-secondary text-center mt-1">
                            {profile.bio}
                        </Text>
                    ) : null}

                    <View className="flex-row gap-3 mt-4 flex-wrap justify-center">
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="px-4 py-2 bg-surface-elevated rounded-full flex-row items-center gap-2"
                        >
                            <Ionicons name="pencil" size={16} color={COLORS.textPrimary} />
                            <Text className="text-primary font-medium">Editar perfil</Text>
                        </TouchableOpacity>
                        {Platform.OS !== 'web' && (
                            /* WEB_DISABLED — share feature not available on web */
                            <TouchableOpacity
                                onPress={shareProfile}
                                disabled={isCapturing}
                                style={styles.shareBtn}
                            >
                                {isCapturing ? (
                                    <ActivityIndicator size="small" color={COLORS.textSecondary} />
                                ) : (
                                    <Ionicons name="share-outline" size={16} color={COLORS.textSecondary} />
                                )}
                                <Text style={styles.shareBtnText}>Compartir perfil</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => router.push('/profile/challenge')}
                            className="px-4 py-2 bg-surface-elevated rounded-full flex-row items-center gap-2"
                        >
                            <Text className="text-primary font-medium">Mis retos 🎯</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/profile/diary')}
                            className="px-4 py-2 bg-surface-elevated rounded-full flex-row items-center gap-2"
                        >
                            <Text className="text-primary font-medium">Mi diario 📅</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/import')}
                            className="px-4 py-2 bg-surface-elevated rounded-full flex-row items-center gap-2"
                        >
                            <Ionicons name="cloud-upload-outline" size={16} color={COLORS.textPrimary} />
                            <Text className="text-primary font-medium">Importar historial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="px-4 py-2 bg-surface-elevated rounded-full"
                        >
                            <Text className="text-error font-medium">Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pinned Favorites */}
                {myUserId && (
                    <PinnedItemsGrid
                        userId={myUserId}
                        isOwnProfile
                        pinnedMode={profile?.pinnedMode ?? 'manual'}
                    />
                )}

                {/* Stats */}
                <ProfileStats userId={myUserId} />

                {/* Challenge Progress */}
                <ChallengeProgress userId={myUserId} isOwnProfile onCelebrate={handleCelebrate} />
                {Platform.OS !== 'web' && firstChallenge !== null && (
                    /* WEB_DISABLED — share feature not available on web */
                    <TouchableOpacity
                        onPress={shareChallenge}
                        disabled={isCapturingChallenge}
                        style={[
                            styles.shareChallengeBtn,
                            isCapturingChallenge && styles.shareBtnDisabled,
                        ]}
                    >
                        {isCapturingChallenge ? (
                            <ActivityIndicator size="small" color={COLORS.textSecondary} />
                        ) : (
                            <Ionicons name="share-outline" size={16} color={COLORS.textSecondary} />
                        )}
                        <Text style={styles.shareChallengeText}>Compartir reto</Text>
                    </TouchableOpacity>
                )}

                {/* Score Distribution Histogram */}
                <ScoreDistribution userId={myUserId} />

                {/* Rating History */}
                <RatingHistory userId={myUserId} username={profile?.username ?? ''} />

                {/* Bookmarks */}
                <BookmarksList
                    onRequestScrollTo={(y) => {
                        scrollRef.current?.scrollTo({
                            y: Math.max(0, y - 16),
                            animated: true,
                        });
                    }}
                />
            </ScrollView>

            {/* Confetti overlay — absolute, does not block scrolling */}
            {showConfetti && (
                <ConfettiCelebration onFinish={handleConfettiFinish} />
            )}

            {/* Off-screen portal for ShareableProfileCard capture */}
            <View style={styles.offscreen} pointerEvents="none">
                <View ref={profileCardRef} collapsable={false}>
                    <ShareableProfileCard {...profileCardProps} />
                </View>
                {firstChallenge !== null && (
                    <View ref={challengeCardRef} collapsable={false}>
                        <ShareableChallengeCard
                            username={profile?.username ?? ''}
                            target={firstChallenge.targetCount}
                            current={getProgress(firstChallenge.id)}
                            year={firstChallenge.year}
                            streak={streakData?.streakDays ?? 0}
                            categoryFilter={
                                (['movie', 'series', 'book', 'game', 'music', 'all'] as const).some(
                                    (c) => c === firstChallenge.categoryFilter,
                                )
                                    ? (firstChallenge.categoryFilter as 'movie' | 'series' | 'book' | 'game' | 'music' | 'all')
                                    : 'all'
                            }
                        />
                    </View>
                )}
            </View>

            {/* Toast feedback */}
            <Toast
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onDismiss={dismissToast}
            />
            <Toast
                visible={challengeToastVisible}
                message={challengeToastMessage}
                type={challengeToastType}
                onDismiss={dismissChallengeToast}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    offscreen: {
        position: 'absolute',
        left: -9999,
        top: 0,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    shareBtnText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Medium',
        color: COLORS.textSecondary,
    },
    shareChallengeBtn: {
        marginHorizontal: 16,
        marginBottom: 8,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
        alignItems: 'center',
    },
    shareChallengeText: {
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Medium',
        color: COLORS.textSecondary,
    },
    shareBtnDisabled: {
        opacity: 0.5,
    },
});
