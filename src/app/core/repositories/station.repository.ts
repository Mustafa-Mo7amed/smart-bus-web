import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Station } from '../../shared/models/station.model';

@Injectable({
  providedIn: 'root',
})
export class StationRepository extends BaseRepository<Station> {
  constructor(db: AppDatabase) {
    super(db.stations);
  }
}
