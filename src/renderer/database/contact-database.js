import { BaseDatabase } from './base-database';

export class ContactDatabase extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      contact : '',
    });
  }
}
