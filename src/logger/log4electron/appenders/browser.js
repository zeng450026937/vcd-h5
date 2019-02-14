// import loggerDB from '../../../utils/database/loggerDB';
import { ipcRenderer } from 'electron';
import log from '../../../main/log';

const consoleLog = console.log.bind(console);

function consoleAppender(layout, timezoneOffset) {
  return (loggingEvent) => {
    const result = layout(loggingEvent, timezoneOffset);

    // loggerDB.add({
    //   timestamp : new Date().valueOf(),
    //   result,
    // });
    // log('info', result.templates.join(''), ...result.params);
    ipcRenderer.send('log', result.level, JSON.stringify(result));

    // consoleLog(result.templates.join(''), ...result.params);
  };
}

function configure(config, layouts) {
  let layout = layouts.browserLayout;

  if (config.layout) {
    layout = layouts.getLayout(config.layout.type, config.layout);
  }

  return consoleAppender(layout, config.timezoneOffset);
}

export default {
  configure,
};
