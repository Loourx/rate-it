import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ContentType, ContentStatus, AllContent } from '@/lib/types/content';
import { useContentDetails } from '@/lib/hooks/useContentDetails';
import { useCreateRating, useExistingRating } from '@/lib/hooks/useCreateRating';
import { useExistingContentStatus, useUpsertContentStatus } from '@/lib/hooks/useContentStatus';

interface UseRatingFormProps {
    contentType: ContentType;
    contentId: string;
}

export function useRatingForm({ contentType, contentId }: UseRatingFormProps) {
    const router = useRouter();

    const { data: item, isLoading: loadingContent, isError, refetch } = useContentDetails(contentType, contentId);
    const { data: existing, isLoading: loadingExisting } = useExistingRating(contentType, contentId);
    const { data: existingStatus, isLoading: loadingStatus } = useExistingContentStatus(contentType, contentId);
    const createRating = useCreateRating();
    const upsertStatus = useUpsertContentStatus();

    const [score, setScore] = useState(5.0);
    const [review, setReview] = useState('');
    const [hasSpoiler, setHasSpoiler] = useState(false);
    const [status, setStatus] = useState<ContentStatus | null>(null);
    const [prefilled, setPrefilled] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (prefilled) return;
        if (loadingExisting || loadingStatus) return;
        if (existing) {
            setScore(existing.score);
            setReview(existing.review_text ?? '');
            setHasSpoiler(existing.has_spoiler ?? false);
        }
        if (existingStatus) {
            setStatus(existingStatus.status as ContentStatus);
        }
        if (!loadingExisting && !loadingStatus) setPrefilled(true);
    }, [existing, existingStatus, loadingExisting, loadingStatus, prefilled]);

    const handleSave = useCallback(async () => {
        if (!item) return;
        try {
            await createRating.mutateAsync({
                contentType,
                contentId,
                contentTitle: item.title,
                contentImageUrl: item.imageUrl,
                score,
                reviewText: review.trim() || null,
                hasSpoiler,
            });
            if (status) {
                await upsertStatus.mutateAsync({
                    contentType,
                    contentId,
                    contentTitle: item.title,
                    contentImageUrl: item.imageUrl,
                    status,
                });
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setToastVisible(true);
            setTimeout(() => router.back(), 1200);
        } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, [item, score, review, hasSpoiler, status, contentType, contentId]);

    const isLoading = loadingContent || loadingExisting || loadingStatus;
    const isSaving = createRating.isPending || upsertStatus.isPending;
    const isEditing = !!existing;

    return {
        content: item as AllContent | undefined,
        formData: {
            score,
            review,
            hasSpoiler,
            status,
        },
        state: {
            isLoading,
            isError,
            isSaving,
            isEditing,
            toastVisible,
        },
        actions: {
            setScore,
            setReview,
            setHasSpoiler,
            setStatus,
            setToastVisible,
            handleSave,
            refetch,
        },
    };
}
