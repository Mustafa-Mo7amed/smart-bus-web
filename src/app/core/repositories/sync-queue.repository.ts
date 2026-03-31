import { Injectable } from "@angular/core";
import { BaseRepository } from "./base.repository";
import { AppDatabase } from "../database/app.database";
import { SyncQueueItem } from "../sync/sync.service";

@Injectable({
  providedIn: 'root',
})
export class SyncQueueRepository extends BaseRepository<SyncQueueItem> {
  constructor(private db: AppDatabase) {
    super(db.syncQueue);
  }

  getAllSorted() {
    return this.db.syncQueue.orderBy('timestamp').toArray();
  }
}
