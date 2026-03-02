import { useState, useRef } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import type { ShareableRatingCardProps } from '@/components/sharing';

export interface UseShareRatingParams {
    cardProps: Omit<ShareableRatingCardProps, 'format'>;
}

export interface UseShareRatingReturn {
    shareAsStory: () => Promise<void>;
    shareAsFeed: () => Promise<void>;
    isCapturing: boolean;
    storiesRef: React.RefObject<View>;
    feedRef: React.RefObject<View>;
    toastVisible: boolean;
    toastMessage: string;
    toastType: 'success' | 'error' | 'info';
    dismissToast: () => void;
}

export function useShareRating({ cardProps }: UseShareRatingParams): UseShareRatingReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('error');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storiesRef = useRef<View>(null as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feedRef = useRef<View>(null as any);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const dismissToast = () => setToastVisible(false);

    const captureAndShare = async (
        ref: React.RefObject<View>,
        _format: 'stories' | 'feed',
    ): Promise<void> => {
        if (!ref.current) {
            showToast('No se pudo capturar la tarjeta. Inténtalo de nuevo.');
            return;
        }

        setIsCapturing(true);

        try {
            // 1. Check sharing availability before capture
            const available = await Sharing.isAvailableAsync();
            if (!available) {
                showToast('Compartir no está disponible en este dispositivo.');
                return;
            }

            // 2. Capture the off-screen view as PNG
            const uri = await captureRef(ref, {
                format: 'png',
                quality: 1.0,
            });

            // 3. Open native share sheet
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: `Mi valoración de ${cardProps.contentTitle} en Rate-it`,
            });
        } catch {
            showToast('Error al compartir la valoración. Inténtalo de nuevo.');
        } finally {
            setIsCapturing(false);
        }
    };

    return {
        shareAsStory: () => captureAndShare(storiesRef, 'stories'),
        shareAsFeed: () => captureAndShare(feedRef, 'feed'),
        isCapturing,
        storiesRef,
        feedRef,
        toastVisible,
        toastMessage,
        toastType,
        dismissToast,
    };
}
