import Vue from 'vue';
import ApolloRTC from 'apollortc';

Vue.use(ApolloRTC);

const rtc = new ApolloRTC();

window.rtc = rtc;

export default rtc;
