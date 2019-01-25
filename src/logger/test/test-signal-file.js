import log4electron from '../log4electron';

log4electron.loadConfigure({
  appenders : {
    file : {
      type     : 'file',
      filename : 'src/logger/logs/test.log',
    },
  },
  categories : {
    default : {
      appenders : [ 'file' ],
      level     : 'ALL',
    },
  },
});

const fileLogger = log4electron.getLogger('FILE');

export default fileLogger;
