import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOnboardingFlag } from '@/lib/hooks/useOnboardingFlag';
import {
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import '../global.css';

const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { session, isLoading, setSession, setLoading } = useAuthStore();
    const { isLoaded: onboardingLoaded, hasCompleted: onboardingDone } = useOnboardingFlag();
    const segments = useSegments();
    const router = useRouter();

    // Font loading
    const [fontsLoaded] = useFonts({
        SpaceGrotesk_300Light,
        SpaceGrotesk_400Regular,
        SpaceGrotesk_500Medium,
        SpaceGrotesk_600SemiBold,
        SpaceGrotesk_700Bold,
    });

    useEffect(() => {

        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (fontsLoaded && !isLoading && onboardingLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoading, onboardingLoaded]);

    useEffect(() => {
        if (isLoading || !fontsLoaded || !onboardingLoaded) return;

        const inUnauthGroup =
            segments[0] === '(auth)' || segments[0] === '(onboarding)';

        if (session) {
            // Authenticated — always go to tabs (covers auth + onboarding redirects)
            if (inUnauthGroup) router.replace('/(tabs)');
        } else {
            // Not authenticated
            if (!inUnauthGroup) {
                if (!onboardingDone) {
                    router.replace('/(onboarding)');
                } else {
                    router.replace('/(auth)/login');
                }
            }
        }
    }, [session, isLoading, segments, fontsLoaded, onboardingLoaded, onboardingDone]);

    if (!fontsLoaded || isLoading || !onboardingLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-[#121212]">
                <ActivityIndicator size="large" color="#64D2FF" />
            </View>
        );
    }

    return (
        <ThemeProvider value={DarkTheme}>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#121212',
                    },
                    headerTintColor: '#FFFFFF',
                    contentStyle: {
                        backgroundColor: '#121212',
                    },
                    headerShown: false
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen name="profile/edit" options={{ headerShown: true, title: 'Editar perfil' }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <RootLayoutNav />
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
