import log4electron from '../log4electron';
import { addCoreAppender } from '../log4electron/appenders';
import multiFile from '../appenders/multiFile';

addCoreAppender('multiFile', multiFile);

log4electron.loadConfigure({
  appenders : {
    console : {
      type   : 'console',
      layout : {
        type : 'basic',
      },
    },
  },
  categories : {
    default : {
      appenders : [ 'console' ],
      level     : 'ALL',
    },
  },
});

const consoleLogger = log4electron.getLogger('CONSOLE');

window.consoleLogger = consoleLogger;

export default consoleLogger;
