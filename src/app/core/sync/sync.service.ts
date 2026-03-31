import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SyncEventsService } from './sync-events.service';
import { SyncQueueRepository } from '../repositories/sync-queue.repository';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from '../network/network.service';

export interface SyncQueueItem {
  id: string;
  entityId: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  timestamp: number;
  retries: number;
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  private isSyncing = false;

  private readonly http = inject(HttpClient);
  private readonly db = inject(SyncQueueRepository);
  private readonly events = inject(SyncEventsService);
  private readonly network = inject(NetworkService);

  async runSync() {
    if (!this.network.isOnline) {
      throw new Error("No internet connection. Can't sync at the moment.");
    }

    if (this.isSyncing) return;

    this.isSyncing = true;

    const queue = await this.db.getAllSorted();

    for (const item of queue) {
      try {
        // TODO: test that this condition is actually useful
        if (!this.network.isOnline) {
          throw new Error('No internet connection. Syncing was interrupted.');
        }

        this.events.emit({ type: 'START', item });

        await firstValueFrom(this.http.request(item.method, item.url, item.body));

        await this.db.delete(item.id);

        this.events.emit({ type: 'SUCCESS', item });
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          this.db.update(item.id, {
            retries: item.retries + 1,
          });
        }

        this.events.emit({ type: 'ERROR', item, error });
      }
    }

    this.isSyncing = false;
  }
}
