import { useState, useCallback, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ContentType, ContentStatus, AllContent, AlbumTrack, Music } from '@/lib/types/content';
import { TrackRatingEntry } from '@/lib/types/database';
import { useContentDetails } from '@/lib/hooks/useContentDetails';
import { useCreateRating, useExistingRating } from '@/lib/hooks/useCreateRating';
import { useExistingContentStatus, useUpsertContentStatus } from '@/lib/hooks/useContentStatus';
import { RATING } from '@/lib/utils/constants';

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

    const [score, setScore] = useState<number>(RATING.DEFAULT);
    const [review, setReview] = useState('');
    const [privateNote, setPrivateNote] = useState('');
    const [hasSpoiler, setHasSpoiler] = useState(false);
    const [status, setStatus] = useState<ContentStatus | null>(null);
    const [prefilled, setPrefilled] = useState(false);
    const [trackRatings, setTrackRatings] = useState<TrackRatingEntry[]>([]);
    const [showTrackRatings, setShowTrackRatings] = useState(false);
    const [toastConfig, setToastConfig] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        visible: false,
        message: '',
        type: 'success',
    });

    useEffect(() => {
        if (prefilled) return;
        if (loadingExisting || loadingStatus) return;
        if (existing) {
            setScore(existing.score);
            setReview(existing.review_text ?? '');
            setPrivateNote(existing.private_note ?? '');
            setHasSpoiler(existing.has_spoiler ?? false);
            if (existing.track_ratings) {
                try {
                    const parsed: TrackRatingEntry[] = typeof existing.track_ratings === 'string'
                        ? JSON.parse(existing.track_ratings)
                        : existing.track_ratings;
                    setTrackRatings(parsed);
                    if (parsed.some(tr => tr.score > 0)) {
                        setShowTrackRatings(true);
                    }
                } catch {
                    // track_ratings corrupto, ignorar
                }
            }
        }
        if (existingStatus) {
            setStatus(existingStatus.status as ContentStatus);
        }
        if (!loadingExisting && !loadingStatus) setPrefilled(true);
    }, [existing, existingStatus, loadingExisting, loadingStatus, prefilled]);

    const setTrackScore = useCallback((trackId: string, score: number) => {
        setTrackRatings(prev =>
            prev.map(tr => tr.trackId === trackId ? { ...tr, score } : tr)
        );
    }, []);

    const initializeTrackRatings = useCallback((tracks: AlbumTrack[]) => {
        setTrackRatings(prev => {
            if (prev.length > 0) return prev;
            return tracks.map(t => ({
                trackId: t.trackId,
                trackName: t.trackName,
                trackNumber: t.trackNumber,
                score: 0,
            }));
        });
    }, []);

    const trackAverage = useMemo(() => {
        const rated = trackRatings.filter(tr => tr.score > 0);
        if (rated.length === 0) return null;
        const sum = rated.reduce((acc, tr) => acc + tr.score, 0);
        return Math.round((sum / rated.length) * 10) / 10;
    }, [trackRatings]);

    const isAlbumContent = contentType === 'music' && (item as Music)?.isAlbum === true;

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
                privateNote: privateNote.trim() || null,
                hasSpoiler,
                contentSubtype: isAlbumContent ? 'album'
                    : (contentType === 'music' ? 'track' : null),
                trackRatings: isAlbumContent && trackRatings.some(tr => tr.score > 0)
                    ? trackRatings.filter(tr => tr.score > 0)
                    : null,
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
            setToastConfig({
                visible: true,
                message: 'Valoración guardada ✓',
                type: 'success',
            });
            setTimeout(() => router.back(), 1200);
        } catch (error) {
            console.error('[Rate-it] Error saving rating:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setToastConfig({
                visible: true,
                message: 'No se pudo guardar la valoración. Inténtalo de nuevo.',
                type: 'error',
            });
        }
    }, [item, score, review, privateNote, hasSpoiler, status, contentType, contentId, isAlbumContent, trackRatings]);

    const isLoading = loadingContent || loadingExisting || loadingStatus;
    const isSaving = createRating.isPending || upsertStatus.isPending;
    const isEditing = !!existing;

    return {
        content: item as AllContent | undefined,
        formData: {
            score,
            review,
            privateNote,
            hasSpoiler,
            status,
            trackRatings,
            showTrackRatings,
            trackAverage,
        },
        state: {
            isLoading,
            isError,
            isSaving,
            isEditing,
            toastConfig,
            isAlbumContent,
        },
        actions: {
            setScore,
            setReview,
            setPrivateNote,
            setHasSpoiler,
            setStatus,
            setToastConfig,
            handleSave,
            refetch,
            setTrackScore,
            setShowTrackRatings,
            initializeTrackRatings,
        },
    };
}
