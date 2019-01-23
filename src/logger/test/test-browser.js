import log4electron from '../log4electron';

log4electron.loadConfigure({
  appenders : {
    browser : {
      type   : 'browser',
      layout : {
        type : 'browser',
      },
    },
  },
  categories : {
    default : {
      appenders : [ 'browser' ],
      level     : 'ALL',
    },
  },
});

const browserLogger = log4electron.getLogger('BROWSER');

window.browserLogger = browserLogger;

export default browserLogger;
