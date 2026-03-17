import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { setSession } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (Platform.OS === 'web') {
          // Extraer tokens del hash de la URL manualmente
          const hash = window.location.hash.substring(1); // quitar el '#'
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            if (data.session) {
              setSession(data.session);
              // Limpiar hash de la URL antes de navegar
              window.history.replaceState(null, '', window.location.pathname);
              router.replace('/(tabs)');
              return;
            }
          }
        }

        // Fallback: intentar getSession normal (para native o si no hay hash)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setSession(session);
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [router, setSession]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0A0A' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
