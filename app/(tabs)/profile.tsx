import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { RatingHistory } from '@/components/profile/RatingHistory';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSocialFeed } from '@/lib/hooks/useSocialFeed';

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

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="px-4 py-2 bg-surface-elevated rounded-full flex-row items-center gap-2"
                        >
                            <Ionicons name="pencil" size={16} color={COLORS.textPrimary} />
                            <Text className="text-primary font-medium">Editar perfil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="px-4 py-2 bg-surface-elevated rounded-full"
                        >
                            <Text className="text-error font-medium">Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <ProfileStats />

                {/* Rating History */}
                <RatingHistory />
            </ScrollView>
        </SafeAreaView>
    );
}
