import { supabase } from '../supabase';
import { useAuthStore } from '../stores/authStore';
import { makeRedirectUri } from 'expo-auth-session';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
    const { session, user, isLoading } = useAuthStore();
    const queryClient = useQueryClient();

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = makeRedirectUri({
                path: '/auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false,
                },
            });

            if (error) throw error;

            return data;
        } catch (error) {
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return data;
    };

    const signOut = async () => {
        try {
            queryClient.clear();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            useAuthStore.getState().setSession(null);
        } catch (error) {
            throw error;
        }
    };

    return {
        session,
        user,
        isLoading,
        isAuthenticated: !!session,
        signInWithGoogle,
        signInWithEmail,
        signOut,
    };
}
