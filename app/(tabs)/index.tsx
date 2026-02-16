import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';

export default function HomeScreen() {
    const { signOut, user } = useAuth();

    return (
        <View className="flex-1 items-center justify-center bg-gray-50 p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenido a Rate-it
            </Text>

            {user && (
                <Text className="text-gray-600 mb-8">
                    Logged in as: {user.email}
                </Text>
            )}

            <TouchableOpacity
                onPress={() => signOut()}
                className="bg-red-500 rounded-full py-3 px-8"
            >
                <Text className="text-white font-semibold">Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}
