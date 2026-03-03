import { useQuery } from '@tanstack/react-query';
import { getSeriesSeasonEpisodes } from '@/lib/api/tmdb';
import { SeriesEpisode } from '@/lib/types/content';

export function useSeriesEpisodes(
  seriesId: string,
  seasonNumber: number
): {
  data: SeriesEpisode[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const {
    data,
    isLoading,
    error,
  } = useQuery<SeriesEpisode[], Error>({
    queryKey: ['seriesEpisodes', seriesId, seasonNumber],
    queryFn: () => getSeriesSeasonEpisodes(seriesId, seasonNumber),
    enabled: Boolean(seriesId) && seasonNumber > 0,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24h en caché
  });

  return {
    data,
    isLoading,
    error: error ?? null,
  };
}
