import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  plateNumber: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [MatIcon, CommonModule, RouterLink],
  templateUrl: './drivers-list.component.html',
  styleUrl: './drivers-list.component.scss',
})
export class DriversListComponent {
  private readonly router = inject(Router);

  drivers = signal<Driver[]>([
    {
      id: '1',
      driverId: 'DRV-1024',
      name: 'Ahmed Hassan',
      phone: '01012345678',
      licenseNumber: 'LIC-001-EG',
      plateNumber: 'ABC 123',
      status: 'Active',
    },
    {
      id: '2',
      driverId: 'DRV-2048',
      name: 'Mohamed Ali',
      phone: '01123456789',
      licenseNumber: 'LIC-002-EG',
      plateNumber: 'DEF 456',
      status: 'Active',
    },
    {
      id: '3',
      driverId: 'DRV-4096',
      name: 'Youssef Kamal',
      phone: '01234567890',
      licenseNumber: 'LIC-003-EG',
      plateNumber: 'GHI 789',
      status: 'Active',
    },
  ]);
  isLoading = signal(false);
}
