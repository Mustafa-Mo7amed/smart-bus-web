import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { QueueItem } from '../../shared/models/queue-item.model';

@Injectable({
  providedIn: 'root',
})
export class QueueItemRepository extends BaseRepository<QueueItem> {
  constructor(appDatabase: AppDatabase) {
    super(appDatabase.queueItems);
  }
}
