import Vuem from './vuem';
import rtc from '../rtc';

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

    },
    openRinging(info) {
      this.callNum++;

      if (this.callNum > 1) {
        return rtc.call.incoming[0].decline();
      }

      const newPopup = this.createNewWindow('ringing.html', 'ringing');

      this.popups.push(newPopup);
    },
    openNotify(info) {
      if (this.isOpenNotify) return;

      this.scheduleEvents.push(info);
      const newPopup = this.createNewWindow('notification.html', 'notification');

      this.popups.push(newPopup);

      this.isOpenNotify = true;
    },
    createNewWindow(tempalte, name) {
      const option = this.createOption(
        this.genPopupsPosition()
      );

      return window.open(tempalte, name, option);
    },
    genPopupsPosition() {
      return {
        offsetLeft : window.screen.width - this.width - 10,
        offsetTop  : window.screen.height - (this.height + 50) * this.popupsNum,
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

    this.$on('notify-close', () => {
      this.isNotifyOpen = false;
      this.scheduleEvents.shift();

      if (this.scheduleEvents.length > 0) {
        setTimeout(() => {
          this.openNotify();
        }, 500);
      }
    });

    this.$on('ringing-close', (info) => {
      debugger;
    });
  },
});


export default model;
