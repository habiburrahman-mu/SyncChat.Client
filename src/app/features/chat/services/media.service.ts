import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { MediaOwnerType } from '@core/enums';
import { InitiateUploadRequest, InitiateUploadResponse } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(
    private readonly http: HttpClient,
  ) {}

  initiateUpload(ownerType: MediaOwnerType, ownerId: string, file: File): Observable<InitiateUploadResponse> {
    const url = API_ROUTES.Media.InitiateUpload;

    const request: InitiateUploadRequest = {
      owner: {
        type: ownerType,
        id: ownerId,
      },
      file: {
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    };

    return this.http.post<InitiateUploadResponse>(url, request);
  }
}
