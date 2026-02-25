import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIsFollowing } from '@/lib/hooks/useIsFollowing';
import { useFollow } from '@/lib/hooks/useFollow';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import type { UserSearchResult } from '@/lib/types/social';

interface Props {
    user: UserSearchResult;
    currentUserId: string;
}

export function UserSearchResultCard({ user, currentUserId }: Props) {
    const { data: isFollowing } = useIsFollowing(user.id);
    const followMutation = useFollow(user.id);
    const initials = user.username.charAt(0).toUpperCase();

    const handleFollowPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        followMutation.mutate(isFollowing ?? false);
    };

    const handleCardPress = () => {
        router.push(`/profile/${user.id}`);
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleCardPress}
            activeOpacity={0.75}
        >
            {/* Avatar */}
            {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
            )}

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.usernameRow}>
                    <Text style={styles.username}>@{user.username}</Text>
                    {user.isPrivate && (
                        <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} style={styles.lockIcon} />
                    )}
                </View>
                {user.displayName ? (
                    <Text style={styles.displayName} numberOfLines={1}>{user.displayName}</Text>
                ) : null}
            </View>

            {/* Follow button */}
            <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollowPress}
                disabled={followMutation.isPending}
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
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm + 4,
        gap: SPACING.sm + 4,
    },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarFallback: {
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: { fontSize: FONT_SIZE.bodyLarge, fontWeight: '700', color: COLORS.textSecondary },
    info: { flex: 1, gap: 2 },
    usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    username: { fontSize: FONT_SIZE.bodyMedium, fontWeight: '700', color: COLORS.textPrimary },
    lockIcon: { marginTop: 1 },
    displayName: { fontSize: FONT_SIZE.bodySmall, color: COLORS.textSecondary },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: COLORS.link,
        alignItems: 'center',
        minWidth: 86,
    },
    followingButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.divider },
    followText: { fontSize: FONT_SIZE.bodySmall, fontWeight: '700', color: COLORS.background },
    followingText: { color: COLORS.textPrimary },
});
