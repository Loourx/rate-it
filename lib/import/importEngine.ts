import { supabase } from '@/lib/supabase';
import type {
  ResolvedImportItem,
  ImportSource,
  ImportResult,
} from '@/lib/types/import';

/**
 * Inserta un array de ResolvedImportItem en Supabase (ratings + user_content_status).
 * Procesa de a 1 item para manejar errores individuales y reportar progreso.
 * No sobreescribe: conflictos 23505 se cuentan como skippedExisting.
 */
export async function executeImport(
  items: ResolvedImportItem[],
  userId: string,
  source: ImportSource,
  onProgress: (processed: number, current: string) => void,
): Promise<ImportResult> {
  const result: ImportResult = {
    source,
    totalParsed: items.length,
    ratingsImported: 0,
    statusImported: 0,
    skippedExisting: 0,
    unresolved: [],
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let isSkipped = false;
    let isImportedAsRating = false;

    // --- Paso 2: insertar rating si tiene score ---
    if (item.score !== null) {
      const { error } = await supabase.from('ratings').insert({
        user_id: userId,
        content_type: item.contentType,
        content_id: item.contentId,
        content_title: item.contentTitle,
        content_image_url: item.contentImageUrl,
        score: item.score,
        review_text: item.reviewText,
        has_spoiler: item.hasSpoiler,
        private_note: item.privateNote,
        imported_from: source,
        created_at: item.sourceDate ?? new Date().toISOString(),
      });

      if (error) {
        if (error.code === '23505') {
          result.skippedExisting++;
          isSkipped = true;
        } else {
          result.errors.push(
            `Rating "${item.contentTitle}": ${error.message}`,
          );
        }
      } else {
        result.ratingsImported++;
        isImportedAsRating = true;
      }
    }

    // --- Paso 3: insertar user_content_status si tiene status ---
    if (item.status !== null) {
      const { error } = await supabase.from('user_content_status').insert({
        user_id: userId,
        content_type: item.contentType,
        content_id: item.contentId,
        content_title: item.contentTitle,
        content_image_url: item.contentImageUrl,
        status: item.status,
      });

      if (error) {
        if (error.code === '23505') {
          // Solo sumamos a skipped si NO lo sumamos ya en el paso de rating
          if (!isSkipped && !isImportedAsRating) {
            result.skippedExisting++;
            isSkipped = true;
          }
        } else {
          result.errors.push(
            `Status "${item.contentTitle}": ${error.message}`,
          );
        }
      } else {
        // Solo sumamos a statusImported si NO se importó como rating
        // (Ratings y Vistos son mutuamente excluyentes)
        if (!isImportedAsRating && !isSkipped) {
          result.statusImported++;
        }
      }
    }

    // --- Paso 4: reportar progreso ---
    onProgress(i + 1, item.contentTitle);
  }

  return result;
}
