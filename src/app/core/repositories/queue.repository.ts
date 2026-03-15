import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Queue } from '../../shared/models/queue.model';

@Injectable({
  providedIn: 'root',
})
export class QueueRepository extends BaseRepository<Queue> {
  constructor(appDatabase: AppDatabase) {
    super(appDatabase.queues);
  }
}
