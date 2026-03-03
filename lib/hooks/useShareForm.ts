import { useState, useEffect, useMemo } from 'react';
import {
    ContentType,
    AllContent,
    AlbumTrack,
    Movie,
    Series,
    Game,
} from '@/lib/types/content';
import { TrackRatingEntry, EpisodeRatingEntry } from '@/lib/types/database';
import { useContentDetails } from '@/lib/hooks/useContentDetails';
import { useExistingRating } from '@/lib/hooks/useCreateRating';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAlbumTracks } from '@/lib/hooks/useAlbumTracks';
import type { ShareableRatingCardProps } from '@/components/sharing';

// ── Helpers (pure functions, no hooks) ──────────────────────

const FALLBACK_STREAMING = [
    'Netflix', 'Prime Video', 'Disney+', 'Max', 'Apple TV+',
    'Movistar+', 'Filmin', 'SkyShowtime', 'Otra',
] as const;

function getAvailablePlatforms(
    contentType: ContentType,
    content: AllContent | undefined,
): string[] {
    if (contentType === 'movie' || contentType === 'series') {
        const providers = (content as Movie | Series | undefined)?.streamingProviders;
        const names = providers?.map(p => p.providerName) ?? [];
        return names.length > 0 ? names : [...FALLBACK_STREAMING];
    }
    if (contentType === 'game') {
        return (content as Game | undefined)?.platforms ?? [];
    }
    return [];
}

function getPrimaryGenre(content: AllContent | undefined): string | null {
    if (!content) return null;
    switch (content.type) {
        case 'movie':
        case 'series':
        case 'game':
            return content.genres?.[0] ?? null;
        case 'book':
            return content.categories?.[0] ?? null;
        case 'music':
            return content.genre ?? null;
        default:
            return null;
    }
}

function parseJsonEntries<T>(raw: unknown): T[] | null {
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw) as T[]; } catch { return null; }
    }
    return Array.isArray(raw) ? (raw as T[]) : null;
}

function computeAverage(entries: { score: number }[] | null): number | null {
    if (!entries || entries.length === 0) return null;
    const rated = entries.filter(e => e.score > 0);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, e) => acc + e.score, 0);
    return Math.round((sum / rated.length) * 10) / 10;
}

function getContentYear(content: AllContent | undefined): string | null {
    if (!content) return null;
    if ('year' in content && content.year) return String(content.year);
    return null;
}

function getContentDirector(content: AllContent | undefined): string | null {
    if (!content) return null;
    if (content.type === 'movie') return content.director ?? null;
    if (content.type === 'series') return content.creator ?? null;
    return null;
}

// ── Types ───────────────────────────────────────────────────

interface UseShareFormProps {
    contentType: ContentType;
    contentId: string;
    fromRating?: boolean;
}

interface ShareFormState {
    headline: string;
    selectedPlatform: string | null;
    favoriteTrack: string | null;
    bookFormat: 'paper' | 'digital' | 'audiobook' | null;
}

type CardVariant = 'complete' | 'no-headline' | 'minimal';

// ── Hook ────────────────────────────────────────────────────

export function useShareForm({ contentType, contentId }: UseShareFormProps) {
    // ── Data fetching ────────────────────────────────────────
    const { data: content, isLoading: loadingContent, isError } =
        useContentDetails(contentType, contentId);
    const { data: existingRating, isLoading: loadingRating } =
        useExistingRating(contentType, contentId);
    const { data: profile } = useProfile();
    const { data: albumTracks } = useAlbumTracks(
        contentType === 'music' ? contentId : undefined,
    );

    // ── Editable state ───────────────────────────────────────
    const [headline, setHeadline] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [favoriteTrack, setFavoriteTrack] = useState<string | null>(null);
    const [bookFormat, setBookFormat] = useState<'paper' | 'digital' | 'audiobook' | null>(null);
    const [prefilled, setPrefilled] = useState(false);

    // ── Prefill from existing rating ─────────────────────────
    useEffect(() => {
        if (prefilled || loadingRating) return;
        if (!existingRating) {
            setPrefilled(true);
            return;
        }
        setHeadline(existingRating.headline ?? '');
        setSelectedPlatform(existingRating.share_platform ?? null);
        setFavoriteTrack(existingRating.favorite_track ?? null);
        setBookFormat(existingRating.book_format ?? null);
        setPrefilled(true);
    }, [existingRating, loadingRating, prefilled]);

    // ── Derived: available options ───────────────────────────
    const availablePlatforms = useMemo(
        () => getAvailablePlatforms(contentType, content as AllContent | undefined),
        [contentType, content],
    );

    const availableTracks: AlbumTrack[] = useMemo(
        () => (contentType === 'music' ? albumTracks ?? [] : []),
        [contentType, albumTracks],
    );

    // ── Derived: card variant ────────────────────────────────
    const cardVariant: CardVariant = useMemo(() => {
        if (!existingRating) return 'minimal';
        return headline.trim() !== '' ? 'complete' : 'no-headline';
    }, [existingRating, headline]);

    // ── Derived: card props ──────────────────────────────────
    const cardProps: ShareableRatingCardProps = useMemo(() => {
        const trackEntries = parseJsonEntries<TrackRatingEntry>(
            existingRating?.track_ratings,
        );
        const episodeEntries = parseJsonEntries<EpisodeRatingEntry>(
            existingRating?.episode_ratings,
        );
        const typedContent = content as AllContent | undefined;

        return {
            contentType: contentType as ShareableRatingCardProps['contentType'],
            title: typedContent?.title ?? '',
            posterUrl: typedContent?.imageUrl ?? null,
            username: profile?.username ?? 'usuario',
            score: existingRating?.score ?? 0,
            reviewText: existingRating?.review_text ?? null,
            headline: headline.trim() || null,
            year: getContentYear(typedContent),
            director: getContentDirector(typedContent),
            trackAverage: computeAverage(trackEntries),
            episodeAverage: computeAverage(episodeEntries),
        };
    }, [contentType, content, existingRating, profile, headline]);

    // ── Form state (read-only snapshot) ──────────────────────
    const formState: ShareFormState = useMemo(
        () => ({ headline, selectedPlatform, favoriteTrack, bookFormat }),
        [headline, selectedPlatform, favoriteTrack, bookFormat],
    );

    // ── Public API ───────────────────────────────────────────
    const isLoading = loadingContent || loadingRating;

    return {
        // Data
        content: content as AllContent | undefined,
        existingRating: existingRating ?? undefined,
        username: profile?.username ?? '',
        isLoading,
        isError,

        // Editable form
        formState,

        // Options per type
        availablePlatforms,
        availableTracks,

        // Computed preview props
        cardProps,
        cardVariant,

        // Actions
        actions: {
            setHeadline,
            setSelectedPlatform,
            setFavoriteTrack,
            setBookFormat,
        },
    };
}
