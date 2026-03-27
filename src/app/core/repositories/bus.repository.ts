import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Bus } from '../../shared/models/bus.model';

@Injectable({
  providedIn: 'root',
})
export class BusRepository extends BaseRepository<Bus> {
  constructor(db: AppDatabase) {
    super(db.buses);
  }
}
