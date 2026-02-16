import { Profile } from '../types';
import { User, Session } from '@supabase/supabase-js';

/**
 * ⚠️ DEV ONLY — Mock profile data for testing the UI
 */
export const MOCK_PROFILE: Profile = {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    username: 'dev_tester',
    displayName: 'Dev Tester',
    avatarUrl: 'https://i.pravatar.cc/150?u=dev_tester',
    bio: 'I am a mock user for development testing.',
    isPrivate: false,
    createdAt: '2026-02-16T12:00:00Z',
    updatedAt: '2026-02-16T12:00:00Z',
};

/**
 * ⚠️ DEV ONLY — Mock user data compatible with Supabase Auth
 */
export const MOCK_USER: User = {
    id: MOCK_PROFILE.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@rateit.com',
    email_confirmed_at: '2026-02-16T12:00:00Z',
    last_sign_in_at: '2026-02-16T12:00:00Z',
    app_metadata: { provider: 'google' },
    user_metadata: {
        full_name: MOCK_PROFILE.displayName,
        avatar_url: MOCK_PROFILE.avatarUrl,
        username: MOCK_PROFILE.username,
    },
    identities: [],
    created_at: '2026-02-16T12:00:00Z',
    updated_at: '2026-02-16T12:00:00Z',
    factors: [],
};

/**
 * ⚠️ DEV ONLY — Mock session data compatible with Supabase Auth
 */
export const MOCK_SESSION: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: MOCK_USER,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
};
