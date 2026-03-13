import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { MediaOwnerType, MediaState } from '@core/enums';
import { ConfirmUploadResponse, GetMediaAccessUrlResponse, GetMediaStateResponse, InitiateUploadRequest, InitiateUploadResponse } from '../models';
import { filter, map, Observable, switchMap, take, throwError, timer, timeout } from 'rxjs';

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

  /**
   * Uploads raw file bytes directly to MinIO via presigned PUT URL.
   * Bypasses Angular HttpClient (and its interceptors) intentionally —
   * auth is embedded in the presigned URL query params.
   *
   * Emits upload progress (0–100), then completes on success.
   */
  uploadToStorage(uploadUri: string, file: File): Observable<number> {
    return new Observable<number>(subscriber => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUri);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          subscriber.next(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          subscriber.next(100);
          subscriber.complete();
        } else {
          subscriber.error(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => subscriber.error(new Error('Network error during upload'));

      xhr.send(file);

      return () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          xhr.abort();
        }
      };
    });
  }

  confirmUpload(mediaId: string): Observable<ConfirmUploadResponse> {
    const url = API_ROUTES.Media.ConfirmUpload;
    return this.http.post<ConfirmUploadResponse>(url, { mediaId });
  }

  getAccessUrl(mediaId: string): Observable<GetMediaAccessUrlResponse> {
    const url = API_ROUTES.Media.GetAccessUrl;
    const params = new HttpParams().set('mediaId', mediaId);
    return this.http.get<GetMediaAccessUrlResponse>(url, { params });
  }

  getMediaState(mediaId: string): Observable<GetMediaStateResponse> {
    const params = new HttpParams().set('mediaId', mediaId);
    return this.http.get<GetMediaStateResponse>(API_ROUTES.Media.GetState, { params });
  }

  /**
   * Polls getMediaState every `pollInterval` ms until the media reaches Active state.
   * Errors if the media is not active within `pollTimeout` ms.
   */
  pollUntilActive(mediaId: string, pollInterval = 1500, pollTimeout = 60_000): Observable<void> {
    return timer(500, pollInterval).pipe(
      switchMap(() => this.getMediaState(mediaId)),
      filter(r => r.mediaState === MediaState.Active),
      take(1),
      map(() => undefined),
      timeout({ first: pollTimeout }),
    );
  }
}
