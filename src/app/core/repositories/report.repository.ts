import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { AppDatabase } from '../database/app.database';
import { Report } from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportRepository extends BaseRepository<Report> {
  constructor(appDatabase: AppDatabase) {
    super(appDatabase.reports);
  }
}
