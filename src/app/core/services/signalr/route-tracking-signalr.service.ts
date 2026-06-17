import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { BaseSignalRService } from './base-signalr.service';
import { RouteLiveUpdate } from '../../../shared/models/signalr.model';

@Injectable({ providedIn: 'root' })
export class RouteTrackingSignalRService extends BaseSignalRService {
  readonly routeUpdated$ = new Subject<RouteLiveUpdate>();

  private currentRouteId: string | null = null;

  constructor() {
    super('/route-tracking', false);
  }

  protected registerEvents(connection: signalR.HubConnection): void {
    connection.on('RouteUpdated', (data: RouteLiveUpdate) => {
      this.routeUpdated$.next(data);
    });
  }

  async joinRoute(routeId: string): Promise<void> {
    await this.leaveRoute();
    await this.start();
    await this.connection!.invoke('JoinRoute', routeId);
    this.currentRouteId = routeId;
  }

  async leaveRoute(): Promise<void> {
    if (this.connection && this.currentRouteId) {
      try {
        await this.connection.invoke('LeaveRoute', this.currentRouteId);
      } catch {
        // Connection may already be closed
      }
      this.currentRouteId = null;
    }
    await this.stop();
  }
}
