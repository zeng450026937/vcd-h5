/* eslint-disable import/no-extraneous-dependencies,new-cap,consistent-return */
import Vue from 'vue';
import { arrayfy, removeEventHandlers, setupEventHandlers } from '../Utils';

export const Command = {
  GET_BOOK_CONFERENCE_SCHEDULE      : 'getBookConferenceSchedule',
  GET_BOOK_CONFERENCE_POINT_RUNNING : 'getBookConferencePointRunning',
  GET_BOOK_CONFERENCE_TEMPLATE      : 'getBookConferenceTemplate',
  GET_SYSTEM_CONFIG                 : 'getSystemConfig',
};
export default Vue.extend({
  data() {
    const to = new Date();

    to.setMonth(to.getMonth() + 1);

    return {
      cm           : null,
      list         : [],
      conferences  : {},
      templates    : {},
      from         : new Date(),
      to,
      enterpriseId : '',
    };
  },
  created() {
    this.$data.handlers = {
      uaChanged : () => {
        if (!this._subscribe) return;
        this.initSchedule().catch(() => {});
      },
      registered : () => {
        this.initSchedule().catch(() => {});
      },
      bookConferenceUpdated : (updated) => {
        const templateUpdated = updated['template-update'];
        const conferences = arrayfy(updated['conference-info']);

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

              delete this.templates[entity];
            }
          }
          else {
            if (templateUpdated) {
              tasks.push(
                this.cm.command(Command.GET_BOOK_CONFERENCE_TEMPLATE)(planId)
                  .then((result) => { this.updateTemplate(result); })
              );
            }

            tasks.push(
              this.cm.command(Command.GET_BOOK_CONFERENCE_SCHEDULE)({
                startDateTime : this.from,
                endDateTime   : this.to,
                planId,
              }).then((result) => this.updateSchedule(result))
            );
          }
        });

        return Promise.all(tasks).then(() => {
          this.merge();
          this.emit('notify', this);
        });
      },
    };
  },
  computed : {
    ua() {
      return this.$parent.ua;
    },
  },
  methods : {
    subscribe() {
      this._subscribe = true;
      this.initSchedule().catch(() => {});
    },
    unsubscribe() {
      this._subscribe = false;
    },
    initSchedule() {
      this.cm = this.$parent.cm;

      return Promise.resolve()
        .then(() => {
          try {
            if (!this.cm) console.warn('conference manager');
          }
          catch (e) { return Promise.reject(e); }

          if (!this.cm || !this.cm.isAvariable()) return Promise.reject(new Error('Not Avariable'));

          this.conferences = Object.create(null);
        })
        .then(() => this.cm.command(Command.GET_BOOK_CONFERENCE_POINT_RUNNING)())
        .then((result) => this.updateSchedule(result))
        .then(() => this.cm.command(Command.GET_BOOK_CONFERENCE_SCHEDULE)({
          startDateTime : this.from,
          endDateTime   : this.to,
        }))
        .then((result) => this.updateSchedule(result))
        .then(() => {
          this.merge();
        })
        .then(() => this.cm.command(Command.GET_SYSTEM_CONFIG)())
        .then((result) => {
          this.enterpriseId = result.data.list[0].enterpriseId;
        });
    },
    updateSchedule(schedule) {
      const conferences = arrayfy(schedule['conference-info']);
      const tasks = [];

      conferences.forEach((c) => {
        const entity = c['@entity'];
        const planId = c['@plan-id'];
        const desc = c['conference-description'];
        const recordId = desc['record-id'];

        delete c['conference-description'];

        this.conferences[recordId] = Object.assign(c, desc);

        if (!this.templates[entity]) {
          tasks.push(
            this.cm.command(Command.GET_BOOK_CONFERENCE_TEMPLATE)(planId)
              .then((result) => this.updateTemplate(result))
              .catch((e) => console.warn('Fetch template failed. error: %o', e))
          );
        }
      });

      return Promise.all(tasks);
    },
    updateTemplate(template) {
      const info = template['conference-info'];
      const entity = info['@entity'];
      const desc = info['conference-description'];

      delete info['conference-description'];

      this.templates[entity] = Object.assign(info, desc);
    },
    merge() {
      const { list, conferences, templates } = this;

      list.length = 0;

      Object.keys(conferences).forEach((key) => {
        const entity = conferences[key]['@entity'];

        list.push(Object.assign(
          {},
          conferences[key],
          templates[entity]
        ));
      });

      return list;
    },
  },
  watch : {
    ua(val, oldVal) {
      removeEventHandlers(oldVal, this.$data.handlers);
      setupEventHandlers(val, this.$data.handlers);
    },
  },
});
