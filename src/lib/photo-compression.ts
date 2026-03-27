import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
  initialQuality: 0.7,
};

/**
 * Compress an image file for upload.
 * Target: max 800px wide, ~500KB, JPEG 70% quality.
 */
export async function compressPhoto(file: File): Promise<File> {
  if (file.size < 100_000) return file; // skip if already < 100KB
  return await imageCompression(file, COMPRESSION_OPTIONS);
}

/**
 * Create a preview URL for a File object.
 * Remember to revoke with URL.revokeObjectURL when done.
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export const MAX_PHOTOS = 5;
export const MIN_PHOTOS = 1;
