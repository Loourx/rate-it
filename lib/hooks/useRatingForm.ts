import { useState, useCallback, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ContentType, ContentStatus, AllContent, AlbumTrack, Music, SeriesEpisode, Series } from '@/lib/types/content';
import { TrackRatingEntry, EpisodeRatingEntry } from '@/lib/types/database';
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
    const [episodeRatings, setEpisodeRatings] = useState<EpisodeRatingEntry[]>([]);
    const [showEpisodeRatings, setShowEpisodeRatings] = useState(false);
    const [toastConfig, setToastConfig] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        visible: false,
        message: '',
        type: 'success',
    });
    const [showCelebration, setShowCelebration] = useState(false);
    const [savedContent, setSavedContent] = useState<{
        score: number;
        reviewText: string | null;
        trackAverage: number | null;
        episodeAverage: number | null;
    } | null>(null);

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
            if (existing.episode_ratings) {
                try {
                    const parsed: EpisodeRatingEntry[] = typeof existing.episode_ratings === 'string'
                        ? JSON.parse(existing.episode_ratings)
                        : existing.episode_ratings;
                    setEpisodeRatings(parsed);
                    if (parsed.some(er => er.score > 0)) setShowEpisodeRatings(true);
                } catch {
                    // episode_ratings corrupto, ignorar
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

    const setEpisodeScore = useCallback((episodeId: string, score: number) => {
        setEpisodeRatings(prev =>
            prev.map(er => er.episodeId === episodeId ? { ...er, score } : er)
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

    const initializeEpisodeRatings = useCallback((episodes: SeriesEpisode[]) => {
        setEpisodeRatings(prev => {
            // Solo añadir episodios nuevos, preservar scores existentes
            const existingIds = new Set(prev.map(er => er.episodeId));
            const newEntries = episodes
                .filter(ep => !existingIds.has(ep.episodeId))
                .map(ep => ({
                    episodeId: ep.episodeId,
                    episodeName: ep.episodeName,
                    seasonNumber: ep.seasonNumber,
                    episodeNumber: ep.episodeNumber,
                    score: 0,
                }));
            return [...prev, ...newEntries];
        });
    }, []);

    const trackAverage = useMemo(() => {
        const rated = trackRatings.filter(tr => tr.score > 0);
        if (rated.length === 0) return null;
        const sum = rated.reduce((acc, tr) => acc + tr.score, 0);
        return Math.round((sum / rated.length) * 10) / 10;
    }, [trackRatings]);

    const episodeAverage = useMemo(() => {
        const rated = episodeRatings.filter(er => er.score > 0);
        if (rated.length === 0) return null;
        const sum = rated.reduce((acc, er) => acc + er.score, 0);
        return Math.round((sum / rated.length) * 10) / 10;
    }, [episodeRatings]);

    const isAlbumContent = contentType === 'music' && (item as Music)?.isAlbum === true;
    const isSeriesContent = contentType === 'series';

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
                episodeRatings: isSeriesContent && episodeRatings.some(er => er.score > 0)
                    ? episodeRatings.filter(er => er.score > 0)
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
            setSavedContent({
                score,
                reviewText: review.trim() || null,
                trackAverage,
                episodeAverage,
            });
            setShowCelebration(true);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setToastConfig({
                visible: true,
                message: 'No se pudo guardar la valoración. Inténtalo de nuevo.',
                type: 'error',
            });
        }
    }, [item, score, review, privateNote, hasSpoiler, status, contentType, contentId, isAlbumContent, trackRatings, isSeriesContent, episodeRatings, trackAverage, episodeAverage]);

    const dismissCelebration = useCallback(() => {
        setShowCelebration(false);
    }, []);

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
            episodeRatings,
            showEpisodeRatings,
            episodeAverage,
        },
        state: {
            isLoading,
            isError,
            isSaving,
            isEditing,
            toastConfig,
            isAlbumContent,
            isSeriesContent,
            showCelebration,
            savedContent,
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
            setEpisodeScore,
            setShowEpisodeRatings,
            initializeEpisodeRatings,
            dismissCelebration,
        },
    };
}
