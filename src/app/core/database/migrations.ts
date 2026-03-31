import { AppDatabase } from './app.database';

export function applyMigrations(db: AppDatabase) {
  db.version(1).stores({
    buses: 'id, busId, stationId, driverId, status',

    drivers: 'id, driverId, phone',

    stations: 'id, stationId, name',

    routes: 'id, routeId, startCity, endCity',

    trips: 'id, tripId, busId, routeId, status, startTime',

    queues: 'id, queueId, stationId, routeId',

    queueItems: 'id, queueId, position, driverId, busId',

    reports: 'id, reportId, userId, tripId',
  });

  db.version(2).stores({
    syncQueue: 'id, entityId, method, url, timestamp, retries',
  });
}
