import { Book } from '../types/content';

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

if (!API_KEY) {
    console.warn('Google Books API Key is missing. Please add EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY to your .env file.');
}

// Internal interfaces for Google Books responses (not exported as per requirements)
interface GoogleBooksVolumeInfo {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    imageLinks?: {
        thumbnail?: string;
    };
    publishedDate?: string;
    categories?: string[];
}

interface GoogleBooksVolume {
    id: string;
    volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksSearchResponse {
    items?: GoogleBooksVolume[];
}

// Helper to sanitize image URL (http to https)
const sanitizeImageUrl = (url?: string): string | null => {
    if (!url) return null;
    return url.replace('http://', 'https://');
};

// Helper for year extraction
const getYear = (date?: string): string | undefined => {
    return date ? date.split('-')[0] : undefined;
};

// Helper for fetch
async function fetchGoogleBooks<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
        ...params
    });

    if (API_KEY) {
        searchParams.append('key', API_KEY);
    }

    const response = await fetch(`${GOOGLE_BOOKS_BASE_URL}${endpoint}?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error(`Google Books API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// -- Public Functions --

export async function searchBooks(query: string): Promise<Book[]> {
    if (!query) return [];

    const data = await fetchGoogleBooks<GoogleBooksSearchResponse>('', {
        q: query,
        maxResults: '20',
        orderBy: 'relevance',
        printType: 'books'
    });

    if (!data.items) return [];

    return data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        imageUrl: sanitizeImageUrl(item.volumeInfo.imageLinks?.thumbnail),
        type: 'book',
        author: item.volumeInfo.authors?.[0],
        pages: item.volumeInfo.pageCount,
        description: item.volumeInfo.description,
        categories: item.volumeInfo.categories,
        year: getYear(item.volumeInfo.publishedDate),
    }));
}

export async function getBookDetails(id: string): Promise<Book> {
    const data = await fetchGoogleBooks<GoogleBooksVolume>(`/${id}`);

    return {
        id: data.id,
        title: data.volumeInfo.title,
        imageUrl: sanitizeImageUrl(data.volumeInfo.imageLinks?.thumbnail),
        type: 'book',
        author: data.volumeInfo.authors?.join(', '),
        pages: data.volumeInfo.pageCount,
        description: data.volumeInfo.description,
        categories: data.volumeInfo.categories,
        year: getYear(data.volumeInfo.publishedDate),
    };
}
