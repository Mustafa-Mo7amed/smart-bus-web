import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Route } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouteRepository extends BaseRepository<Route> {
  constructor(appDatabase: AppDatabase) {
    super(appDatabase.routes);
  }
}
