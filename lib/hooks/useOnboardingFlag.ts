import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'has_completed_onboarding';

/**
 * Reads/writes the one-shot `has_completed_onboarding` flag from SecureStore.
 *
 * - `isLoaded`: true once SecureStore has responded (safe to use in routing guards).
 * - `hasCompleted`: true if the user has already seen onboarding.
 * - `markCompleted`: persists the flag; idempotent.
 */
export function useOnboardingFlag() {
    const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
    const markedRef = useRef(false);

    useEffect(() => {
        SecureStore.getItemAsync(ONBOARDING_KEY)
            .then((val) => setHasCompleted(val === 'true'))
            .catch(() => setHasCompleted(true)); // on read error → skip onboarding
    }, []);

    const markCompleted = () => {
        if (markedRef.current) return;
        markedRef.current = true;
        setHasCompleted(true);
        SecureStore.setItemAsync(ONBOARDING_KEY, 'true').catch(() => {/* ignore */});
    };

    return {
        isLoaded: hasCompleted !== null,
        hasCompleted: hasCompleted === true,
        markCompleted,
    };
}
