import Vue from 'vue';
import ApolloRTC from '../../../lib/apollo-rtc/src/index';

Vue.use(ApolloRTC);

const rtc = new ApolloRTC();

window.rtc = rtc;

export default rtc;
