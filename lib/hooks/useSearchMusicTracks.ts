import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { searchMusicTracks } from '../api/itunes';

export function useSearchMusicTracks(query: string): UseQueryResult<any> {
    return useQuery({
        queryKey: ['search', 'musicTracks', query],
        queryFn: () => searchMusicTracks(query),
        enabled: query.length >= 3,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 min
    });
}
