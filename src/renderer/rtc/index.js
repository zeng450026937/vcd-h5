import Vue from 'vue';
import ApolloRTC from '../../../lib/apollo-rtc/src/index';

// import ApolloRTC from 'apollortc';
import ApolloSIP from 'apollosip';

const __DEV__ = process.env.NODE_ENV === 'development';

if (!__DEV__) {
  // ApolloSIP.Logger.Observer = logger;
}

Vue.use(ApolloRTC);

export default window.rtc = new ApolloRTC();
