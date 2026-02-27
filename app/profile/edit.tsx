import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    ScrollView, Switch, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile, useUpdateProfile, uploadAvatar } from '@/lib/hooks/useProfile';
import { useAuthStore } from '@/lib/stores/authStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Toast } from '@/components/ui/Toast';
import { COLORS, SPACING, RADIUS } from '@/lib/utils/constants';
import { TYPO, FONT } from '@/lib/utils/typography';

const MAX_DISPLAY_NAME = 30;
const MAX_BIO = 150;

export default function EditProfileScreen() {
    const router = useRouter();
    const { session } = useAuthStore();
    const { data: profile, isLoading, isError, refetch } = useProfile();
    const updateProfile = useUpdateProfile();

    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName ?? '');
            setBio(profile.bio ?? '');
            setIsPublic(!profile.isPrivate);
            setAvatarUri(profile.avatarUrl ?? null);
        }
    }, [profile]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        const trimmed = displayName.trim();
        if (!trimmed) return;
        setIsSaving(true);
        try {
            let finalAvatarUrl: string | undefined;
            // Upload new avatar only if it's a local file (not a URL)
            if (avatarUri && !avatarUri.startsWith('http') && session?.user.id) {
                finalAvatarUrl = await uploadAvatar(session.user.id, avatarUri);
            }
            await updateProfile.mutateAsync({
                displayName: trimmed,
                bio: bio.trim(),
                isPrivate: !isPublic,
                ...(finalAvatarUrl && { avatarUrl: finalAvatarUrl }),
            });
            setToastVisible(true);
            setTimeout(() => router.back(), 600);
        } catch {
            // Mutation error is handled by TanStack Query state
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingSkeleton />;
    if (isError) return <ErrorState onRetry={refetch} />;

    const isValid = displayName.trim().length > 0;

    return (
        <>
            <Stack.Screen options={{
                title: 'Editar perfil',
                headerStyle: { backgroundColor: COLORS.background },
                headerTintColor: COLORS.textPrimary,
            }} />
            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
                    {/* Avatar */}
                    <TouchableOpacity onPress={pickImage} style={s.avatarWrap} activeOpacity={0.8}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={s.avatar} />
                        ) : (
                            <View style={s.avatarPlaceholder}>
                                <Ionicons name="person" size={48} color={COLORS.textTertiary} />
                            </View>
                        )}
                        <View style={s.cameraBadge}>
                            <Ionicons name="camera" size={16} color={COLORS.textPrimary} />
                        </View>
                    </TouchableOpacity>
                    <Text style={s.avatarHint}>Toca para cambiar la foto</Text>

                    {/* Display Name */}
                    <Text style={s.label}>Nombre</Text>
                    <TextInput
                        style={s.input}
                        value={displayName}
                        onChangeText={(t) => setDisplayName(t.slice(0, MAX_DISPLAY_NAME))}
                        placeholder="Tu nombre"
                        placeholderTextColor={COLORS.textTertiary}
                        maxLength={MAX_DISPLAY_NAME}
                    />
                    <Text style={s.counter}>{displayName.length}/{MAX_DISPLAY_NAME}</Text>

                    {/* Bio */}
                    <Text style={s.label}>Bio</Text>
                    <TextInput
                        style={[s.input, s.bioInput]}
                        value={bio}
                        onChangeText={(t) => setBio(t.slice(0, MAX_BIO))}
                        placeholder="Cuéntanos algo sobre ti…"
                        placeholderTextColor={COLORS.textTertiary}
                        multiline
                        maxLength={MAX_BIO}
                    />
                    <Text style={s.counter}>{bio.length}/{MAX_BIO}</Text>

                    {/* Privacy Toggle */}
                    <View style={s.toggleRow}>
                        <View>
                            <Text style={s.toggleLabel}>Perfil público</Text>
                            <Text style={s.toggleHint}>Todos pueden ver tu perfil</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: COLORS.surfaceElevated, true: COLORS.success }}
                            thumbColor={COLORS.textPrimary}
                        />
                    </View>

                    {updateProfile.isError && (
                        <Text style={s.errorText}>Error al guardar. Inténtalo de nuevo.</Text>
                    )}
                </ScrollView>

                {/* Save Button */}
                <View style={s.bottomBar}>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving || !isValid}
                        style={[s.saveBtn, { opacity: isSaving || !isValid ? 0.5 : 1 }]}
                        activeOpacity={0.8}
                    >
                        <Text style={s.saveTxt}>
                            {isSaving ? 'Guardando…' : 'Guardar cambios'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <Toast
                message="Perfil actualizado ✓"
                visible={toastVisible}
                onDismiss={() => setToastVisible(false)}
            />
        </>
    );
}

function LoadingSkeleton() {
    return (
        <View style={[s.flex, { padding: SPACING.xl, alignItems: 'center' }]}>
            <Skeleton width={100} height={100} borderRadius={RADIUS.full} />
            <View style={{ width: '100%', marginTop: SPACING['2xl'], gap: SPACING.base }}>
                <Skeleton width="40%" height={16} />
                <Skeleton width="100%" height={44} borderRadius={RADIUS.md} />
                <Skeleton width="30%" height={16} />
                <Skeleton width="100%" height={90} borderRadius={RADIUS.md} />
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    flex: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SPACING.xl, paddingBottom: 140, alignItems: 'center' },
    avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
    avatar: { width: 100, height: 100, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceElevated },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.link, alignItems: 'center', justifyContent: 'center',
    },
    avatarHint: { color: COLORS.textTertiary, ...TYPO.caption, marginBottom: SPACING['2xl'] },
    label: {
        color: COLORS.textSecondary, ...TYPO.bodySmall, fontFamily: FONT.medium,
        alignSelf: 'flex-start', marginBottom: SPACING.sm,
    },
    input: {
        width: '100%', backgroundColor: COLORS.surfaceElevated, color: COLORS.textPrimary,
        borderRadius: RADIUS.md, padding: SPACING.base, ...TYPO.body,
    },
    bioInput: { minHeight: 90, textAlignVertical: 'top' },
    counter: {
        color: COLORS.textTertiary, ...TYPO.caption,
        alignSelf: 'flex-end', marginTop: SPACING.xs, marginBottom: SPACING.lg,
    },
    toggleRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', backgroundColor: COLORS.surfaceElevated,
        borderRadius: RADIUS.md, padding: SPACING.base, marginTop: SPACING.sm,
    },
    toggleLabel: { color: COLORS.textPrimary, ...TYPO.body, fontFamily: FONT.semibold },
    toggleHint: { color: COLORS.textTertiary, ...TYPO.caption, marginTop: 2 },
    errorText: { color: COLORS.error, ...TYPO.bodySmall, marginTop: SPACING.base, textAlign: 'center' },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: SPACING.xl, paddingBottom: 40, backgroundColor: COLORS.background,
    },
    saveBtn: {
        paddingVertical: SPACING.base, borderRadius: RADIUS.full,
        alignItems: 'center', backgroundColor: COLORS.link,
    },
    saveTxt: { color: COLORS.background, ...TYPO.h4, fontFamily: FONT.bold },
});
