export const MEDIA_CONSTANTS = {
  MAX_FILE_SIZE_BYTES: 5_242_880, // 5 MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ] as const,
};
