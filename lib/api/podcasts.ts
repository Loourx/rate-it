import { Podcast } from '../types/content';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

// Internal interfaces for iTunes responses
interface ItunesPodcastResult {
    collectionId: number;
    collectionName: string;
    artistName: string;
    artworkUrl100: string;
    artworkUrl600?: string;
    description?: string;
    primaryGenreName?: string;
    trackCount?: number;
}

interface ItunesResponse {
    resultCount: number;
    results: ItunesPodcastResult[];
}

// Helper to get high-res image
const getImageUrl = (url100: string | null, url600?: string | null): string | null => {
    if (url600) return url600;
    if (!url100) return null;
    return url100.replace('100x100bb.jpg', '600x600bb.jpg');
};

// -- Public Functions --

export async function searchPodcasts(query: string): Promise<Podcast[]> {
    if (!query) return [];

    const params = new URLSearchParams({
        term: query,
        entity: 'podcast',
        limit: '20'
    });

    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Search Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    return data.results.map(item => ({
        id: item.collectionId.toString(),
        title: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100, item.artworkUrl600),
        type: 'podcast',
        publisher: item.artistName,
        description: item.description || '',
        genre: item.primaryGenreName,
        episodeCount: item.trackCount,
    }));
}

export async function getPodcastDetails(id: string): Promise<Podcast> {
    const params = new URLSearchParams({
        id: id,
        entity: 'podcast'
    });

    const response = await fetch(`${ITUNES_LOOKUP_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Lookup Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    if (data.resultCount === 0) {
        throw new Error(`Podcast with ID ${id} not found`);
    }

    const item = data.results[0];

    return {
        id: item.collectionId.toString(),
        title: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100, item.artworkUrl600),
        type: 'podcast',
        publisher: item.artistName,
        description: item.description || '',
        genre: item.primaryGenreName,
        episodeCount: item.trackCount,
    };
}
