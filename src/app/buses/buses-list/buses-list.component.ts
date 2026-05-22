import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface Bus {
  id: string;
  busId: string;
  plateNumber: string;
  licenseNumber: string;
  capacity: number;
  status: 'In Hub' | 'On Route' | 'Unavailable';
}

@Component({
  selector: 'app-buses-list',
  standalone: true,
  imports: [MatIcon, CommonModule, RouterLink],
  templateUrl: './buses-list.component.html',
  styleUrl: './buses-list.component.scss',
})
export class BusesListComponent {
  private readonly router = inject(Router);

  buses = signal<Bus[]>([
    {
      id: '1',
      busId: 'BUS-101',
      plateNumber: 'ABC 123',
      licenseNumber: 'L-BUS-001',
      capacity: 14,
      status: 'In Hub',
    },
    {
      id: '2',
      busId: 'BUS-102',
      plateNumber: 'DEF 456',
      licenseNumber: 'L-BUS-002',
      capacity: 12,
      status: 'On Route',
    },
    {
      id: '3',
      busId: 'BUS-103',
      plateNumber: 'GHI 789',
      licenseNumber: 'L-BUS-003',
      capacity: 14,
      status: 'In Hub',
    },
  ]);
  isLoading = signal(false);
}
