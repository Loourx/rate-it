import { supabase } from '../supabase';
import { useAuthStore } from '../stores/authStore';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

export function useAuth() {
    const { session, user, isLoading } = useAuthStore();

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = makeRedirectUri({
                path: '/auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false, // We want the browser to handle the redirect
                },
            });

            if (error) throw error;

            // Note: actual session handling happens in _layout.tsx via onAuthStateChange
            return data;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return {
        session,
        user,
        isLoading,
        isAuthenticated: !!session,
        signInWithGoogle,
        signOut,
    };
}
