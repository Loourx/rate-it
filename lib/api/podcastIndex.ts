import * as Crypto from 'expo-crypto';
import { Podcast } from '../types/content';

const BASE_URL = 'https://api.podcastindex.org/api/1.0';
const API_KEY = process.env.EXPO_PUBLIC_PODCAST_INDEX_KEY;
const API_SECRET = process.env.EXPO_PUBLIC_PODCAST_INDEX_SECRET;

if (!API_KEY || !API_SECRET) {
    console.warn('Podcast Index API Key or Secret is missing.');
}

async function getAuthHeaders() {
    if (!API_KEY || !API_SECRET) {
        throw new Error('Podcast Index API Key or Secret is missing');
    }

    const epoch = Math.floor(Date.now() / 1000).toString();
    const authString = API_KEY + API_SECRET + epoch;

    // Authorization: SHA-1 hash of (key + secret + epoch)
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        authString
    );

    return {
        'User-Agent': 'Rate-it/1.0',
        'X-Auth-Key': API_KEY,
        'X-Auth-Date': epoch,
        'Authorization': hash,
        'Content-Type': 'application/json'
    };
}

interface PodcastIndexResult {
    id: number;
    title: string;
    image: string;
    author: string;
    description: string;
}

interface PodcastIndexSearchResponse {
    feeds: PodcastIndexResult[];
}

interface PodcastIndexDetailsResponse {
    feed: PodcastIndexResult;
}

export async function searchPodcasts(query: string): Promise<Podcast[]> {
    if (!query) return [];

    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/search/byterm?q=${encodeURIComponent(query)}`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Podcast Index API Error: ${response.status}`);
        }

        const data: PodcastIndexSearchResponse = await response.json();

        return data.feeds.map(item => ({
            id: item.id.toString(),
            title: item.title,
            imageUrl: item.image || null,
            type: 'podcast',
            publisher: item.author,
            description: item.description
        }));
    } catch (error) {
        console.error('Error searching podcasts:', error);
        return [];
    }
}

export async function getPodcastDetails(id: string): Promise<Podcast> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/podcasts/byfeedid?id=${id}`, {
        headers
    });

    if (!response.ok) {
        throw new Error(`Podcast Index API Error: ${response.status}`);
    }

    const data: PodcastIndexDetailsResponse = await response.json();
    const item = data.feed;

    return {
        id: item.id.toString(),
        title: item.title,
        imageUrl: item.image || null,
        type: 'podcast',
        publisher: item.author,
        description: item.description
    };
}
