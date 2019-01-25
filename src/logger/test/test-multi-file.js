import log4electron from '../log4electron';
import { addCoreAppender } from '../log4electron/appenders';
import multiFile from '../appenders/multiFile';

addCoreAppender('multiFile', multiFile);

log4electron.loadConfigure({
  appenders : {
    multiFile : {
      type      : 'multiFile',
      base      : 'src/logger/logs/',
      property  : 'categoryName',
      extension : '.log',
      timeout   : 20,
      layout    : {
        type : 'browser',
      },
    },
  },
  categories : {
    default : {
      appenders : [ 'multiFile' ],
      level     : 'ALL',
    },
  },
});

window.log4electron = log4electron;

const multiFileLoggerA = log4electron.getLogger('MULTI_FILE_A');
const multiFileLoggerB = log4electron.getLogger('MULTI_FILE_B');

window.multiFileLogger = [ multiFileLoggerA, multiFileLoggerB ];
// multiFileLogger[1].debug('String', 123456, true, {type: 'object'})
export default log4electron;
