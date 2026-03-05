import { useQuery } from '@tanstack/react-query';
import { getAlbumTracks } from '@/lib/api/itunes';

import { UseQueryResult } from '@tanstack/react-query';

/**
 * Fetches the tracklist for an album from iTunes.
 * Only enabled when a valid collectionId is provided.
 */
export function useAlbumTracks(collectionId: string | undefined): UseQueryResult<any> {
    return useQuery({
        queryKey: ['album-tracks', collectionId],
        queryFn: () => getAlbumTracks(collectionId!),
        enabled: !!collectionId,
        staleTime: 1000 * 60 * 60, // 1 hour — tracklists don't change
        gcTime: 2 * 60 * 60 * 1000, // 2 hours
    });
}
