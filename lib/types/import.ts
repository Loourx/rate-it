/** Fuentes de import soportadas */
export type ImportSource = 'letterboxd' | 'goodreads';

/** Fila raw de Letterboxd ratings.csv */
export interface LetterboxdRatingRow {
  Date: string;          // YYYY-MM-DD
  Name: string;          // título película
  Year: string;          // año estreno
  'Letterboxd URI': string;
  Rating: string;        // 0.5-5.0 o vacío
}

/** Fila raw de Letterboxd watched.csv (sin rating) */
export interface LetterboxdWatchedRow {
  Date: string;
  Name: string;
  Year: string;
  'Letterboxd URI': string;
}

/** Fila raw de Letterboxd reviews.csv */
export interface LetterboxdReviewRow {
  Date: string;
  Name: string;
  Year: string;
  'Letterboxd URI': string;
  Rating: string;
  Review: string;
  Spoiler: string;       // "Yes" o vacío
}

/** Fila raw de Goodreads CSV */
export interface GoodreadsRow {
  'Book Id': string;
  Title: string;
  Author: string;
  'Author l-f': string;
  ISBN: string;          // puede tener ="" wrapper
  ISBN13: string;        // puede tener ="" wrapper
  'My Rating': string;   // 0-5 entero, "0" = sin rating
  'Exclusive Shelf': string; // read, currently-reading, to-read
  'Date Read': string;   // YYYY/MM/DD o YYYY-MM-DD o vacío
  'Date Added': string;
  'My Review': string;
  Spoiler: string;       // "true"/"false" o vacío
  'Private Notes': string;
}

/** Item normalizado listo para resolución de ID */
export interface ImportItem {
  source: ImportSource;
  originalTitle: string;
  originalYear: string | null;
  originalAuthor: string | null;  // solo libros
  originalISBN: string | null;    // solo libros
  score: number | null;           // ya convertido a escala 1-10, null = watched sin rating
  reviewText: string | null;
  hasSpoiler: boolean;
  privateNote: string | null;     // solo Goodreads
  status: 'done' | 'want' | 'doing' | null;
  sourceDate: string | null;      // fecha original del CSV (ISO string)
  sourceUri: string | null;       // Letterboxd URI para dedup
}

/** Item con ID resuelto, listo para insertar */
export interface ResolvedImportItem extends ImportItem {
  contentType: 'movie' | 'book';
  contentId: string;              // TMDB ID o Google Books ID
  contentTitle: string;           // título de la API (canónico)
  contentImageUrl: string | null;
  resolved: true;
}

/** Item que no se pudo resolver */
export interface UnresolvedImportItem extends ImportItem {
  resolved: false;
  reason: 'not_found' | 'ambiguous' | 'api_error';
}

/** Estado global del proceso de import */
export type ImportPhase =
  | 'idle'
  | 'parsing'       // leyendo CSV
  | 'resolving'     // buscando IDs en APIs externas
  | 'inserting'     // escribiendo en Supabase
  | 'complete'
  | 'error';

export interface ImportProgress {
  phase: ImportPhase;
  totalItems: number;
  processedItems: number;
  currentItem: string | null;    // título del item siendo procesado
}

/** Resultado final del import */
export interface ImportResult {
  source: ImportSource;
  totalParsed: number;
  ratingsImported: number;
  statusImported: number;        // watched/want sin rating
  skippedExisting: number;       // conflictos (ya existían en Rate-it)
  unresolved: UnresolvedImportItem[];
  errors: string[];
}
