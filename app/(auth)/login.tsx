import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'expo-router';
import { COLORS } from '@/lib/utils/constants';
import { WelcomeAnimation } from '@/components/auth/WelcomeAnimation';

export default function LoginScreen() {
    const { signInWithGoogle, signInWithEmail, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [devLoading, setDevLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, router]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
        }
    };

    const handleDevLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Introduce email y contraseña.');
            return;
        }
        setDevLoading(true);
        try {
            await signInWithEmail(email.trim(), password.trim());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            Alert.alert('Login failed', message);
        } finally {
            setDevLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <WelcomeAnimation />
        <View className="flex-1 items-center justify-center bg-transparent p-6">
            <View className="items-center mb-12">
                <Text className="text-4xl font-bold text-primary mb-2">Rate-it</Text>
                <Text className="text-lg text-secondary text-center">
                    Una app para todo. Comparte opiniones con amigos.
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.link} />
            ) : (
                <View className="w-full max-w-sm gap-4">
                    <TouchableOpacity
                        onPress={handleGoogleLogin}
                        className="bg-accent rounded-full py-3 px-8 w-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-center font-semibold text-lg">
                            Continuar con Google
                        </Text>
                    </TouchableOpacity>

                    {__DEV__ && (
                        <View className="mt-6 border-t border-divider pt-6 gap-3">
                            <Text className="text-secondary text-center text-sm font-medium mb-1">
                                🛠 Dev Login (solo desarrollo)
                            </Text>
                            <TextInput
                                className="bg-surface-elevated text-primary px-4 py-3 rounded-xl border border-divider"
                                placeholder="Email"
                                placeholderTextColor="#666"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                className="bg-surface-elevated text-primary px-4 py-3 rounded-xl border border-divider"
                                placeholder="Password"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                onPress={handleDevLogin}
                                disabled={devLoading}
                                className="bg-surface-elevated border border-link rounded-full py-3 px-8"
                                activeOpacity={0.8}
                            >
                                {devLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.link} />
                                ) : (
                                    <Text className="text-link text-center font-semibold">
                                        Dev Login (Email)
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
        </SafeAreaView>
    );
}
