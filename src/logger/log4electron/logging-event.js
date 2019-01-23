import CircularJSON from 'circular-json';
import levels from './levels';

class LoggingEvent {
  /**
   *
   * @param categoryName
   * @param level message level
   * @param data
   * @param context
   */
  constructor(categoryName, level, data, context) {
    this.startTime = new Date();
    this.categoryName = categoryName;
    this.data = data;
    this.level = level;
    this.context = Object.assign({}, context);
    this.pid = process.pid;
  }

  serialize() {
    this.data = this.data.map((e) => (e && e.message && e.stack
      ? Object.assign({ message: e.message, stack: e.stack }, e)
      : e));

    return CircularJSON.stringify(this);
  }

  static deserialize(serialized) {
    let event;

    try {
      const rehydratedEvent = CircularJSON.parse(serialized);

      rehydratedEvent.data = rehydratedEvent.data.map((e) => (e && e.message && e.stack
        ? Object.keys(e).forEach((key) => {
          new Error(e)[key] = e[key];
        })
        : e));

      event = new LoggingEvent(rehydratedEvent.categoryName,
        levels.getLevel(rehydratedEvent.level.levelContent),
        rehydratedEvent.data,
        rehydratedEvent.context);

      event.startTime = new Date(rehydratedEvent.startTime);
      event.pid = rehydratedEvent.pid;
      // event.cluster = rehydratedEvent.cluster;
    }
    catch (e) {
      event = new LoggingEvent('log4electron',
        levels.getLevel('ERROR'),
        [ 'Unable to parse log:', serialized, 'because: ', e ]);
    }

    return event;
  }
}

export default LoggingEvent;
