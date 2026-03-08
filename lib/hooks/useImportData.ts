import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
            const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
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
            const csvContent = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });

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
