import { BaseDatabase } from './base-database';

export class StatsDatabase extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      launches      : '++',
      dailyMeasures : '++id',
    });
  }
}
