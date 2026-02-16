import { Game } from '../types/content';

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const API_KEY = process.env.EXPO_PUBLIC_RAWG_API_KEY;

if (!API_KEY) {
    console.warn('RAWG API Key is missing. Please add EXPO_PUBLIC_RAWG_API_KEY to only your .env file.');
}

// Internal interfaces for RAWG responses
interface RawgGameResult {
    id: number;
    name: string;
    background_image: string | null;
    released: string;
}

interface RawgSearchResponse {
    results: RawgGameResult[];
}

interface RawgGameDetails extends RawgGameResult {
    description_raw: string;
    developers: Array<{ name: string }>;
    platforms: Array<{ platform: { name: string } }>;
}

// Helper for year extraction
const getYear = (date: string | null): string | undefined => {
    return date ? date.split('-')[0] : undefined;
};

// Helper for fetch
async function fetchRawg<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!API_KEY) throw new Error('RAWG API Key is missing');

    const searchParams = new URLSearchParams({
        key: API_KEY,
        ...params
    });

    const response = await fetch(`${RAWG_BASE_URL}${endpoint}?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error(`RAWG API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// -- Public Functions --

export async function searchGames(query: string): Promise<Game[]> {
    if (!query) return [];

    const data = await fetchRawg<RawgSearchResponse>('/games', { search: query, page_size: '20' });

    return data.results.map(item => ({
        id: item.id.toString(),
        title: item.name,
        imageUrl: item.background_image,
        type: 'game',
        year: getYear(item.released),
    }));
}

export async function getGameDetails(id: string): Promise<Game> {
    const data = await fetchRawg<RawgGameDetails>(`/games/${id}`);

    const developer = data.developers?.[0]?.name;
    const platform = data.platforms?.[0]?.platform?.name;

    return {
        id: data.id.toString(),
        title: data.name,
        imageUrl: data.background_image,
        type: 'game',
        year: getYear(data.released),
        developer,
        platform,
        description: data.description_raw
    };
}
