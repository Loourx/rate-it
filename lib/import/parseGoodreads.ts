import { ImportItem } from '@/lib/types/import';

function parseCSV(csv: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++; // saltar comilla escapada
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++; // saltar \n
            }
            currentRow.push(currentField);
            if (currentRow.length > 1 || currentRow[0] !== '') {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== '') {
            rows.push(currentRow);
        }
    }

    return rows;
}

function cleanISBN(raw: string): string {
    return raw.replace(/[^0-9Xx]/g, '');
}

export function parseGoodreads(csv: string): ImportItem[] {
    const rows = parseCSV(csv);
    
    console.log('RAW CSV (primeros 500 chars):', csv.slice(0, 500));
    console.log('Líneas detectadas:', rows.length);
    if (rows.length > 0) {
        // Log just the header length and a peek to prevent clutter
        console.log('Primera fila (header) columnas:', rows[0].length);
    }
    if (rows.length > 1) {
        console.log('Segunda fila (primera data):', rows[1]);
        console.log('Columnas parseadas de fila 1:', rows[1].length);
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim());
    const getIndex = (name: string) => headers.findIndex((h) => h === name);
    
    const titleIdx = getIndex('Title');
    const authorIdx = getIndex('Author');
    const myRatingIdx = getIndex('My Rating');
    const dateReadIdx = getIndex('Date Read');
    const dateAddedIdx = getIndex('Date Added');
    const exclusiveShelfIdx = getIndex('Exclusive Shelf');
    const myReviewIdx = getIndex('My Review');
    const spoilerIdx = getIndex('Spoiler');
    const isbn13Idx = getIndex('ISBN13');
    const isbnIdx = getIndex('ISBN');
    const privateNotesIdx = getIndex('Private Notes');
    const bookIdIdx = getIndex('Book Id');
    const originalYearIdx = getIndex('Original Publication Year');
    const yearPublishedIdx = getIndex('Year Published');

    const results: ImportItem[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < headers.length * 0.5) continue; // skip evidently bad rows

        const getVal = (idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

        const title = getVal(titleIdx);
        if (!title) continue;

        const exclusiveShelf = getVal(exclusiveShelfIdx);
        if (exclusiveShelf !== 'read') continue;

        const originalISBN = cleanISBN(getVal(isbn13Idx) || getVal(isbnIdx));
        
        const rawRating = parseInt(getVal(myRatingIdx), 10);
        let score: number | null = null;
        if (!isNaN(rawRating) && rawRating > 0) {
            score = rawRating * 2; // scale 1-5 to 2-10
        }

        const dateRead = getVal(dateReadIdx) || getVal(dateAddedIdx);
        const year = getVal(originalYearIdx) || getVal(yearPublishedIdx);

        results.push({
            source: 'goodreads',
            originalTitle: title,
            originalYear: year || null,
            originalAuthor: getVal(authorIdx) || null,
            originalISBN: originalISBN || null,
            score,
            reviewText: getVal(myReviewIdx) || null,
            hasSpoiler: getVal(spoilerIdx) === 'true',
            privateNote: getVal(privateNotesIdx) || null,
            status: 'done',
            sourceDate: dateRead ? dateRead.replace(/\//g, '-') : null,
            sourceUri: getVal(bookIdIdx) ? `goodreads:${getVal(bookIdIdx)}` : null,
        });
    }

    console.log(`Parsed ${results.length} valid "read" items from Goodreads CSV`);

    return results;
}
