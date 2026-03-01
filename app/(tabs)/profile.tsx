import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const { signOut } = useAuth();
    const { data: profile } = useProfile();
    const router = useRouter();

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
    const profileCardProps: ShareableProfileCardProps = {
        username: profile?.username ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        totalRatings: statsData?.totalRatings ?? 0,
        averageScore: (statsData?.averageScore && statsData.averageScore > 0)
            ? statsData.averageScore
            : null,
        currentStreak: streakData?.streakDays ?? 0,
        pinnedItems: (pinnedData ?? []).slice(0, 5).map((p) => ({
            title: p.contentTitle,
            imageUrl: p.contentImageUrl ?? null,
            contentType: p.contentType,
        })),
        challenge: firstChallenge
            ? {
                target: firstChallenge.targetCount,
                current: getProgress(firstChallenge.id),
                categoryFilter: firstChallenge.categoryFilter ?? null,
            }
            : null,
    };
    // void suppresses TS warning for unused feedItems
    void feedItems;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ position: 'relative' }}>
            <ScrollView contentContainerClassName="pb-24">
                {/* Header */}
                <View className="px-6 py-6 items-center">
                    <View className="w-24 h-24 bg-surface-elevated rounded-full mb-4 items-center justify-center overflow-hidden border-2 border-surface-elevated">
                        {profile?.avatarUrl ? (
                            <Image
                                source={{ uri: profile.avatarUrl }}
                                className="w-24 h-24"
                                resizeMode="cover"
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
                        {/* Share profile button — secondary style, own profile only */}
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
                {firstChallenge !== null && (
                    <TouchableOpacity
                        onPress={shareChallenge}
                        disabled={isCapturingChallenge}
                        style={[
                            styles.shareChallengeBtn,
                            isCapturingChallenge && styles.shareBtnDisabled,
                        ]}
                    >
                        <Text style={styles.shareChallengeText}>Compartir reto</Text>
                    </TouchableOpacity>
                )}

                {/* Score Distribution Histogram */}
                <ScoreDistribution userId={myUserId} />

                {/* Rating History */}
                <RatingHistory userId={myUserId} />

                {/* Bookmarks */}
                <BookmarksList />
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
                            percentage={getPercentage(firstChallenge.id)}
                            categoryFilter={firstChallenge.categoryFilter === 'all' ? null : firstChallenge.categoryFilter}
                            year={firstChallenge.year}
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
