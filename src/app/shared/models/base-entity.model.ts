export interface BaseEntity {
  id: string;

  createdAt: string;
  updatedAt: string;

  lastSyncedAt?: string;
  deletedAt?: string;

  version: number;


  syncStatus: 'synced' | 'pending' | 'conflict';
}
