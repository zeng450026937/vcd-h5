import Dexie from 'dexie';

export default class BaseDatabase extends Dexie {
  constructor(name, schemaVersion) {
    super(name);

    this.schemaVersion = schemaVersion;
  }

  async conditionalVersion(version, schema, upgrade) {
    if (this.schemaVersion != null && this.schemaVersion < version) return;

    const dexieVersion = this.version(version).stores(schema);

    if (upgrade != null) {
      await dexieVersion.upgrade(upgrade);
    }
  }
}
