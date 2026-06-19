import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { BaseSignalRService } from './base-signalr.service';
import { DriverLocationUpdate } from '../../../shared/models/signalr.model';

@Injectable({ providedIn: 'root' })
export class LocationSignalRService extends BaseSignalRService {
  readonly locationReceived$ = new Subject<DriverLocationUpdate>();

  private currentDriverId: string | null = null;

  constructor() {
    super('/location-tracking', true);
  }

  protected registerEvents(connection: signalR.HubConnection): void {
    connection.on('ReceiveLocation', (data: DriverLocationUpdate) => {
      this.locationReceived$.next(data);
    });
  }

  async joinDriver(driverId: string): Promise<void> {
    await this.leaveDriver();
    await this.start();
    await this.connection!.invoke('JoinDriver', driverId);
    this.currentDriverId = driverId;
  }

  async leaveDriver(): Promise<void> {
    if (this.connection && this.currentDriverId) {
      try {
        await this.connection.invoke('LeaveDriver', this.currentDriverId);
      } catch {}
      this.currentDriverId = null;
    }
    await this.stop();
  }
}