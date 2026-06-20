import { Component, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

export interface CropResult {
  blob: Blob;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  zoom: number;
}

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, MatIconModule],
  templateUrl: './image-cropper-modal.component.html',
  styleUrl: './image-cropper-modal.component.scss'
})
export class ImageCropperModalComponent {
  imageFile = input<File | undefined>(undefined);
  save = output<CropResult>();
  cancel = output<void>();

  @ViewChild(ImageCropperComponent) imageCropper?: ImageCropperComponent;

  zoom = signal(1);
  croppedImage: any = '';
  currentCropEvent: ImageCroppedEvent | null = null;
  errorMessage = signal<string | null>(null);

  imageLoaded(image: LoadedImage) {
    this.errorMessage.set(null);
  }

  cropperReady() {
  }

  loadImageFailed() {
    console.error('Load image failed');
    this.errorMessage.set('Failed to load image. Please try another file.');
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    this.currentCropEvent = event;
  }

  onZoomChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.zoom.set(parseFloat(input.value));
  }

  onSave() {
    if (this.currentCropEvent && this.currentCropEvent.blob) {
      const x1 = this.currentCropEvent.imagePosition?.x1 ?? 0;
      const y1 = this.currentCropEvent.imagePosition?.y1 ?? 0;
      const x2 = this.currentCropEvent.imagePosition?.x2 ?? 0;
      const y2 = this.currentCropEvent.imagePosition?.y2 ?? 0;

      this.save.emit({
        blob: this.currentCropEvent.blob,
        cropX: Math.round(x1),
        cropY: Math.round(y1),
        cropWidth: Math.round(x2 - x1),
        cropHeight: Math.round(y2 - y1),
        zoom: this.zoom()
      });
    }
  }
}
