import Axios from 'axios';
import querystring from 'querystring';
import API from './api';
import auth from '../auth';

import Vuem from '../../vuem';

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
      const url = `${API.GET_SCHEDULE_LIST}?${querystring.stringify(params)}`;

      console.warn(url);

      console.time('getScheduleList total');

      const res = await Axios({
        method  : 'get',
        baseURL : API.BASE_URL,
        url,
        headers : {
          'Sec-Metadata' : '{}',
          Authorization  : auth({
            appId  : 'conference-manager',
            method : 'GET',
            path   : url,
          }),
          token : this.$getVM('digest').token,
        },
      });

      // console.warn(API.BASE_URL + url)
      // const res = await fetch(API.BASE_URL + url, {
      //   method  : 'GET',
      //   headers : {
      //     Authorization : auth({
      //       appId  : 'conference-manager',
      //       method : 'GET',
      //       path   : url,
      //     }),
      //     token : this.$getVM('digest').token,
      //   },
      // }).then((res) => console.warn(res))
      //   .catch((error) => console.warn(error));
      //
      // console.warn(res);

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
          Authorization : auth({
            appId  : 'conference-manager',
            method : 'POST',
            path   : API.GET_EXCEPTION_LIST,
          }),
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

      const url = `${API.GET_SCHEDULE_INFO}?${querystring.stringify(params)}`;

      console.time('getScheduleInfo total');
      const res = await Axios({
        method  : 'get',
        baseURL : API.BASE_URL,
        url,
        headers : {
          // Authorization  : auth,
          Authorization : auth({
            appId  : 'conference-manager',
            method : 'GET',
            path   : url,
          }),
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
