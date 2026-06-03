import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';

export interface RouteQueue {
  routeId: string;
  from: string;
  to: string;
  price: number;
  buses: Array<{
    position: number;
    plateNumber: string;
    driverName: string;
    passengerCount: number;
    model: string;
    color: string;
    status: 'Waiting' | 'OnWay';
  }>;
}

export interface PassengerReport {
  id: string;
  plateNumber: string;
  reason: string;
  createdAt: string;
  description: string;
  status: 'Pending' | 'Resolved';
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly authService = inject(AuthService);

  // Get current user display details
  currentUser = this.authService.currentUser;

  // KPI Metrics Signals
  activeBusesCount = signal(12);
  busesOnTripCount = signal(8);
  availableDriversCount = signal(14);
  pendingReportsCount = signal(3);

  // Route Queues Signal (Representing live loading queues in the station)
  routeQueues = signal<RouteQueue[]>([
    {
      routeId: '1',
      from: 'Ramsis',
      to: 'Heliopolis Hub',
      price: 15.0,
      buses: [
        {
          position: 1,
          plateNumber: 'ABC 123',
          driverName: 'Mahmoud Hassan',
          passengerCount: 11,
          model: 'Toyota Hiace',
          color: 'White',
          status: 'Waiting',
        },
        {
          position: 2,
          plateNumber: 'DEF 456',
          driverName: 'Ahmed Driver',
          passengerCount: 4,
          model: 'King Long',
          color: 'Silver',
          status: 'Waiting',
        },
      ],
    },
    {
      routeId: '2',
      from: 'Ramsis',
      to: 'Alexandria',
      price: 65.0,
      buses: [
        {
          position: 1,
          plateNumber: 'XYZ 987',
          driverName: 'Mohamed Ali',
          passengerCount: 14,
          model: 'Toyota Hiace',
          color: 'White',
          status: 'Waiting',
        },
        {
          position: 2,
          plateNumber: 'MNO 321',
          driverName: 'Youssef Kamal',
          passengerCount: 3,
          model: 'King Long',
          color: 'Silver',
          status: 'Waiting',
        },
      ],
    },
    {
      routeId: '3',
      from: 'Ramsis',
      to: 'Giza Square',
      price: 12.0,
      buses: [
        {
          position: 1,
          plateNumber: 'PQR 654',
          driverName: 'Mustafa Mahmoud',
          passengerCount: 8,
          model: 'Toyota Hiace',
          color: 'Golden',
          status: 'Waiting',
        },
      ],
    },
  ]);

  // Passenger Reports Feed Signal
  passengerReports = signal<PassengerReport[]>([
    {
      id: 'rep-101',
      plateNumber: 'ABC 123',
      reason: 'Speeding / Reckless Driving',
      createdAt: '2026-06-03T21:40:00Z',
      description: 'The driver was speeding and weaving between lanes on the highway.',
      status: 'Pending',
    },
    {
      id: 'rep-102',
      plateNumber: 'XYZ 987',
      reason: 'AC Failure',
      createdAt: '2026-06-03T21:15:00Z',
      description: 'The air conditioning is not working, and the bus is extremely hot.',
      status: 'Pending',
    },
    {
      id: 'rep-103',
      plateNumber: 'PQR 654',
      reason: 'Overcrowded',
      createdAt: '2026-06-03T20:50:00Z',
      description: 'The driver allowed extra passengers to sit on auxiliary stools in the aisle.',
      status: 'Pending',
    },
  ]);

  // Passenger Flow Chart Data for SVG Visualization
  // Represents hourly passenger checkouts
  hourlyData = [
    { hour: '08:00', count: 120 },
    { hour: '10:00', count: 180 },
    { hour: '12:00', count: 150 },
    { hour: '14:00', count: 230 },
    { hour: '16:00', count: 310 },
    { hour: '18:00', count: 280 },
    { hour: '20:00', count: 190 },
    { hour: '22:00', count: 90 },
  ];

  // Quick Action Handlers
  resolveReport(reportId: string) {
    // Update report status
    this.passengerReports.update((reports) =>
      reports.map((r) => (r.id === reportId ? { ...r, status: 'Resolved' } : r))
    );
    
    // Decrement pending count
    this.pendingReportsCount.update((count) => Math.max(0, count - 1));
  }

  // Simulate boarding passenger (interactive dashboard element)
  addPassenger(routeId: string, plateNumber: string) {
    this.routeQueues.update((queues) =>
      queues.map((q) => {
        if (q.routeId !== routeId) return q;
        return {
          ...q,
          buses: q.buses.map((b) => {
            if (b.plateNumber !== plateNumber) return b;
            return {
              ...b,
              passengerCount: Math.min(14, b.passengerCount + 1),
            };
          }),
        };
      })
    );
  }
}
