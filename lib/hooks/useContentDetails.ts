import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getSeriesDetails } from '../api/tmdb';
import { getBookDetails } from '../api/googleBooks';
import { getGameDetails } from '../api/rawg';
import { getMusicDetails } from '../api/itunes';
/* MVP_DISABLED: import { getPodcastDetails } from '../api/podcasts'; */
import { supabase } from '../supabase';
import { ContentType, Movie, Series, Book, Game, Music /* MVP_DISABLED: , Podcast, Anything */ } from '../types/content';

import { UseQueryResult } from '@tanstack/react-query';

export function useContentDetails(type: ContentType, id: string, isAlbum?: boolean): UseQueryResult<any> {
    return useQuery({
        queryKey: ['content', type, id, isAlbum],
        staleTime: 10 * 60 * 1000, // 10 min
        gcTime: 20 * 60 * 1000, // 20 min
        queryFn: async () => {
            if (type === 'movie') {
                return getMovieDetails(id);
            } else if (type === 'series') {
                return getSeriesDetails(id);
            } else if (type === 'book') {
                return getBookDetails(id);
            } else if (type === 'game') {
                return getGameDetails(id);
            } else if (type === 'music') {
                return getMusicDetails(id, isAlbum ?? true);
            }
            /* MVP_DISABLED: podcast + anything branches
            } else if (type === 'podcast') {
                return getPodcastDetails(id);
            } else if (type === 'anything') {
                const { data, error } = await supabase
                    .from('anything_items')
                    .select('*, profiles!created_by(username)')
                    .eq('id', id)
                    .single();

                if (error) throw new Error(error.message);
                if (!data) throw new Error('Item not found');

                const profile = data.profiles as { username: string } | null;

                return {
                    id: data.id,
                    type: 'anything',
                    title: data.title,
                    imageUrl: data.image_url ?? null,
                    createdBy: data.created_by,
                    creatorUsername: profile?.username ?? undefined,
                    description: data.description || undefined,
                    categoryTag: data.category_tag || undefined,
                } as Anything;
            }
            */
            throw new Error(`Content type ${type} is not supported by the current APIs`);
        },
        enabled: !!id && (type === 'movie' || type === 'series' || type === 'book' || type === 'game' || type === 'music' /* MVP_DISABLED: || type === 'podcast' || type === 'anything' */),
    });
}
