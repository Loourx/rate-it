import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { MOCK_SESSION, MOCK_USER } from '../dev/mockUser';

// ⚠️ DEV ONLY — Bypass auth for Expo Go testing
const isBypassEnabled = process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

interface AuthState {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: isBypassEnabled ? MOCK_SESSION : null,
    user: isBypassEnabled ? MOCK_USER : null,
    isLoading: isBypassEnabled ? false : true, // Start with loading false if bypass is active
    setSession: (session) => set({ session, user: session?.user ?? null }),
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
}));
