import moment from 'moment';
import { chunk } from 'lodash';
import Vuem from '../../vuem';
import { Conference } from '../../adapter/schedule/lib/Conference';
import { formatSchedule } from './format';
import rtc from '../../../rtc';

const model = new Vuem();

model.provide({
  data() {
    return {
      rawSchedules      : [], // 前七后七天的会议日程
      lastUpdated       : 0,
      selectedDate      : new Date(), // consider to be remove
      currentDateEvents : [], // consider to be remove
      currentEvent      : {}, // consider to be remove
    };
  },
  computed : {
    isRegistered() {
      return rtc.account.status === 'registered';
    },
    fetchSchedule() {
      return this.$getVM('fetch.schedule');
    },
    calendar() {
      /* eslint-disable no-unused-expressions */
      this.lastUpdated;

      return formatSchedule(this.rawSchedules);
    },
  },
  created() {
  },
  methods : {
    async initScheduleList() {
      const { data } = await this.fetchSchedule.getScheduleList();

      const { conferencePlans, serverTime, queryStartTime, queryEndTime } = data;

      this.dstEnable = data.dstEnable;// 是否开启夏令时
      this.utcOffset = moment().utcOffset(); // 当前浏览器的时间偏移量

      const exceptions = await this.getExceptionList(
        chunk(conferencePlans.map((s) => s.planId), 100) // 对数组进行每100个分组
      );

      const conference = new Conference({
        scheduleds : conferencePlans,
        exceptions,
        utcOffset  : this.utcOffset,
        dstEnable  : this.dstEnable,
        serverTime,
        queryEndTime,
        queryStartTime,
      });

      this.conference = conference;

      const from = new Date().setHours(-6 * 24);
      const to = new Date().setHours(8 * 24);

      this.rawSchedules = conference.getTimeRangeResult(from, to);
    },

    async getExceptionList(plainIdsList = []) {
      const result = {};

      return new Promise((resolve) => {
        plainIdsList.forEach(async(plainIds, index) => {
          const { data } = await this.fetchSchedule.getExceptionList(plainIds);

          Object.assign(result, data);

          if (index === plainIdsList.length - 1) resolve(result);
        });
      });
    },
  },
  watch : {
    isRegistered(val) {
      if (!val) {
        this.selectedDate = null;
        this.currentDateEvents = [];
        this.currentEvent = {};
        
        return;
      }
      this.initScheduleList();
    },
  },
});

export default model;
