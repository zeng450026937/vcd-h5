
import rtc from '../../rtc';

export default {
  data() {
    return {
      formatCalendar    : null,
      currentDateEvents : [],
      currentEvent      : {},
    };
  },
  computed : {
    rawCalendars() {
      return rtc.account.schedule.list;
    },
    ua() {
      return rtc.account.ua;
    },
  },
  watch : {
    rawCalendars(val) {
      this.formatCalendar = formatCalendar(val);
    },
    ua() {
      this.formatCalendar = null;
    },
  },
};
