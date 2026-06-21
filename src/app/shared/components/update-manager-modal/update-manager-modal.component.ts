import { Component, input, output, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StationService } from '../../../core/services/station.service';
import { StationInfo } from '../../models/station.model';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-update-manager-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './update-manager-modal.component.html',
  styleUrl: './update-manager-modal.component.scss',
})
export class UpdateManagerModalComponent implements OnInit {
  private readonly stationService = inject(StationService);
  private readonly adminService = inject(AdminService);

  show = input.required<boolean>();
  managerId = input.required<string>();
  currentDisplayName = input.required<string>();
  currentStationId = input<string | null>(null);

  close = output<void>();
  success = output<{ displayName: string; stationId: string; stationName?: string }>();

  stations = signal<StationInfo[]>([]);
  isLoadingStations = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = new FormGroup({
    displayName: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    stationId: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (this.show()) {
        this.form.patchValue({
          displayName: this.currentDisplayName(),
          stationId: this.currentStationId() || '',
        });
        this.errorMessage.set(null);
      }
    });
  }

  ngOnInit() {
    this.fetchStations();
  }

  fetchStations() {
    this.isLoadingStations.set(true);
    this.stationService.getStations().subscribe({
      next: (data) => {
        this.stations.set(data || []);
        this.isLoadingStations.set(false);
      },
      error: (err) => {
        console.error('Error fetching stations for update modal:', err);
        this.isLoadingStations.set(false);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const displayName = this.form.value.displayName!;
    const stationId = this.form.value.stationId!;

    this.adminService.updateManagerStation(this.managerId(), displayName, stationId).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          const selectedStation = this.stations().find(s => s.id === stationId);
          this.success.emit({
            displayName,
            stationId,
            stationName: selectedStation ? selectedStation.name : undefined
          });
        } else {
          this.errorMessage.set(res.message || 'Failed to update manager.');
        }
      },
      error: (err) => {
        console.error('Error updating manager:', err);
        this.errorMessage.set(err.error?.message || 'Something went wrong! Please try again later.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}
