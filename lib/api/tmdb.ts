import { Movie, Series } from '../types/content';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

if (!API_KEY) {
    console.warn('TMDB API Key is missing. Please add EXPO_PUBLIC_TMDB_API_KEY to only your .env file.');
}

// Internal interfaces for TMDB responses
interface TmdbMovieResult {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
}

interface TmdbSeriesResult {
    id: number;
    name: string;
    poster_path: string | null;
    first_air_date: string;
    overview: string;
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

const getHeaders = () => {
    return {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    };
};

// Helper for image URL
const getImageUrl = (path: string | null): string | null => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : null;
};

// Helper for year extraction
const getYear = (date: string): string | undefined => {
    return date ? date.split('-')[0] : undefined;
};

// Helper for fetch
async function fetchTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
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

    return data.results.map(item => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: getImageUrl(item.poster_path),
        type: 'movie',
        year: getYear(item.release_date),
        overview: item.overview,
        // Director not available in simple search
    }));
}

export async function searchSeries(query: string): Promise<Series[]> {
    if (!query) return [];

    const data = await fetchTmdb<TmdbSearchResponse<TmdbSeriesResult>>('/search/tv', { query });

    return data.results.map(item => ({
        id: item.id.toString(),
        title: item.name,
        imageUrl: getImageUrl(item.poster_path),
        type: 'series',
        year: getYear(item.first_air_date),
        overview: item.overview,
        // Creator not available in simple search
    }));
}

export async function getMovieDetails(id: string): Promise<Movie> {
    // append_to_response=credits to get director
    const data = await fetchTmdb<TmdbMovieDetails>(`/movie/${id}`, { append_to_response: 'credits' });

    const director = data.credits?.crew.find(c => c.job === 'Director')?.name;

    const genres = data.genres?.map(g => g.name);
    const runtime = data.runtime ?? undefined;

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
    };
}

export async function getSeriesDetails(id: string): Promise<Series> {
    const data = await fetchTmdb<TmdbSeriesDetails>(`/tv/${id}`);

    // TMDB returns created_by array for series details
    const creator = data.created_by && data.created_by.length > 0
        ? data.created_by.map(c => c.name).join(', ')
        : undefined;

    const genres = data.genres?.map(g => g.name);
    const seasons = data.number_of_seasons ?? undefined;
    const episodes = data.number_of_episodes ?? undefined;

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
    };
}
