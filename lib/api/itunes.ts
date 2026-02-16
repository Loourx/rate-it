import { Music } from '../types/content';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

// Internal interfaces for iTunes responses
interface ItunesAlbumResult {
    collectionId: number;
    collectionName: string;
    artistName: string;
    artworkUrl100: string;
    releaseDate: string;
    primaryGenreName: string;
}

interface ItunesResponse {
    resultCount: number;
    results: ItunesAlbumResult[];
}

// Helper to get high-res image (iTunes provides 100x100, we can try to get bigger)
const getImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    // iTunes artwork URLs usually end in 100x100bb.jpg. We can replace it with 600x600bb.jpg
    return url.replace('100x100bb.jpg', '600x600bb.jpg');
};

// -- Public Functions --

export async function searchMusic(query: string): Promise<Music[]> {
    if (!query) return [];

    const params = new URLSearchParams({
        term: query,
        entity: 'album',
        limit: '20',
        media: 'music'
    });

    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Search Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    return data.results.map(item => ({
        id: item.collectionId.toString(),
        title: item.collectionName,
        artist: item.artistName,
        album: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100),
        type: 'music'
    }));
}

export async function getMusicDetails(id: string): Promise<Music> {
    const params = new URLSearchParams({
        id: id,
        entity: 'album'
    });

    const response = await fetch(`${ITUNES_LOOKUP_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Lookup Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    if (data.resultCount === 0) {
        throw new Error(`Music album with ID ${id} not found`);
    }

    const item = data.results[0];

    return {
        id: item.collectionId.toString(),
        title: item.collectionName,
        artist: item.artistName,
        album: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100),
        type: 'music'
    };
}
