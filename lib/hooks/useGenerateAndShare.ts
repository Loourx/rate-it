import { useState } from 'react';
import { Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useUpdateRatingMeta } from '@/lib/hooks/useUpdateRatingMeta';
import type { ContentType } from '@/lib/types/content';

interface ShareFormState {
    headline: string;
    selectedPlatform: string | null;
    favoriteTrack: string | null;
    bookFormat: 'paper' | 'digital' | 'audiobook' | null;
}

export interface UseGenerateAndShareProps {
    contentType: ContentType;
    contentId: string;
    existingRatingId: string | null;
    formState: ShareFormState;
    fromRating?: boolean;
    /* MVP_FEED_DISABLED */
    // format: 'stories' | 'feed';
    /* /MVP_FEED_DISABLED */
    shareRef: React.RefObject<View | null>;
}

export interface UseGenerateAndShareReturn {
    shareRef: React.RefObject<View | null>;
    handleGenerate: () => Promise<void>;
    isGenerating: boolean;
    errorMessage: string | null;
}

export function useGenerateAndShare({
    contentType,
    contentId,
    existingRatingId,
    formState,
    fromRating = false,
    /* MVP_FEED_DISABLED */
    // format,
    /* /MVP_FEED_DISABLED */
    shareRef,
}: UseGenerateAndShareProps): UseGenerateAndShareReturn {
    const router = useRouter();
    const updateRatingMeta = useUpdateRatingMeta();

    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGenerate = async (): Promise<void> => {
        /* WEB_DISABLED — react-native-view-shot and expo-sharing are native-only */
        if (Platform.OS === 'web') {
            console.warn('[Rate.] Share not available on web.');
            return;
        }

        if (isGenerating) return;
        if (!shareRef.current) {
            setErrorMessage('No se pudo capturar la tarjeta. Inténtalo de nuevo.');
            return;
        }

        setIsGenerating(true);
        setErrorMessage(null);

        try {
            // 1. Persist share meta if there is an existing rating and any new field
            const hasNewFields =
                formState.headline !== '' ||
                formState.selectedPlatform !== null ||
                formState.favoriteTrack !== null ||
                formState.bookFormat !== null;

            if (existingRatingId !== null && hasNewFields) {
                await updateRatingMeta.mutateAsync({
                    ratingId: existingRatingId,
                    contentType,
                    contentId,
                    headline: formState.headline.trim() || null,
                    sharePlatform: formState.selectedPlatform,
                    favoriteTrack: formState.favoriteTrack,
                    bookFormat: formState.bookFormat,
                });
            }

            // 2. Capture off-screen view as PNG
            const uri = await captureRef(shareRef, {
                format: 'png',
                quality: 1.0,
                result: 'tmpfile',
            });

            // 3. Open native share sheet
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Compartir con Rate.',
            });

            // 4. Navigate after share/cancel
            if (fromRating) {
                router.replace(`/content/${contentType}/${contentId}`);
            } else {
                router.back();
            }
        } catch {
            setErrorMessage('Error al generar la imagen. Inténtalo de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    return { shareRef, handleGenerate, isGenerating, errorMessage };
}
