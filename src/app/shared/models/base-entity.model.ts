export interface BaseEntity {
  id: string;

  createdAt: number;
  updatedAt: number;

  lastSyncedAt?: number;

  version: number;

  deleted?: boolean;

  syncStatus: 'synced' | 'pending' | 'conflict';
}
