import { BaseDatabase } from './base-database';

export class CallRecordDatabase extends BaseDatabase {
  constructor(name, schemaVersion) {
    super(name, schemaVersion);

    this.conditionalVersion(1, {
      callRecord : '',
    });
  }
}
