import { BaseDatabase } from './base-database';

export class ScheduleDatabse extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      schedule : '',
    });
  }
}
