import { supabase } from '../supabase';

const BUCKET = 'anything-images';

/**
 * Uploads an image from a local URI to Supabase Storage.
 * Returns the public URL of the uploaded image.
 * Path: anything-images/{userId}/{timestamp}.jpg
 */
export async function uploadAnythingImage(
    userId: string,
    imageUri: string,
): Promise<string> {
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Fetch the local image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase upload
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
        });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
}

/**
 * Deletes an uploaded image by its storage path.
 * Used for rollback if the DB insert fails after upload.
 */
export async function deleteAnythingImage(storagePath: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([storagePath]);
}
