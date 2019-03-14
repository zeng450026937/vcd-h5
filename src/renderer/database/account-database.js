import { BaseDatabase } from './base-database';

export class AccountDatabse extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      account : '',
    });
  }
}
