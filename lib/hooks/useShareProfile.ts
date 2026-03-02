import { useState, useRef } from 'react';
import { View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface UseShareProfileReturn {
    shareProfile: () => Promise<void>;
    isCapturing: boolean;
    profileCardRef: React.RefObject<ViewShot>;
    toastVisible: boolean;
    toastMessage: string;
    toastType: 'success' | 'error' | 'info';
    dismissToast: () => void;
}

export function useShareProfile(): UseShareProfileReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

    const profileCardRef = useRef<ViewShot>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const dismissToast = () => setToastVisible(false);

    const shareProfile = async (): Promise<void> => {
        if (!profileCardRef.current) {
            showToast('No se pudo capturar el perfil. Inténtalo de nuevo.');
            return;
        }

        setIsCapturing(true);

        try {
            const available = await Sharing.isAvailableAsync();
            if (!available) {
                showToast('Compartir no está disponible en este dispositivo.');
                return;
            }

            const uri = await captureRef(profileCardRef, {
                format: 'png',
                quality: 1.0,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Mi perfil en Rate-it',
            });
        } catch {
            showToast('Error al compartir el perfil. Inténtalo de nuevo.');
        } finally {
            setIsCapturing(false);
        }
    };

    return {
        shareProfile,
        isCapturing,
        profileCardRef,
        toastVisible,
        toastMessage,
        toastType,
        dismissToast,
    };
}
