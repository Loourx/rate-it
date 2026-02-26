import React, { useState } from 'react';
import {
    Modal, View, Text, FlatList, TouchableOpacity,
    Image, ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/authStore';
import { useFollowing } from '@/lib/hooks/useFollowing';
import { sendRecommendation } from '@/lib/api/notifications';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/lib/utils/constants';
import type { FollowingProfile } from '@/lib/types/social';

interface RecommendModalProps {
    visible: boolean;
    onClose: () => void;
    contentType: string;
    contentId: string;
    contentTitle: string;
    contentImageUrl: string | null;
}

export function RecommendModal({
    visible, onClose,
    contentType, contentId, contentTitle, contentImageUrl,
}: RecommendModalProps) {
    const { session } = useAuthStore();
    const userId = session?.user.id;
    const { data: following, isLoading } = useFollowing(userId);
    const [sending, setSending] = useState<string | null>(null);
    const [sent, setSent] = useState<Set<string>>(new Set());

    const handleSend = async (recipient: FollowingProfile) => {
        if (!userId || sent.has(recipient.id)) return;
        setSending(recipient.id);
        try {
            await sendRecommendation({
                senderId: userId,
                recipientId: recipient.id,
                contentType,
                contentId,
                contentTitle,
                contentImageUrl,
            });
            setSent((prev) => new Set(prev).add(recipient.id));
        } catch {
            // Fallo silencioso — no crashear el modal
        } finally {
            setSending(null);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={S.overlay}>
                <View style={S.sheet}>
                    {/* Header */}
                    <View style={S.header}>
                        <Text style={S.title}>Recomendar a...</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={S.subtitle} numberOfLines={1}>{contentTitle}</Text>

                    {isLoading && (
                        <ActivityIndicator color={COLORS.textSecondary} style={S.loader} />
                    )}

                    {!isLoading && (!following || following.length === 0) && (
                        <Text style={S.emptyText}>No sigues a nadie aún</Text>
                    )}

                    {!isLoading && following && following.length > 0 && (
                        <FlatList
                            data={following}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const isSent = sent.has(item.id);
                                const isSending = sending === item.id;
                                const initials = item.username.charAt(0).toUpperCase();

                                return (
                                    <TouchableOpacity
                                        style={S.userRow}
                                        onPress={() => handleSend(item)}
                                        disabled={isSent || isSending}
                                        activeOpacity={0.7}
                                    >
                                        {item.avatarUrl ? (
                                            <Image source={{ uri: item.avatarUrl }} style={S.avatar} />
                                        ) : (
                                            <View style={[S.avatar, S.avatarFallback]}>
                                                <Text style={S.avatarInitial}>{initials}</Text>
                                            </View>
                                        )}
                                        <Text style={S.username}>@{item.username}</Text>
                                        {isSending ? (
                                            <ActivityIndicator size="small" color={COLORS.textSecondary} />
                                        ) : isSent ? (
                                            <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                                        ) : (
                                            <Ionicons name="paper-plane-outline" size={22} color={COLORS.textSecondary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            style={S.list}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: SPACING.md,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    },
    title: { fontSize: FONT_SIZE.headlineSmall, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    subtitle: { fontSize: FONT_SIZE.bodySmall, color: COLORS.textSecondary, paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
    loader: { marginTop: SPACING.xl },
    emptyText: { fontSize: FONT_SIZE.bodyMedium, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xl },
    list: { marginTop: SPACING.sm },
    userRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    avatarFallback: { backgroundColor: COLORS.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: FONT_SIZE.bodyMedium, fontFamily: 'SpaceGrotesk_700Bold', color: COLORS.textPrimary },
    username: { flex: 1, fontSize: FONT_SIZE.bodyMedium, fontFamily: 'SpaceGrotesk_500Medium', color: COLORS.textPrimary },
});
