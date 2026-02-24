import { useQuery } from '@tanstack/react-query';
import { getAlbumTracks } from '@/lib/api/itunes';

/**
 * Fetches the tracklist for an album from iTunes.
 * Only enabled when a valid collectionId is provided.
 */
export function useAlbumTracks(collectionId: string | undefined) {
    return useQuery({
        queryKey: ['album-tracks', collectionId],
        queryFn: () => getAlbumTracks(collectionId!),
        enabled: !!collectionId,
        staleTime: 1000 * 60 * 60, // 1 hour — tracklists don't change
    });
}
