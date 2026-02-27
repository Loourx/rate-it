import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const storeKey = (id: string) => `challenge_celebrated_${id}`;

/**
 * Tracks whether a completed challenge has been celebrated already.
 *
 * - `shouldCelebrate`: true only once — when isCompleted first becomes true
 *   and SecureStore hasn't recorded a prior celebration for this challengeId.
 * - `markCelebrated`: persists the flag so the confetti won't replay on re-open.
 */
export function useCelebration(challengeId: string, isCompleted: boolean) {
    // null = still reading from SecureStore
    const [hasCelebrated, setHasCelebrated] = useState<boolean | null>(null);
    const markedRef = useRef(false);

    useEffect(() => {
        if (!isCompleted) {
            setHasCelebrated(false);
            return;
        }
        SecureStore.getItemAsync(storeKey(challengeId))
            .then((val) => setHasCelebrated(val === 'true'))
            .catch(() => setHasCelebrated(true)); // on read error → don't celebrate
    }, [challengeId, isCompleted]);

    const markCelebrated = () => {
        if (markedRef.current) return;
        markedRef.current = true;
        setHasCelebrated(true);
        SecureStore.setItemAsync(storeKey(challengeId), 'true').catch(() => {/* ignore */});
    };

    // Only true when: challenge is done AND SecureStore resolved AND hasn't been celebrated yet
    const shouldCelebrate = isCompleted && hasCelebrated === false;

    return { shouldCelebrate, markCelebrated };
}
