import Dexie from 'dexie';

class Base {
  constructor(dbName, storesOpt, version) {
    this.db = this.createDB(dbName, storesOpt, version);
  }

  static getVersion(dbName) {
    return new Promise((resolve, reject) => new Dexie(dbName).open()
      .then((db) => resolve(db.verno)).catch((e) => { reject(e); }));
  }

  createDB(dbName, storesOpt, version) {
    const db = new Dexie(dbName);

    db.version(version).stores(storesOpt);

    return db;
  }

  clear(storeName) {
    this.db.open();

    return new Promise((resolve) => {
      this.db[storeName].clear().then(() => {
        resolve();
      });
    });
  }

  add(storeName, data) {
    return this.db.open().then((db) => {
      db[storeName].add(data);
    });
  }

  bulkAdd(storeName, data) {
    this.db.open();
    
    return new Promise((resolve) => {
      this.db[storeName].bulkAdd(data).then((lastKey) => {
        resolve(lastKey);
      });
    });
  }

  put(storeName, key, data) {
    return this.db.open().then((db) => {
      db[storeName].put(data);
    });
  }

  bulkPut(storeName, key, data) {
    return this.db.open().then((db) => {
      db[storeName].put(data);
    });
  }

  find(storeName, key, val) {
    this.db.open();

    return this.db[storeName].where(key).equals(val);
  }

  deleteByKey(storeName, key, val) {
    return this.find(storeName, key, val).delete();
  }

  updateByKey(storeName, key, val, data) {
    this.db.open();

    return this.db[storeName].where(key).equals(val).modify(data);
  }

  creatNewVersion(newVersion) {
    this.db.close();

    return this.db.version(newVersion);
  }

  upgrade(newVersion, storesOpt, callback) {
    this.db.close();

    return this.db.version(newVersion).stores(storesOpt).upgrade(callback);
  }

  getAllData(storeName) {
    return new Promise((resolve) => {
      this.db[storeName].toArray().then((data) => {
        resolve(data);
      });
    });
  }

  get version() {
    return this.db ? this.db.verno : null;
  }
}
export default Base;
