import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { useRatings } from '@/lib/hooks/useRatings';
import { ContentCard } from '@/components/content/ContentCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { data: profile } = useProfile();
    const { data: ratings } = useRatings();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/(auth)/login');
        } catch {
            // signOut already logs errors internally
        }
    };

    const handlePress = (content: unknown & { type: string; id: string }) => {
        router.push(`/content/${content.type}/${content.id}`);
    };

    const ratingCount = ratings?.length || 0;
    const followersCount = 0;
    const followingCount = 0;

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
                <View className="flex-row justify-around px-6 py-4 border-y border-divider bg-surface mb-6">
                    <View className="items-center">
                        <Text className="text-headlineMedium font-bold text-primary">{ratingCount}</Text>
                        <Text className="text-bodySmall text-secondary">Ratings</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-headlineMedium font-bold text-primary">{followersCount}</Text>
                        <Text className="text-bodySmall text-secondary">Seguidores</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-headlineMedium font-bold text-primary">{followingCount}</Text>
                        <Text className="text-bodySmall text-secondary">Siguiendo</Text>
                    </View>
                </View>

                {/* Ratings Grid */}
                <View className="px-6">
                    <Text className="text-headlineSmall font-bold text-primary mb-4">Recientes</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {ratings?.map((rating) => (
                            <View key={rating.id} className="w-[48%]">
                                <ContentCard
                                    content={{
                                        id: rating.content_id,
                                        type: rating.content_type,
                                        title: (rating as unknown as Record<string, string>).content_title,
                                        imageUrl: (rating as unknown as Record<string, string>).content_image_url,
                                    }}
                                    rating={rating.rating}
                                    onPress={handlePress}
                                    orientation="vertical"
                                />
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
