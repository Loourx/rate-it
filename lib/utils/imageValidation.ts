const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: { mimeType?: string; fileSize?: number; uri: string }): void {
  if (file.mimeType && !ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    throw new Error('Tipo de archivo no permitido. Usa JPG, PNG o WebP.');
  }
  if (file.fileSize && file.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.');
  }
}
