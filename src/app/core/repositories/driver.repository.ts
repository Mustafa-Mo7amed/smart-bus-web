import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Driver } from '../../shared/models/driver.model';

@Injectable({
  providedIn: 'root',
})
export class DriverRepository extends BaseRepository<Driver> {
  constructor(appDatabase: AppDatabase) {
    super(appDatabase.drivers);
  }
}
