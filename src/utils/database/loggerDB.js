import Dexie from 'dexie';

const db = new Dexie('logger');

db.version(1).stores({
  log : '++id, timestamp',
});

class LoggerDB {
  constructor() {
    this.db = db;
  }

  add(data) {
    this.db.log.add({
      timestamp : new Date().valueOf(),
      result    : data.result,
    });
  }

  getLogBetweenTime(start, end) {
    return new Promise((resolve) => {
      this.db.log.where('timestamp').between(start, end).toArray((data) => {
        resolve(data);
      });
    });
  }

  getLogByLevel(start, end, level) {
    return new Promise((resolve) => {
      this.getLogBetweenTime(start, end).then((res) => {
        resolve(res.filter((item) => item.result.result.level === level));
      });
    });
  }
}
export default new LoggerDB();
