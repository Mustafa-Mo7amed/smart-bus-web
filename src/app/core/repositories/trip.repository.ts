import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Trip } from '../../shared/models/trip.model';

@Injectable({
  providedIn: 'root',
})
export class TripRepository extends BaseRepository<Trip> {
  constructor(db: AppDatabase) {
    super(db.trips);
  }
}
