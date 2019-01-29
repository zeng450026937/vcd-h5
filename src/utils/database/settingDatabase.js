import Dexie from 'dexie';
import BaseDatabase from './base';

export default class SettingDatabase extends BaseDatabase {
  constructor(version, schema) {
    super(version);

    this.conditionalVersion(version = 1, schema);
  }
}
