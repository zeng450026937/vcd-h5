import ApolloSIP from 'apollosip';
import log4electron from './log4electron';
import browserLogger from './test/test-browser';
// import './test/test-multi-file';
// browserLogger.ns = 'US:SIP';
// import fileLogger from './test/test-signal-file';
// import consoleLogger from './test/test-console';

ApolloSIP.Logger.Observer = browserLogger;
//
window.logger = browserLogger;
export default log4electron;
