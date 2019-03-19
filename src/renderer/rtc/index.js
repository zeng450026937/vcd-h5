import Vue from 'vue';
import ApolloRTC from 'apollortc';

Vue.use(ApolloRTC);

export default window.rtc = new ApolloRTC();
