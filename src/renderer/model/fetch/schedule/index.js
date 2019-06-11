import Axios from 'axios';
import querystring from 'querystring';
import API from './api';
import auth from '../auth';

import Vuem from '../../vuem';

const model = new Vuem();

model.provide({
  data() {
    return {
      appId : 'vcs',
      app   : 'conference-manager',
    };
  },
  computed : {
    scheduleList() {
      return [];
    },
    token() {
      return this.$getVM('digest').token;
    },
    baseUrl() {
      const { pushUrl } = this.$getVM('login.account');

      if (!pushUrl) return API.BASE_URL;

      return pushUrl.startsWith('http://') ? pushUrl : `http://${pushUrl}`;
    },
  },
  middleware : {
  },
  methods : {
    async getScheduleList(from, to) {
      const params = {
        queryStartTime : from || Date.now(),
        queryEndTime   : to || new Date().setHours(7 * 24),
      };
      const url = `${API.GET_SCHEDULE_LIST}?${querystring.stringify(params)}`;

      console.warn(url);

      console.time('getScheduleList total');

      const res = await Axios({
        method  : 'get',
        baseURL : API.BASE_URL,
        url,
        headers : {
          'Y-Authorization' : auth({
            appId  : this.appId,
            method : 'GET',
            path   : url,
          }),
          token : this.token,
        },
      });

      console.timeEnd('getScheduleList total');
      
      return res.data;
    },
    async getExceptionList(planIds) {
      if (!planIds) return Promise.reject();
      if (!Array.isArray(planIds)) planIds = [ planIds ];
      const data = { planIds };

      console.time('getExceptionList total');
      const res = await Axios({
        method  : 'post',
        baseURL : this.baseUrl,
        url     : API.GET_EXCEPTION_LIST,
        data,
        headers : {
          'Y-Authorization' : auth({
            appId  : this.appId,
            method : 'POST',
            path   : API.GET_EXCEPTION_LIST,
          }),
          token : this.token,
        },
      });

      console.timeEnd('getExceptionList total');

      return res.data;
    },

    async getScheduleInfo(planId, sequence = 1) {
      if (!planId) return Promise.reject();
      const params = {
        planId,
        sequence,
      };

      const url = `${API.GET_SCHEDULE_INFO}?${querystring.stringify(params)}`;

      console.time('getScheduleInfo total');
      const res = await Axios({
        method  : 'get',
        baseURL : this.baseUrl,
        url,
        headers : {
          // Authorization  : auth,
          'Y-Authorization' : auth({
            appId  : this.appId,
            method : 'GET',
            path   : url,
          }),
          token : this.token,
        },
      });

      console.timeEnd('getScheduleInfo total');

      
      return res.data;
    },

    async deleteSchedule(deleteType, planId, sequence) {
      return Promise.resolve();
    },

    async addSchedule(options) { // 这里不再检测options的合法性，所以传过来的数据必须有保证
      console.time('addSchedule total');
      const res = await Axios({
        method  : 'post',
        baseURL : this.baseUrl,
        url     : API.ADD_SCHEDULE,
        data    : options,
        headers : {
          'Y-Authorization' : auth({
            appId  : this.appId,
            method : 'POST',
            path   : API.ADD_SCHEDULE,
          }),
          token : this.token,
        },
      });

      console.timeEnd('addSchedule total');

      return res.data;
    },

  },
});

export default model;
