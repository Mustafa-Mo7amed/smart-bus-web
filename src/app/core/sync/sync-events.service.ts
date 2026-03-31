import { Injectable } from '@angular/core';
import { SyncQueueItem } from './sync.service';
import { Subject } from 'rxjs';

export type SyncEventType = 'START' | 'SUCCESS' | 'ERROR' | 'FAILED_PERMANENTLY';

export interface SyncEvent {
  type: SyncEventType;
  item: SyncQueueItem;
  error?: any;
}

@Injectable({ providedIn: 'root' })
export class SyncEventsService {
  private events$ = new Subject<SyncEvent>();

  emit(event: SyncEvent) {
    this.events$.next(event);
  }

  onEvents() {
    return this.events$.asObservable();
  }
}
