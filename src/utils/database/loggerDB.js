import Base from './base';

class LoggerDB extends Base {
  constructor(dbName, storesOpt, version) {
    super(dbName, storesOpt, version);
  }

  addLog(data) {
    this.add('log', {
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
        resolve(res.filter((item) => item.result.level === level));
      });
    });
  }
}

export default window.loggerDB = new LoggerDB('logger', { log: '++id, timestamp' }, 1);
