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

// -- Helpers --

const isSingleOrEP = (item: ItunesResult): boolean => {
    const name = item.collectionName?.toLowerCase() ?? '';
    return item.collectionType === 'Single' || name.includes('- single')
        || item.collectionType === 'EP' || name.includes('- ep');
};

function mapAlbumResult(item: ItunesResult): Music {
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

// -- Public Functions --

export async function searchMusic(query: string): Promise<Music[]> {
    if (!query) return [];

    const albumParams = new URLSearchParams({ term: query, entity: 'album', limit: '30', media: 'music' });
    const songParams  = new URLSearchParams({ term: query, entity: 'song',  limit: '30', media: 'music' });

    // Fetch albums and songs in parallel; tolerate individual failures
    const [albumRes, songRes] = await Promise.allSettled([
        fetch(`${ITUNES_SEARCH_URL}?${albumParams.toString()}`),
        fetch(`${ITUNES_SEARCH_URL}?${songParams.toString()}`),
    ]);

    const albumData: ItunesResult[] = albumRes.status === 'fulfilled' && albumRes.value.ok
        ? ((await albumRes.value.json()) as ItunesResponse).results
        : [];
    const songData: ItunesResult[] = songRes.status === 'fulfilled' && songRes.value.ok
        ? ((await songRes.value.json()) as ItunesResponse).results
        : [];

    if (albumData.length === 0 && songData.length === 0) return [];

    // Direct album results (filter singles/EPs)
    const directAlbums = albumData.filter(item => !isSingleOrEP(item));

    // Extract unique albums discovered via song results
    const albumsFromSongs = new Map<string, ItunesResult>();
    songData.forEach(item => {
        const colId = item.collectionId.toString();
        if (!albumsFromSongs.has(colId)) {
            albumsFromSongs.set(colId, item);
        }
    });

    // Combine both sources, deduplicating by collectionId
    const seen = new Set<string>();
    const combined: Music[] = [];

    // Direct albums first (higher priority)
    for (const item of directAlbums) {
        const colId = item.collectionId.toString();
        if (!seen.has(colId)) {
            seen.add(colId);
            combined.push(mapAlbumResult(item));
        }
    }

    // Albums discovered via songs
    for (const [colId, item] of albumsFromSongs) {
        if (!seen.has(colId) && !isSingleOrEP(item)) {
            seen.add(colId);
            combined.push(mapAlbumResult(item));
        }
    }

    // Sort by relevance: title matches query first, then by track count
    const queryLower = query.toLowerCase();
    combined.sort((a, b) => {
        const aMatch = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
        const bMatch = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        return (b.trackCount ?? 0) - (a.trackCount ?? 0);
    });

    return combined.slice(0, 20);
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
