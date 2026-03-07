import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ImageViewerData } from '@features/chat/models';

@Component({
  selector: 'image-viewer-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './image-viewer-overlay.component.html',
  styleUrl: './image-viewer-overlay.component.scss',
})
export class ImageViewerOverlayComponent {
  private readonly dialogRef = inject(DialogRef);
  readonly data = inject<ImageViewerData>(DIALOG_DATA);

  zoomed = false;

  close() {
    this.dialogRef.close();
  }

  toggleZoom() {
    this.zoomed = !this.zoomed;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
