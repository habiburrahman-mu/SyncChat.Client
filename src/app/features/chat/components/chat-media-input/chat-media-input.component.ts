import { Component, ElementRef, EventEmitter, input, Output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MEDIA_CONSTANTS } from '@features/chat/configs/media.config';

export interface MediaAttachment {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'chat-media-input',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './chat-media-input.component.html',
  styleUrl: './chat-media-input.component.scss',
})
export class ChatMediaInputComponent {
  uploadProgress = input<number | null>(null);
  isUploading = input<boolean>(false);

  @Output() fileSelected = new EventEmitter<MediaAttachment>();
  @Output() attachmentCleared = new EventEmitter<void>();

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly pendingAttachment = signal<MediaAttachment | null>(null);
  readonly isDragOver = signal(false);
  readonly validationError = signal<string | null>(null);

  readonly acceptedTypes = MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.join(',');

  onFileInputChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this._processFile(file);
  }

  onBrowseClick() {
    this.fileInput()?.nativeElement.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this._processFile(file);
  }

  clearAttachment() {
    this._revokePendingUrl();
    this.pendingAttachment.set(null);
    this.validationError.set(null);
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
    this.attachmentCleared.emit();
  }

  private _processFile(file: File) {
    this.validationError.set(null);

    if (!MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type as typeof MEDIA_CONSTANTS.ALLOWED_MIME_TYPES[number])) {
      this.validationError.set(`Unsupported file type. Allowed: JPEG, PNG, GIF, WEBP, SVG, BMP, TIFF.`);
      return;
    }

    if (file.size <= 0 || file.size > MEDIA_CONSTANTS.MAX_FILE_SIZE_BYTES) {
      this.validationError.set(`File exceeds the 5 MB limit.`);
      return;
    }

    this._revokePendingUrl();

    const previewUrl = URL.createObjectURL(file);
    const attachment: MediaAttachment = { file, previewUrl };
    this.pendingAttachment.set(attachment);
    this.fileSelected.emit(attachment);
  }

  private _revokePendingUrl() {
    const prev = this.pendingAttachment();
    if (prev) URL.revokeObjectURL(prev.previewUrl);
  }
}
