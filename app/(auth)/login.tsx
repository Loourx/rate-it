import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const { signInWithGoogle, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            // In a real app, show a toast or alert here
        }
    };

    return (
        <View className="flex-1 items-center justify-center bg-white p-6">
            <View className="items-center mb-12">
                <Text className="text-4xl font-bold text-gray-900 mb-2">Rate-it</Text>
                <Text className="text-lg text-gray-500 text-center">
                    Una app para todo. Comparte opiniones con amigos.
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-blue-600 rounded-full py-3 px-8 w-full max-w-sm"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-center font-semibold text-lg">
                        Continuar con Google
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
