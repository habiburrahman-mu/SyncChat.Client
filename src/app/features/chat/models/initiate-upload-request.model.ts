import { MediaOwnerType } from '@core/enums';

export interface InitiateUploadRequest {
  owner: {
    type: MediaOwnerType;
    id: string;
  };
  file: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  };
}
