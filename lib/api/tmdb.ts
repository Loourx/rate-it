import { Movie, Series, SeriesEpisode, StreamingProvider } from '../types/content';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;



// Internal interfaces for TMDB responses
interface TmdbMovieResult {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    popularity?: number;
}

interface TmdbSeriesResult {
    id: number;
    name: string;
    poster_path: string | null;
    first_air_date: string;
    overview: string;
    popularity?: number;
}

interface TmdbSearchResponse<T> {
    results: T[];
}

interface TmdbMovieDetails extends TmdbMovieResult {
    credits?: {
        crew: Array<{ job: string; name: string }>;
    };
    genres?: Array<{ id: number; name: string }>;
    runtime?: number | null;
}

interface TmdbSeriesDetails extends TmdbSeriesResult {
    created_by: Array<{ name: string }>;
    genres?: Array<{ id: number; name: string }>;
    number_of_seasons?: number;
    number_of_episodes?: number;
}

interface TmdbWatchProviders {
    results: {
        ES?: TmdbProviderRegion;
        US?: TmdbProviderRegion;
    };
}

interface TmdbProviderRegion {
    flatrate?: Array<{
        provider_id: number;
        provider_name: string;
        logo_path: string;
    }>;
}

interface TmdbSeasonDetails {
    episodes: Array<{
        id: number;
        name: string;
        season_number: number;
        episode_number: number;
        overview?: string;
        runtime?: number | null;
        still_path?: string | null;
    }>;
}

// Helper for image URL
export const getImageUrl = (path: string | null): string | null => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

// Helper for year extraction
const getYear = (date: string): string | undefined => {
    return date ? date.split('-')[0] : undefined;
};

// Helper to extract streaming providers from TMDB watch/providers response
function extractProviders(
    watchData: TmdbWatchProviders | undefined
): StreamingProvider[] {
    if (!watchData) return [];
    // Prefer ES, fallback to US
    const region = watchData.results?.ES ?? watchData.results?.US;
    const flatrate = region?.flatrate ?? [];
    return flatrate.map(p => ({
        providerId: p.provider_id,
        providerName: p.provider_name,
        logoPath: p.logo_path,
    }));
}

// Helper for fetch
export async function fetchTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!API_KEY) throw new Error('TMDB API Key is missing');

    const searchParams = new URLSearchParams({
        api_key: API_KEY, // TMDB allows api_key query param for some auth, using Bearer too if needed but simple api_key works for v3
        language: 'es-ES',
        ...params
    });

    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// -- Public Functions --

export async function searchMovies(query: string): Promise<Movie[]> {
    if (!query) return [];

    const data = await fetchTmdb<TmdbSearchResponse<TmdbMovieResult>>('/search/movie', { query });

    const results = data.results.map(item => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: getImageUrl(item.poster_path),
        type: 'movie' as const,
        year: getYear(item.release_date),
        overview: item.overview,
        popularity: item.popularity,
        // Director not available in simple search
    }));

    // Sort by TMDB popularity (higher = more popular)
    results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    // Optionally filter by minimum popularity threshold to exclude low-quality results
    const filtered = results.filter(r => (r.popularity ?? 0) >= 1.0);
    return filtered.length > 0 ? filtered : results;
}

export async function searchSeries(query: string): Promise<Series[]> {
    if (!query) return [];

    const data = await fetchTmdb<TmdbSearchResponse<TmdbSeriesResult>>('/search/tv', { query });

    const results = data.results.map(item => ({
        id: item.id.toString(),
        title: item.name,
        imageUrl: getImageUrl(item.poster_path),
        type: 'series' as const,
        year: getYear(item.first_air_date),
        overview: item.overview,
        popularity: item.popularity,
        // Creator not available in simple search
    }));

    // Sort by TMDB popularity (higher = more popular)
    results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

    // Optionally filter by minimum popularity threshold to exclude low-quality results
    const filtered = results.filter(r => (r.popularity ?? 0) >= 1.0);
    return filtered.length > 0 ? filtered : results;
}

export async function getMovieDetails(id: string): Promise<Movie> {
    // append_to_response=credits,watch/providers to get director and streaming providers
    const data = await fetchTmdb<TmdbMovieDetails & { 'watch/providers'?: TmdbWatchProviders }>(
        `/movie/${id}`,
        { append_to_response: 'credits,watch/providers' }
    );

    const director = data.credits?.crew.find(c => c.job === 'Director')?.name;

    const genres = data.genres?.map(g => g.name);
    const runtime = data.runtime ?? undefined;
    const streamingProviders = extractProviders(data['watch/providers']);

    return {
        id: data.id.toString(),
        title: data.title,
        imageUrl: getImageUrl(data.poster_path),
        type: 'movie',
        year: getYear(data.release_date),
        overview: data.overview,
        director,
        genres,
        runtime,
        streamingProviders,
    };
}

export async function getSeriesDetails(id: string): Promise<Series> {
    const data = await fetchTmdb<TmdbSeriesDetails & { 'watch/providers'?: TmdbWatchProviders }>(
        `/tv/${id}`,
        { append_to_response: 'watch/providers' }
    );

    // TMDB returns created_by array for series details
    const creator = data.created_by && data.created_by.length > 0
        ? data.created_by.map(c => c.name).join(', ')
        : undefined;

    const genres = data.genres?.map(g => g.name);
    const seasons = data.number_of_seasons ?? undefined;
    const episodes = data.number_of_episodes ?? undefined;
    const streamingProviders = extractProviders(data['watch/providers']);

    return {
        id: data.id.toString(),
        title: data.name,
        imageUrl: getImageUrl(data.poster_path),
        type: 'series',
        year: getYear(data.first_air_date),
        overview: data.overview,
        creator,
        genres,
        seasons,
        episodes,
        streamingProviders,
    };
}

export async function getSeriesSeasonEpisodes(
    seriesId: string,
    seasonNumber: number
): Promise<SeriesEpisode[]> {
    const data = await fetchTmdb<TmdbSeasonDetails>(
        `/tv/${seriesId}/season/${seasonNumber}`
    );

    return data.episodes.map(ep => ({
        episodeId: `S${String(ep.season_number).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`,
        episodeName: ep.name,
        seasonNumber: ep.season_number,
        episodeNumber: ep.episode_number,
        overview: ep.overview || undefined,
        runtime: ep.runtime ?? undefined,
        stillPath: ep.still_path,
    }));
}
