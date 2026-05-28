import { Component, inject, OnInit, signal } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { Route } from '../../shared/models/route.model';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ExcelService, ExcelColumnDef } from '../../core/services/export.service';

@Component({
  selector: 'app-routes-list',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './routes-list.component.html',
  styleUrl: './routes-list.component.scss',
})
export class RoutesListComponent implements OnInit {
  routeService = inject(RouteService);
  excelService = inject(ExcelService);
  isLoading = false;
  routes = signal<Route[]>([]);

  ngOnInit() {
    this.isLoading = true;
    this.routeService.getAllRoutes().subscribe({
      next: (routes: Route[]) => {
        this.routes.set(routes);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching routes:', error);
        this.isLoading = false;
      },
    });
  }

  exportToExcel() {
    const data = this.routes().map((route) => ({
      routeName: `${route.startCity} - ${route.endCity}`,
      price: route.routeSummary.price,
      distance: route.routeSummary.distanceKm,
      activeBuses:
        route.routeSummary.numberOfMicrobusesInQueue +
        route.routeSummary.numberOfMicrobusesOnTheWay,
      nearestArrival: route.routeSummary.nearestArrivalMinutes,
    }));

    const columns: ExcelColumnDef[] = [
      { header: 'Route', key: 'routeName', type: 'text' },
      { header: 'Price (LE)', key: 'price', type: 'number' },
      { header: 'Distance (km)', key: 'distance', type: 'number' },
      { header: 'Active Buses', key: 'activeBuses', type: 'number' },
      { header: 'Nearest Arrival (min)', key: 'nearestArrival', type: 'number' },
    ];

    this.excelService
      .exportData({
        data,
        columns,
        fileName: 'routes-list.xlsx',
        sheetName: 'Routes',
      })
      .subscribe({
        next: (res) => {
          console.log('Export progress:', res.progress);
        },
        error: (err) => {
          console.error('Export failed:', err);
        },
      });
  }
}
