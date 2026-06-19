import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';
import { OverviewService } from '../core/services/overview.service';
import { ReportService } from '../core/services/report.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TripHourCount, LiveRouteQueue, DemandOnRoute } from '../shared/models/overview.model';
import { ReportListItem } from '../shared/models/report.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly overviewService = inject(OverviewService);
  private readonly reportService = inject(ReportService);
  private readonly destroyRef = inject(DestroyRef);

  currentUser = this.authService.currentUser;

  // KPI Metrics Signals
  availableMicrobuses = signal(0);
  incomingMicrobuses = signal(0);
  completedTripsToday = signal(0);
  totalPassengersToday = signal(0);
  pendingReportsCount = signal(0);

  routeQueues = signal<LiveRouteQueue[]>([]);
  passengerReports = signal<ReportListItem[]>([]);
  hourlyData = signal<TripHourCount[]>([]);
  demandByRoute = signal<DemandOnRoute[]>([]);

  ngOnInit(): void {
    // --- TEMPORARY DUMMY DATA FOR DEMO ---
    this.availableMicrobuses.set(15);
    this.incomingMicrobuses.set(8);
    this.completedTripsToday.set(42);
    this.totalPassengersToday.set(588);

    this.routeQueues.set([
      { destinationName: 'Cairo', microbusesReady: 5 },
      { destinationName: 'Assiut', microbusesReady: 3 },
      { destinationName: 'Beni Suef', microbusesReady: 2 },
      { destinationName: 'Minya', microbusesReady: 4 },
      { destinationName: 'Fayoum', microbusesReady: 1 }
    ]);

    this.demandByRoute.set([
      { destinationName: 'Cairo', passengerCount: 350 },
      { destinationName: 'Assiut', passengerCount: 238 },
      { destinationName: 'Beni Suef', passengerCount: 145 },
      { destinationName: 'Minya', passengerCount: 90 },
      { destinationName: 'Fayoum', passengerCount: 60 }
    ]);

    this.hourlyData.set([
      { hour: '08:00', tripCount: 10 },
      { hour: '09:00', tripCount: 15 },
      { hour: '10:00', tripCount: 8 },
      { hour: '11:00', tripCount: 22 },
      { hour: '12:00', tripCount: 18 },
      { hour: '13:00', tripCount: 25 },
      { hour: '14:00', tripCount: 14 }
    ]);

    this.passengerReports.set([
      { id: 'rep-uuid-1', plateNumber: 'أ ب ج 123', createdAt: new Date().toISOString(), resolvedAt: null, status: 'Pending' },
      { id: 'rep-uuid-2', plateNumber: 'د هـ و 456', createdAt: new Date(Date.now() - 300000).toISOString(), resolvedAt: null, status: 'Pending' },
      { id: 'rep-uuid-3', plateNumber: 'س ص ع 789', createdAt: new Date(Date.now() - 600000).toISOString(), resolvedAt: null, status: 'Reviewed' }
    ]);
    this.pendingReportsCount.set(2);

    /* Commented out real API calls for now
    this.overviewService.getDashboardOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.availableMicrobuses.set(data.availableMicrobuses);
          this.incomingMicrobuses.set(data.incomingMicrobuses);
          this.completedTripsToday.set(data.completedTripsToday);
          this.totalPassengersToday.set(data.totalPassengersToday);
          this.routeQueues.set(data.liveRouteQueues);
          this.hourlyData.set(data.tripsOverTime);
          this.demandByRoute.set(data.demandByRoute);
        },
        error: (err) => console.error('Error fetching overview', err)
      });

    this.reportService.getReports()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.passengerReports.set(data.items);
          const pending = data.items.filter(r => r.status === 'Pending').length;
          this.pendingReportsCount.set(pending);
        },
        error: (err) => console.error('Error fetching reports', err)
      });
    */
  }

  resolveReport(reportId: string) {
    this.reportService.reviewReport(reportId).subscribe(() => {
      this.passengerReports.update((reports) =>
        reports.map((r) => (r.id === reportId ? { ...r, status: 'Reviewed' } : r))
      );
      this.pendingReportsCount.update((count) => Math.max(0, count - 1));
    });
  }

  // Chart computations
  generateChartPath(): string {
    const data = this.hourlyData();
    if (!data || !data.length) return '';
    const maxVal = Math.max(...data.map(d => d.tripCount), 1);
    
    let path = 'M ';
    data.forEach((d, i) => {
      const x = 30 + i * 45;
      const y = 140 - (d.tripCount / maxVal) * 120;
      path += `${x},${y} `;
      if (i < data.length - 1) path += 'L ';
    });
    return path;
  }
  
  generateAreaPath(): string {
    const data = this.hourlyData();
    if (!data || !data.length) return '';
    const linePath = this.generateChartPath();
    const lastX = 30 + (data.length - 1) * 45;
    return `${linePath} L ${lastX},140 L 30,140 Z`;
  }

  getPoints(): {x: number, y: number}[] {
    const data = this.hourlyData();
    if (!data) return [];
    const maxVal = Math.max(...data.map(d => d.tripCount), 1);
    return data.map((d, i) => ({
      x: 30 + i * 45,
      y: 140 - (d.tripCount / maxVal) * 120
    }));
  }

  getDemandBars(): {x: number, y: number, width: number, height: number, color: string}[] {
    const data = this.demandByRoute();
    if (!data || !data.length) return [];
    const maxVal = Math.max(...data.map(d => d.passengerCount), 1);
    const barSpacing = 360 / data.length;
    const barWidth = Math.min(barSpacing * 0.6, 40);

    return data.map((d, i) => {
      const height = (d.passengerCount / maxVal) * 120;
      return {
        x: 30 + (i * barSpacing) + (barSpacing - barWidth) / 2,
        y: 140 - height,
        width: barWidth,
        height: height,
        color: '#00c2a8'
      };
    });
  }
}

