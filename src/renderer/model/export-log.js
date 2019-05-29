import { readFile } from 'fs-extra';
import Vuem from './vuem';
import { getDate } from '../utils/date';
import { sendPackLog } from '../proxy/main-process-proxy';

const model = new Vuem();


model.provide({
  data() {
    return {
      link : document.createElement('a'),
    };
  },
  computed : {

  },
  middleware : {
    async downloadLogs(ctx, next) {
      await next();

      this.packLog();
    },
  },
  methods : {
    async packLog() {
      this.link.href = await sendPackLog();
      this.link.download = `vc-desktop-log-${getDate(new Date(), '-')}.zip`;
      this.link.click();
    },
  },
  created() {

  },
  beforeDestroy() {

  },
  watch : {

  },
});

export default model;
