import Vuem from './vuem';
import rtc from '../rtc';
import router from '../router';
import { restoreWindow } from '../proxy/main-process-proxy';

const model = new Vuem();


model.provide({
  data() {
    return {
      popups         : [],
      width          : 320,
      height         : 180,
      callNum        : 0,
      scheduleEvents : [],
      isNotifyOpen   : false,
    };
  },
  computed : {
    popupsNum() {
      return this.popups.length + 1;
    },
  },
  middleware : {
    async notify(ctx, next) {
      await next();

      const { type, info } = ctx.payload;

      if (type === 'ringing') return this.openRinging();

      if (type === 'notify') return this.openNotify(info);
    },

  },
  methods : {
    onClose(info) {
      this.popups = this.popups.filter((popup) => popup.id !== info.id);

      this.updatePosition();
    },
    updatePosition() {
      this.popups.forEach((popup, index) => {
        const { offsetTop } = this.genPopupsPosition(index + 1);

        popup.updatePosition(offsetTop);
      });
    },
    getRandomString(num = 16) {
      const allowedChars = '0123456789ABCDEF';

      let result = '';

      for (let i = 0; i < num; ++i) {
        result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      }

      return result;
    },

    openRinging(info) {
      if (this.callNum > 1) {
        if (rtc.call.incoming[0].decline) return rtc.call.incoming[0].disconnect();
        this.callNum = 1;
      }
      this.callNum++;
      const newPopup = this.createNewWindow('ringing.html', 'ringing');

      this.popups.push(newPopup);
    },
    openNotify(info) {
      if (this.isNotifyOpen) return;

      const newPopup = this.createNewWindow('notification.html', 'notification');

      this.popups.push(newPopup);

      this.isNotifyOpen = true;
    },
    createNewWindow(tempalte, name) {
      const option = this.createOption(
        this.genPopupsPosition(this.popupsNum)
      );

      const popup = window.open(tempalte, name, option);

      popup.id = this.getRandomString();

      return popup;
    },
    genPopupsPosition(pos) {
      return {
        offsetLeft : window.screen.width - this.width - 10,
        offsetTop  : window.screen.height - (this.height + 50) * pos,
      };
    },
    createOption({ offsetLeft, offsetTop }) {
      const defaults = 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no';

      return `width=${this.width},height=${this.height},left=${offsetLeft},top=${offsetTop},${defaults}`;
    },
  },
  created() {
    const schedule = this.$getVM('schedule');

    schedule.$on('schedule-event', (info) => {
      this.scheduleEvents.push(info);
      this.openNotify(info);
    });

    this.$on('notify-close', (id) => {
      this.isNotifyOpen = false;
      this.scheduleEvents.shift();
      this.popups = this.popups.filter((popup) => popup.id !== id);

      this.updatePosition();

      if (this.scheduleEvents.length > 0) {
        setTimeout(() => {
          this.openNotify(this.scheduleEvents[0]);
        }, 500);
      }
    });

    this.$on('to-detail', ({ conference }) => {
      router.push({
        name  : 'schedule',
        query : {
          planId : conference['@plan-id'],
        },
      });
      this.$dispatch('main.setCurrentSidebar', { name: 'schedule' });
      restoreWindow();
    });

    this.$on('ringing-close', (id) => {
      if (this.callNum > 0) this.callNum--;

      this.popups = this.popups.filter((popup) => popup.id !== id);

      this.updatePosition();
    });
  },
});


export default model;
