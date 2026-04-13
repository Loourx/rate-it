import { useState, useRef } from 'react';
import { Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface UseShareChallengeReturn {
    shareChallenge: () => Promise<void>;
    isCapturingChallenge: boolean;
    challengeCardRef: React.RefObject<View | null>;
    toastVisible: boolean;
    toastMessage: string;
    toastType: 'success' | 'error' | 'info';
    dismissToast: () => void;
}

export function useShareChallenge(): UseShareChallengeReturn {
    const [isCapturingChallenge, setIsCapturingChallenge] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

    const challengeCardRef = useRef<View | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const dismissToast = () => setToastVisible(false);

    const shareChallenge = async (): Promise<void> => {
        /* WEB_DISABLED — react-native-view-shot and expo-sharing are native-only */
        if (Platform.OS === 'web') {
            console.warn('[Rate.] Share not available on web.');
            return;
        }

        if (!challengeCardRef.current) {
            showToast('No se pudo capturar el reto. Inténtalo de nuevo.');
            return;
        }

        setIsCapturingChallenge(true);

        try {
            const available = await Sharing.isAvailableAsync();
            if (!available) {
                showToast('Compartir no está disponible en este dispositivo.');
                return;
            }

            const uri = await captureRef(challengeCardRef, {
                format: 'png',
                quality: 1.0,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Mi reto en Rate-it',
            });
        } catch {
            showToast('Error al compartir el reto. Inténtalo de nuevo.');
        } finally {
            setIsCapturingChallenge(false);
        }
    };

    return {
        shareChallenge,
        isCapturingChallenge,
        challengeCardRef,
        toastVisible,
        toastMessage,
        toastType,
        dismissToast,
    };
}
