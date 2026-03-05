import { MEDIA_CONSTANTS } from '@features/chat/configs/media.config';

export interface FileValidationError {
  code: 'FILE_TOO_LARGE' | 'UNSUPPORTED_MIME_TYPE';
  description: string;
}

export function validateMediaFile(file: File): FileValidationError | null {
  if (!MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type as typeof MEDIA_CONSTANTS.ALLOWED_MIME_TYPES[number])) {
    return {
      code: 'UNSUPPORTED_MIME_TYPE',
      description: `The MIME type '${file.type}' is not supported. Allowed types: ${MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (file.size <= 0 || file.size > MEDIA_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      description: `File size must be between 1 byte and ${MEDIA_CONSTANTS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  return null;
}
