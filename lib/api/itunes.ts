import { Music, AlbumTrack } from '../types/content';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';

// Internal interfaces for iTunes responses
interface ItunesResult {
    wrapperType: string;
    kind?: string;
    collectionType?: string; // 'Album', 'Single', 'EP', etc.
    collectionId: number;
    collectionName: string;
    artistName: string;
    artworkUrl100: string;
    releaseDate: string;
    primaryGenreName: string;
    trackCount?: number;
    trackId?: number;
    trackName?: string;
    trackNumber?: number;
    trackTimeMillis?: number;
    discNumber?: number;
    previewUrl?: string;
}

interface ItunesResponse {
    resultCount: number;
    results: ItunesResult[];
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

    // Fetch more results so we can filter out singles/EPs and still have enough albums
    const params = new URLSearchParams({
        term: query,
        entity: 'album',
        limit: '50',
        media: 'music'
    });

    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Search Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    // Separate real albums from singles/EPs, then combine (albums first)
    const albums = data.results.filter(item => {
        // Keep only actual albums — exclude Singles and EPs
        const name = item.collectionName?.toLowerCase() ?? '';
        const isSingle = item.collectionType === 'Single' || name.includes('- single');
        const isEP = item.collectionType === 'EP' || name.includes('- ep');
        return !isSingle && !isEP;
    });

    const singlesAndEPs = data.results.filter(item => {
        const name = item.collectionName?.toLowerCase() ?? '';
        const isSingle = item.collectionType === 'Single' || name.includes('- single');
        const isEP = item.collectionType === 'EP' || name.includes('- ep');
        return isSingle || isEP;
    });

    // Sort albums by track count descending (major albums tend to have more tracks)
    albums.sort((a, b) => (b.trackCount ?? 0) - (a.trackCount ?? 0));

    // Combine: real albums first, then singles/EPs as fallback, cap at 20
    const combined = [...albums, ...singlesAndEPs].slice(0, 20);

    return combined.map(item => ({
        id: item.collectionId.toString(),
        title: item.collectionName,
        artist: item.artistName,
        album: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100),
        type: 'music',
        year: item.releaseDate ? item.releaseDate.split('-')[0] : undefined,
        genre: item.primaryGenreName,
        trackCount: item.trackCount,
        isAlbum: true,
    }));
}

export async function searchMusicTracks(query: string): Promise<Music[]> {
    if (!query) return [];

    const params = new URLSearchParams({
        term: query,
        entity: 'song',
        limit: '20',
        media: 'music'
    });

    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Search Tracks Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    return data.results.map(item => ({
        id: item.trackId ? item.trackId.toString() : item.collectionId.toString(),
        title: item.trackName || item.collectionName,
        artist: item.artistName,
        album: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100),
        type: 'music',
        year: item.releaseDate ? item.releaseDate.split('-')[0] : undefined,
        genre: item.primaryGenreName,
        isAlbum: false,
    }));
}

export async function getMusicDetails(id: string, isAlbum: boolean = true): Promise<Music> {
    if (isAlbum) {
        return getAlbumDetails(id);
    } else {
        return getTrackDetails(id);
    }
}

async function getAlbumDetails(id: string): Promise<Music> {
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
        type: 'music',
        year: item.releaseDate ? item.releaseDate.split('-')[0] : undefined,
        genre: item.primaryGenreName,
        trackCount: item.trackCount,
        isAlbum: true,
    };
}

async function getTrackDetails(id: string): Promise<Music> {
    const params = new URLSearchParams({
        id: id,
    });

    const response = await fetch(`${ITUNES_LOOKUP_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Track Lookup Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    if (data.resultCount === 0) {
        throw new Error(`Music track with ID ${id} not found`);
    }

    const item = data.results[0];

    return {
        id: (item.trackId ?? item.collectionId).toString(),
        title: item.trackName || item.collectionName,
        artist: item.artistName,
        album: item.collectionName,
        imageUrl: getImageUrl(item.artworkUrl100),
        type: 'music',
        year: item.releaseDate ? item.releaseDate.split('-')[0] : undefined,
        genre: item.primaryGenreName,
        isAlbum: false,
        durationMs: item.trackTimeMillis,
    };
}

export async function getAlbumTracks(collectionId: string): Promise<AlbumTrack[]> {
    const params = new URLSearchParams({
        id: collectionId,
        entity: 'song',
    });

    const response = await fetch(`${ITUNES_LOOKUP_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`iTunes API Album Tracks Error: ${response.status} ${response.statusText}`);
    }

    const data: ItunesResponse = await response.json();

    // First result is the album metadata, rest are tracks
    const trackResults = data.results.filter(
        (r) => r.wrapperType === 'track' || r.kind === 'song'
    );

    return trackResults
        .sort((a, b) => {
            // Sort by disc number first, then track number
            const discA = a.discNumber ?? 1;
            const discB = b.discNumber ?? 1;
            if (discA !== discB) return discA - discB;
            return (a.trackNumber ?? 0) - (b.trackNumber ?? 0);
        })
        .map((item) => ({
            trackId: (item.trackId ?? item.collectionId).toString(),
            trackName: item.trackName || item.collectionName,
            trackNumber: item.trackNumber ?? 0,
            durationMs: item.trackTimeMillis ?? 0,
            discNumber: item.discNumber ?? 1,
            previewUrl: item.previewUrl,
            artistName: item.artistName,
        }));
}
