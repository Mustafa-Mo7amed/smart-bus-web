import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ImageCropperModalComponent, CropResult } from './image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, ImageCropperModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isUploading = signal(false);

  showCropper = signal(false);
  selectedFile = signal<File | null>(null);

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.showCropper.set(true);
    }
  }

  onCropSave(result: CropResult) {
    const originalFile = this.selectedFile();
    if (!originalFile) return;

    this.isUploading.set(true);
    
    const formData = new FormData();
    formData.append('File', originalFile);
    formData.append('Crop.X', result.cropX.toString());
    formData.append('Crop.Y', result.cropY.toString());
    formData.append('Crop.Width', result.cropWidth.toString());
    formData.append('Crop.Height', result.cropHeight.toString());
    formData.append('Crop.Zoom', result.zoom.toString());

    this.authService.uploadPhoto(formData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.closeCropper();
      },
      error: () => {
        this.isUploading.set(false);
        this.closeCropper();
      }
    });
  }

  onCropCancel() {
    this.closeCropper();
  }

  private closeCropper() {
    this.showCropper.set(false);
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getPhotoUrl(photoUrl: string | undefined): string {
    if (!photoUrl) return 'wasla-logo-rounded.png';
    if (photoUrl.startsWith('http')) return photoUrl;
    const baseDomain = environment.baseURL.replace(/\/api\/v.*/, '');
    return `${baseDomain}/${photoUrl}`;
  }

  onDeletePhoto() {
    if (confirm('Are you sure you want to delete your photo?')) {
      this.authService.deletePhoto().subscribe();
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  onDeleteAccount() {
    if (confirm('WARNING: Are you sure you want to delete your account? This action cannot be undone.')) {
      this.authService.deleteAccount().subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
