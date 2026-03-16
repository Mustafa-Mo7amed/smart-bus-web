import Dexie, { Table } from 'dexie';
import { Bus } from '../../shared/models/bus.model';
import { Driver } from '../../shared/models/driver.model';
import { Queue } from '../../shared/models/queue.model';
import { Report } from '../../shared/models/report.model';
import { Station } from '../../shared/models/station.model';
import { Trip } from '../../shared/models/trip.model';
import { applyMigrations } from './migrations';
import { Route } from '@angular/router';
import { QueueItem } from '../../shared/models/queue-item.model';

export class AppDatabase extends Dexie {
  buses!: Table<Bus>;
  drivers!: Table<Driver>;
  stations!: Table<Station>;
  routes!: Table<Route>;
  trips!: Table<Trip>;
  queues!: Table<Queue>;
  queueItems!: Table<QueueItem>;
  reports!: Table<Report>;

  constructor() {
    super('smart-bus-db');

    applyMigrations(this);
  }
}

export const appDatabase = new AppDatabase();
