import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getSeriesDetails } from '../api/tmdb';
import { getBookDetails } from '../api/googleBooks';
import { getGameDetails } from '../api/rawg';
import { getMusicDetails } from '../api/itunes';
import { getPodcastDetails } from '../api/podcasts';
import { supabase } from '../supabase';
import { ContentType, Movie, Series, Book, Game, Music, Podcast, Anything } from '../types/content';

export function useContentDetails(type: ContentType, id: string, isAlbum?: boolean) {
    return useQuery({
        queryKey: ['content', type, id, isAlbum],
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
            } else if (type === 'podcast') {
                return getPodcastDetails(id);
            } else if (type === 'anything') {
                const { data, error } = await supabase
                    .from('anything_items')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw new Error(error.message);
                if (!data) throw new Error('Item not found');

                return {
                    id: data.id,
                    type: 'anything',
                    title: data.title,
                    imageUrl: null, // TODO: Add image support
                    createdBy: data.createdBy,
                    description: data.description || undefined,
                    categoryTag: data.categoryTag || undefined,
                } as Anything;
            }
            throw new Error(`Content type ${type} is not supported by the current APIs`);
        },
        enabled: !!id && (type === 'movie' || type === 'series' || type === 'book' || type === 'game' || type === 'music' || type === 'podcast' || type === 'anything'),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}
