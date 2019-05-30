import { ConferenceManager } from 'apollosip';
import { sortBy } from 'lodash';
import moment from 'moment';
import Vuem from '../vuem';
import { ScheduleDatabse } from '../../database/schedule-database';
import { arrayify } from '../../lib/arrayify';
import { formatCalendar } from './format-calendar';
import {
  fixConference,
  fixTemplate,
} from './fix-info';
import rtc from '../../rtc';
import 'moment/locale/zh-cn';


const C = ConferenceManager.Command;

const model = new Vuem();

model.provide({
  data() {
    return {
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
    list() {
      /* eslint-disable no-unused-expressions */ 
      this.lastUpdated;
      /* eslint-enable no-unused-expressions */ 

      return this.merged;
    },
    language() {
      return this.$parent.i18n.language;
    },
    calendar() {
      /* eslint-disable no-unused-expressions */
      this.lastUpdated;
      // this.$getVM('i18n').language;
      /* eslint-enable no-unused-expressions */

      return formatCalendar(this.merged);
    },
  },

  methods : {
    async fetch(from, to) {
      if (!this.cm || !this.cm.isAvariable()) throw new Error('not avariable');

      if (!from) {
        from = new Date();
        from.setHours(-7 * 24);
      }
      if (!to) {
        to = new Date();
        to.setHours(8 * 24);
      }

      this.conferences = Object.create(null);
      // this.templates = Object.create(null);

      const running = await this.cm[C.GET_BOOK_CONFERENCE_POINT_RUNNING]();

      await this.updateSchedule(running);

      const booked = await this.cm[C.GET_BOOK_CONFERENCE_SCHEDULE]({
        startDateTime : from,
        endDateTime   : to,
      });

      await this.updateSchedule(booked);

      // vue watcher is always tiggered in next tick.
      this.lastUpdated = Date.now();

      return this.toArray();
    },

    async updateSchedule(schedule = {}) {
      const tasks = [];

      arrayify(schedule['conference-info']).forEach((c) => {
        c = fixConference(c);
  
        const recordId = c['record-id'];
        const planId = c['@plan-id'];

        // this.db.conferences.put(c);
        this.conferences[recordId] = c;
  
        // const finded = !!await this.db.templates.where('@plan-id').equals(planId).count();

        // const finded = !!this.templates[planId];
        //
        // if (finded) return;

        tasks.push(
          this.fetchTemplate(planId)
        );
      });

      await Promise.all(tasks);
    },

    async bookConferenceUpdated(/* schedule */) {
      // we do a full update currently
      await this.fetch();

      /*
      const templateUpdated = schedule['template-update'];
      const conferences = arrayify(schedule['conference-info']);

      const tasks = [];

      conferences.forEach((c) => {
        const planId = c['@plan-id'];
        const entity = c['@entity'];
        const state = c['@state'];
        const recordId = c['conference-description']['record-id'];

        if (state === 'deleted') {
          if (recordId) {
            delete this.conferences[recordId];
          }
          else {
            Object.keys(this.conferences).forEach((key) => {
              if (this.conferences[key]['@entity'] === entity) {
                delete this.conferences[key];
              }
            });

            delete this.templates[planId];
          }
        }

        if (templateUpdated) {
          tasks.push(
            this.fetchTemplate(planId)
          );
        }
      });

      await Promise.all(tasks);

      // vue watcher is always tiggered in next tick.
      this.lastUpdated = Date.now();
      // update schedule list
      this.toArray();
      */
    },

    async fetchTemplate(planId) {
      const isPending = this.pendings.has(planId);

      if (isPending) return;

      // ignore error
      const template = await this.cm[C.GET_BOOK_CONFERENCE_TEMPLATE](planId)
        .catch((e) => logger.warn('fetch template failed. error: %s', e));

      const fixed = fixTemplate(template);

      // await this.db.templates.put(fixed);
      this.templates[planId] = fixed;

      this.pendings.delete(planId);
    },

    async fetchMailTemplate(conferenceRecordId) {
      let template = '';

      await this.cm[C.GET_MAIL_TEMPLATE]({
        enterpriseId   : '', // rtc.account.enterpriseId
        conferenceRecordId,
        isDST          : moment().isDST(),
        utcOffset      : moment().utcOffset() * 60,
        language       : 'zh',
        isManager      : false,
        loginStaffName : rtc.account.username,
      }).then((val) => template = val && val.data)
        .catch((e) => logger.warn('fetch mail template failed. error: %s', e));
      
      return template;
    },
    
    toArray() {
      const { merged, conferences, templates } = this;
      
      merged.length = 0;

      Object.keys(conferences).forEach((recordId) => {
        const planId = conferences[recordId]['@plan-id'];

        merged.push({
          ...templates[planId],
          ...conferences[recordId], // conference first
        });
      });

      return merged;
    },

    async getEnterpriseId() {
      /*
      const res = await this.cm[C.GET_SYSTEM_CONFIG]();
      const data = res.data.list[0];
      const config = data.data;

      this.enterpriseId = data.enterpriseId;
      */
    },
    
    checkAndNotify(start = 0) {
      if (this.notifyTimer) {
        clearTimeout(this.notifyTimer);
        this.notifyTimer = null;
      }

      const sorted = sortBy(this.merged, (n) => n['start-time'].valueOf());


      let index = start;

      while (index < sorted.length) {
        const schedule = sorted[index];
        const isHosting = schedule['expiry-time'].valueOf() - Date.now() > 0;

        if (!isHosting || this.notified.has(schedule['@plan-id'])) {
          index++;
          /* eslint-disable no-continue */
          continue;
          /* eslint-enable no-continue */
        }

        const deltaTime = schedule['start-time'].valueOf() - Date.now();
        const remindEarly = (schedule['remind-early'] || 5) * 60 * 1000;
        const waitingTime = deltaTime - remindEarly;

        if (deltaTime < remindEarly) {
          this.$emit('schedule-event', schedule);
          this.notified.add(schedule['@plan-id']);
        }
        else {
          /* eslint-disable no-loop-func */
          this.notifyTimer = setTimeout(() => this.checkAndNotify(index), waitingTime);
          /* eslint-enable no-loop-func */

          break;
        }

        index++;
      }
    },
  },
  watch : {
    list() {
      this.checkAndNotify();
    },
    isRegistered(val) {
      if (!val) {
        this.selectedDate = new Date();
        this.currentDateEvents = [];
        this.currentEvent = {};
      }
    },
    language() {
      if (!this.currentEvent || !this.currentEvent.isRecurrence) return;
      const planId = this.currentEvent['@planId'];

      this.currentEvent = {};
      Promise.resolve().then(() => {
        this.currentEvent = this.calendar.find((event) => event['@planId'] === planId) || {};
      });
    },
  },

  async created() {
    // this.db = new ScheduleDatabse('ScheduleDatabse');
    // this.cm = new ConferenceManager();
    //
    // this.conferences = Object.create(null);
    // this.conferences._isVue = true; // prevent object to be observed by vue
    this.templates = Object.create(null);
    this.templates._isVue = true;
    this.merged = [];
    this.merged._isVue = true;

    this.pendings = new Set();

    this.notified = new Set();

    await this.$nextTick();

    rtc.account.$on('bookConferenceUpdated', this.bookConferenceUpdated);

    rtc.account.$watch('ua', (val) => {
      this.cm.ua = val;
    });

    rtc.account.$watch('registered', (val) => {
      if (!val) {
        if (this.notifyTimer) {
          clearTimeout(this.notifyTimer);
          this.notifyTimer = null;
        }

        return;
      }
      // this.notified.clear();
      this.fetch();
      // this.getEnterpriseId();
    });

    /*
    const account = this.$getVM('account');

    account.$on('bookConferenceUpdated', this.bookConferenceUpdated);

    account.$watch('ua', (val) => {
      this.cm.ua = val;
    });

    account.$watch('registered', (val) => {
      if (!val) return;
      this.fetch();
    });
    */
  },

  beforeDestroy() {
    this.db = null;
    this.cm = null;

    // this.conferences = null;
    this.templates = null;
    this.merged = null;
  },
});

export default model;
