import React from 'react';
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/utils/constants';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.textTertiary} />
                    <Text className="text-2xl font-bold text-primary mt-4 mb-2">
                        Página no encontrada
                    </Text>
                    <Text className="text-secondary text-center mb-6">
                        Esta pantalla no existe.
                    </Text>
                    <Link href="/(tabs)" className="px-6 py-3 bg-surface-elevated rounded-xl">
                        <Text className="text-primary font-semibold">Volver al inicio</Text>
                    </Link>
                </View>
            </SafeAreaView>
        </>
    );
}
