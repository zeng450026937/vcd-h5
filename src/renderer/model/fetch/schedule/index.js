import Axios from 'axios';
import API from './api';

import Vuem from '../../vuem';
import rtc from '../../../rtc';

const model = new Vuem();

model.provide({
  data() {
  },
  computed : {
    scheduleList() {
      return [];
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

      console.time('getScheduleList total');

      const res = await Axios({
        method  : 'get',
        baseURL : API.BASE_URL,
        url     : API.GET_SCHEDULE_LIST,
        params,
        headers : {
          token : this.$getVM('digest').token,
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
        baseURL : API.BASE_URL,
        url     : API.GET_EXCEPTION_LIST,
        data,
        headers : {
          token : this.$getVM('digest').token,
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

      console.time('getScheduleInfo total');
      const res = await Axios({
        method  : 'get',
        baseURL : API.BASE_URL,
        url     : API.GET_SCHEDULE_INFO,
        params,
        headers : {
          token : this.$getVM('digest').token,
        },
      });

      console.timeEnd('getScheduleInfo total');

      
      return res.data;
    },

    async deleteSchedule(deleteType, planId, sequence) {
      return Promise.resolve();
    },

  },
});

export default model;
