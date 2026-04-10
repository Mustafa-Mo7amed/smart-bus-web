// TODO: all are optional till final decision about removing sync feature
export interface BaseEntity {
  id?: string;

  createdAt?: string;
  updatedAt?: string;

  lastSyncedAt?: string;
  deletedAt?: string;

  version?: number;


  syncStatus?: 'synced' | 'pending' | 'conflict';
}
