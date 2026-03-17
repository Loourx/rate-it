import { useState } from 'react';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import JSZip from 'jszip';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/lib/stores/authStore';
import { parseLetterboxd } from '@/lib/import/parseLetterboxd';
import { parseGoodreads } from '@/lib/import/parseGoodreads';
import { resolveTMDB } from '@/lib/import/resolveTMDB';
import { resolveGoogleBooks } from '@/lib/import/resolveGoogleBooks';
import { executeImport } from '@/lib/import/importEngine';
import type {
    ImportProgress,
    ImportResult,
    ResolvedImportItem,
    UnresolvedImportItem,
} from '@/lib/types/import';

/**
 * Platform-aware file reading function.
 * - Web: Uses FileReader API and fetch to read files as text or base64
 * - Native: Uses expo-file-system/legacy with the specified encoding
 */
async function readFileAsString(
    uri: string,
    encoding: 'utf8' | 'base64' = 'utf8'
): Promise<string> {
    if (Platform.OS === 'web') {
        // On web, the uri is typically a blob URL — use fetch + FileReader
        const response = await fetch(uri);
        const text = await response.text();

        if (encoding === 'base64') {
            // Convert text to base64 using the standard web API
            // Encode UTF-8 text as base64
            const uint8Array = new TextEncoder().encode(text);
            const binary = String.fromCharCode.apply(null, Array.from(uint8Array) as number[]);
            return btoa(binary);
        }
        return text;
    } else {
        // On native, use expo-file-system/legacy with dynamic import
        // to prevent web from attempting to load the native module
        const FileSystem = await import('expo-file-system/legacy');
        const content = await FileSystem.readAsStringAsync(uri, { encoding });
        return content;
    }
}

export function useImportData() {
    const { session } = useAuthStore();
    const userId = session?.user.id;
    const queryClient = useQueryClient();

    const [progress, setProgress] = useState<ImportProgress>({
        phase: 'idle',
        totalItems: 0,
        processedItems: 0,
        currentItem: null,
    });
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setProgress({ phase: 'idle', totalItems: 0, processedItems: 0, currentItem: null });
        setResult(null);
        setError(null);
    };

    const handleUpdateProgress = (processed: number, current: string) => {
        setProgress((prev) => ({
            ...prev,
            processedItems: processed,
            currentItem: current,
        }));
    };

    const invalidateRelevantQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['ratings'] });
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
        queryClient.invalidateQueries({ queryKey: ['rating-history'] });
    };

    const importFromLetterboxd = async () => {
        if (!userId) return;
        try {
            reset();
            const pickerResult = await DocumentPicker.getDocumentAsync({ type: 'application/zip' });
            if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) return;

            const uri = pickerResult.assets[0].uri;
            const base64Data = await readFileAsString(uri, 'base64');
            const zip = await JSZip.loadAsync(base64Data, { base64: true });

            const ratings = await zip.file('ratings.csv')?.async('text');
            const watched = await zip.file('watched.csv')?.async('text');
            const reviews = await zip.file('reviews.csv')?.async('text');
            const watchlist = await zip.file('watchlist.csv')?.async('text');

            setProgress((prev) => ({ ...prev, phase: 'parsing' }));
            const items = parseLetterboxd({ ratings, watched, reviews, watchlist });

            setProgress((prev) => ({ ...prev, phase: 'resolving', totalItems: items.length }));
            const resolutionResults = await resolveTMDB(items, handleUpdateProgress);

            const resolved = resolutionResults.filter((r) => r.resolved) as ResolvedImportItem[];
            const unresolved = resolutionResults.filter((r) => !r.resolved) as UnresolvedImportItem[];

            setProgress((prev) => ({ ...prev, phase: 'inserting', totalItems: resolved.length, processedItems: 0 }));
            const finalResult = await executeImport(resolved, userId, 'letterboxd', handleUpdateProgress);

            finalResult.totalParsed = items.length;
            finalResult.unresolved = unresolved;

            invalidateRelevantQueries();
            setResult(finalResult);
            setProgress((prev) => ({ ...prev, phase: 'complete' }));
        } catch (err: unknown) {
            setProgress((prev) => ({ ...prev, phase: 'error' }));
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    };

    const importFromGoodreads = async () => {
        if (!userId) return;
        try {
            reset();
            const pickerResult = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', '*/*'],
            });
            if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) return;

            const uri = pickerResult.assets[0].uri;
            const csvContent = await readFileAsString(uri, 'utf8');

            setProgress((prev) => ({ ...prev, phase: 'parsing' }));
            const items = parseGoodreads(csvContent);

            setProgress((prev) => ({ ...prev, phase: 'resolving', totalItems: items.length }));
            const resolutionResults = await resolveGoogleBooks(items, handleUpdateProgress);

            const resolved = resolutionResults.filter((r) => r.resolved) as ResolvedImportItem[];
            const unresolved = resolutionResults.filter((r) => !r.resolved) as UnresolvedImportItem[];

            setProgress((prev) => ({ ...prev, phase: 'inserting', totalItems: resolved.length, processedItems: 0 }));
            const finalResult = await executeImport(resolved, userId, 'goodreads', handleUpdateProgress);

            finalResult.totalParsed = items.length;
            finalResult.unresolved = unresolved;

            invalidateRelevantQueries();
            setResult(finalResult);
            setProgress((prev) => ({ ...prev, phase: 'complete' }));
        } catch (err: unknown) {
            setProgress((prev) => ({ ...prev, phase: 'error' }));
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    };

    return {
        importFromLetterboxd,
        importFromGoodreads,
        progress,
        result,
        error,
        reset,
    };
}
