import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { StationService } from '../../core/services/station.service';
import { StationInfo } from '../../shared/models/station.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './stations-list.component.html',
  styleUrl: './stations-list.component.scss',
})
export class StationsListComponent implements OnInit {
  private readonly stationService = inject(StationService);
  private readonly router = inject(Router);

  stations = signal<StationInfo[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');

  // Confirmation dialog state
  confirmDialog = signal<{
    show: boolean;
    title: string;
    message: string;
    confirmText: string;
    icon: string;
    type: 'danger' | 'primary';
    action: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    icon: 'help_outline',
    type: 'primary',
    action: () => {},
  });

  filteredStations = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.stations();
    if (!query) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.fetchStations();
  }

  fetchStations() {
    this.isLoading.set(true);
    this.stationService.getStations().subscribe({
      next: (data) => {
        this.stations.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching stations:', err);
        this.isLoading.set(false);
      },
    });
  }

  editStation(id: string) {
    this.router.navigate(['/stations/edit', id]);
  }

  deleteStation(event: Event, station: StationInfo) {
    event.stopPropagation();
    this.confirmDialog.set({
      show: true,
      title: 'Delete Station',
      message: `Are you sure you want to permanently delete station "${station.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      icon: 'delete_forever',
      type: 'danger',
      action: () => {
        this.closeConfirm();
        this.isLoading.set(true);
        this.stationService.deleteStation(station.id).subscribe({
          next: () => {
            this.stations.update((list) => list.filter((s) => s.id !== station.id));
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error deleting station:', err);
            this.isLoading.set(false);
          },
        });
      },
    });
  }

  closeConfirm() {
    this.confirmDialog.update((state) => ({ ...state, show: false }));
  }

  executeConfirm() {
    this.confirmDialog().action();
  }
}
