import { chunk } from 'lodash';
import moment from 'moment';
import Vuem from '../../vuem';
import rtc from '../../../rtc';
import { Conference } from './lib/Conference';
import CloudSchedule from './entities/CloudSchedule';
import YmsSchedule from './entities/YmsSchdule';
import { RECU_TYPE, CONF_PROFILE } from './format';

const model = new Vuem();

model.provide({
  data() {
    return {
      rawSchedules     : [],
      lastUpdated      : 0,
      selectedDate     : Date.now(), // 当前选中的时间
      selectedSchedule : {}, // 当前选中的日程
      displaySchedules : [], // 在页面上展示的日程列表
      timeRange        : {
        get start() { return new Date().setHours(-7 * 24); },
        get end() { return new Date().setHours(8 * 24); },
      },
    };
  },
  computed : {
    registered() {
      return rtc.account.registered;
    },
    isCloud() {
      return this.$getVM('login.sketch').isCloud;
    },
    schedules() {
      /* eslint-disable no-unused-expressions */
      this.lastUpdated;

      return this.rawSchedules;
    },
    calendar() {
      return this.schedules;
    },
  },
  create() {
    this.rawSchedules._isVue = true;
  },
  methods : {
    async fetchSchedules() {
      if (!this.isCloud) return this.fetchYmsSchedules(); // YMS 暂时单独拿出来，后续可能会和Cloud使用同一套接口
      this.fetch = this.$getVM('fetch.schedule');
      const { data } = await this.fetch.getScheduleList();
      const { conferencePlans, serverTime, queryStartTime, queryEndTime } = data;

      this.dstEnable = data.dstEnable;// 是否开启夏令时
      this.utcOffset = moment().utcOffset(); // 当前浏览器的时间偏移量

      const exceptions = await this.fetchExceptionList(
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

      conference._isVue = true;

      this.rawSchedules = conference.getTimeRangeResult(
        this.timeRange.start,
        this.timeRange.end
      ).map((schedule) => new CloudSchedule(schedule));
    },

    async fetchYmsSchedules() {
      const { cm, Command } = rtc.account;

      if (!cm || !cm.isAvariable()) return new Error('not available');

      // const running = await cm[Command.GET_BOOK_CONFERENCE_POINT_RUNNING]();

      const data = await cm[Command.GET_BOOK_CONFERENCE_SCHEDULE]({
        startDateTime : new Date(this.timeRange.start),
        endDateTime   : new Date(this.timeRange.end),
      });

      Promise.all(data['conference-info'].map(async(schedule) => {
        const template = await this.fetchTemplate(schedule['@plan-id']);

        Object.assign(schedule['conference-description'], template['conference-description']);

        return new YmsSchedule(Object.assign(template, schedule));
      })).then(([ ...result ]) => this.rawSchedules = result);
    },

    async fetchTemplate(planId) {
      this.pendings = this.pendings || new Set();
      if (this.pendings.has(planId)) return;
      const { cm, Command } = rtc.account;
      const result = await cm[Command.GET_BOOK_CONFERENCE_TEMPLATE](planId);

      this.pendings.delete(planId);

      return result['conference-info'];
    },

    async fetchExceptionList(plainIdsList) {
      const result = {};

      return new Promise((resolve) => {
        plainIdsList.forEach(async(plainIds, index) => {
          const { data } = await this.fetch.getExceptionList(plainIds);

          Object.assign(result, data);

          if (index === plainIdsList.length - 1) resolve(result);
        });
      });
    },

    async updateSchedule() {
      //
    },

    async fetchScheduleInfo(schedule, force) {
      if (schedule.hasDetails && !force) return;

      const { data } = await this.fetch.getScheduleInfo(schedule.planId, schedule.sequence);

      return schedule.setDetails(data);
    },

    async getTemplate() {
      //
    },

    checkAndNotify() {

    },

    bookEvents() {

    },

  },
  middleware : {
    async addSchedule(ctx, next) {
      console.warn(ctx.payload);
      // const {
      //   profile = CONF_PROFILE.MEETING, subject, zoneId,
      //   startDate, startTime, durationHour, durationMinute,
      //   recurrenceType, interval, dayOfWeeks, rangeEndDate,
      //   remark, participants,
      // } = ctx.payload;
      // const options = {};
      //
      // switch (recurrenceType) {
      //   case undefined:
      //   case null: // 非周期会议
      //
      //     break;
      //   case RECU_TYPE.RECURS_DAILY: // 按天循环
      //
      //     break;
      //   case RECU_TYPE.RECURS_WEEKLY: // 按周循环
      //     break;
      //   case RECU_TYPE.RECURS_MONTHLY: // 按月的第几天循环
      //     break;
      //   default:
      //     break;
      // }
      //
      // const { data } = await this.fetch.addSchedule(options);
      //
      // console.warn(data);
    },
  },

  watch : {
    registered(val) {
      if (val) { // 登陆成功
        // 初始化日程列表
        this.fetchSchedules();
        if (!this.isCloud) {
          rtc.account.$on('bookConferenceUpdated', this.fetchYmsSchedules);
        }
      }
      else {
        // 还原数据
        this.rawSchedules = [];
        this.lastUpdated = 0;
        this.selectedDate = Date.now(); // 当前选中的时间
        this.selectedSchedule = {}; // 当前选中的日程
        this.displaySchedules = []; // 在页面上展示的日程列表
      }
    },
    selectedSchedule(val) {
      if (!val || !val.planId) return;
      val.genRecurrence();
      if (this.isCloud) {
        this.fetchScheduleInfo(val);
      }
    },
  },
});

export default model;
