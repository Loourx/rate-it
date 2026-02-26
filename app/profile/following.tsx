import React from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    Image, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFollowing } from '@/lib/hooks/useFollowing';
import { useFollow } from '@/lib/hooks/useFollow';
import { useIsFollowing } from '@/lib/hooks/useIsFollowing';
import { useAuthStore } from '@/lib/stores/authStore';
import { COLORS, FONT_SIZE, SPACING } from '@/lib/utils/constants';
import type { FollowingProfile } from '@/lib/types/social';

function UserRow({ profile }: { profile: FollowingProfile }) {
    const { session } = useAuthStore();
    const currentUserId = session?.user.id;
    const isOwnProfile = currentUserId === profile.id;

    const { data: isFollowing } = useIsFollowing(profile.id);
    const followMutation = useFollow(profile.id);

    const initials = profile.username.charAt(0).toUpperCase();

    return (
        <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.push(`/profile/${profile.id}`)}
            activeOpacity={0.7}
        >
            {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
            )}

            <View style={styles.userInfo}>
                <Text style={styles.username}>{profile.username}</Text>
                {profile.displayName && (
                    <Text style={styles.displayName} numberOfLines={1}>
                        {profile.displayName}
                    </Text>
                )}
            </View>

            {!isOwnProfile && (
                <TouchableOpacity
                    style={[styles.followBtn, isFollowing && styles.followingBtn]}
                    onPress={() => followMutation.mutate(isFollowing ?? false)}
                    disabled={followMutation.isPending}
                >
                    <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

export default function FollowingScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const insets = useSafeAreaInsets();
    const { data: following, isLoading, isError } = useFollowing(userId);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Siguiendo</Text>
                <View style={styles.backBtn} />
            </View>

            {isLoading && (
                <ActivityIndicator color={COLORS.textSecondary} style={styles.centered} />
            )}

            {isError && (
                <Text style={[styles.emptyText, styles.centered]}>
                    Error al cargar siguiendo
                </Text>
            )}

            {!isLoading && !isError && (
                <FlatList
                    data={following ?? []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <UserRow profile={item} />}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, styles.centered]}>
                            No sigue a nadie aún
                        </Text>
                    }
                    contentContainerStyle={following?.length === 0 ? styles.emptyContainer : undefined}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    },
    backBtn: { width: 40, alignItems: 'flex-start' },
    title: { fontSize: FONT_SIZE.headlineSmall, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    userRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: SPACING.sm },
    avatarFallback: { backgroundColor: COLORS.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: FONT_SIZE.bodyLarge, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    userInfo: { flex: 1 },
    username: { fontSize: FONT_SIZE.bodyMedium, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    displayName: { fontSize: FONT_SIZE.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
    followBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: 6,
        borderRadius: 999, borderWidth: 1, borderColor: COLORS.textPrimary,
    },
    followingBtn: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.divider },
    followBtnText: { fontSize: FONT_SIZE.bodySmall, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    followingBtnText: { color: COLORS.textSecondary },
    centered: { marginTop: SPACING['2xl'] },
    emptyText: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, textAlign: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center' },
});
