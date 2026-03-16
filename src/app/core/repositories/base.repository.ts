import { Table, UpdateSpec } from 'dexie';

export abstract class BaseRepository<T> {
  constructor(protected table: Table<T, string>) {}

  getById(id: string) {
    return this.table.get(id);
  }

  getAll() {
    return this.table.toArray();
  }

  add(entity: T) {
    return this.table.add(entity);
  }

  update(id: string, changes: UpdateSpec<T>) {
    return this.table.update(id, changes);
  }

  delete(id: string) {
    return this.table.delete(id);
  }
}
