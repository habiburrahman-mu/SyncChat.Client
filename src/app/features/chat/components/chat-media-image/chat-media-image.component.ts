import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '@features/chat/services';

@Component({
  selector: 'chat-media-image',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './chat-media-image.component.html',
  styleUrl: './chat-media-image.component.scss',
})
export class ChatMediaImageComponent implements OnInit {
  mediaId = input.required<string>();

  private readonly mediaService = inject(MediaService);

  readonly imageUrl = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  /** Cached expiry so we can refresh when the presigned URL expires. */
  private _expiresAt: Date | null = null;
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this._fetchUrl();
  }

  onImageError() {
    const expired = this._expiresAt && new Date() >= this._expiresAt;
    if (expired) {
      this._fetchUrl();
    } else {
      this.loadError.set(true);
      this.isLoading.set(false);
    }
  }

  onImageLoad() {
    this.isLoading.set(false);
  }

  private _fetchUrl() {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.mediaService.getAccessUrl(this.mediaId()).subscribe({
      next: ({ url, expiresAt }) => {
        if (this._refreshTimer) clearTimeout(this._refreshTimer);

        this.imageUrl.set(url);
        this._expiresAt = new Date(expiresAt);

        // Refresh URL 30 seconds before it expires
        const msUntilExpiry = this._expiresAt.getTime() - Date.now() - 30_000;
        if (msUntilExpiry > 0) {
          this._refreshTimer = setTimeout(() => this._fetchUrl(), msUntilExpiry);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(true);
      },
    });
  }
}
